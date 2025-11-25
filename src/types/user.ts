export interface UserSettings {
  currency: string;
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

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  settings: UserSettings;
  createdAt: Date;
  updatedAt: Date;
}

export const defaultUserSettings: UserSettings = {
  currency: 'USD',
  dateFormat: 'MM/dd/yyyy',
  theme: 'system',
  language: 'en',
  notifications: {
    budgetAlerts: true,
    billReminders: true,
    weeklyReports: true,
    unusualSpending: true,
  },
};
