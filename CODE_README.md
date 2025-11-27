# Budgeto (Kakeibo) - Technical Code Reference

> A comprehensive technical map for LLM agents and developers to navigate the Budgeto codebase efficiently.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Entry Points](#entry-points)
3. [Data Flow](#data-flow)
4. [Directory Structure](#directory-structure)
5. [Type Definitions](#type-definitions)
6. [Database Layer](#database-layer)
7. [State Management](#state-management)
8. [Hooks Reference](#hooks-reference)
9. [Components Reference](#components-reference)
10. [Pages Reference](#pages-reference)
11. [Routing](#routing)
12. [Utilities](#utilities)
13. [Common Patterns](#common-patterns)
14. [File Dependencies Map](#file-dependencies-map)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Application                         │
├─────────────────────────────────────────────────────────────────┤
│  Pages (src/pages/)                                              │
│    └── Use hooks for data, components for UI                     │
├─────────────────────────────────────────────────────────────────┤
│  Components (src/components/)                                    │
│    ├── ui/        → Reusable primitives (Button, Modal, etc.)   │
│    ├── features/  → Domain components (TransactionCard, etc.)   │
│    └── layout/    → App structure (AppShell, Navbar, etc.)      │
├─────────────────────────────────────────────────────────────────┤
│  Hooks (src/hooks/)                                              │
│    └── Data access layer using Dexie's useLiveQuery             │
├─────────────────────────────────────────────────────────────────┤
│  Store (src/store/)                                              │
│    └── Zustand for UI state, settings, modal management         │
├─────────────────────────────────────────────────────────────────┤
│  Database (src/services/db/)                                     │
│    └── Dexie (IndexedDB) for offline-first data persistence     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Entry Points

### Application Bootstrap

```
index.html
  └── src/main.tsx           → React root render
        └── src/App.tsx      → Router provider setup
              └── src/router/index.ts → Route definitions
                    └── AppShell (root component)
```

### Key Files

| File | Purpose |
|------|---------|
| `src/main.tsx` | React DOM render, imports global CSS |
| `src/App.tsx` | RouterProvider setup with TanStack Router |
| `src/router/index.ts` | All route definitions |
| `src/components/layout/AppShell/AppShell.tsx` | Root layout component |
| `src/services/db/index.ts` | Database singleton instance |
| `src/store/appStore.ts` | Global Zustand store |

---

## Data Flow

### Reading Data

```
Component/Page
    │
    ▼
useXXX() hook (e.g., useTransactions)
    │
    ▼
useLiveQuery() from dexie-react-hooks
    │
    ▼
db.tableName query (IndexedDB)
    │
    ▼
Returns reactive data (auto-updates on DB changes)
```

### Writing Data

```
User Action (e.g., form submit)
    │
    ▼
useXXXActions() hook (e.g., useTransactionActions)
    │
    ▼
Action function (addTransaction, updateTransaction, etc.)
    │
    ▼
db.tableName.add/update/delete
    │
    ▼
useLiveQuery automatically re-queries → UI updates
```

### Modal Flow

```
User clicks "Add" button
    │
    ▼
setActiveModal('modal-name') from Zustand store
    │
    ▼
Modal component checks: activeModal === 'modal-name'
    │
    ▼
Modal renders with form
    │
    ▼
Form submit → calls hook action → closes modal via setActiveModal(null)
```

---

## Directory Structure

```
src/
├── main.tsx                    # App entry point
├── App.tsx                     # Router provider wrapper
├── index.css                   # Global styles & Tailwind theme
│
├── components/
│   ├── common/                 # Shared utility components
│   │   └── PWAPrompts.tsx      # PWA install/update prompts
│   │
│   ├── features/               # Domain-specific components
│   │   ├── accounts/
│   │   │   ├── AddAccountModal.tsx
│   │   │   └── index.ts
│   │   ├── budgets/
│   │   │   ├── AddBudgetModal.tsx
│   │   │   └── index.ts
│   │   ├── goals/
│   │   │   ├── AddGoalModal.tsx
│   │   │   ├── ContributeGoalModal.tsx
│   │   │   └── index.ts
│   │   ├── transactions/
│   │   │   ├── AddTransactionModal.tsx
│   │   │   ├── TransactionCard.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── layout/                 # App layout structure
│   │   ├── AppShell/           # Root layout with all modals
│   │   ├── BottomNav/          # Mobile bottom navigation
│   │   ├── FloatingActionButton/# Mobile FAB for quick add
│   │   ├── Navbar/             # Desktop top navigation
│   │   ├── Sidebar/            # Desktop side navigation
│   │   └── index.ts
│   │
│   └── ui/                     # Reusable UI primitives
│       ├── Badge/
│       ├── Button/             # Variants: primary, secondary, danger, etc.
│       ├── Card/
│       ├── CategoryIcon/       # 70+ Lucide icon mappings
│       ├── CategorySelect/     # Dropdown with category icons
│       ├── Checkbox/           # Radix UI based
│       ├── Input/
│       ├── Modal/              # Framer Motion animated
│       ├── ProgressBar/
│       ├── Select/             # Radix UI based with color dots
│       └── index.ts            # Barrel export
│
├── hooks/
│   ├── useAccounts.ts          # Account CRUD & stats
│   ├── useBudgets.ts           # Budget CRUD & progress
│   ├── useCategories.ts        # Category management
│   ├── useCurrency.ts          # Currency formatting
│   ├── useGoals.ts             # Goals CRUD & progress
│   ├── usePWA.ts               # PWA install prompts
│   ├── useTransactions.ts      # Transaction CRUD & stats
│   └── index.ts                # Barrel export
│
├── pages/
│   ├── Accounts/               # Account management page
│   ├── Analytics/              # Charts and insights
│   ├── Budgets/                # Budget management page
│   ├── Dashboard/              # Home overview
│   ├── Goals/                  # Savings goals page
│   ├── Settings/               # User preferences
│   └── Transactions/           # Transaction list page
│
├── router/
│   └── index.ts                # TanStack Router configuration
│
├── services/
│   └── db/
│       └── index.ts            # Dexie database setup
│
├── store/
│   ├── appStore.ts             # Zustand store definition
│   └── index.ts
│
├── types/
│   ├── account.ts              # Account types & constants
│   ├── budget.ts               # Budget types & templates
│   ├── category.ts             # Category types & defaults (70 categories)
│   ├── goal.ts                 # Goal types & progress
│   ├── transaction.ts          # Transaction types & filters
│   ├── user.ts                 # User settings
│   └── index.ts                # Barrel export
│
└── utils/
    ├── cn.ts                   # Tailwind class merger (clsx + twMerge)
    ├── formatters.ts           # Date & currency formatters
    └── index.ts
```

---

## Type Definitions

### Transaction (`src/types/transaction.ts`)

```typescript
type TransactionType = 'expense' | 'income' | 'transfer';

interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  description: string;
  date: Date;
  tags: string[];
  location?: Location;
  receipt?: string;
  isRecurring: boolean;
  recurringId?: string;
  toAccountId?: string;     // For transfers only
  synced: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateTransactionInput {
  accountId: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  description: string;
  date: Date;
  tags?: string[];
  toAccountId?: string;
}

interface TransactionFilters {
  type?: TransactionType;
  categoryId?: string;
  accountId?: string;
  startDate?: Date;
  endDate?: Date;
  searchQuery?: string;
}
```

### Account (`src/types/account.ts`)

```typescript
type AccountType = 'bank' | 'credit' | 'cash' | 'investment' | 'wallet';

interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  color: string;
  icon: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Budget (`src/types/budget.ts`)

```typescript
type BudgetPeriod = 'weekly' | 'monthly' | 'yearly';

interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  spent: number;
  period: BudgetPeriod;
  startDate: Date;
  endDate?: Date;
  rollover: boolean;
  alerts: { threshold: number; enabled: boolean };
  createdAt: Date;
  updatedAt: Date;
}

interface BudgetProgress {
  budget: Budget;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
  daysRemaining: number;
  dailyBudget: number;
  projectedSpending: number;
}
```

### Goal (`src/types/goal.ts`)

```typescript
type GoalType = 'savings' | 'debt';
type GoalStatus = 'active' | 'completed' | 'cancelled';

interface Goal {
  id: string;
  userId: string;
  name: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  accountId?: string;
  color: string;
  icon: string;
  status: GoalStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface GoalProgress {
  goal: Goal;
  percentage: number;
  remaining: number;
  daysUntilDeadline?: number;
  requiredMonthlyContribution?: number;
  isOnTrack: boolean;
}
```

### Category (`src/types/category.ts`)

```typescript
type CategoryType = 'expense' | 'income';

interface Category {
  id: string;
  userId: string;
  name: string;
  type: CategoryType;
  color: string;
  icon: string;              // Lucide icon name
  parentId?: string;
  isDefault: boolean;
  order: number;
}

// 52 default expense categories
// 18 default income categories
// Defined in defaultExpenseCategories and defaultIncomeCategories arrays
```

### User Settings (`src/types/user.ts`)

```typescript
interface UserSettings {
  currency: string;          // 'USD', 'EUR', 'GBP', 'JPY', 'INR'
  dateFormat: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    budgetAlerts: boolean;
    billReminders: boolean;
    weeklyReports: boolean;
    unusualSpending: boolean;
  };
}
```

---

## Database Layer

### Location: `src/services/db/index.ts`

### Database Schema

```typescript
class KakeiboDatabase extends Dexie {
  users!: EntityTable<User, 'id'>;
  accounts!: EntityTable<Account, 'id'>;
  categories!: EntityTable<Category, 'id'>;
  transactions!: EntityTable<Transaction, 'id'>;
  budgets!: EntityTable<Budget, 'id'>;
  goals!: EntityTable<Goal, 'id'>;
}
```

### Indexes

```typescript
users: 'id, email'
accounts: 'id, userId, type, isActive'
categories: 'id, userId, type, parentId, isDefault, order'
transactions: 'id, userId, accountId, categoryId, type, date, [userId+date], [userId+categoryId]'
budgets: 'id, userId, categoryId, period, [userId+categoryId]'
goals: 'id, userId, type, status, [userId+status]'
```

### Exported Functions

| Function | Purpose |
|----------|---------|
| `db` | Database singleton instance |
| `generateId()` | Creates unique ID: `${Date.now()}-${random}` |
| `clearDatabase()` | Deletes and reopens database |
| `exportDatabase()` | Returns all data as JSON string |
| `importDatabase(json)` | Bulk imports data from JSON |

---

## State Management

### Location: `src/store/appStore.ts`

### Zustand Store Interface

```typescript
interface AppState {
  // User Settings
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;

  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // User Management
  currentUserId: string | null;
  setCurrentUserId: (userId: string | null) => void;

  // Loading State
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Modal Management
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;

  // Edit State (for edit forms)
  editingTransaction: Transaction | null;
  setEditingTransaction: (transaction: Transaction | null) => void;
  
  editingBudget: Budget | null;
  setEditingBudget: (budget: Budget | null) => void;
  
  editingGoal: Goal | null;
  setEditingGoal: (goal: Goal | null) => void;

  // Reset
  resetStore: () => void;
}
```

### Modal Names (used with `setActiveModal`)

| Modal Name | Component | Purpose |
|------------|-----------|---------|
| `'add-transaction'` | `AddTransactionModal` | Add/edit transactions |
| `'add-budget'` | `AddBudgetModal` | Add/edit budgets |
| `'add-goal'` | `AddGoalModal` | Add/edit goals |
| `'add-account'` | `AddAccountModal` | Add/edit accounts |
| `'contribute-goal'` | `ContributeGoalModal` | Add money to goal |

### Persisted State

The following state is persisted to localStorage:
- `settings`
- `theme`
- `currentUserId`
- `sidebarOpen`

---

## Hooks Reference

### useTransactions (`src/hooks/useTransactions.ts`)

```typescript
// Get all transactions (optionally filtered)
useTransactions(filters?: TransactionFilters): Transaction[]

// Get single transaction by ID
useTransaction(id: string): Transaction | undefined

// CRUD actions
useTransactionActions(): {
  addTransaction(input: CreateTransactionInput, userId: string): Promise<Transaction>
  updateTransaction(id: string, updates: Partial<CreateTransactionInput>): Promise<void>
  deleteTransaction(id: string): Promise<void>
}

// Monthly statistics
useTransactionStats(userId?: string): {
  monthlyIncome: number
  monthlyExpenses: number
  savings: number
  transactionCount: number
} | undefined
```

### useAccounts (`src/hooks/useAccounts.ts`)

```typescript
// Get user's accounts
useAccounts(userId?: string): Account[]

// Get all accounts with balances
useAccountsWithBalance(userId?: string): Account[]

// Get single account
useAccount(id: string): Account | undefined

// CRUD actions
useAccountActions(): {
  addAccount(input: CreateAccountInput, userId: string): Promise<Account>
  updateAccount(id: string, updates: Partial<CreateAccountInput>): Promise<void>
  deleteAccount(id: string): Promise<void>
}

// Account statistics
useAccountStats(userId?: string): {
  totalAssets: number
  totalLiabilities: number
  netWorth: number
  accountCount: number
} | null
```

### useBudgets (`src/hooks/useBudgets.ts`)

```typescript
// Get all budgets
useBudgets(userId?: string): Budget[]

// Get single budget
useBudget(id: string): Budget | undefined

// CRUD actions
useBudgetActions(): {
  addBudget(input: CreateBudgetInput, userId: string): Promise<Budget>
  updateBudget(id: string, updates: Partial<CreateBudgetInput>): Promise<void>
  deleteBudget(id: string): Promise<void>
}

// Budget progress with spending calculations
useBudgetProgress(userId?: string): BudgetProgress[]
```

### useGoals (`src/hooks/useGoals.ts`)

```typescript
// Get all goals
useGoals(userId?: string): Goal[]

// Get single goal
useGoal(id: string): Goal | undefined

// CRUD actions
useGoalActions(): {
  addGoal(input: CreateGoalInput, userId: string): Promise<Goal>
  updateGoal(id: string, updates: Partial<CreateGoalInput>): Promise<void>
  deleteGoal(id: string): Promise<void>
  contributeToGoal(id: string, amount: number): Promise<void>
}

// Goal progress calculations
useGoalProgress(userId?: string): GoalProgress[]
```

### useCategories (`src/hooks/useCategories.ts`)

```typescript
// Get all categories
useCategories(userId?: string): Category[]

// Get categories by type
useCategoriesByType(userId: string, type: 'expense' | 'income'): Category[]

// Get single category
useCategory(id: string): Category | undefined

// CRUD actions
useCategoryActions(): {
  addCategory(input: CreateCategoryInput, userId: string): Promise<Category>
  updateCategory(id: string, updates: Partial<CreateCategoryInput>): Promise<void>
  deleteCategory(id: string): Promise<void>
  initializeDefaultCategories(userId: string): Promise<void>
}
```

### useCurrency (`src/hooks/useCurrency.ts`)

```typescript
useCurrency(): {
  formatCurrency(amount: number): string        // Full format: "$1,234.56"
  formatCurrencyCompact(amount: number): string // Compact: "$1.2M"
  currency: string                               // Current currency code
}
```

---

## Components Reference

### UI Components (`src/components/ui/`)

| Component | File | Props | Purpose |
|-----------|------|-------|---------|
| `Button` | `Button/Button.tsx` | `variant`, `size`, `isLoading`, `leftIcon`, `rightIcon`, `fullWidth` | Primary action button |
| `Modal` | `Modal/Modal.tsx` | `isOpen`, `onClose`, `title`, `description`, `size`, `footer` | Animated dialog |
| `Input` | `Input/Input.tsx` | `label`, `error`, `leftIcon`, `rightIcon` | Text input field |
| `Select` | `Select/Select.tsx` | `value`, `onValueChange`, `options`, `placeholder` | Radix dropdown |
| `Checkbox` | `Checkbox/Checkbox.tsx` | `checked`, `onCheckedChange`, `label` | Radix checkbox |
| `Card` | `Card/Card.tsx` | `variant`, `padding` | Container card |
| `Badge` | `Badge/Badge.tsx` | `variant`, `size` | Status badge |
| `ProgressBar` | `ProgressBar/ProgressBar.tsx` | `value`, `max`, `color`, `showLabel` | Progress indicator |
| `CategoryIcon` | `CategoryIcon/CategoryIcon.tsx` | `icon`, `color`, `size` | Lucide icon wrapper |
| `CategorySelect` | `CategorySelect/CategorySelect.tsx` | `value`, `onChange`, `type`, `categories` | Category dropdown |

### Button Variants

```tsx
variant: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost' | 'outline' | 'link'
size: 'sm' | 'md' | 'lg' | 'xl' | 'icon' | 'icon-sm' | 'icon-lg'
```

### Feature Components (`src/components/features/`)

| Component | File | Purpose |
|-----------|------|---------|
| `TransactionCard` | `transactions/TransactionCard.tsx` | Single transaction display with edit/delete menu |
| `AddTransactionModal` | `transactions/AddTransactionModal.tsx` | Add/edit transaction form |
| `AddAccountModal` | `accounts/AddAccountModal.tsx` | Add/edit account form |
| `AddBudgetModal` | `budgets/AddBudgetModal.tsx` | Add/edit budget form |
| `AddGoalModal` | `goals/AddGoalModal.tsx` | Add/edit goal form |
| `ContributeGoalModal` | `goals/ContributeGoalModal.tsx` | Add/withdraw money to goal |

### Layout Components (`src/components/layout/`)

| Component | File | Purpose |
|-----------|------|---------|
| `AppShell` | `AppShell/AppShell.tsx` | Root layout, renders all modals |
| `Navbar` | `Navbar/Navbar.tsx` | Desktop top navigation |
| `Sidebar` | `Sidebar/Sidebar.tsx` | Desktop side navigation |
| `BottomNav` | `BottomNav/BottomNav.tsx` | Mobile bottom tab bar |
| `FloatingActionButton` | `FloatingActionButton/FloatingActionButton.tsx` | Mobile FAB for quick add |

---

## Pages Reference

### Dashboard (`src/pages/Dashboard/`)

- Shows monthly overview (income, expenses, savings)
- Recent transactions list
- Quick stats cards

### Transactions (`src/pages/Transactions/`)

- Full transaction list grouped by date
- Search and filter (all/expense/income)
- Delete confirmation via Modal

### Budgets (`src/pages/Budgets/`)

- Budget cards with progress bars
- Spending vs budget visualization

### Goals (`src/pages/Goals/`)

- Savings goals with progress
- Hero card with overall progress
- Add money/contribute feature
- Delete confirmation via Modal

### Accounts (`src/pages/Accounts/`)

- Account cards (bank, credit, cash, etc.)
- Net worth calculation

### Analytics (`src/pages/Analytics/`)

- Spending charts (Recharts)
- Category breakdown

### Settings (`src/pages/Settings/`)

- Currency preference
- Theme selection
- Data export/import

---

## Routing

### Location: `src/router/index.ts`

### Route Structure

```typescript
const routeTree = rootRoute.addChildren([
  dashboardRoute,      // path: '/'
  transactionsRoute,   // path: '/transactions'
  budgetsRoute,        // path: '/budgets'
  analyticsRoute,      // path: '/analytics'
  goalsRoute,          // path: '/goals'
  accountsRoute,       // path: '/accounts'
  settingsRoute,       // path: '/settings'
]);
```

### Root Route

The `rootRoute` renders `AppShell`, which provides:
- Layout structure (sidebar, navbar, bottom nav)
- All modals (transaction, budget, goal, account)
- `<Outlet />` for page content

---

## Utilities

### cn() - Class Name Merger (`src/utils/cn.ts`)

```typescript
import { cn } from '@/utils/cn';

// Combines clsx conditional logic with tailwind-merge deduplication
cn('px-4 py-2', isActive && 'bg-blue-500', 'px-6') // → 'py-2 px-6 bg-blue-500'
```

### Formatters (`src/utils/formatters.ts`)

```typescript
// Currency formatting
formatCurrency(amount, currency, locale): string
formatCurrencyCompact(amount, currency, locale): string

// Number formatting
formatCompactNumber(num, locale): string
formatPercentage(value, decimals): string

// Date formatting (uses date-fns)
formatDate(date, formatStr): string
formatRelativeDate(date): string
formatDateDistance(date, baseDate): string
```

---

## Common Patterns

### Opening a Modal for Editing

```typescript
// In page component
const { setEditingTransaction, setActiveModal } = useAppStore();

const handleEdit = (transaction: Transaction) => {
  setEditingTransaction(transaction);  // Set edit data
  setActiveModal('add-transaction');    // Open modal
};

const handleAdd = () => {
  setEditingTransaction(null);          // Clear edit data
  setActiveModal('add-transaction');    // Open modal
};
```

### Delete Confirmation Pattern

```typescript
const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

// In card menu
const handleDeleteClick = () => setItemToDelete(item);

// Modal at end of component
<Modal
  isOpen={!!itemToDelete}
  onClose={() => setItemToDelete(null)}
  title="Delete Item"
>
  <p>Are you sure?</p>
  <div className="flex gap-3">
    <Button variant="secondary" onClick={() => setItemToDelete(null)}>
      Cancel
    </Button>
    <Button variant="danger" onClick={() => {
      deleteItem(itemToDelete.id);
      setItemToDelete(null);
    }}>
      Delete
    </Button>
  </div>
</Modal>
```

### Feature Card with 3-Dot Menu

```typescript
const [menuOpen, setMenuOpen] = useState(false);
const menuRef = useRef<HTMLDivElement>(null);

// Close on outside click
useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setMenuOpen(false);
    }
  };
  if (menuOpen) {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }
}, [menuOpen]);

// In JSX
<button onClick={() => setMenuOpen(!menuOpen)}>
  <MoreVertical className="w-5 h-5" />
</button>

{menuOpen && (
  <div ref={menuRef} className="absolute right-2 top-full ...">
    <button onClick={onEdit}>Edit</button>
    <button onClick={onDelete}>Delete</button>
  </div>
)}
```

### Hook Pattern for Database Operations

```typescript
// Query hook - reactive data
export const useItems = (userId?: string) => {
  const items = useLiveQuery(async () => {
    return db.items.where('userId').equals(userId).toArray();
  }, [userId]);
  return items ?? [];
};

// Actions hook - CRUD operations
export const useItemActions = () => {
  const addItem = async (input, userId) => {
    const item = { id: generateId(), userId, ...input };
    await db.items.add(item);
    return item;
  };
  
  const updateItem = async (id, updates) => {
    await db.items.update(id, { ...updates, updatedAt: new Date() });
  };
  
  const deleteItem = async (id) => {
    await db.items.delete(id);
  };
  
  return { addItem, updateItem, deleteItem };
};
```

---

## File Dependencies Map

### Core Dependencies

```
AppShell.tsx
├── imports: AddTransactionModal, AddBudgetModal, AddGoalModal, AddAccountModal
├── imports: BottomNav, Navbar, Sidebar, FloatingActionButton
├── imports: useAppStore, useCategoryActions
└── renders: <Outlet /> (pages)

TransactionsPage.tsx
├── imports: TransactionCard
├── imports: useTransactions, useTransactionActions, useCategories
├── imports: useCurrency, useAppStore
└── imports: Button, Modal (UI components)

GoalsPage.tsx
├── imports: ContributeGoalModal
├── imports: useGoals, useGoalActions, useGoalProgress
├── imports: useCurrency, useAppStore
└── imports: Button, Modal, CategoryIcon, ProgressBar
```

### Type Dependencies

```
transaction.ts → used by: useTransactions, TransactionCard, AddTransactionModal
account.ts     → used by: useAccounts, AddAccountModal, useTransactions (balance updates)
budget.ts      → used by: useBudgets, AddBudgetModal, BudgetsPage
goal.ts        → used by: useGoals, AddGoalModal, ContributeGoalModal, GoalsPage
category.ts    → used by: useCategories, CategoryIcon, CategorySelect
user.ts        → used by: appStore (settings), SettingsPage
```

### Store Dependencies

```
appStore.ts
├── used by: AppShell (modal management)
├── used by: All pages (activeModal, setEditingX)
├── used by: useCurrency (settings.currency)
└── used by: Navbar, Sidebar (sidebarOpen)
```

---

## Quick Reference: Finding Things

| I want to... | Look in... |
|--------------|------------|
| Add a new page | `src/pages/` + `src/router/index.ts` |
| Add a new modal | `src/components/features/` + `AppShell.tsx` |
| Add a new UI component | `src/components/ui/` |
| Add a new hook | `src/hooks/` |
| Modify database schema | `src/services/db/index.ts` |
| Change global state | `src/store/appStore.ts` |
| Add a new type | `src/types/` |
| Add a new category | `src/types/category.ts` + `CategoryIcon.tsx` |
| Change styling/theme | `src/index.css` |
| Add utility function | `src/utils/` |

---

## Default User

The app uses a default user ID for offline-first operation:

```typescript
const DEFAULT_USER_ID = 'default-user';
```

This is set in `AppShell.tsx` on app initialization.
