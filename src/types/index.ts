/**
 * Интерфейс учетной записи пользователя
 */
export interface UserAccount {
  /** Уникальный идентификатор записи */
  id: string
  /** Массив меток записи */
  labels: Label[]
  /** Тип учетной записи */
  type: AccountType
  /** Логин пользователя */
  login: string
  /** Пароль (null для LDAP) */
  password: string | null
}

/**
 * Интерфейс метки учетной записи
 */
export interface Label {
  text: string
}

/**
 * Тип учетной записи
 */
export type AccountType = 'LDAP' | 'Локальная'

