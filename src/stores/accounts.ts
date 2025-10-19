import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserAccount } from '@/types'

export const useAccountsStore = defineStore('accounts', () => {
  const accounts = ref<UserAccount[]>([])

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

  return {
    accounts,
    addAccount,
    updateAccount,
    removeAccount,
  }
})
