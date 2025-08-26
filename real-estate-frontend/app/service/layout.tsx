"use client"

import type React from "react"

import { VerticalNavbar } from "@/components/navbar/VecticalNavBar"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-base-100">
      <VerticalNavbar />
      <main className="flex-1 ml-0 lg:ml-20 p-6 transition-all duration-300">{children}</main>
    </div>
  )
}
