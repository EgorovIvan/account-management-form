export interface UserAccount {
  id: string
  labels: Label[]
  type: AccountType
  login: string
  password: string | null
}

export interface Label {
  text: string
}

export type AccountType = 'LDAP' | 'Локальная'

