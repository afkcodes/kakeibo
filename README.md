# 🐷 Kakeibo

A modern, offline-first personal finance management PWA inspired by the Japanese art of saving money.

![Kakeibo](public/icons/icon.svg)

## ✨ Features

- **📊 Dashboard** - Get a quick overview of your financial health with beautiful charts and insights
- **💳 Accounts Management** - Track multiple accounts (cash, bank, credit cards, investments)
- **💸 Transaction Tracking** - Record income, expenses, and transfers between accounts
- **📁 Categories** - Organize transactions with customizable categories
- **📈 Analytics** - Visualize spending patterns and trends
- **🎯 Budget Goals** - Set and track monthly budgets by category
- **🌙 Dark Mode** - Beautiful dark theme designed for comfortable viewing
- **📱 PWA Support** - Install on any device, works offline
- **💾 Local Storage** - All data stored locally using IndexedDB

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite (Rolldown)
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Database**: Dexie.js (IndexedDB)
- **Routing**: TanStack Router
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **PWA**: vite-plugin-pwa

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/afkcodes/kakeibo.git
cd kakeibo

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```text
src/
├── components/
│   ├── ui/           # Reusable UI components (Button, Card, Modal, etc.)
│   ├── layout/       # Layout components (AppShell, Sidebar)
│   └── features/     # Feature-specific components
├── hooks/            # Custom React hooks
├── pages/            # Page components
├── services/
│   └── db/           # IndexedDB setup with Dexie
├── store/            # Zustand stores
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

## 🎨 Design System

Kakeibo uses a custom dark theme with the following color tokens:

- **Surface colors**: `surface-50` to `surface-900` for backgrounds
- **Primary**: Blue accent for interactive elements
- **Success/Warning/Danger**: Semantic colors for feedback

## 📱 PWA Features

- Installable on desktop and mobile
- Offline support with service worker
- App-like experience with standalone display
- Automatic updates

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Made with ❤️ inspired by the Japanese Kakeibo budgeting method
