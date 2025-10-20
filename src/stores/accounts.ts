import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { UserAccount, Label } from '@/types'

const STORAGE_KEY = 'account-management-accounts'

/**
 * Загрузка данных из localStorage
 * @returns массив учетных записей
 */
const loadFromStorage = (): UserAccount[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Сохранение данных в localStorage
 * @param accounts - массив учетных записей для сохранения
 */
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

  /**
   * Добавление новой учетной записи
   * @param account - учетная запись для добавления
   */
  const addAccount = (account: UserAccount) => {
    accounts.value.push(account)
  }

  /**
   * Обновление существующей учетной записи
   * @param id - идентификатор записи
   * @param updates - частичные данные для обновления
   */
  const updateAccount = (id: string, updates: Partial<UserAccount>) => {
    const index = accounts.value.findIndex((account) => account.id === id)
    if (index !== -1) {
      accounts.value[index] = { ...accounts.value[index], ...updates }
    }
  }

  /**
   * Удаление учетной записи
   * @param id - идентификатор записи для удаления
   */
  const removeAccount = (id: string) => {
    const index = accounts.value.findIndex((account) => account.id === id)
    if (index !== -1) {
      accounts.value.splice(index, 1)
    }
  }

  /**
   * Парсинг строки меток в массив объектов
   * @param labelsString - строка меток разделенных ";"
   * @returns массив объектов меток
   */
  const parseLabels = (labelsString: string): Label[] => {
    if (!labelsString.trim()) return []
    return labelsString.split(';').map(label => ({ text: label.trim() })).filter(label => label.text)
  }

  /**
   * Форматирование массива меток в строку
   * @param labels - массив объектов меток
   * @returns строка меток разделенных "; "
   */
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
