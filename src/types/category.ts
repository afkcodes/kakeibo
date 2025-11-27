export type CategoryType = 'expense' | 'income';

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
  parentId?: string;
  isDefault: boolean;
  order: number;
}

export interface CreateCategoryInput {
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
  parentId?: string;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  order?: number;
}

// Default expense categories - organized for detailed analytics
export const defaultExpenseCategories: Omit<Category, 'id' | 'userId'>[] = [
  // 🍽️ Food & Dining
  { name: 'Groceries', type: 'expense', color: '#22c55e', icon: 'shopping-cart', isDefault: true, order: 1 },
  { name: 'Restaurants', type: 'expense', color: '#ef4444', icon: 'utensils', isDefault: true, order: 2 },
  { name: 'Coffee & Snacks', type: 'expense', color: '#f97316', icon: 'coffee', isDefault: true, order: 3 },
  { name: 'Food Delivery', type: 'expense', color: '#fb923c', icon: 'bike', isDefault: true, order: 4 },
  
  // 🏠 Housing & Utilities
  { name: 'Rent', type: 'expense', color: '#06b6d4', icon: 'home', isDefault: true, order: 5 },
  { name: 'Mortgage', type: 'expense', color: '#0891b2', icon: 'landmark', isDefault: true, order: 6 },
  { name: 'Electricity', type: 'expense', color: '#eab308', icon: 'zap', isDefault: true, order: 7 },
  { name: 'Water', type: 'expense', color: '#3b82f6', icon: 'droplet', isDefault: true, order: 8 },
  { name: 'Gas', type: 'expense', color: '#f59e0b', icon: 'flame', isDefault: true, order: 9 },
  { name: 'Internet', type: 'expense', color: '#8b5cf6', icon: 'wifi', isDefault: true, order: 10 },
  { name: 'Phone', type: 'expense', color: '#a855f7', icon: 'smartphone', isDefault: true, order: 11 },
  { name: 'Home Maintenance', type: 'expense', color: '#a8a29e', icon: 'wrench', isDefault: true, order: 12 },
  
  // 🚗 Transportation
  { name: 'Fuel', type: 'expense', color: '#dc2626', icon: 'fuel', isDefault: true, order: 13 },
  { name: 'Public Transit', type: 'expense', color: '#2563eb', icon: 'train-front', isDefault: true, order: 14 },
  { name: 'Cab & Rideshare', type: 'expense', color: '#1d4ed8', icon: 'car', isDefault: true, order: 15 },
  { name: 'Parking', type: 'expense', color: '#6366f1', icon: 'square-parking', isDefault: true, order: 16 },
  { name: 'Car Maintenance', type: 'expense', color: '#a1a1aa', icon: 'car-front', isDefault: true, order: 17 },
  { name: 'Car Insurance', type: 'expense', color: '#94a3b8', icon: 'shield', isDefault: true, order: 18 },
  
  // 🛍️ Shopping
  { name: 'Clothing', type: 'expense', color: '#ec4899', icon: 'shirt', isDefault: true, order: 19 },
  { name: 'Electronics', type: 'expense', color: '#6366f1', icon: 'laptop', isDefault: true, order: 20 },
  { name: 'Home & Furniture', type: 'expense', color: '#d4d4d4', icon: 'armchair', isDefault: true, order: 21 },
  { name: 'Beauty & Personal Care', type: 'expense', color: '#f472b6', icon: 'sparkles', isDefault: true, order: 22 },
  { name: 'Gifts', type: 'expense', color: '#e879f9', icon: 'gift', isDefault: true, order: 23 },
  
  // 🎬 Entertainment & Leisure
  { name: 'Movies & Shows', type: 'expense', color: '#be185d', icon: 'film', isDefault: true, order: 24 },
  { name: 'Streaming Services', type: 'expense', color: '#9333ea', icon: 'tv', isDefault: true, order: 25 },
  { name: 'Gaming', type: 'expense', color: '#7c3aed', icon: 'gamepad-2', isDefault: true, order: 26 },
  { name: 'Books & Magazines', type: 'expense', color: '#c2410c', icon: 'book-open', isDefault: true, order: 27 },
  { name: 'Hobbies', type: 'expense', color: '#db2777', icon: 'palette', isDefault: true, order: 28 },
  { name: 'Sports & Fitness', type: 'expense', color: '#16a34a', icon: 'dumbbell', isDefault: true, order: 29 },
  { name: 'Events & Concerts', type: 'expense', color: '#d946ef', icon: 'ticket', isDefault: true, order: 30 },
  
  // ✈️ Travel
  { name: 'Flights', type: 'expense', color: '#0ea5e9', icon: 'plane', isDefault: true, order: 31 },
  { name: 'Hotels', type: 'expense', color: '#0284c7', icon: 'bed', isDefault: true, order: 32 },
  { name: 'Vacation Activities', type: 'expense', color: '#0369a1', icon: 'map', isDefault: true, order: 33 },
  
  // 🏥 Health & Medical
  { name: 'Doctor & Clinic', type: 'expense', color: '#10b981', icon: 'stethoscope', isDefault: true, order: 34 },
  { name: 'Medicine', type: 'expense', color: '#14b8a6', icon: 'pill', isDefault: true, order: 35 },
  { name: 'Health Insurance', type: 'expense', color: '#059669', icon: 'heart-pulse', isDefault: true, order: 36 },
  { name: 'Dental', type: 'expense', color: '#0d9488', icon: 'smile', isDefault: true, order: 37 },
  { name: 'Vision', type: 'expense', color: '#0f766e', icon: 'eye', isDefault: true, order: 38 },
  
  // 📚 Education
  { name: 'Tuition', type: 'expense', color: '#4f46e5', icon: 'graduation-cap', isDefault: true, order: 39 },
  { name: 'Courses & Training', type: 'expense', color: '#6366f1', icon: 'book-marked', isDefault: true, order: 40 },
  { name: 'School Supplies', type: 'expense', color: '#818cf8', icon: 'pencil', isDefault: true, order: 41 },
  
  // 💰 Financial
  { name: 'Bank Fees', type: 'expense', color: '#94a3b8', icon: 'building-2', isDefault: true, order: 42 },
  { name: 'Loan Payment', type: 'expense', color: '#f97316', icon: 'landmark', isDefault: true, order: 43 },
  { name: 'Credit Card Payment', type: 'expense', color: '#fb923c', icon: 'credit-card', isDefault: true, order: 44 },
  { name: 'Taxes', type: 'expense', color: '#991b1b', icon: 'receipt', isDefault: true, order: 45 },
  
  // 👶 Family & Kids
  { name: 'Childcare', type: 'expense', color: '#f472b6', icon: 'baby', isDefault: true, order: 46 },
  { name: 'Kids Activities', type: 'expense', color: '#fb7185', icon: 'blocks', isDefault: true, order: 47 },
  { name: 'Pet Care', type: 'expense', color: '#fbbf24', icon: 'paw-print', isDefault: true, order: 48 },
  
  // 🔧 Subscriptions & Services
  { name: 'Subscriptions', type: 'expense', color: '#a855f7', icon: 'repeat', isDefault: true, order: 49 },
  { name: 'Software & Apps', type: 'expense', color: '#c084fc', icon: 'app-window', isDefault: true, order: 50 },
  
  // 🎁 Other
  { name: 'Charity & Donations', type: 'expense', color: '#f43f5e', icon: 'heart-handshake', isDefault: true, order: 51 },
  { name: 'Miscellaneous', type: 'expense', color: '#a1a1aa', icon: 'more-horizontal', isDefault: true, order: 52 },
];

// Default income categories - organized for detailed analytics
export const defaultIncomeCategories: Omit<Category, 'id' | 'userId'>[] = [
  // 💼 Employment
  { name: 'Salary', type: 'income', color: '#10b981', icon: 'briefcase', isDefault: true, order: 1 },
  { name: 'Bonus', type: 'income', color: '#22c55e', icon: 'award', isDefault: true, order: 2 },
  { name: 'Overtime', type: 'income', color: '#16a34a', icon: 'clock', isDefault: true, order: 3 },
  
  // 💻 Freelance & Business
  { name: 'Freelance', type: 'income', color: '#06b6d4', icon: 'laptop', isDefault: true, order: 4 },
  { name: 'Business Income', type: 'income', color: '#0891b2', icon: 'store', isDefault: true, order: 5 },
  { name: 'Consulting', type: 'income', color: '#22d3ee', icon: 'users', isDefault: true, order: 6 },
  { name: 'Side Hustle', type: 'income', color: '#14b8a6', icon: 'rocket', isDefault: true, order: 7 },
  
  // 📈 Investments & Passive Income
  { name: 'Dividends', type: 'income', color: '#8b5cf6', icon: 'trending-up', isDefault: true, order: 8 },
  { name: 'Interest', type: 'income', color: '#a855f7', icon: 'percent', isDefault: true, order: 9 },
  { name: 'Capital Gains', type: 'income', color: '#7c3aed', icon: 'chart-line', isDefault: true, order: 10 },
  { name: 'Rental Income', type: 'income', color: '#f59e0b', icon: 'building', isDefault: true, order: 11 },
  { name: 'Royalties', type: 'income', color: '#d97706', icon: 'music', isDefault: true, order: 12 },
  
  // 🎁 Other Income
  { name: 'Gifts Received', type: 'income', color: '#ec4899', icon: 'gift', isDefault: true, order: 13 },
  { name: 'Refunds', type: 'income', color: '#3b82f6', icon: 'undo-2', isDefault: true, order: 14 },
  { name: 'Cashback & Rewards', type: 'income', color: '#6366f1', icon: 'badge-percent', isDefault: true, order: 15 },
  { name: 'Tax Refund', type: 'income', color: '#059669', icon: 'receipt', isDefault: true, order: 16 },
  { name: 'Sold Items', type: 'income', color: '#84cc16', icon: 'tag', isDefault: true, order: 17 },
  { name: 'Other Income', type: 'income', color: '#a1a1aa', icon: 'plus-circle', isDefault: true, order: 18 },
];
