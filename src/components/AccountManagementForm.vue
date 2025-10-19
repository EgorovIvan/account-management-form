<template>
  <v-container fluid class="pa-8">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card elevation="3" class="pa-6">
          <v-card-title class="text-h4 text-center mb-6 text-primary">
            👥 Управление учетными записями
          </v-card-title>

          <v-card-subtitle class="text-center mb-8 text-grey-darken-1">
            Создание и управление учетными записями пользователей
          </v-card-subtitle>

          <div class="d-flex justify-space-between align-center mb-6">
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="addNewAccount"
            >
              Добавить учетную запись
            </v-btn>
          </div>

          <v-alert
            type="info"
            variant="tonal"
            class="mb-6"
          >
            <strong>Подсказка для поля "Метка":</strong> Для указания нескольких меток для одной пары логин/пароль используйте разделитель ";" (точка с запятой).
          </v-alert>

          <div v-if="accounts.length === 0" class="text-center py-8">
            <v-icon size="64" color="grey-lighten-1">mdi-account-multiple-outline</v-icon>
            <p class="text-h6 text-grey mt-4">Нет учетных записей</p>
            <p class="text-body-2 text-grey">Нажмите "Добавить учетную запись" для создания первой записи</p>
          </div>

          <div v-else>
            <v-card
              v-for="(account, index) in accounts"
              :key="account.id"
              class="mb-4"
              variant="outlined"
            >
              <v-card-title class="d-flex justify-space-between align-center">
                <span>Учетная запись #{{ index + 1 }}</span>
                <v-btn
                  icon="mdi-delete"
                  color="error"
                  variant="text"
                  size="small"
                  @click="removeAccount(account.id)"
                />
              </v-card-title>

              <v-card-text>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="account.labelsString"
                      label="Метка"
                      hint="Максимум 50 символов. Разделяйте метки знаком ';'"
                      :counter="50"
                      :maxlength="50"
                      variant="outlined"
                      @blur="validateAndSaveAccount(account)"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-select
                      v-model="account.type"
                      :items="accountTypeOptions"
                      label="Тип записи"
                      variant="outlined"
                      @update:model-value="onAccountTypeChange(account)"
                    />
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="account.login"
                      label="Логин"
                      hint="Максимум 100 символов"
                      :counter="100"
                      :maxlength="100"
                      :error-messages="account.errors.login"
                      variant="outlined"
                      @blur="validateAndSaveAccount(account)"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-if="account.type === 'Локальная'"
                      v-model="account.password"
                      label="Пароль"
                      type="password"
                      hint="Максимум 100 символов"
                      :counter="100"
                      :maxlength="100"
                      :error-messages="account.errors.password"
                      variant="outlined"
                      @blur="validateAndSaveAccount(account)"
                    />
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAccountsStore } from '@/stores/accounts'
import type { UserAccount, AccountType } from '@/types'

const accountsStore = useAccountsStore()

interface AccountWithErrors extends UserAccount {
  labelsString: string
  errors: {
    login: string[]
    password: string[]
  }
}

const accounts = ref<AccountWithErrors[]>([])

const accountTypeOptions = [
  { title: 'LDAP', value: 'LDAP' },
  { title: 'Локальная', value: 'Локальная' }
]

const addNewAccount = () => {
  const newAccount: AccountWithErrors = {
    id: Date.now().toString(),
    labels: [],
    type: 'Локальная',
    login: '',
    password: '',
    labelsString: '',
    errors: {
      login: [],
      password: []
    }
  }
  accounts.value.push(newAccount)
}

const removeAccount = (id: string) => {
  const index = accounts.value.findIndex(account => account.id === id)
  if (index !== -1) {
    accounts.value.splice(index, 1)
    accountsStore.removeAccount(id)
  }
}

const onAccountTypeChange = (account: AccountWithErrors) => {
  if (account.type === 'LDAP') {
    account.password = null
  } else if (account.type === 'Локальная' && account.password === null) {
    account.password = ''
  }
  validateAndSaveAccount(account)
}

const validateAndSaveAccount = (account: AccountWithErrors) => {
  const errors = {
    login: [] as string[],
    password: [] as string[]
  }

  if (!account.login.trim()) {
    errors.login.push('Логин обязателен для заполнения')
  } else if (account.login.length > 100) {
    errors.login.push('Логин не должен превышать 100 символов')
  }

  if (account.type === 'Локальная') {
    if (!account.password) {
      errors.password.push('Пароль обязателен для локальной записи')
    } else if (account.password.length > 100) {
      errors.password.push('Пароль не должен превышать 100 символов')
    }
  }

  account.errors = errors

  if (errors.login.length === 0 && errors.password.length === 0) {
    const labels = accountsStore.parseLabels(account.labelsString)
    const accountToSave: UserAccount = {
      id: account.id,
      labels,
      type: account.type,
      login: account.login,
      password: account.type === 'LDAP' ? null : account.password
    }

    const existingIndex = accountsStore.accounts.findIndex(acc => acc.id === account.id)
    if (existingIndex !== -1) {
      accountsStore.updateAccount(account.id, accountToSave)
    } else {
      accountsStore.addAccount(accountToSave)
    }
  }
}

const loadAccounts = () => {
  accounts.value = accountsStore.accounts.map(account => ({
    ...account,
    labelsString: accountsStore.formatLabels(account.labels),
    password: account.password || '',
    errors: {
      login: [],
      password: []
    }
  }))
}

onMounted(() => {
  loadAccounts()
})
</script>
