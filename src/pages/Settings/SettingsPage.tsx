import { Card, CardContent, CardHeader, CardTitle, Select } from '@/components/ui';
import { useAppStore } from '@/store';
import { Bell, ChevronRight, Download, Monitor, Moon, Shield, Sun, Trash2 } from 'lucide-react';

export const SettingsPage = () => {
  const { theme, setTheme, settings, updateSettings } = useAppStore();

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  const currencyOptions = [
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'JPY', label: 'JPY - Japanese Yen' },
    { value: 'INR', label: 'INR - Indian Rupee' },
  ];

  const dateFormatOptions = [
    { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY' },
    { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY' },
    { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD' },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-100">
          Settings
        </h1>
        <p className="text-surface-400 mt-1">
          Customize your app preferences
        </p>
      </div>

      {/* Appearance */}
      <Card padding="none">
        <CardHeader className="p-4 sm:p-6 pb-0">
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-200 mb-3">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-3">
                {themeOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = theme === option.value;

                  return (
                    <button
                      key={option.value}
                      onClick={() => setTheme(option.value as 'light' | 'dark' | 'system')}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        isSelected
                          ? 'border-primary-500 bg-primary-500/20'
                          : 'border-surface-700 hover:border-surface-600'
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 mx-auto mb-2 ${
                          isSelected ? 'text-primary-400' : 'text-surface-500'
                        }`}
                      />
                      <p
                        className={`text-sm font-medium ${
                          isSelected
                            ? 'text-primary-400'
                            : 'text-surface-400'
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
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card padding="none">
        <CardHeader className="p-4 sm:p-6 pb-0">
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            <Select
              label="Currency"
              options={currencyOptions}
              value={settings.currency}
              onChange={(e) => updateSettings({ currency: e.target.value })}
            />
            <Select
              label="Date Format"
              options={dateFormatOptions}
              value={settings.dateFormat}
              onChange={(e) => updateSettings({ dateFormat: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card padding="none">
        <CardHeader className="p-4 sm:p-6 pb-0">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-surface-500" />
            <CardTitle>Notifications</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            {[
              { key: 'budgetAlerts', label: 'Budget Alerts', description: 'Get notified when you\'re close to budget limits' },
              { key: 'billReminders', label: 'Bill Reminders', description: 'Reminders for upcoming bills and payments' },
              { key: 'weeklyReports', label: 'Weekly Reports', description: 'Receive weekly spending summaries' },
              { key: 'unusualSpending', label: 'Unusual Spending', description: 'Alerts for unusual spending patterns' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-surface-100">{item.label}</p>
                  <p className="text-sm text-surface-400">{item.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications[item.key as keyof typeof settings.notifications]}
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
                  <div className="w-11 h-6 bg-surface-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-300 after:border-surface-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card padding="none">
        <CardHeader className="p-4 sm:p-6 pb-0">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-surface-500" />
            <CardTitle>Data Management</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-surface-800/50 transition-colors duration-200">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-surface-500" />
                <div className="text-left">
                  <p className="font-medium text-surface-100">Export Data</p>
                  <p className="text-sm text-surface-400">Download all your data as CSV or JSON</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-surface-500" />
            </button>

            <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-surface-800/50 transition-colors duration-200">
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-danger-500" />
                <div className="text-left">
                  <p className="font-medium text-danger-400">Delete All Data</p>
                  <p className="text-sm text-surface-400">Permanently delete all your data</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-surface-500" />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
