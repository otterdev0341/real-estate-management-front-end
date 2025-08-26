"use client"

import type { ReactNode } from "react"
import { XMarkIcon } from "@heroicons/react/24/outline"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  maxWidth?: "sm" | "md" | "lg" | "xl"
}

export default function Modal({ isOpen, onClose, title, children, footer, maxWidth = "md" }: ModalProps) {
  if (!isOpen) return null

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div
        className={`bg-card border border-border rounded-xl shadow-2xl w-full ${maxWidthClasses[maxWidth]} mx-2 sm:mx-0 max-h-[90vh] overflow-y-auto`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border sticky top-0 bg-card">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">{title}</h2>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6">{children}</div>

        {/* Modal Footer */}
        {footer && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-border">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
