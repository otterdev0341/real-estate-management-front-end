"use client"

import React from "react"
import { useRouter, usePathname } from "next/navigation"

import { useState, useRef } from "react"
import {
  HomeIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  Bars3Icon,
  DocumentIcon,
  ChartBarIcon,
  PencilSquareIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  ArrowTrendingUpIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import UserDisplayCard from "./UserDisplayCard"


const navigationItems = [
  { name: "", icon: HomeIcon, href: "/service/dashboard", active: true }, // Dashboard with no text
  { name: "Property", icon: BuildingOfficeIcon, href: "/service/property" },
  { name: "Contact", icon: UserGroupIcon, href: "/service/contact" },
  { name: "Expense", icon: CurrencyDollarIcon, href: "/service/expense" },
  { name: "Memo", icon: PencilSquareIcon, href: "/service/memo" },
  { name: "File", icon: DocumentIcon, href: "#" },
  { name: "Report", icon: ChartBarIcon, href: "#" },
  { name: "Sale", icon: ShoppingCartIcon, href: "/service/sale" },
  { name: "Payment", icon: CreditCardIcon, href: "/service/payment" },
  { name: "Investment", icon: ArrowTrendingUpIcon, href: "/service/investment" },
]



export function VerticalNavbar() {
  const pathname = usePathname()
  // Find the item that matches the current path
  const getActiveItem = (pathname: string) => {
    if (pathname.startsWith("/service/memo")) return "Memo"
    if (pathname.startsWith("/service/property")) return "Property"
    if (pathname.startsWith("/service/sale")) return "Sale"
    if (pathname.startsWith("/service/payment")) return "Payment"
    if (pathname.startsWith("/service/investment")) return "Investment"
    const matched = navigationItems.find(item => item.href === pathname)
    return matched?.name || "Dashboard"
  }

  const [activeItem, setActiveItem] = useState(getActiveItem(pathname))
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const [loadingItem, setLoadingItem] = useState<string | null>(null)
  const avatarRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()

  const handleNavigation = async (href: string, itemName: string) => {
    if (href === "#") return

    setLoadingItem(itemName)
    setActiveItem(itemName)
    setIsMobileMenuOpen(false)

    await new Promise((resolve) => setTimeout(resolve, 400))

    router.push(href)

    setTimeout(() => setLoadingItem(null), 500)
  }

  const handleAvatarClick = (event: React.MouseEvent) => {
    if (avatarRef.current) {
      const rect = avatarRef.current.getBoundingClientRect()
      // Position dropdown to the right of avatar, vertically centered
      const top = rect.top + rect.height / 2
      const left = rect.right + 4 // 12px margin from avatar

      setDropdownPosition({ top, left })
    }
    setIsUserDropdownOpen(!isUserDropdownOpen)
  }

  // Update activeItem when pathname changes
  React.useEffect(() => {
    setActiveItem(getActiveItem(pathname))
  }, [pathname])

  return (
    <>
      {/* Desktop Navbar */}
      <div className="hidden lg:flex w-20 bg-white/10 backdrop-blur-xl border-r border-white/20 min-h-screen flex-col items-center py-6 shadow-2xl fixed left-0 top-0 z-30">
        {/* Navigation Items */}
        <div className="flex flex-col space-y-4 flex-1 overflow-y-auto scrollbar-hide">
          {navigationItems.map((item, index) => {
            const Icon = item.icon
            const itemName = item.name || "Dashboard"
            const isLoading = loadingItem === itemName
            return (
              <button
                key={index}
                onClick={() => handleNavigation(item.href, itemName)}
                disabled={isLoading}
                className={`
                  p-3 rounded-xl transition-all duration-300 group relative backdrop-blur-sm
                  ${
                    activeItem === itemName
                      ? "bg-blue-600/80 text-white shadow-lg border border-blue-400/50"
                      : "text-gray-700 hover:bg-blue-500/20 hover:text-blue-800 border border-transparent hover:border-blue-300/30 bg-white/40"
                  }
                  ${isLoading ? "opacity-75 cursor-not-allowed" : ""}
                `}
              >
                {isLoading ? (
                  <div className="w-6 h-6 animate-spin">
                    <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full"></div>
                  </div>
                ) : (
                  <Icon className="w-6 h-6" />
                )}

                <div className="absolute left-full ml-2 px-3 py-2 bg-white text-black text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-10 shadow-2xl border border-gray-200">
                  {isLoading ? "Loading..." : itemName}
                </div>
              </button>
            )
          })}
        </div>

        {/* User Info Section - Fixed at bottom */}
        <div className="flex-shrink-0 mt-4">
          <button
            ref={avatarRef}
            onClick={handleAvatarClick}
            className={`
              p-3 rounded-xl transition-all duration-300 backdrop-blur-sm group relative
              text-gray-700 hover:bg-blue-500/20 hover:text-blue-800 border border-transparent hover:border-blue-300/30 bg-white/40
            `}
          >
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white text-xs font-semibold">JD</span>
            </div>
            
            {/* Tooltip for desktop */}
            <div className="absolute left-full ml-2 px-3 py-2 bg-white text-black text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-10 shadow-2xl border border-gray-200">
              Profile
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Hamburger Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`p-3 rounded-xl shadow-xl transition-all duration-300 border ${
            isMobileMenuOpen
              ? "bg-white/25 border-white/30 backdrop-blur-xl"
              : "bg-white/5 border-white/40 "
          }`}
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="w-6 h-6 text-white" />
          ) : (
            <Bars3Icon className="w-6 h-6 text-gray-300" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-all duration-300 ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />

        {/* Drawer */}
        <div
          className={`absolute left-0 top-0 h-full w-80 bg-white/10 backdrop-blur-xl shadow-2xl border-r border-white/20 transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full p-6 pt-20">
            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <div className="flex flex-col space-y-2 pb-4">
                {navigationItems.map((item, index) => {
                  const Icon = item.icon
                  const itemName = item.name || "Dashboard"
                  const isLoading = loadingItem === itemName
                  return (
                    <button
                      key={index}
                      onClick={() => handleNavigation(item.href, itemName)}
                      disabled={isLoading}
                      className={`
                        flex items-center space-x-3 p-4 rounded-xl transition-all duration-300 text-left backdrop-blur-sm
                        ${
                          activeItem === itemName
                            ? "bg-blue-600/80 text-white shadow-lg border border-blue-400/50"
                            : "text-gray-700 hover:bg-blue-500/20 hover:text-blue-800 border border-transparent hover:border-blue-300/30 bg-white/40"
                        }
                        ${isLoading ? "opacity-75 cursor-not-allowed" : ""}
                      `}
                    >
                      {isLoading ? (
                        <div className="w-6 h-6 animate-spin">
                          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                        </div>
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                      <span className="font-medium">{isLoading ? "Loading..." : itemName}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* User Info Section - styled as navigation item */}
            <div className="flex-shrink-0 border-t border-white/20 pt-4">
              <button
                onClick={handleAvatarClick}
                className={`
                  flex items-center space-x-3 p-4 rounded-xl transition-all duration-300 text-left w-full backdrop-blur-sm
                  text-gray-700 hover:bg-blue-500/20 hover:text-blue-800 border border-transparent hover:border-blue-300/30 bg-white/40
                `}
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">JD</span>
                </div>
                <div>
                  <p className="font-medium">John Doe</p>
                  <p className="text-sm opacity-70">Administrator</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* UserDropdown component */}
      <UserDisplayCard
        isOpen={isUserDropdownOpen}
        onClose={() => setIsUserDropdownOpen(false)}
        position={dropdownPosition}
      />

      {/* Global loading overlay for page transitions */}
      {loadingItem && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/30">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 animate-spin">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              </div>
              <span className="text-gray-800 font-medium">Loading {loadingItem}...</span>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  )
}