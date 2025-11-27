# Budgeto - GitHub Copilot Instructions

## Project Overview

**Budgeto** (codebase name: `kakeibo`) is a personal finance management Progressive Web App (PWA) built with a mobile-first, offline-first architecture. The app helps users track expenses, income, budgets, and savings goals with a beautiful dark-themed UI.

### Tech Stack

- **Frontend Framework**: React 19 + TypeScript
- **Build Tool**: Vite (using rolldown-vite)
- **Styling**: Tailwind CSS v4 with custom design system
- **Routing**: TanStack Router
- **State Management**: Zustand with persist middleware
- **Database**: IndexedDB via Dexie + dexie-react-hooks
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Radix UI primitives (Select, Checkbox)
- **Icons**: Lucide React (70+ icons used)
- **Animations**: Framer Motion
- **Charts**: Recharts
- **PWA**: vite-plugin-pwa

---

## Project Structure

```
src/
├── components/
│   ├── common/           # Shared components (empty state, etc.)
│   ├── features/         # Feature-specific components
│   │   ├── accounts/     # Account cards, modals
│   │   ├── budgets/      # Budget cards, modals
│   │   ├── goals/        # Goal cards, contribution modal
│   │   └── transactions/ # Transaction cards, forms
│   ├── layout/           # AppShell, navigation
│   └── ui/               # Reusable UI primitives
│       ├── Badge/
│       ├── Button/
│       ├── Card/
│       ├── CategoryIcon/
│       ├── CategorySelect/
│       ├── Checkbox/
│       ├── Input/
│       ├── Modal/
│       ├── ProgressBar/
│       └── Select/
├── hooks/                # Custom React hooks
│   ├── useAccounts.ts
│   ├── useBudgets.ts
│   ├── useCategories.ts
│   ├── useCurrency.ts
│   ├── useGoals.ts
│   ├── usePWA.ts
│   └── useTransactions.ts
├── pages/                # Page components
│   ├── Accounts/
│   ├── Analytics/
│   ├── Budgets/
│   ├── Dashboard/
│   ├── Goals/
│   ├── Settings/
│   └── Transactions/
├── router/               # TanStack Router config
├── services/
│   └── db/               # Dexie database setup
├── store/                # Zustand store
│   └── appStore.ts
├── types/                # TypeScript types
│   ├── account.ts
│   ├── budget.ts
│   ├── category.ts
│   ├── goal.ts
│   ├── transaction.ts
│   └── user.ts
└── utils/                # Utility functions
    └── cn.ts             # Tailwind class merging
```

---

## Design System & Styling

### Theme Colors (Dark Elegant)

The app uses a custom dark theme defined in `src/index.css`:

```css
/* Primary - Purple Blue */
--color-primary-500: #5B6EF5;

/* Success/Income - Emerald Green */
--color-success-500: #10b981;

/* Danger/Expense - Rose */
--color-danger-500: #f43f5e;

/* Warning - Amber */
--color-warning-500: #f59e0b;

/* Surface (Dark Greys) */
--color-surface-50 to --color-surface-950
```

### Key Styling Patterns

1. **Squircle Design**: Use `squircle` class with `rounded-xl` or `rounded-2xl` for iOS-like rounded corners
2. **Card Backgrounds**: `bg-surface-800/40` or `bg-surface-800/60` with `border border-surface-700/30`
3. **Text Colors**:
   - Headings: `text-surface-50` or `text-surface-100`
   - Body: `text-surface-200` or `text-surface-300`
   - Muted: `text-surface-400` or `text-surface-500`
4. **Expense amounts**: `text-danger-400` with `−` prefix
5. **Income amounts**: `text-success-400` with `+` prefix
6. **Amount font**: `font-amount` class for tabular numbers

### Button Variants

```tsx
// Available variants
<Button variant="primary" />   // Purple gradient
<Button variant="secondary" /> // Dark grey
<Button variant="danger" />    // Red
<Button variant="success" />   // Green
<Button variant="warning" />   // Amber
<Button variant="ghost" />     // Transparent
<Button variant="outline" />   // Border only
<Button variant="link" />      // Underline on hover
```

### Custom CSS Utilities

- `.squircle` - Smooth rounded corners
- `.font-amount` - Tabular numbers for amounts
- `.animate-fade-in`, `.animate-slide-up` - Animations
- `.glass` - Glass morphism effect

---

## State Management

### Zustand Store (`src/store/appStore.ts`)

```typescript
interface AppState {
  // User settings
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;

  // UI state
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';

  // Modal management
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;

  // Editing state for forms
  editingTransaction: Transaction | null;
  editingBudget: Budget | null;
  editingGoal: Goal | null;
}
```

### Modal Pattern

```tsx
// Opening a modal with edit data
setEditingTransaction(transaction);
setActiveModal('add-transaction');

// Opening modal for new item
setEditingTransaction(null);
setActiveModal('add-transaction');

// Closing modal
setActiveModal(null);
```

---

## Database (Dexie/IndexedDB)

### Schema (`src/services/db/index.ts`)

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

### Hook Pattern with dexie-react-hooks

```typescript
// Live query that auto-updates
const transactions = useLiveQuery(async () => {
  return db.transactions.orderBy('date').reverse().toArray();
}, []);

// Actions hook pattern
export const useTransactionActions = () => {
  const addTransaction = async (input: CreateTransactionInput) => {
    await db.transactions.add(transaction);
  };
  
  const deleteTransaction = async (id: string) => {
    await db.transactions.delete(id);
  };
  
  return { addTransaction, deleteTransaction };
};
```

---

## Component Patterns

### Feature Card Pattern

```tsx
export const FeatureCard = ({ item, onEdit, onDelete }: Props) => {
  const [menuOpen, setMenuOpen] = useState(false);
  
  return (
    <div className="relative bg-surface-800/40 border border-surface-700/30 rounded-xl squircle p-4">
      {/* Icon */}
      <div className="w-10 h-10 rounded-lg flex items-center justify-center"
           style={{ backgroundColor: `${color}18` }}>
        <CategoryIcon icon={icon} color={color} size="sm" />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-surface-100 font-semibold text-[14px] truncate">{name}</p>
        <p className="text-surface-500 text-[12px]">{subtitle}</p>
      </div>
      
      {/* 3-dot Menu */}
      <button onClick={() => setMenuOpen(!menuOpen)}>
        <MoreVertical className="w-5 h-5" />
      </button>
      
      {/* Dropdown */}
      {menuOpen && (
        <div className="absolute right-2 top-full mt-1 z-50 bg-surface-800 border border-surface-700 rounded-xl shadow-xl">
          <button onClick={onEdit}>Edit</button>
          <button onClick={onDelete}>Delete</button>
        </div>
      )}
    </div>
  );
};
```

### Delete Confirmation Modal Pattern

Always use Modal dialogs for delete confirmations (not inline dropdowns):

```tsx
const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

// In card's onDelete handler
const handleDelete = () => setItemToDelete(item);

// Modal at end of component
<Modal
  isOpen={!!itemToDelete}
  onClose={() => setItemToDelete(null)}
  title="Delete Item"
>
  <p className="text-surface-300 text-[14px]">
    Are you sure? This cannot be undone.
  </p>
  <div className="flex gap-3">
    <Button variant="secondary" onClick={() => setItemToDelete(null)}>
      Cancel
    </Button>
    <Button variant="danger" onClick={confirmDelete}>
      Delete
    </Button>
  </div>
</Modal>
```

### CategoryIcon Component

Uses Lucide icons with 70+ icon mappings:

```tsx
<CategoryIcon 
  icon="shopping-cart"  // Icon name from lucide
  color="#22c55e"       // Color hex
  size="sm"             // sm | md | lg
/>
```

---

## Categories System

### Default Categories

- **52 expense categories** organized into groups:
  - Food & Dining, Housing & Utilities, Transportation
  - Shopping, Entertainment, Travel, Health, Education
  - Financial, Family & Kids, Subscriptions

- **18 income categories**:
  - Salary, Freelance, Business, Investments, Rental
  - Dividends, Interest, Bonus, Commission, Refunds, etc.

### Adding New Categories

When adding categories, ensure:
1. Unique icon name exists in `CategoryIcon` iconMap
2. Color is visible on dark background (avoid too dark colors)
3. Add to both `defaultExpenseCategories` or `defaultIncomeCategories` in `src/types/category.ts`
4. Add icon mapping in `src/components/ui/CategoryIcon/CategoryIcon.tsx`

---

## Routing (TanStack Router)

```typescript
// Route structure
/                    → DashboardPage
/transactions        → TransactionsPage
/budgets            → BudgetsPage
/analytics          → AnalyticsPage
/goals              → GoalsPage
/accounts           → AccountsPage
/settings           → SettingsPage
```

Navigation uses `<Link>` from TanStack Router:

```tsx
import { Link } from '@tanstack/react-router';

<Link to="/transactions" className="...">
  Transactions
</Link>
```

---

## Form Handling

### React Hook Form + Zod Pattern

```tsx
const schema = z.object({
  description: z.string().min(1, 'Required'),
  amount: z.number().positive('Must be positive'),
  categoryId: z.string().min(1, 'Select a category'),
});

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
  defaultValues: editingItem ?? { description: '', amount: 0 },
});

const onSubmit = (data: FormData) => {
  if (editingItem) {
    updateItem(editingItem.id, data);
  } else {
    addItem(data);
  }
  onClose();
};
```

---

## Currency Formatting

Use the `useCurrency` hook:

```tsx
const { formatCurrency, currencySymbol } = useCurrency();

// Returns formatted string like "₹1,234.56" or "$1,234.56"
formatCurrency(1234.56);
```

---

## Best Practices

### DO

1. ✅ Use `cn()` utility for conditional class merging
2. ✅ Use Modal dialogs for confirmations (not inline)
3. ✅ Use `squircle` + `rounded-xl` for card-like elements
4. ✅ Use semantic color classes (`text-danger-400` for expenses)
5. ✅ Use `useLiveQuery` for reactive database queries
6. ✅ Use Zustand's `setEditingX` pattern for edit forms
7. ✅ Use `font-amount` for monetary values
8. ✅ Use `text-[14px]` pattern for precise font sizes
9. ✅ Close dropdowns when clicking outside
10. ✅ Use `truncate` class for potentially long text

### DON'T

1. ❌ Don't use inline styles for colors that should use the theme
2. ❌ Don't use light colors that won't be visible on dark backgrounds
3. ❌ Don't show delete confirmations in dropdowns
4. ❌ Don't use emoji icons - use Lucide icons instead
5. ❌ Don't hardcode currency symbols - use `useCurrency`
6. ❌ Don't forget to handle loading/empty states
7. ❌ Don't use regular `useState` for cross-component state - use Zustand

---

## Mobile-First Considerations

1. Use `active:` instead of `hover:` for mobile interactions
2. Use touch-friendly tap targets (min 44px)
3. Use `@media (hover: hover)` for hover-only styles
4. Bottom navigation is the primary nav on mobile
5. Test with mobile viewport (375px width)

---

## PWA Features

The app is PWA-enabled with:
- Service worker for offline support
- Installable on home screen
- Uses `usePWA` hook for install prompts

---

## File Naming Conventions

- Components: `PascalCase.tsx` (e.g., `TransactionCard.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useTransactions.ts`)
- Types: `camelCase.ts` (e.g., `transaction.ts`)
- Utils: `camelCase.ts` (e.g., `cn.ts`)
- Pages: Folder with `index.ts` barrel export

---

## Import Aliases

```typescript
// Use @ alias for src directory
import { Button } from '@/components/ui';
import { useTransactions } from '@/hooks/useTransactions';
import { cn } from '@/utils/cn';
import type { Transaction } from '@/types';
```

---

## Testing & Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

---

## Common Tasks

### Adding a New Page

1. Create page component in `src/pages/NewPage/`
2. Add route in `src/router/index.ts`
3. Add navigation item if needed

### Adding a New Feature Card

1. Create card component in `src/components/features/`
2. Follow the card pattern with 3-dot menu
3. Add delete confirmation via Modal
4. Use `CategoryIcon` for icons

### Adding a New Hook

1. Create in `src/hooks/`
2. Export from `src/hooks/index.ts`
3. Use `useLiveQuery` for database queries
4. Return actions as separate hook if needed

### Adding a New Modal

1. Use the `Modal` component from `@/components/ui`
2. Control with `activeModal` state from Zustand
3. Handle form state with React Hook Form
