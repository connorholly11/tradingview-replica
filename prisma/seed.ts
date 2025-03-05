import { PrismaClient } from '@prisma/client';
import { UserRole, InstrumentType } from '../src/types';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'System Administrator',
      role: UserRole.ADMIN,
      status: 'ACTIVE',
      isVerified: true,
      verifiedAt: new Date(),
    },
  });

  console.log(`Created admin user: ${admin.id}`);

  // Create demo trader user
  const trader = await prisma.user.upsert({
    where: { email: 'trader@example.com' },
    update: {},
    create: {
      email: 'trader@example.com',
      name: 'Demo Trader',
      role: UserRole.TRADER,
      status: 'ACTIVE',
      isVerified: true,
      verifiedAt: new Date(),
    },
  });

  console.log(`Created trader user: ${trader.id}`);

  // Create trader stats record
  await prisma.userStats.upsert({
    where: { userId: trader.id },
    update: {},
    create: {
      userId: trader.id,
    },
  });

  // Create trading programs
  const basicProgram = await prisma.program.upsert({
    where: { id: 'prog-basic-001' },
    update: {},
    create: {
      id: 'prog-basic-001',
      name: 'Basic Evaluation',
      description: 'Entry-level trading evaluation program',
      initialBalance: 50000,
      maxDailyLoss: 5,
      maxTotalLoss: 10,
      profitTarget: 10,
      minTradingDays: 5,
      maxDailyDrawdown: 5,
      maxTotalDrawdown: 10,
      maxPositionSize: 5000,
      phases: 1,
      allowedSymbols: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'ES', 'NQ', 'CL', 'GC'],
      allowedTimeframes: ['1m', '5m', '15m', '1h', '4h', '1d'],
      drawdownType: 'STATIC',
    },
  });

  console.log(`Created basic program: ${basicProgram.id}`);

  const advancedProgram = await prisma.program.upsert({
    where: { id: 'prog-adv-001' },
    update: {},
    create: {
      id: 'prog-adv-001',
      name: 'Advanced Evaluation',
      description: 'Professional-level trading evaluation program',
      initialBalance: 100000,
      maxDailyLoss: 4,
      maxTotalLoss: 8,
      profitTarget: 8,
      minTradingDays: 10,
      maxDailyDrawdown: 4,
      maxTotalDrawdown: 8,
      maxPositionSize: 10000,
      phases: 2,
      allowedSymbols: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NFLX', 'ES', 'NQ', 'CL', 'GC', 'SI', 'BTC', 'ETH'],
      allowedTimeframes: ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'],
      drawdownType: 'STATIC',
    },
  });

  console.log(`Created advanced program: ${advancedProgram.id}`);

  // Create common market symbols
  const symbolsToCreate = [
    { ticker: 'AAPL', name: 'Apple Inc.', type: InstrumentType.STOCK, exchange: 'NASDAQ' },
    { ticker: 'MSFT', name: 'Microsoft Corporation', type: InstrumentType.STOCK, exchange: 'NASDAQ' },
    { ticker: 'GOOGL', name: 'Alphabet Inc.', type: InstrumentType.STOCK, exchange: 'NASDAQ' },
    { ticker: 'AMZN', name: 'Amazon.com Inc.', type: InstrumentType.STOCK, exchange: 'NASDAQ' },
    { ticker: 'TSLA', name: 'Tesla Inc.', type: InstrumentType.STOCK, exchange: 'NASDAQ' },
    { ticker: 'META', name: 'Meta Platforms Inc.', type: InstrumentType.STOCK, exchange: 'NASDAQ' },
    { ticker: 'NFLX', name: 'Netflix Inc.', type: InstrumentType.STOCK, exchange: 'NASDAQ' },
    { ticker: 'ES', name: 'E-mini S&P 500 Futures', type: InstrumentType.FUTURES, exchange: 'CME' },
    { ticker: 'NQ', name: 'E-mini Nasdaq 100 Futures', type: InstrumentType.FUTURES, exchange: 'CME' },
    { ticker: 'CL', name: 'Crude Oil Futures', type: InstrumentType.FUTURES, exchange: 'NYMEX' },
    { ticker: 'GC', name: 'Gold Futures', type: InstrumentType.FUTURES, exchange: 'COMEX' },
    { ticker: 'SI', name: 'Silver Futures', type: InstrumentType.FUTURES, exchange: 'COMEX' },
    { ticker: 'BTC', name: 'Bitcoin', type: InstrumentType.CRYPTO, exchange: 'CRYPTO' },
    { ticker: 'ETH', name: 'Ethereum', type: InstrumentType.CRYPTO, exchange: 'CRYPTO' },
  ];

  for (const symbol of symbolsToCreate) {
    await prisma.symbol.upsert({
      where: { ticker: symbol.ticker },
      update: {},
      create: {
        ticker: symbol.ticker,
        name: symbol.name,
        type: symbol.type,
        exchange: symbol.exchange,
      },
    });

    console.log(`Created symbol: ${symbol.ticker}`);
  }

  // Create a demo account for the trader
  const account = await prisma.account.upsert({
    where: { 
      userId_accountNumber: {
        userId: trader.id,
        accountNumber: 1,
      }
    },
    update: {},
    create: {
      userId: trader.id,
      programId: basicProgram.id,
      accountNumber: 1,
      balance: basicProgram.initialBalance,
      initialBalance: basicProgram.initialBalance,
      equity: basicProgram.initialBalance,
      status: 'PENDING',
      phase: 1,
    },
  });

  console.log(`Created account: ${account.id}`);

  // Create initial daily metric
  await prisma.dailyMetric.upsert({
    where: { 
      accountId_date: {
        accountId: account.id,
        date: new Date()
      }
    },
    update: {},
    create: {
      accountId: account.id,
      date: new Date(),
      startBalance: basicProgram.initialBalance,
      endBalance: basicProgram.initialBalance,
      highBalance: basicProgram.initialBalance,
      lowBalance: basicProgram.initialBalance,
    },
  });

  // Create default chart layouts and watchlists for the trader
  await prisma.chartLayout.upsert({
    where: { 
      userId_name: {
        userId: trader.id,
        name: 'Default',
      }
    },
    update: {},
    create: {
      userId: trader.id,
      name: 'Default',
      isDefault: true,
      config: {
        chartType: 'candle',
        timeframe: '1h',
        indicators: [
          {
            id: 'ma-50',
            type: 'sma',
            name: 'MA 50',
            color: '#2196F3',
            visible: true,
            settings: { period: 50 },
          },
          {
            id: 'ma-200',
            type: 'sma',
            name: 'MA 200',
            color: '#FF5722',
            visible: true,
            settings: { period: 200 },
          }
        ],
        drawingTools: [],
        gridConfig: {
          showGrid: true,
          showAxis: true,
          showLabels: true,
        },
        colorConfig: {
          background: '#131722',
          text: '#D1D4DC',
          grid: '#363C4E',
          upCandle: '#26A69A',
          downCandle: '#EF5350',
        },
      },
    },
  });

  const watchlist = await prisma.watchlist.upsert({
    where: { 
      userId_name: {
        userId: trader.id,
        name: 'Favorites',
      }
    },
    update: {},
    create: {
      userId: trader.id,
      name: 'Favorites',
      isDefault: true,
    },
  });

  // Add symbols to watchlist
  const symbolsForWatchlist = ['AAPL', 'MSFT', 'TSLA', 'ES', 'BTC'];
  
  for (const ticker of symbolsForWatchlist) {
    const symbol = await prisma.symbol.findUnique({
      where: { ticker },
    });
    
    if (symbol) {
      await prisma.watchlistItem.upsert({
        where: {
          watchlistId_symbolId: {
            watchlistId: watchlist.id,
            symbolId: symbol.id,
          }
        },
        update: {},
        create: {
          watchlistId: watchlist.id,
          symbolId: symbol.id,
        },
      });
    }
  }

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 