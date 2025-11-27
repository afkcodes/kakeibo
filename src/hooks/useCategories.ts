import { db, generateId } from '@/services/db';
import type { Category, CreateCategoryInput } from '@/types';
import { defaultExpenseCategories, defaultIncomeCategories } from '@/types/category';
import { useLiveQuery } from 'dexie-react-hooks';

export const useCategories = (userId?: string) => {
  const categories = useLiveQuery(async () => {
    if (!userId) {
      // Return all categories if no userId provided
      return db.categories.orderBy('order').toArray();
    }
    return db.categories.where('userId').equals(userId).sortBy('order');
  }, [userId]);

  return categories ?? [];
};

export const useCategoriesByType = (userId: string, type: 'expense' | 'income') => {
  const categories = useLiveQuery(async () => {
    return db.categories
      .where({ userId, type })
      .sortBy('order');
  }, [userId, type]);

  return categories ?? [];
};

export const useCategory = (id: string) => {
  return useLiveQuery(() => db.categories.get(id), [id]);
};

export const useCategoryActions = () => {
  const addCategory = async (input: CreateCategoryInput, userId: string) => {
    const categories = await db.categories.where('userId').equals(userId).toArray();
    const maxOrder = Math.max(...categories.map(c => c.order), 0);

    const category: Category = {
      id: generateId(),
      userId,
      ...input,
      isDefault: false,
      order: maxOrder + 1,
    };

    await db.categories.add(category);
    return category;
  };

  const updateCategory = async (id: string, updates: Partial<CreateCategoryInput>) => {
    await db.categories.update(id, updates);
  };

  const deleteCategory = async (id: string) => {
    const category = await db.categories.get(id);
    if (category && !category.isDefault) {
      await db.categories.delete(id);
    }
  };

  const initializeDefaultCategories = async (userId: string) => {
    // First, clean up any duplicate categories
    const allCategories = await db.categories.where('userId').equals(userId).toArray();
    
    // Remove deprecated category names that have been replaced
    const deprecatedNames = ['Others', 'Other']; // Replaced by "Miscellaneous" and "Other Income"
    const deprecatedIds: string[] = [];
    
    for (const cat of allCategories) {
      if (deprecatedNames.includes(cat.name)) {
        deprecatedIds.push(cat.id);
      }
    }
    
    if (deprecatedIds.length > 0) {
      await db.categories.bulkDelete(deprecatedIds);
      // Refresh the list after deletion
      const refreshed = await db.categories.where('userId').equals(userId).toArray();
      allCategories.length = 0;
      allCategories.push(...refreshed);
    }
    
    // Find duplicates by name and type
    const seen = new Map<string, string>();
    const duplicateIds: string[] = [];
    
    for (const cat of allCategories) {
      const key = `${cat.type}-${cat.name}`;
      if (seen.has(key)) {
        duplicateIds.push(cat.id);
      } else {
        seen.set(key, cat.id);
      }
    }
    
    // Remove duplicates
    if (duplicateIds.length > 0) {
      await db.categories.bulkDelete(duplicateIds);
    }

    // Check if categories already exist for this user (after cleanup)
    const existing = await db.categories.where('userId').equals(userId).toArray();
    
    // Create a map of existing categories by name and type
    const existingCatMap = new Map<string, Category>();
    for (const cat of existing) {
      const key = `${cat.type}-${cat.name.toLowerCase()}`;
      existingCatMap.set(key, cat);
    }
    
    // Create a map of default categories for icon/color updates
    const defaultCatMap = new Map<string, { icon: string; color: string; name: string }>();
    [...defaultExpenseCategories, ...defaultIncomeCategories].forEach(c => {
      // Map by old names too for migration
      const oldNames: Record<string, string> = {
        'food': 'food & dining',
        'transport': 'transportation', 
        'bills': 'bills & utilities',
        'health': 'healthcare',
        'rent': 'housing',
        'personal': 'personal care',
        'rental': 'rental income',
      };
      defaultCatMap.set(`${c.type}-${c.name.toLowerCase()}`, { icon: c.icon, color: c.color, name: c.name });
      // Also add old name mappings
      const newNameLower = c.name.toLowerCase();
      if (oldNames[newNameLower]) {
        defaultCatMap.set(`${c.type}-${oldNames[newNameLower]}`, { icon: c.icon, color: c.color, name: c.name });
      }
    });

    // Update existing categories with correct icons/colors
    for (const cat of existing) {
      const key = `${cat.type}-${cat.name.toLowerCase()}`;
      const defaultCat = defaultCatMap.get(key);
      if (defaultCat && cat.isDefault) {
        // Update icon and color to match defaults, also update name if it changed
        await db.categories.update(cat.id, { 
          icon: defaultCat.icon, 
          color: defaultCat.color,
          name: defaultCat.name 
        });
      }
    }

    // Get the max order from existing categories
    const maxOrder = existing.length > 0 ? Math.max(...existing.map(c => c.order)) : 0;
    let newOrder = maxOrder;

    // Add any missing default categories
    const missingCategories: Category[] = [];
    
    [...defaultExpenseCategories, ...defaultIncomeCategories].forEach((c) => {
      const key = `${c.type}-${c.name.toLowerCase()}`;
      if (!existingCatMap.has(key)) {
        newOrder++;
        missingCategories.push({
          ...c,
          id: `${userId}-${c.type}-${c.name.toLowerCase().replace(/\s+/g, '-')}`,
          userId,
          order: newOrder,
        });
      }
    });

    if (missingCategories.length > 0) {
      await db.categories.bulkPut(missingCategories);
    }

    // If there were no existing categories, we just added all defaults
    if (existing.length === 0) {
      return missingCategories;
    }

    return [...existing, ...missingCategories];
  };

  return { addCategory, updateCategory, deleteCategory, initializeDefaultCategories };
};
