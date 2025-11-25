import { AppShell } from '@/components/layout/AppShell';
import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';

// Pages
import { AccountsPage } from '@/pages/Accounts';
import { AnalyticsPage } from '@/pages/Analytics';
import { BudgetsPage } from '@/pages/Budgets';
import { DashboardPage } from '@/pages/Dashboard';
import { GoalsPage } from '@/pages/Goals';
import { SettingsPage } from '@/pages/Settings';
import { TransactionsPage } from '@/pages/Transactions';

// Root Route
const rootRoute = createRootRoute({
  component: AppShell,
});

// Dashboard Route
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
});

// Transactions Route
const transactionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/transactions',
  component: TransactionsPage,
});

// Budgets Route
const budgetsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/budgets',
  component: BudgetsPage,
});

// Analytics Route
const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/analytics',
  component: AnalyticsPage,
});

// Goals Route
const goalsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/goals',
  component: GoalsPage,
});

// Accounts Route
const accountsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/accounts',
  component: AccountsPage,
});

// Settings Route
const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
});

// Create the route tree
const routeTree = rootRoute.addChildren([
  dashboardRoute,
  transactionsRoute,
  budgetsRoute,
  analyticsRoute,
  goalsRoute,
  accountsRoute,
  settingsRoute,
]);

// Create and export the router
export const router = createRouter({ routeTree });

// Type declaration for router
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
