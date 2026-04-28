/**
 * store/transactionStore.ts
 * Zustand store caching recent transactions for instant UI updates.
 */
import { create } from 'zustand'
import type { Transaction } from '@/types/dashboard.types'

interface TransactionStore {
  transactions:     Transaction[]
  setTransactions:  (txs: Transaction[]) => void
  addTransaction:   (tx: Transaction) => void
  removeTransaction:(id: string) => void
}

export const useTransactionStore = create<TransactionStore>((set) => ({
  transactions:      [],
  setTransactions:   (transactions) => set({ transactions }),
  addTransaction:    (tx)           => set((s) => ({ transactions: [tx, ...s.transactions] })),
  removeTransaction: (id)           => set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),
}))
