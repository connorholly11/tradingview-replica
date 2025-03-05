import { prisma, handlePrismaOperation } from '../db/prisma';
import { AccountStatus, DrawdownType, TradeSide, ViolationType } from '@/types';
import { Decimal } from '@prisma/client/runtime/library';

/**
 * Service for handling account operations
 */
export const accountService = {
  /**
   * Create a new trading account for a user in a specific program
   */
  async createAccount(
    userId: string, 
    programId: string
  ): Promise<{ accountId: string | null; error: string | null }> {
    return handlePrismaOperation(async () => {
      // Check if the user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      // Find the program
      const program = await prisma.program.findUnique({
        where: { id: programId },
      });

      if (!program) {
        throw new Error(`Program ${programId} not found`);
      }

      // Get the next account number for this user
      const lastAccount = await prisma.account.findFirst({
        where: { userId },
        orderBy: { accountNumber: 'desc' },
      });

      const accountNumber = lastAccount ? lastAccount.accountNumber + 1 : 1;

      // Create the account
      const account = await prisma.account.create({
        data: {
          userId,
          programId,
          accountNumber,
          balance: program.initialBalance,
          initialBalance: program.initialBalance,
          equity: program.initialBalance,
          status: AccountStatus.PENDING,
          phase: 1,
        },
      });

      // Create initial daily metric
      await prisma.dailyMetric.create({
        data: {
          accountId: account.id,
          date: new Date(),
          startBalance: program.initialBalance,
          endBalance: program.initialBalance,
          highBalance: program.initialBalance,
          lowBalance: program.initialBalance,
        },
      });

      // Update user stats
      await prisma.userStats.upsert({
        where: { userId },
        update: {
          totalAccounts: { increment: 1 },
          activeAccounts: { increment: 1 },
        },
        create: {
          userId,
          totalAccounts: 1,
          activeAccounts: 1,
        },
      });

      return account.id;
    }, `Failed to create account for user ${userId}`);
  },

  /**
   * Get account details including positions and metrics
   */
  async getAccountDetails(accountId: string): Promise<{ data: any | null; error: string | null }> {
    return handlePrismaOperation(async () => {
      const account = await prisma.account.findUnique({
        where: { id: accountId },
        include: {
          program: true,
          positions: true,
          metrics: {
            orderBy: { date: 'desc' },
            take: 30,
          },
          trades: {
            orderBy: { timestamp: 'desc' },
            take: 50,
          },
          violations: {
            orderBy: { timestamp: 'desc' },
          },
        },
      });

      if (!account) {
        throw new Error(`Account ${accountId} not found`);
      }

      return account;
    }, `Failed to get account details for ${accountId}`);
  },

  /**
   * Execute a trade on an account
   */
  async executeTrade(
    accountId: string,
    symbol: string,
    side: TradeSide,
    quantity: number,
    price: number
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      // Start a transaction
      return await prisma.$transaction(async (tx) => {
        // Get the account
        const account = await tx.account.findUnique({
          where: { id: accountId },
          include: {
            program: true,
            positions: {
              where: { symbol },
            },
          },
        });

        if (!account) {
          throw new Error(`Account ${accountId} not found`);
        }

        if (account.status !== AccountStatus.ACTIVE) {
          throw new Error(`Account is not active (current status: ${account.status})`);
        }

        // Calculate trade value
        const tradeValue = price * quantity;
        const commission = new Decimal(quantity * 0.005); // Example commission calculation

        // Check if within position size limits
        if (account.program.maxPositionSize && tradeValue > account.program.maxPositionSize) {
          // Create a violation
          await tx.violation.create({
            data: {
              accountId,
              type: ViolationType.POSITION_SIZE,
              value: new Decimal(tradeValue),
              threshold: account.program.maxPositionSize,
              description: `Position size exceeded: ${tradeValue} > ${account.program.maxPositionSize}`,
            },
          });

          throw new Error(`Position size limit exceeded`);
        }

        // Check if allowed symbol
        if (account.program.allowedSymbols.length > 0 && !account.program.allowedSymbols.includes(symbol)) {
          throw new Error(`Symbol ${symbol} is not allowed in this program`);
        }

        // Update or create position
        const position = account.positions.length > 0 ? account.positions[0] : null;
        
        let isWin = null;
        let pnl = null;

        if (position) {
          // Existing position - calculate P&L if closing or reducing
          if ((position.quantity > 0 && side === TradeSide.SELL) || 
              (position.quantity < 0 && side === TradeSide.BUY)) {
            const tradeQuantity = Math.min(Math.abs(position.quantity), quantity);
            
            if (position.quantity > 0) {
              // Long position
              pnl = new Decimal(price - parseFloat(position.avgPrice.toString())).mul(tradeQuantity);
            } else {
              // Short position
              pnl = new Decimal(parseFloat(position.avgPrice.toString()) - price).mul(tradeQuantity);
            }
            
            isWin = pnl.greaterThan(0);
          }
          
          // Update position
          const newQuantity = side === TradeSide.BUY
            ? position.quantity + quantity
            : position.quantity - quantity;
            
          if (newQuantity === 0) {
            // Close the position
            await tx.position.delete({
              where: { id: position.id },
            });
          } else {
            // Update the position
            const avgPrice = newQuantity !== position.quantity
              ? calculateNewAveragePrice(position.avgPrice, position.quantity, price, quantity, side)
              : position.avgPrice;
              
            await tx.position.update({
              where: { id: position.id },
              data: {
                quantity: newQuantity,
                avgPrice,
                currentPrice: price,
                updatedAt: new Date(),
              },
            });
          }
        } else if (quantity > 0) {
          // Create new position
          await tx.position.create({
            data: {
              accountId,
              symbol,
              quantity: side === TradeSide.BUY ? quantity : -quantity,
              avgPrice: price,
              currentPrice: price,
            },
          });
        }

        // Create trade record
        const trade = await tx.trade.create({
          data: {
            accountId,
            symbol,
            side,
            quantity,
            price,
            marketPrice: price,
            commission,
            pnl,
            isWin,
          },
        });

        // Update account balance if P&L is realized
        if (pnl !== null) {
          const newBalance = new Decimal(account.balance).add(pnl).sub(commission);
          const newEquity = calculateEquity(newBalance, await getOpenPositionsValue(tx, accountId));
          
          // Update the account
          await tx.account.update({
            where: { id: accountId },
            data: {
              balance: newBalance,
              equity: newEquity,
              totalPnL: new Decimal(account.totalPnL).add(pnl),
              totalTrades: account.totalTrades + 1,
              winningTrades: isWin ? account.winningTrades + 1 : account.winningTrades,
              losingTrades: isWin === false ? account.losingTrades + 1 : account.losingTrades,
              lastTradeAt: new Date(),
            },
          });

          // Check for violations after the trade
          await checkForViolations(tx, account, newBalance, newEquity);
          
          // Update daily metrics
          await updateDailyMetrics(tx, accountId, pnl, isWin, commission);
        }

        return { success: true, tradeId: trade.id };
      });
    } catch (error) {
      console.error(`Error executing trade: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, error: `Failed to execute trade: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  },

  /**
   * Get active account metrics for a user
   */
  async getUserActiveAccounts(userId: string): Promise<{ data: any | null; error: string | null }> {
    return handlePrismaOperation(async () => {
      return prisma.account.findMany({
        where: { 
          userId,
          status: {
            in: [AccountStatus.ACTIVE, AccountStatus.PENDING, AccountStatus.FUNDED]
          }
        },
        include: {
          program: {
            select: {
              name: true,
              initialBalance: true,
              profitTarget: true,
              maxDailyLoss: true,
              maxTotalLoss: true,
            }
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }, `Failed to get active accounts for user ${userId}`);
  },
};

// Helper functions

/**
 * Calculate new average price after adding to a position
 */
function calculateNewAveragePrice(
  currentAvgPrice: Decimal,
  currentQuantity: number,
  newPrice: number,
  newQuantity: number,
  side: TradeSide
): Decimal {
  // Only recalculate if adding to the position
  if ((currentQuantity > 0 && side === TradeSide.BUY) || 
      (currentQuantity < 0 && side === TradeSide.SELL)) {
    const totalQuantity = Math.abs(currentQuantity) + newQuantity;
    const totalValue = parseFloat(currentAvgPrice.toString()) * Math.abs(currentQuantity) + newPrice * newQuantity;
    return new Decimal(totalValue / totalQuantity);
  }
  
  return currentAvgPrice;
}

/**
 * Calculate account equity based on balance and open positions
 */
async function calculateEquity(balance: Decimal, openPositionsValue: Decimal): Promise<Decimal> {
  return balance.add(openPositionsValue);
}

/**
 * Get the current value of all open positions
 */
async function getOpenPositionsValue(tx: any, accountId: string): Promise<Decimal> {
  const positions = await tx.position.findMany({
    where: { accountId },
  });
  
  let totalValue = new Decimal(0);
  
  for (const position of positions) {
    const positionValue = new Decimal(position.currentPrice)
      .sub(position.avgPrice)
      .mul(position.quantity);
    totalValue = totalValue.add(positionValue);
  }
  
  return totalValue;
}

/**
 * Check for rule violations after a trade
 */
async function checkForViolations(tx: any, account: any, newBalance: Decimal, newEquity: Decimal): Promise<void> {
  const program = account.program;
  
  // Check max total loss
  if (newBalance.lessThan(program.initialBalance.mul(1 - program.maxTotalLoss.div(100)))) {
    await createViolation(
      tx,
      account.id,
      ViolationType.MAX_LOSS,
      program.initialBalance.sub(newBalance),
      program.maxTotalLoss.mul(program.initialBalance).div(100),
      `Maximum total loss exceeded`
    );
    
    // Update account status
    await tx.account.update({
      where: { id: account.id },
      data: { status: AccountStatus.VIOLATED },
    });
  }
  
  // Check daily loss (requires daily metrics)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dailyMetric = await tx.dailyMetric.findFirst({
    where: {
      accountId: account.id,
      date: {
        gte: today,
      },
    },
  });
  
  if (dailyMetric) {
    const dailyLoss = dailyMetric.startBalance.sub(newBalance);
    const maxDailyLossAmount = program.maxDailyLoss.mul(program.initialBalance).div(100);
    
    if (dailyLoss.greaterThan(maxDailyLossAmount)) {
      await createViolation(
        tx,
        account.id,
        ViolationType.DAILY_LOSS,
        dailyLoss,
        maxDailyLossAmount,
        `Maximum daily loss exceeded`
      );
      
      // Update account status
      await tx.account.update({
        where: { id: account.id },
        data: { status: AccountStatus.VIOLATED },
      });
    }
  }
  
  // Check drawdown
  if (program.drawdownType === DrawdownType.STATIC && program.maxTotalDrawdown) {
    const highWaterMark = await getHighWaterMark(tx, account.id);
    const drawdown = highWaterMark.sub(newEquity).div(highWaterMark).mul(100);
    
    if (drawdown.greaterThan(program.maxTotalDrawdown)) {
      await createViolation(
        tx,
        account.id,
        ViolationType.DRAWDOWN,
        drawdown,
        program.maxTotalDrawdown,
        `Maximum drawdown exceeded`
      );
      
      // Update account status
      await tx.account.update({
        where: { id: account.id },
        data: { status: AccountStatus.VIOLATED },
      });
    }
  }
  
  // Check profit target
  const profitPercentage = newBalance.sub(program.initialBalance).div(program.initialBalance).mul(100);
  
  if (profitPercentage.greaterThanOrEqual(program.profitTarget)) {
    // Target achieved - does not create a violation but marks account as completed
    await tx.account.update({
      where: { id: account.id },
      data: { status: AccountStatus.COMPLETED },
    });
  }
}

/**
 * Create a rule violation record
 */
async function createViolation(
  tx: any,
  accountId: string,
  type: ViolationType,
  value: Decimal,
  threshold: Decimal,
  description: string
): Promise<void> {
  await tx.violation.create({
    data: {
      accountId,
      type,
      value,
      threshold,
      description,
    },
  });
}

/**
 * Get the highest equity achieved by an account
 */
async function getHighWaterMark(tx: any, accountId: string): Promise<Decimal> {
  const dailyMetrics = await tx.dailyMetric.findMany({
    where: { accountId },
    orderBy: { highBalance: 'desc' },
    take: 1,
  });
  
  if (dailyMetrics.length > 0) {
    return dailyMetrics[0].highBalance;
  }
  
  const account = await tx.account.findUnique({
    where: { id: accountId },
  });
  
  return account.initialBalance;
}

/**
 * Update daily metrics with trade results
 */
async function updateDailyMetrics(
  tx: any,
  accountId: string,
  pnl: Decimal,
  isWin: boolean | null,
  commission: Decimal
): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const account = await tx.account.findUnique({
    where: { id: accountId },
  });
  
  let dailyMetric = await tx.dailyMetric.findFirst({
    where: {
      accountId,
      date: {
        gte: today,
      },
    },
  });
  
  if (!dailyMetric) {
    // Create a new daily metric
    dailyMetric = await tx.dailyMetric.create({
      data: {
        accountId,
        date: today,
        startBalance: account.balance,
        endBalance: account.balance,
        highBalance: account.balance,
        lowBalance: account.balance,
      },
    });
  }
  
  // Update the daily metric
  const updatedMetric = {
    endBalance: account.balance,
    trades: dailyMetric.trades + 1,
    grossPnL: dailyMetric.grossPnL.add(pnl || 0),
    netPnL: dailyMetric.netPnL.add(pnl || 0).sub(commission),
  };
  
  // Update win/loss metrics
  if (isWin === true) {
    updatedMetric.winningTrades = dailyMetric.winningTrades + 1;
    
    if (pnl.greaterThan(dailyMetric.largestWin)) {
      updatedMetric.largestWin = pnl;
    }
  } else if (isWin === false) {
    updatedMetric.losingTrades = dailyMetric.losingTrades + 1;
    
    if (pnl.lessThan(dailyMetric.largestLoss)) {
      updatedMetric.largestLoss = pnl;
    }
  }
  
  // Update high/low metrics
  if (account.balance.greaterThan(dailyMetric.highBalance)) {
    updatedMetric.highBalance = account.balance;
  }
  
  if (account.balance.lessThan(dailyMetric.lowBalance)) {
    updatedMetric.lowBalance = account.balance;
  }
  
  // Calculate drawdown
  updatedMetric.drawdown = dailyMetric.highBalance.sub(account.balance);
  
  await tx.dailyMetric.update({
    where: { id: dailyMetric.id },
    data: updatedMetric,
  });
  
  // Update account profitable days if needed
  if (dailyMetric.netPnL.lessThanOrEqual(0) && updatedMetric.netPnL.greaterThan(0)) {
    await tx.account.update({
      where: { id: accountId },
      data: {
        profitableDays: account.profitableDays + 1,
      },
    });
  }
} 