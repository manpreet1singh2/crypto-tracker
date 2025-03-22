# Crypto Tracker

A comprehensive cryptocurrency tracking application built with Next.js that allows users to monitor live cryptocurrency prices and manage their investment portfolio.

## Live Demo
[Crypto Tracker](https://v0-crypto-price-tracker-omega.vercel.app/)

## Features

### Market Tracking
- **Live Price Updates**: Fetches real-time cryptocurrency prices using the CoinGecko API.
- **Top 50 Cryptocurrencies**: Displays the most popular cryptocurrencies by market capitalization.
- **Search Functionality**: Enables users to find specific cryptocurrencies quickly.
- **Price Change Indicators**: Visual indicators for price movements over the last 24 hours.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop devices.

### Portfolio Management
- **Transaction Tracking**: Allows users to add and manage cryptocurrency purchases.
- **Portfolio Overview**: Displays total investment, current value, and profit/loss.
- **Holdings Summary**: Provides a breakdown of aggregated holdings with average purchase prices.
- **Profit/Loss Calculation**: Automatically calculates profit or loss for each holding.
- **Local Storage Support**: Saves portfolio data locally to retain information across sessions.

## Installation

Follow these steps to install and run the project locally:

### Prerequisites
- Node.js (version 16+ recommended)
- npm or yarn package manager

### Steps to Install

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/crypto-tracker.git
   cd crypto-tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables:**
   - Create a `.env.local` file in the root directory.
   - Add the following environment variable:
     ```env
     NEXT_PUBLIC_COINGECKO_API=https://api.coingecko.com/api/v3
     ```

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open the application in your browser:**
   ```
   http://localhost:3000
   ```

## Technologies Used
- **Next.js** - React-based framework for server-side rendering and static site generation.
- **CoinGecko API** - Fetches real-time cryptocurrency data.
- **Tailwind CSS** - Provides a modern and responsive design.
- **Local Storage API** - Saves portfolio data for persistence across sessions.

## Future Enhancements
- **User Authentication**: Implement login/logout functionality for personalized portfolios.
- **Historical Data & Charts**: Visualize price trends using interactive charts.
- **Dark Mode Support**: Improve user experience with a dark theme option.
- **Multi-Currency Support**: Display prices in different fiat currencies.

## Contributing
Contributions are welcome! If you'd like to contribute:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature-name`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to your branch (`git push origin feature-name`)
5. Open a Pull Request

## License
This project is open-source and available under the MIT License.


