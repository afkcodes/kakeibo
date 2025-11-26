import { Button, Modal, Select } from '@/components/ui';
import { clearDatabase } from '@/services/db';
import { useAppStore } from '@/store';
import {
  AlertTriangle,
  Bell,
  ChevronRight,
  DollarSign,
  Download,
  Monitor,
  Moon,
  Palette,
  Shield,
  Sun,
  Trash2,
  User,
} from 'lucide-react';
import { useState } from 'react';

export const SettingsPage = () => {
  const { theme, setTheme, settings, updateSettings, resetStore } = useAppStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  const currencyOptions = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'JPY', label: 'JPY (¥)' },
    { value: 'INR', label: 'INR (₹)' },
  ];

  const dateFormatOptions = [
    { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY' },
    { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY' },
    { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD' },
  ];

  const handleDeleteAllData = async () => {
    setIsDeleting(true);
    try {
      await clearDatabase();
      resetStore();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete data:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportData = () => {
    // TODO: Implement data export
    console.log('Exporting data...');
  };

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-xl font-semibold text-surface-50">Settings</h1>
          <p className="text-sm text-surface-400 mt-0.5">
            Customize your app preferences
          </p>
        </div>

        {/* Profile Section */}
        <div className="bg-surface-800/60 border border-surface-700/50 rounded-2xl p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center">
              <User className="w-8 h-8 text-primary-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-surface-50">
                Guest User
              </h2>
              <p className="text-sm text-surface-400">
                Your data is stored locally on this device
              </p>
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="bg-surface-800/60 border border-surface-700/50 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Palette className="w-4 h-4 text-purple-400" />
              </div>
              <h2 className="font-medium text-surface-50">Appearance</h2>
            </div>
          </div>
          <div className="p-5">
            <label className="block text-sm text-surface-400 mb-3">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = theme === option.value;

                return (
                  <button
                    key={option.value}
                    onClick={() =>
                      setTheme(option.value as 'light' | 'dark' | 'system')
                    }
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-surface-700 hover:border-surface-600 bg-surface-800/50'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 mx-auto mb-2 ${
                        isSelected ? 'text-primary-400' : 'text-surface-400'
                      }`}
                    />
                    <p
                      className={`text-sm font-medium ${
                        isSelected ? 'text-primary-400' : 'text-surface-400'
                      }`}
                    >
                      {option.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-surface-800/60 border border-surface-700/50 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <DollarSign className="w-4 h-4 text-blue-400" />
              </div>
              <h2 className="font-medium text-surface-50">Preferences</h2>
            </div>
          </div>
          
          {/* Currency Selection */}
          <div className="px-5 py-4 border-b border-surface-700/50">
            <p className="text-sm text-surface-400 mb-3">Currency</p>
            <Select
              options={currencyOptions}
              value={settings.currency}
              onValueChange={(value) => updateSettings({ currency: value })}
            />
          </div>

          {/* Date Format Selection */}
          <div className="px-5 py-4">
            <p className="text-sm text-surface-400 mb-3">Date Format</p>
            <div className="flex flex-wrap gap-2">
              {dateFormatOptions.map((option) => {
                const isSelected = settings.dateFormat === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => updateSettings({ dateFormat: option.value })}
                    className={`py-2 px-4 rounded-full text-sm font-medium transition-all duration-200 ${
                      isSelected
                        ? 'bg-primary-500 text-white'
                        : 'bg-surface-700/50 text-surface-300 hover:bg-surface-700'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-surface-800/60 border border-surface-700/50 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning-500/20 rounded-lg">
                <Bell className="w-4 h-4 text-warning-400" />
              </div>
              <h2 className="font-medium text-surface-50">Notifications</h2>
            </div>
          </div>
          <div className="divide-y divide-surface-700/50">
            {[
              {
                key: 'budgetAlerts',
                label: 'Budget Alerts',
                description: "Get notified when you're close to budget limits",
              },
              {
                key: 'billReminders',
                label: 'Bill Reminders',
                description: 'Reminders for upcoming bills and payments',
              },
              {
                key: 'weeklyReports',
                label: 'Weekly Reports',
                description: 'Receive weekly spending summaries',
              },
              {
                key: 'unusualSpending',
                label: 'Unusual Spending',
                description: 'Alerts for unusual spending patterns',
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between px-5 py-4"
              >
                <div>
                  <p className="font-medium text-surface-100">{item.label}</p>
                  <p className="text-sm text-surface-400">{item.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      settings.notifications[
                        item.key as keyof typeof settings.notifications
                      ]
                    }
                    onChange={(e) =>
                      updateSettings({
                        notifications: {
                          ...settings.notifications,
                          [item.key]: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-surface-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-surface-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500 peer-checked:after:bg-white" />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Data Management Section */}
        <div className="bg-surface-800/60 border border-surface-700/50 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success-500/20 rounded-lg">
                <Shield className="w-4 h-4 text-success-400" />
              </div>
              <h2 className="font-medium text-surface-50">Data Management</h2>
            </div>
          </div>
          <div className="divide-y divide-surface-700/50">
            <button
              onClick={handleExportData}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-700/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-surface-400" />
                <div className="text-left">
                  <p className="font-medium text-surface-100">Export Data</p>
                  <p className="text-sm text-surface-400">
                    Download all your data as CSV or JSON
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-surface-500" />
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-danger-500/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-danger-400" />
                <div className="text-left">
                  <p className="font-medium text-danger-400">Delete All Data</p>
                  <p className="text-sm text-surface-400">
                    Permanently delete all your data
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-surface-500" />
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="text-center py-4">
          <p className="text-sm text-surface-500">Kakeibo v1.0.0</p>
          <p className="text-xs text-surface-600 mt-1">
            Made with ❤️ for better financial health
          </p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete All Data"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-danger-500/20 rounded-xl shrink-0">
              <AlertTriangle className="w-6 h-6 text-danger-400" />
            </div>
            <div>
              <p className="text-surface-200">
                Are you sure you want to delete all your data?
              </p>
              <p className="text-sm text-surface-400 mt-2">
                This will permanently delete all your accounts, transactions,
                budgets, and settings. This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              className="flex-1"
              onClick={handleDeleteAllData}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Everything'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
