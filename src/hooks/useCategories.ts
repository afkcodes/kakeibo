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
    const existing = await db.categories.where('userId').equals(userId).count();
    if (existing > 0) return;

    const categories: Category[] = [
      ...defaultExpenseCategories.map((c, i) => ({
        ...c,
        id: generateId(),
        userId,
        order: i + 1,
      })),
      ...defaultIncomeCategories.map((c, i) => ({
        ...c,
        id: generateId(),
        userId,
        order: defaultExpenseCategories.length + i + 1,
      })),
    ];

    await db.categories.bulkAdd(categories);
    return categories;
  };

  return { addCategory, updateCategory, deleteCategory, initializeDefaultCategories };
};
