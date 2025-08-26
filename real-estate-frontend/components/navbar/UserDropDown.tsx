"use client"

import { useRef, useEffect } from "react"
import {
  UserIcon,
  KeyIcon,
  EnvelopeIcon,
  PencilSquareIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline"

interface UserDropdownProps {
  isOpen: boolean
  onClose: () => void
  position: { top: number; left: number }
}

export function UserDropdown({ isOpen, onClose, position }: UserDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const menuItems = [
    { name: "View User Info", icon: UserIcon, action: "view-info" },
    { name: "Change Password", icon: KeyIcon, action: "change-password" },
    { name: "Change Email", icon: EnvelopeIcon, action: "change-email" },
    { name: "Edit User Info", icon: PencilSquareIcon, action: "edit-info" },
  ]

  const logoutItem = { name: "Log Out", icon: ArrowRightOnRectangleIcon, action: "logout" }

  const handleMenuClick = (action: string) => {
    console.log(`[v0] User clicked: ${action}`)
    // Handle different actions here
    onClose()
  }

  return (
    <>
      <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />

      <div
        ref={dropdownRef}
        className={`
          fixed z-50 shadow-2xl
          lg:w-80 lg:rounded-2xl lg:bg-gray-900/95 lg:backdrop-blur-xl lg:border lg:border-gray-700/50
          max-lg:inset-x-4 max-lg:bottom-4 max-lg:top-20 max-lg:rounded-3xl 
          max-lg:overflow-y-auto max-lg:scrollbar-hide
          max-lg:bg-white/10 max-lg:backdrop-blur-xl max-lg:border max-lg:border-white/20
          [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
        `}
        style={{
          ...(window.innerWidth >= 1024 && {
            top: position.top - 20,
            left: position.left + 60,
            transform: "translateY(-100%)",
          }),
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 lg:p-4 max-lg:p-6 border-b lg:border-gray-700/50 max-lg:border-white/20">
          <span className="lg:text-gray-300 max-lg:text-white text-sm lg:text-sm max-lg:text-base">
            john.doe@gmail.com
          </span>
          <button
            onClick={onClose}
            className="p-1 lg:hover:bg-gray-700/50 max-lg:hover:bg-white/20 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 lg:w-5 lg:h-5 max-lg:w-6 max-lg:h-6 lg:text-gray-400 max-lg:text-white" />
          </button>
        </div>

        {/* User Info */}
        <div className="flex flex-col items-center py-6 lg:py-6 max-lg:py-8 border-b lg:border-gray-700/50 max-lg:border-white/20">
          <div className="w-16 h-16 lg:w-16 lg:h-16 max-lg:w-20 max-lg:h-20 rounded-full bg-green-500 flex items-center justify-center mb-3">
            <UserIcon className="w-8 h-8 lg:w-8 lg:h-8 max-lg:w-10 max-lg:h-10 text-white" />
          </div>
          <h3 className="lg:text-white max-lg:text-white text-lg lg:text-lg max-lg:text-xl font-medium">
            Hi, John Doe!
          </h3>
        </div>

        {/* Menu Items */}
        <div className="p-2 lg:p-2 max-lg:p-4 space-y-1 lg:space-y-0 max-lg:space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            return (
              <button
                key={index}
                onClick={() => handleMenuClick(item.action)}
                className="w-full flex items-center space-x-3 lg:space-x-3 max-lg:space-x-4 p-3 lg:p-3 max-lg:p-4 rounded-xl lg:hover:bg-gray-700/50 max-lg:hover:bg-white/20 transition-colors text-left"
              >
                <Icon className="w-5 h-5 lg:w-5 lg:h-5 max-lg:w-6 max-lg:h-6 lg:text-gray-400 max-lg:text-white" />
                <span className="lg:text-gray-200 max-lg:text-white font-medium lg:text-base max-lg:text-lg">
                  {item.name}
                </span>
              </button>
            )
          })}

          <button
            onClick={() => handleMenuClick(logoutItem.action)}
            className="w-full flex items-center space-x-3 lg:space-x-3 max-lg:space-x-4 p-3 lg:p-3 max-lg:p-4 rounded-xl lg:hover:bg-red-600/20 max-lg:hover:bg-red-500/20 transition-colors text-left border-t lg:border-gray-700/50 max-lg:border-white/20 mt-2 pt-4"
          >
            <logoutItem.icon className="w-5 h-5 lg:w-5 lg:h-5 max-lg:w-6 max-lg:h-6 text-red-500" />
            <span className="text-red-500 font-medium lg:text-base max-lg:text-lg">{logoutItem.name}</span>
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center space-x-4 p-4 lg:p-4 max-lg:p-6 border-t lg:border-gray-700/50 max-lg:border-white/20 lg:mt-0 max-lg:mt-auto">
          <button className="lg:text-gray-400 max-lg:text-white/80 text-sm lg:text-sm max-lg:text-base lg:hover:text-gray-300 max-lg:hover:text-white transition-colors">
            Privacy Policy
          </button>
          <span className="lg:text-gray-600 max-lg:text-white/60">•</span>
          <button className="lg:text-gray-400 max-lg:text-white/80 text-sm lg:text-sm max-lg:text-base lg:hover:text-gray-300 max-lg:hover:text-white transition-colors">
            Terms of Service
          </button>
        </div>
      </div>
    </>
  )
}
