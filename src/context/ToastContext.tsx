import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'

interface ToastState {
  message: string
  error: boolean
  show: boolean
}

interface ToastContextValue {
  showToast: (message: string, error?: boolean) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    error: false,
    show: false,
  })
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((message: string, error = false) => {
    setToast({ message, error, show: true })
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setToast((t) => ({ ...t, show: false }))
    }, 2000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className={`toast${toast.show ? ' show' : ''}${toast.error ? ' error' : ''}`}>
        {toast.message}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within a ToastProvider')
  return ctx
}
