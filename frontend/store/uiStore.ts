/**
 * store/uiStore.ts
 * Zustand store for UI state — sidebar, theme, loading overlays.
 */
import { create } from 'zustand'

interface UIStore {
  sidebarOpen:    boolean
  theme:          'dark' | 'light'
  globalLoading:  boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar:  () => void
  setTheme:       (theme: 'dark' | 'light') => void
  toggleTheme:    () => void
  setLoading:     (loading: boolean) => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen:    false,
  theme:          'dark',
  globalLoading:  false,
  setSidebarOpen: (open)    => set({ sidebarOpen: open }),
  toggleSidebar:  ()        => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setTheme:       (theme)   => set({ theme }),
  toggleTheme:    ()        => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
  setLoading:     (loading) => set({ globalLoading: loading }),
}))
