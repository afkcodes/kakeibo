import { Button, Input, Modal, Select } from '@/components/ui';
import { useAccountActions, useAccountStats, useAccountsWithBalance } from '@/hooks/useAccounts';
import { useCurrency } from '@/hooks/useCurrency';
import { useAppStore } from '@/store';
import type { Account, AccountType } from '@/types';
import {
    AlertTriangle,
    ArrowDownRight,
    ArrowLeftRight,
    ArrowUpRight,
    Banknote,
    Building2,
    CreditCard,
    MoreVertical,
    Pencil,
    Plus,
    Trash2,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const getAccountIcon = (type: AccountType) => {
  switch (type) {
    case 'bank':
      return Building2;
    case 'credit':
      return CreditCard;
    case 'cash':
      return Banknote;
    case 'investment':
      return TrendingUp;
    default:
      return Wallet;
  }
};

const getAccountTypeLabel = (type: AccountType) => {
  switch (type) {
    case 'bank':
      return 'Bank Account';
    case 'credit':
      return 'Credit Card';
    case 'cash':
      return 'Cash';
    case 'investment':
      return 'Investment';
    default:
      return 'Account';
  }
};

const typeOptions = [
  { value: 'bank', label: 'Bank Account', icon: 'landmark' },
  { value: 'credit', label: 'Credit Card', icon: 'credit-card' },
  { value: 'cash', label: 'Cash', icon: 'banknote' },
  { value: 'investment', label: 'Investment', icon: 'trending-up' },
  { value: 'wallet', label: 'Digital Wallet', icon: 'wallet' },
];

const colorOptions = [
  { value: '#3b82f6', label: 'Blue', icon: 'circle' },
  { value: '#10b981', label: 'Green', icon: 'circle' },
  { value: '#f59e0b', label: 'Yellow', icon: 'circle' },
  { value: '#ef4444', label: 'Red', icon: 'circle' },
  { value: '#8b5cf6', label: 'Purple', icon: 'circle' },
  { value: '#ec4899', label: 'Pink', icon: 'circle' },
  { value: '#06b6d4', label: 'Cyan', icon: 'circle' },
  { value: '#6b7280', label: 'Gray', icon: 'circle' },
];

export const AccountsPage = () => {
  const { currentUserId, setActiveModal } = useAppStore();
  const { formatCurrencyCompact } = useCurrency();
  const accounts = useAccountsWithBalance(currentUserId ?? undefined);
  const stats = useAccountStats(currentUserId ?? undefined);
  const { deleteAccount, updateAccount } = useAccountActions();

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<Account | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Edit form state
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<AccountType>('bank');
  const [editBalance, setEditBalance] = useState('0');
  const [editColor, setEditColor] = useState('#3b82f6');
  
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalAssets = stats?.totalAssets ?? 0;
  const totalLiabilities = stats?.totalLiabilities ?? 0;
  const netWorth = stats?.netWorth ?? 0;

  // Group accounts by type
  const groupedAccounts = useMemo(() => {
    const groups: Record<AccountType, typeof accounts> = {
      bank: [],
      credit: [],
      cash: [],
      investment: [],
      wallet: [],
    };

    accounts.forEach((account) => {
      if (groups[account.type]) {
        groups[account.type].push(account);
      }
    });

    return groups;
  }, [accounts]);

  // Calculate percentage of net worth for assets vs liabilities
  const assetsPercentage = totalAssets > 0 ? (totalAssets / (totalAssets + Math.abs(totalLiabilities))) * 100 : 0;

  const handleOpenEditModal = (account: Account) => {
    setEditingAccount(account);
    setEditName(account.name);
    setEditType(account.type);
    setEditBalance(account.balance.toString());
    setEditColor(account.color);
    setOpenMenuId(null);
  };

  const handleCloseEditModal = () => {
    setEditingAccount(null);
    setEditName('');
    setEditType('bank');
    setEditBalance('0');
    setEditColor('#3b82f6');
  };

  const handleUpdateAccount = async () => {
    if (!editingAccount) return;
    
    setIsUpdating(true);
    try {
      await updateAccount(editingAccount.id, {
        name: editName,
        type: editType,
        balance: parseFloat(editBalance) || 0,
        color: editColor,
      });
      handleCloseEditModal();
    } catch (error) {
      console.error('Failed to update account:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenDeleteModal = (account: Account) => {
    setDeletingAccount(account);
    setOpenMenuId(null);
  };

  const handleCloseDeleteModal = () => {
    setDeletingAccount(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingAccount) return;
    
    setIsDeleting(true);
    try {
      await deleteAccount(deletingAccount.id);
      handleCloseDeleteModal();
    } catch (error) {
      console.error('Failed to delete account:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTransferToAccount = (_accountId: string) => {
    // TODO: Open transfer modal with this account pre-selected as destination
    setActiveModal('add-transaction');
    setOpenMenuId(null);
  };

  return (
    <>
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-semibold text-surface-50">Accounts</h1>
        <p className="text-sm text-surface-400 mt-0.5">
          Manage your financial accounts
        </p>
      </div>

      {/* Net Worth Overview Card */}
      <div className="bg-surface-800/60 border border-surface-700/50 rounded-xl squircle p-5">
        <div className="flex flex-col gap-4">
          {/* Net Worth Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-surface-400">Net Worth</p>
              <p
                className={`text-3xl font-bold font-mono mt-1 ${
                  netWorth >= 0 ? 'text-surface-50' : 'text-danger-400'
                }`}
              >
                {formatCurrencyCompact(netWorth)}
              </p>
            </div>
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium ${
                netWorth >= 0
                  ? 'bg-success-500/15 text-success-400'
                  : 'bg-danger-500/15 text-danger-400'
              }`}
            >
              {netWorth >= 0 ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              <span>{netWorth >= 0 ? 'Positive' : 'Negative'}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="h-2 bg-surface-700 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-success-500 rounded-l-full transition-all duration-500"
                style={{ width: `${assetsPercentage}%` }}
              />
              <div
                className="h-full bg-danger-500 rounded-r-full transition-all duration-500"
                style={{ width: `${100 - assetsPercentage}%` }}
              />
            </div>

            {/* Assets vs Liabilities */}
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success-500" />
                <span className="text-surface-400">Assets</span>
                <span className="font-mono font-medium text-success-400">
                  {formatCurrencyCompact(totalAssets)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium text-danger-400">
                  {formatCurrencyCompact(totalLiabilities)}
                </span>
                <span className="text-surface-400">Liabilities</span>
                <div className="w-2 h-2 rounded-full bg-danger-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Bank Accounts',
            count: groupedAccounts.bank.length,
            icon: Building2,
            color: 'text-blue-400',
            bg: 'bg-blue-500/20',
          },
          {
            label: 'Credit Cards',
            count: groupedAccounts.credit.length,
            icon: CreditCard,
            color: 'text-purple-400',
            bg: 'bg-purple-500/20',
          },
          {
            label: 'Cash',
            count: groupedAccounts.cash.length,
            icon: Banknote,
            color: 'text-success-400',
            bg: 'bg-success-500/20',
          },
          {
            label: 'Investments',
            count: groupedAccounts.investment.length,
            icon: TrendingUp,
            color: 'text-warning-400',
            bg: 'bg-warning-500/20',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-surface-800/40 border border-surface-700/30 rounded-xl squircle p-3 flex items-center gap-3"
          >
            <div className={`p-2 rounded-lg ${stat.bg}`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div>
              <p className="text-lg font-semibold text-surface-50">
                {stat.count}
              </p>
              <p className="text-xs text-surface-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Accounts List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium text-surface-50">
            All Accounts
          </h2>
          <span className="text-sm text-surface-400">
            {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'}
          </span>
        </div>

        <div className="grid gap-2">
          {accounts.map((account) => {
            const Icon = getAccountIcon(account.type);
            const isNegative = account.balance < 0;
            const isCredit = account.type === 'credit';

            return (
              <div
                key={account.id}
                className="relative flex items-center gap-3 bg-surface-800/40 border border-surface-700/30 rounded-xl p-3.5 squircle"
              >
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 squircle"
                  style={{ backgroundColor: `${account.color}18` }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: account.color }}
                  />
                </div>

                {/* Name & Type */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-surface-100 text-[14px] truncate leading-tight">
                    {account.name}
                  </h3>
                  <p className="text-[12px] text-surface-500 mt-0.5">
                    {getAccountTypeLabel(account.type)}
                  </p>
                </div>

                {/* Balance */}
                <p
                  className={`font-bold font-amount text-[15px] shrink-0 ${
                    isCredit
                      ? isNegative
                        ? 'text-danger-400'
                        : 'text-success-400'
                      : isNegative
                        ? 'text-danger-400'
                        : 'text-surface-50'
                  }`}
                >
                  {formatCurrencyCompact(account.balance)}
                </p>

                {/* Menu Button */}
                <div className="relative shrink-0" ref={openMenuId === account.id ? menuRef : null}>
                  <button
                    className="p-1.5 -mr-1 rounded-lg active:bg-surface-700/50 text-surface-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === account.id ? null : account.id);
                    }}
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  
                  {openMenuId === account.id && (
                    <div className="absolute right-0 top-full mt-1 w-44 bg-surface-800 border border-surface-700 rounded-xl squircle shadow-xl z-50 py-1 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
                      <button
                        className="w-full px-4 py-2.5 text-left text-sm text-surface-200 active:bg-surface-700/50 flex items-center gap-3 transition-colors"
                        onClick={() => handleTransferToAccount(account.id)}
                      >
                        <ArrowLeftRight className="w-4 h-4 text-surface-400" />
                        Transfer
                      </button>
                      <button
                        className="w-full px-4 py-2.5 text-left text-sm text-surface-200 active:bg-surface-700/50 flex items-center gap-3 transition-colors"
                        onClick={() => handleOpenEditModal(account)}
                      >
                        <Pencil className="w-4 h-4 text-surface-400" />
                        Edit Account
                      </button>
                      <div className="h-px bg-surface-700 my-1" />
                      <button
                        className="w-full px-4 py-2.5 text-left text-sm text-danger-400 active:bg-danger-500/10 flex items-center gap-3 transition-colors"
                        onClick={() => handleOpenDeleteModal(account)}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Account
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add Account Card */}
          <button
            onClick={() => setActiveModal('add-account')}
            className="border-2 border-dashed border-surface-700/70 active:border-surface-500 rounded-xl squircle p-6 flex items-center justify-center gap-3 transition-all duration-200 group"
          >
            <div className="w-10 h-10 bg-surface-700/50 group-active:bg-surface-700 rounded-xl squircle flex items-center justify-center transition-colors">
              <Plus className="w-5 h-5 text-surface-400 group-active:text-surface-300" />
            </div>
            <span className="font-medium text-surface-400 group-active:text-surface-300">
              Add New Account
            </span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {accounts.length === 0 && (
        <div className="bg-surface-800/40 border border-surface-700/30 rounded-xl squircle p-8 text-center">
          <div className="w-16 h-16 bg-surface-700/50 rounded-xl squircle flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-surface-400" />
          </div>
          <h3 className="text-lg font-medium text-surface-50 mb-2">
            No accounts yet
          </h3>
          <p className="text-surface-400 text-sm mb-4 max-w-sm mx-auto">
            Add your bank accounts, credit cards, and other financial accounts
            to track your complete financial picture.
          </p>
          <Button
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setActiveModal('add-account')}
          >
            Add Your First Account
          </Button>
        </div>
      )}
    </div>

    {/* Edit Account Modal */}
    <Modal
      isOpen={!!editingAccount}
      onClose={handleCloseEditModal}
      title="Edit Account"
      size="md"
    >
      <div className="space-y-4">
        <Input
          label="Account Name"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          placeholder="e.g., Main Checking, Savings"
        />

        <Select
          label="Account Type"
          options={typeOptions}
          value={editType}
          onValueChange={(value) => setEditType(value as AccountType)}
        />

        <Input
          label="Current Balance"
          type="number"
          step="0.01"
          value={editBalance}
          onChange={(e) => setEditBalance(e.target.value)}
          placeholder="0.00"
        />

        <Select
          label="Color"
          options={colorOptions}
          value={editColor}
          onValueChange={setEditColor}
        />

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handleCloseEditModal}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={handleUpdateAccount}
            disabled={isUpdating || !editName.trim()}
          >
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Modal>

    {/* Delete Confirmation Modal */}
    <Modal
      isOpen={!!deletingAccount}
      onClose={handleCloseDeleteModal}
      title="Delete Account"
      size="sm"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-danger-500/20 rounded-xl shrink-0">
            <AlertTriangle className="w-6 h-6 text-danger-400" />
          </div>
          <div>
            <p className="text-surface-200">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-surface-50">
                {deletingAccount?.name}
              </span>
              ?
            </p>
            <p className="text-sm text-surface-400 mt-2">
              This action cannot be undone. All transactions associated with
              this account will remain but won't be linked to any account.
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={handleCloseDeleteModal}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            className="flex-1"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </Button>
        </div>
      </div>
    </Modal>
    </>
  );
};
