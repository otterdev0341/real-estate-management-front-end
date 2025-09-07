"use client"

import type { ReactNode } from "react"
import { XMarkIcon } from "@heroicons/react/24/outline"
import { useEffect, useRef } from "react"
import { createPortal } from "react-dom"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  maxWidth?: "sm" | "md" | "lg" | "xl"
}

export default function Modal({ isOpen, onClose, title, children, footer, maxWidth = "md" }: ModalProps) {
  const modalRootRef = useRef<Element | null>(null)

  useEffect(() => {
    if (!modalRootRef.current) {
      let root = document.getElementById("modal-root")
      if (!root) {
        root = document.createElement("div")
        root.id = "modal-root"
        document.body.appendChild(root)
      }
      modalRootRef.current = root
    }
  }, [])

  if (!isOpen || !modalRootRef.current) return null

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  }

  // Add wider width for large screens
  const responsiveWidth =
    "w-full " +
    maxWidthClasses[maxWidth] +
    " mx-2 sm:mx-0 " +
    "max-h-[90vh] overflow-y-auto " +
    "lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl"

  return createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div
        className={`bg-card border border-border rounded-xl shadow-2xl ${responsiveWidth}`}
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
    </div>,
    modalRootRef.current
  )
}
