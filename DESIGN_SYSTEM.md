# Budgeto Design System

A comprehensive guide to the design language, components, and patterns used in Budgeto. This document helps LLMs and developers understand how to create consistent, on-brand UI.

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Component Patterns](#component-patterns)
6. [Common UI Patterns](#common-ui-patterns)
7. [Animations & Transitions](#animations--transitions)
8. [Icons](#icons)
9. [Responsive Design](#responsive-design)
10. [Do's and Don'ts](#dos-and-donts)

---

## Design Philosophy

### Core Principles

1. **Dark-First**: The app uses a dark theme exclusively - no light mode. All colors are optimized for dark backgrounds.

2. **Mobile-First**: Designed primarily for mobile with PWA capabilities. Touch targets are 44px minimum.

3. **Minimalist Elegance**: Clean interfaces with purposeful whitespace. Avoid clutter.

4. **iOS-Inspired**: Uses squircle (superellipse) corners, subtle depth, and smooth animations similar to iOS.

5. **Financial Clarity**: Numbers are prominent, color-coded (green=income, red=expense), and use tabular figures.

6. **Offline-First**: UI should work seamlessly offline with optimistic updates.

---

## Color System

### Semantic Colors

```
Primary (Purple-Blue) - Actions, links, active states
├── primary-400: #818cf8  (lighter, for hover states)
├── primary-500: #5B6EF5  (main brand color)
├── primary-600: #4A5BD9  (darker, for pressed states)

Success (Green) - Income, positive amounts, confirmations
├── success-400: #34d399  (text on dark backgrounds)
├── success-500: #10b981  (main success color)
├── success-600: #059669  (darker variant)

Danger (Rose) - Expenses, negative amounts, destructive actions
├── danger-400: #fb7185  (text on dark backgrounds)
├── danger-500: #f43f5e  (main danger color)
├── danger-600: #e11d48  (darker variant)

Warning (Amber) - Alerts, budget warnings
├── warning-400: #fbbf24  (text on dark backgrounds)
├── warning-500: #f59e0b  (main warning color)
├── warning-600: #d97706  (darker variant)
```

### Surface Colors (Greys)

```
Backgrounds & Surfaces
├── surface-950: #09090b  (deepest background)
├── surface-900: #18181b  (card backgrounds)
├── surface-800: #27272a  (elevated surfaces, inputs)
├── surface-700: #3f3f46  (borders, dividers)
├── surface-600: #52525b  (subtle borders)

Text Colors
├── surface-100: #f4f4f5  (primary text, headings)
├── surface-200: #e4e4e7  (secondary text)
├── surface-300: #d4d4d8  (body text)
├── surface-400: #a1a1aa  (muted text, placeholders)
├── surface-500: #71717a  (disabled text, hints)
```

### Usage Patterns

```tsx
// Income amounts
<span className="text-success-400">+₹1,234</span>

// Expense amounts  
<span className="text-danger-400">−₹1,234</span>

// Primary text
<h1 className="text-surface-100">Title</h1>

// Secondary/body text
<p className="text-surface-300">Description</p>

// Muted/helper text
<span className="text-surface-500">Last updated</span>

// Backgrounds with transparency
<div className="bg-surface-800/40">  // 40% opacity
<div className="bg-surface-700/30">  // 30% opacity
```

### Icon Background Pattern

When displaying category icons, use the category color at low opacity:

```tsx
<div 
  className="w-10 h-10 rounded-xl flex items-center justify-center"
  style={{ backgroundColor: `${categoryColor}18` }}  // 18 = ~10% opacity in hex
>
  <CategoryIcon icon={icon} color={categoryColor} size="sm" />
</div>
```

---

## Typography

### Font Families

```css
/* Primary font - UI text */
font-family: "Plus Jakarta Sans", system-ui, sans-serif;

/* Monospace - Numbers, amounts, code */
font-family: "JetBrains Mono", ui-monospace, monospace;
```

### Font Sizes (Using Tailwind arbitrary values)

```
Headings
├── text-[20px] or text-xl  - Page titles
├── text-[18px] or text-lg  - Section titles
├── text-[16px]             - Card titles
├── text-[15px]             - Emphasized text

Body Text
├── text-[14px] or text-sm  - Primary body text
├── text-[13px]             - Secondary text, labels
├── text-[12px]             - Helper text, timestamps
├── text-[11px]             - Tiny labels, badges
```

### Font Weights

```
font-bold     (700) - Large amounts, primary headings
font-semibold (600) - Card titles, emphasized text
font-medium   (500) - Labels, buttons
font-normal   (400) - Body text
```

### Amount Formatting

Always use the `font-amount` class for monetary values:

```tsx
<span className="font-amount text-[16px] font-semibold">
  {formatCurrency(amount)}
</span>
```

This applies:
- Monospace font (JetBrains Mono)
- Tabular figures (numbers align vertically)
- Slight negative letter-spacing

---

## Spacing & Layout

### Spacing Scale

```
Padding/Margin values commonly used:
├── 1    (4px)   - Tiny gaps
├── 1.5  (6px)   - Compact spacing
├── 2    (8px)   - Tight spacing
├── 2.5  (10px)  - Default small
├── 3    (12px)  - Default medium
├── 4    (16px)  - Comfortable
├── 5    (20px)  - Spacious
├── 6    (24px)  - Section gaps
```

### Common Spacing Patterns

```tsx
// Card padding
<div className="p-4">           // Standard card
<div className="p-3">           // Compact card
<div className="p-2.5">         // Tight card

// Section spacing
<div className="space-y-4">     // Standard list
<div className="space-y-3">     // Compact list
<div className="space-y-6">     // Sections

// Gap between inline items
<div className="gap-2">         // Tight
<div className="gap-3">         // Standard
<div className="gap-4">         // Comfortable
```

### Border Radius

```
rounded-md   (6px)  - Small elements, tags
rounded-lg   (8px)  - Buttons, inputs
rounded-xl   (12px) - Cards, modals (PRIMARY)
rounded-2xl  (16px) - Large cards
rounded-full        - Circular elements, pills
```

Always add `squircle` class with rounded corners for iOS-like appearance:

```tsx
<div className="rounded-xl squircle">
```

---

## Component Patterns

### Cards

```tsx
// Standard feature card
<div className="bg-surface-800/40 border border-surface-700/30 rounded-xl squircle p-4">
  {/* content */}
</div>

// Elevated card (for important content)
<div className="bg-surface-900 border border-surface-800 rounded-xl squircle p-4 shadow-xl shadow-black/20">
  {/* content */}
</div>

// Interactive card
<div className="bg-surface-800/40 border border-surface-700/30 rounded-xl squircle p-4 
                hover:border-surface-600 hover:bg-surface-800/60 transition-colors cursor-pointer">
  {/* content */}
</div>
```

### Buttons

```tsx
// Primary action
<Button variant="primary">Save</Button>

// Secondary action
<Button variant="secondary">Cancel</Button>

// Danger action
<Button variant="danger">Delete</Button>

// Ghost button (subtle)
<Button variant="ghost">Edit</Button>

// Icon button
<Button variant="ghost" size="icon-sm">
  <MoreVertical className="w-5 h-5" />
</Button>
```

### Inputs

```tsx
<Input
  label="Amount"
  type="number"
  placeholder="0.00"
  error={errors.amount?.message}
  leftIcon={<DollarSign className="w-4 h-4" />}
/>
```

### Modals

```tsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Modal Title"
>
  <form className="space-y-4">
    {/* Form content */}
    
    {/* Actions at bottom */}
    <div className="flex gap-3 pt-2">
      <Button variant="secondary" onClick={onClose} className="flex-1">
        Cancel
      </Button>
      <Button type="submit" className="flex-1">
        Confirm
      </Button>
    </div>
  </form>
</Modal>
```

### Dropdown Menus (3-dot menu pattern)

```tsx
const [menuOpen, setMenuOpen] = useState(false);
const menuRef = useRef<HTMLDivElement>(null);

// Click outside to close
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setMenuOpen(false);
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

return (
  <div className="relative" ref={menuRef}>
    <button 
      onClick={() => setMenuOpen(!menuOpen)}
      className="p-1.5 rounded-lg hover:bg-surface-700/50 transition-colors"
    >
      <MoreVertical className="w-5 h-5 text-surface-400" />
    </button>
    
    {menuOpen && (
      <div className="absolute right-0 top-full mt-1 z-50 
                      bg-surface-800 border border-surface-700 rounded-xl 
                      shadow-xl shadow-black/30 py-1 min-w-[140px]">
        <button className="w-full px-4 py-2 text-left text-[13px] text-surface-300 
                          hover:bg-surface-700/50 flex items-center gap-2">
          <Edit3 className="w-4 h-4" />
          Edit
        </button>
        <button className="w-full px-4 py-2 text-left text-[13px] text-danger-400 
                          hover:bg-danger-500/10 flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    )}
  </div>
);
```

### Progress Bars

```tsx
// Simple progress bar
<div className="h-2 bg-surface-700/50 rounded-full overflow-hidden">
  <div 
    className="h-full rounded-full bg-primary-500"
    style={{ width: `${percentage}%` }}
  />
</div>

// Progress bar with labels
<div className="space-y-1.5">
  <div className="flex justify-between text-[13px]">
    <span className="text-surface-100 font-medium font-amount">{current}</span>
    <span className="text-surface-500 font-amount">{target}</span>
  </div>
  <div className="h-2 bg-surface-700/50 rounded-full overflow-hidden">
    <div 
      className="h-full rounded-full bg-primary-500"
      style={{ width: `${percentage}%` }}
    />
  </div>
</div>

// Colored progress bar (for budgets)
<div className="h-2 bg-surface-700/50 rounded-full overflow-hidden">
  <div 
    className={`h-full rounded-full ${
      percentage > 100 ? 'bg-danger-500' : 
      percentage > 80 ? 'bg-warning-500' : 
      'bg-success-500'
    }`}
    style={{ width: `${Math.min(percentage, 100)}%` }}
  />
</div>
```

### Empty States

```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mb-4">
    <Inbox className="w-8 h-8 text-surface-500" />
  </div>
  <h3 className="text-surface-200 font-semibold text-[16px] mb-1">
    No transactions yet
  </h3>
  <p className="text-surface-500 text-[14px] mb-4 max-w-[250px]">
    Start tracking your expenses and income to see them here.
  </p>
  <Button variant="primary" size="sm">
    <Plus className="w-4 h-4" />
    Add Transaction
  </Button>
</div>
```

### Badges / Pills

```tsx
// Status badge
<span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-success-500/20 text-success-400">
  Active
</span>

// Category badge
<span className="px-2.5 py-1 rounded-lg text-[12px] font-medium bg-surface-700/50 text-surface-300">
  Shopping
</span>
```

### Tabs / Segmented Control

```tsx
<div className="flex gap-2 p-1 bg-surface-700/30 rounded-lg">
  {tabs.map(tab => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={`flex-1 py-1.5 px-3 rounded-md text-[12px] font-medium transition-colors ${
        activeTab === tab.id
          ? 'bg-primary-500/20 text-primary-400'
          : 'text-surface-400 hover:text-surface-300'
      }`}
    >
      {tab.label}
    </button>
  ))}
</div>
```

### Quick Amount Buttons

```tsx
<div className="flex gap-2">
  {[100, 500, 1000, 5000].map((amount) => (
    <button
      key={amount}
      type="button"
      onClick={() => setAmount(amount.toString())}
      className="flex-1 py-1.5 bg-surface-700/50 hover:bg-surface-700 
                 text-surface-300 text-[12px] font-medium rounded-md transition-colors"
    >
      {amount >= 1000 ? `${amount / 1000}K` : amount}
    </button>
  ))}
</div>
```

---

## Common UI Patterns

### Transaction Card Layout

```tsx
<div className="flex items-center gap-3 p-3 bg-surface-800/40 rounded-xl">
  {/* Icon */}
  <div 
    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
    style={{ backgroundColor: `${color}18` }}
  >
    <CategoryIcon icon={icon} color={color} size="sm" />
  </div>
  
  {/* Content */}
  <div className="flex-1 min-w-0">
    <p className="text-surface-100 font-semibold text-[14px] truncate">
      {description}
    </p>
    <p className="text-surface-500 text-[12px]">
      {category} • {date}
    </p>
  </div>
  
  {/* Amount */}
  <div className="text-right shrink-0">
    <p className={`font-semibold text-[14px] font-amount ${
      type === 'expense' ? 'text-danger-400' : 'text-success-400'
    }`}>
      {type === 'expense' ? '−' : '+'}{formatCurrency(amount)}
    </p>
  </div>
</div>
```

### Account/Goal Card Layout

```tsx
<div className="relative bg-surface-800/40 border border-surface-700/30 rounded-xl p-4">
  <div className="flex items-start justify-between mb-3">
    {/* Icon + Title */}
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
        <Wallet className="w-5 h-5 text-primary-400" />
      </div>
      <div>
        <h3 className="text-surface-100 font-semibold text-[15px]">{name}</h3>
        <p className="text-surface-500 text-[12px]">{type}</p>
      </div>
    </div>
    
    {/* Menu */}
    <DropdownMenu />
  </div>
  
  {/* Balance */}
  <p className="text-surface-100 font-bold text-[20px] font-amount">
    {formatCurrency(balance)}
  </p>
</div>
```

### Form Section Layout

```tsx
<div className="space-y-4">
  {/* Section with label */}
  <div className="space-y-1.5">
    <label className="text-surface-300 text-[12px] font-medium flex items-center gap-1.5">
      <Icon className="w-3.5 h-3.5" />
      Label Text
    </label>
    <Input ... />
  </div>
  
  {/* Another section */}
  <div className="space-y-1.5">
    <label className="text-surface-300 text-[12px] font-medium">
      Another Label
    </label>
    <Select ... />
  </div>
</div>
```

### Preview/Summary Box

```tsx
<div className="p-2.5 bg-surface-700/30 rounded-lg">
  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[12px]">
    <div className="flex justify-between">
      <span className="text-surface-500">Label:</span>
      <span className="text-surface-300">{value}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-surface-500">→ New:</span>
      <span className="text-success-400">{newValue}</span>
    </div>
  </div>
</div>
```

---

## Animations & Transitions

### Transition Classes

```tsx
// Standard transition (colors, backgrounds)
className="transition-colors"

// All properties
className="transition-all duration-200"

// Specific duration
className="transition-colors duration-300"
```

### Animation Classes

```css
/* Available animations */
animate-fade-in     /* Fade in */
animate-slide-up    /* Slide up + fade */
animate-slide-down  /* Slide down + fade */
animate-scale-in    /* Scale + fade */
animate-bounce-in   /* Bouncy entrance */
```

### Button Press Effect

```tsx
// Scale down slightly on press
className="active:scale-[0.98]"
```

### Framer Motion Patterns

```tsx
// Modal animation
<motion.div
  initial={{ opacity: 0, scale: 0.95, y: 10 }}
  animate={{ opacity: 1, scale: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.95, y: 10 }}
  transition={{ duration: 0.2 }}
>
```

---

## Icons

### Icon Library

We use **Lucide React** icons exclusively. Never use emoji or other icon libraries.

### Icon Sizes

```
w-3.5 h-3.5  - Tiny (inline with small text)
w-4 h-4      - Small (buttons, inputs)
w-5 h-5      - Medium (cards, default)
w-6 h-6      - Large (headers)
w-8 h-8      - XL (empty states)
```

### Icon Usage

```tsx
import { Plus, Minus, Edit3, Trash2, MoreVertical } from 'lucide-react';

// In buttons
<Button>
  <Plus className="w-4 h-4" />
  Add
</Button>

// Standalone
<Edit3 className="w-5 h-5 text-surface-400" />

// With background
<div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
  <Target className="w-5 h-5 text-primary-400" />
</div>
```

### Category Icons

Use the `CategoryIcon` component for category-specific icons:

```tsx
<CategoryIcon 
  icon="shopping-cart"  // Lucide icon name
  color="#22c55e"       // Category color
  size="sm"             // sm | md | lg
/>
```

---

## Responsive Design

### Breakpoints

```
sm:  640px   - Large phones, small tablets
md:  768px   - Tablets
lg:  1024px  - Laptops
xl:  1280px  - Desktops
```

### Mobile-First Patterns

```tsx
// Padding that increases on larger screens
className="p-4 sm:p-6"

// Grid that changes columns
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"

// Text that changes size
className="text-[14px] sm:text-[16px]"
```

### Touch Targets

Minimum touch target size is 44x44px:

```tsx
// Icon buttons
className="p-2"  // 8px padding on 24px icon = 40px total (acceptable)
className="p-2.5" // 10px padding = 44px total (ideal)

// Interactive elements
className="min-h-[44px]"
```

### Mobile Interactions

```tsx
// Use active: instead of hover: for mobile
className="active:bg-surface-700 hover:bg-surface-700"

// Disable text selection for app-like feel
className="select-none"

// Enable selection only for text content
className="select-text"
```

---

## Do's and Don'ts

### ✅ DO

1. **Use semantic color classes** - `text-danger-400` not `text-red-400`
2. **Use the `squircle` class** with `rounded-xl` for cards
3. **Use `font-amount`** for all monetary values
4. **Use `truncate`** for potentially long text in constrained spaces
5. **Use transparent backgrounds** - `bg-surface-800/40` not solid colors
6. **Use border with low opacity** - `border-surface-700/30`
7. **Add transitions** to interactive elements
8. **Use Modal for confirmations** - Never inline delete confirmations
9. **Format amounts correctly** - Use `formatCurrency()` and prefix with +/−
10. **Close dropdowns on outside click**

### ❌ DON'T

1. **Don't use light colors** that won't be visible on dark background
2. **Don't use emoji** - Use Lucide icons instead
3. **Don't hardcode colors** - Use theme variables
4. **Don't use hover-only** interactions on mobile - Add active: states
5. **Don't use light mode colors** - This is a dark-only app
6. **Don't skip loading/empty states** - Always handle edge cases
7. **Don't use `useState` for cross-component state** - Use Zustand
8. **Don't make modals too tall** - Keep them compact, avoid scrolling
9. **Don't use default browser form styles** - Always style inputs
10. **Don't forget accessibility** - Use proper labels and ARIA attributes

---

## Quick Reference

### Most Used Classes

```
/* Backgrounds */
bg-surface-800/40         - Card background
bg-surface-700/30         - Subtle background
bg-surface-700/50         - Input background, progress track

/* Borders */
border border-surface-700/30  - Card border
border border-surface-700     - Input border

/* Text */
text-surface-100          - Primary text
text-surface-300          - Body text  
text-surface-500          - Muted text
text-danger-400           - Expense
text-success-400          - Income
text-primary-400          - Links, active

/* Rounded */
rounded-xl squircle       - Cards
rounded-lg                - Buttons, inputs
rounded-full              - Pills, avatars

/* Layout */
flex items-center gap-3   - Horizontal layout
space-y-4                 - Vertical spacing
min-w-0                   - Allow flex child to shrink (for truncate)
shrink-0                  - Prevent flex child from shrinking
```

### Component Size Reference

```
Icon backgrounds:   w-9 h-9 to w-12 h-12
Card padding:       p-3 to p-4
Input height:       h-10 (via py-2.5)
Button height:      h-8 (sm), h-10 (md), h-12 (lg)
Modal max-width:    max-w-md
```

---

## File Structure for Components

```
src/components/ui/ComponentName/
├── ComponentName.tsx     - Main component
├── index.ts             - Barrel export
└── ComponentName.test.tsx (optional)
```

Export pattern in `index.ts`:
```ts
export { ComponentName } from './ComponentName';
export type { ComponentNameProps } from './ComponentName';
```

---

*Last updated: November 2025*
