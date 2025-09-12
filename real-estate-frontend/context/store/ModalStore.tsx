"use client"
import { createContext, useContext, useState } from "react"

interface ModalContextValue {
  isMobileModalOpen: boolean
  setMobileModalOpen: (open: boolean) => void
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined)

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isMobileModalOpen, setMobileModalOpen] = useState(false)

  return (
    <ModalContext.Provider value={{ isMobileModalOpen, setMobileModalOpen }}>
      {children}
    </ModalContext.Provider>
  )
}

export const useModalStore = () => {
  const context = useContext(ModalContext)
  if (!context) throw new Error("useModalStore must be used within a ModalProvider")
  return context
}

const ModalStore = () => {
  return (
    <div>ModalStore</div>
  )
}
export default ModalStore