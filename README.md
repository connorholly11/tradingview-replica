# TradingView Replica - Trader Funding Platform

This project is a comprehensive trading platform inspired by TradingView that serves as the foundation for a trader funding program. The platform enables aspiring traders to prove their skills, earn capital allocation, and build sustainable trading careers.

## Key Features

- **Interactive Charts**: Advanced charting capabilities with multiple timeframes
- **Technical Indicators**: Support for standard and custom technical indicators
- **Trading Simulation**: Real-time trading simulation with accurate P&L tracking
- **Program Evaluation**: Automated evaluation of trader performance against defined rules
- **Account Management**: Complete lifecycle management from evaluation to funding
- **Performance Analytics**: Comprehensive metrics and analytics on trading performance

## Technology Stack

- **Frontend**: Next.js 15 with TypeScript
- **Charting**: Lightweight Charts
- **State Management**: Zustand
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk
- **Real-time Data**: WebSockets integration
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (18.x or higher)
- PostgreSQL database
- Polygon.io API key (for market data)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/connorholly11/tradingview-replica.git
   cd tradingview-replica
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/tradingview?schema=public"
   DIRECT_URL="postgresql://username:password@localhost:5432/tradingview?schema=public"
   NEXT_PUBLIC_POLYGON_API=your_polygon_api_key
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   ```

4. Initialize the database
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   npx prisma db seed
   ```

5. Start the development server
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `/prisma` - Database schema and migrations
- `/src/app` - Next.js application routes
- `/src/components` - Reusable UI components
- `/src/lib` - Core utilities and services
  - `/db` - Database client and utilities
  - `/services` - Service layer for business logic
- `/src/types` - TypeScript type definitions
- `/src/hooks` - Custom React hooks
- `/src/store` - State management

## Database Schema

The database schema is designed to support the trader funding program business model:

- **User** - Platform users with role-based permissions
- **Program** - Trading program configurations and rules
- **Account** - Trading accounts in evaluation or funded status
- **Position** - Open trading positions
- **Trade** - Individual trade records
- **Violation** - Rule violations for compliance tracking
- **Symbol** - Market instruments (stocks, futures, crypto)
- **ChartLayout** - User-saved chart configurations
- **Watchlist** - User-created watchlists

For more details on the database schema, see [prisma/README.md](prisma/README.md).

## Contributing

1. Create a feature branch from `dev`
   ```bash
   git checkout dev
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them
   ```bash
   git commit -m "Description of your changes"
   ```

3. Push your branch and create a pull request
   ```bash
   git push origin feature/your-feature-name
   ```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Recent Updates

### Chart Component Enhancement (August 2023)
- Updated the Chart component to properly handle and display technical indicators
- Improved the `createIndicatorData` function to support different indicator types
- Fixed WebSocket error handling with improved error reporting
- Standardized timeframe options across components by removing timeframes above daily (1W and 1M)
- Enhanced indicator data formatting for compatibility with lightweight-charts

### WebSocket Service Improvements
- Implemented robust reconnection logic with exponential backoff
- Added comprehensive error handling and logging
- Fixed memory leaks and improved connection stability

## Acknowledgments

- [Polygon.io](https://polygon.io/) for the market data API
- [lightweight-charts](https://github.com/tradingview/lightweight-charts) for the charting library
- [TradingView](https://www.tradingview.com/) for the inspiration
