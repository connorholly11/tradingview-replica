# TradingView Replica - Database Schema

This directory contains the Prisma schema for the TradingView replica platform that serves as the foundation for our trader funding program. The schema is designed to support the business model of evaluating, funding, and monitoring traders.

## Key Features

- User management with role-based permissions
- Trading program configuration (evaluation rules)
- Trading account tracking and performance metrics
- Position and trade management
- Rule violation monitoring
- Symbol data and price history storage
- Trading interface features (chart layouts, watchlists, etc.)

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Set up your database connection in the `.env` file. We use Supabase PostgreSQL, but any PostgreSQL database will work.

3. Initialize the Prisma client:

```bash
npx prisma generate
```

4. Run database migrations:

```bash
npx prisma migrate dev --name init
```

## Schema Overview

### Core Business Models

- **User**: Traders and administrators in the system
- **Program**: Trading program configurations with rules
- **Account**: Individual trading accounts in evaluation or funded status
- **Position**: Open trading positions
- **Trade**: Individual trade records
- **Violation**: Rule violations for tracking compliance

### TradingView Platform Models

- **Symbol**: Trading instruments (stocks, futures, crypto, etc.)
- **PriceData**: Historical price data for charting
- **ChartLayout**: User-saved chart configurations
- **Watchlist**: User-created watchlists
- **CustomIndicator**: User-created technical indicators

## Working with the Database

### Prisma Client Usage

Import the Prisma client in your services:

```typescript
import { prisma } from '@/lib/db/prisma';

// Example: Fetch all active accounts for a user
const accounts = await prisma.account.findMany({
  where: {
    userId: 'user-id',
    status: 'ACTIVE',
  },
  include: {
    program: true,
  },
});
```

### Database Service Layer

The application includes several service modules to abstract database operations:

- `src/lib/services/accountService.ts` - Account and trading operations
- `src/lib/services/priceDataService.ts` - Price data operations
- `src/lib/services/tradingViewService.ts` - Chart layouts and watchlists

### Error Handling

All database operations should use the `handlePrismaOperation` helper function which provides consistent error handling:

```typescript
import { handlePrismaOperation } from '@/lib/db/prisma';

// Example
return handlePrismaOperation(
  async () => {
    // Prisma operations here
    return result;
  },
  'Failed to fetch data'
);
```

## Data Model Relationships

- Users have multiple Accounts
- Programs define rules for Accounts
- Accounts track Positions, Trades, and Violations
- Users create ChartLayouts and Watchlists
- Symbols contain PriceData records
- Watchlists reference Symbols

## Database Migrations

When making changes to the schema:

1. Update `schema.prisma`
2. Generate the migration:

```bash
npx prisma migrate dev --name descriptive_name
```

3. Apply migrations to production:

```bash
npx prisma migrate deploy
```

## Seeding the Database

To populate the database with initial data:

```bash
npx prisma db seed
```

Seed scripts are located in `prisma/seed.ts` and include:

- Default trading programs
- Common market symbols
- System user accounts 