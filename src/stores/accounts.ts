import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { UserAccount, Label } from '@/types'

const STORAGE_KEY = 'account-management-accounts'

const loadFromStorage = (): UserAccount[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const saveToStorage = (accounts: UserAccount[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts))
  } catch {
    console.error('Failed to save accounts to localStorage')
  }
}

export const useAccountsStore = defineStore('accounts', () => {
  const accounts = ref<UserAccount[]>(loadFromStorage())

  watch(accounts, (newAccounts) => {
    saveToStorage(newAccounts)
  }, { deep: true })

  const addAccount = (account: UserAccount) => {
    accounts.value.push(account)
  }

  const updateAccount = (id: string, updates: Partial<UserAccount>) => {
    const index = accounts.value.findIndex((account) => account.id === id)
    if (index !== -1) {
      accounts.value[index] = { ...accounts.value[index], ...updates }
    }
  }

  const removeAccount = (id: string) => {
    const index = accounts.value.findIndex((account) => account.id === id)
    if (index !== -1) {
      accounts.value.splice(index, 1)
    }
  }

  const parseLabels = (labelsString: string): Label[] => {
    if (!labelsString.trim()) return []
    return labelsString.split(';').map(label => ({ text: label.trim() })).filter(label => label.text)
  }

  const formatLabels = (labels: Label[]): string => {
    return labels.map(label => label.text).join('; ')
  }

  return {
    accounts,
    addAccount,
    updateAccount,
    removeAccount,
    parseLabels,
    formatLabels,
  }
})
