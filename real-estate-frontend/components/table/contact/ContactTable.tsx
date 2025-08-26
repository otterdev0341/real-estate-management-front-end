"use client"

import { useState } from "react"
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline"
import Modal from "@/components/modal/Modal"
import CreateContactForm from "@/components/form/contact/CreateContactForm"

interface Contact {
  id: string
  businessName: string
  internalName?: string
  detail?: string
  note?: string
  contactType: string
  address?: string
  phone?: string
  mobilePhone?: string
  line?: string
  email?: string
  createdAt: string
  updatedAt: string
}

const mockContacts: Contact[] = [
  {
    id: "C001",
    businessName: "Acme Corp",
    internalName: "acme",
    detail: "Main supplier",
    note: "Preferred vendor",
    contactType: "Owner",
    address: "123 Main St",
    phone: "123-456-7890",
    mobilePhone: "098-765-4321",
    line: "@acmecorp",
    email: "contact@acme.com",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-15",
  },
  {
    id: "C002",
    businessName: "Beta LLC",
    internalName: "beta",
    detail: "Tenant",
    note: "",
    contactType: "Tenant",
    address: "456 Beta Ave",
    phone: "222-333-4444",
    mobilePhone: "111-222-3333",
    line: "@betallc",
    email: "info@beta.com",
    createdAt: "2024-01-12",
    updatedAt: "2024-01-18",
  },
]

export default function ContactTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [sortColumn, setSortColumn] = useState<keyof Contact>("businessName")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const filteredContacts = mockContacts.filter((contact) => {
    const matchesSearch =
      contact.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.internalName ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.contactType ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.email ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.id.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const sortedContacts = [...filteredContacts].sort((a, b) => {
    const aValue = a[sortColumn]
    const bValue = b[sortColumn]
    if (aValue === undefined && bValue === undefined) return 0
    if (aValue === undefined) return sortDirection === "asc" ? 1 : -1
    if (bValue === undefined) return sortDirection === "asc" ? -1 : 1
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  const totalPages = Math.ceil(sortedContacts.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const paginatedContacts = sortedContacts.slice(startIndex, startIndex + rowsPerPage)

  const handleSort = (column: keyof Contact) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const handleCreateContact = (contactData: any) => {
    // Add logic to update your data here
    console.log("Creating new contact:", contactData)
    setIsCreateModalOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contacts</h1>
          <p className="text-muted-foreground mt-1">Manage your contacts</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium"
        >
          <PlusIcon className="w-4 h-4" />
          New Contact
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-card/60 backdrop-blur-xl border border-border rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 backdrop-blur-sm border-b border-border">
                {[
                  { key: "id", label: "ID" },
                  { key: "businessName", label: "Business Name" },
                  { key: "contactType", label: "Type" },
                  { key: "email", label: "Email" },
                  { key: "phone", label: "Phone" },
                  { key: "createdAt", label: "Created At" },
                  { key: "updatedAt", label: "Updated At" },
                ].map((column) => (
                  <th
                    key={column.key}
                    onClick={() => handleSort(column.key as keyof Contact)}
                    className="px-6 py-4 text-left text-sm font-semibold text-foreground cursor-pointer hover:text-accent transition-colors select-none"
                  >
                    <div className="flex items-center gap-1">
                      {column.label}
                      {sortColumn === column.key && (
                        <span className="text-accent">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedContacts.length > 0 ? (
                paginatedContacts.map((contact, index) => (
                  <tr
                    key={contact.id}
                    className={`border-b border-border hover:bg-muted/30 transition-colors ${
                      index % 2 === 0 ? "bg-background/50" : "bg-muted/20"
                    }`}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{contact.id}</td>
                    <td className="px-6 py-4 text-sm text-foreground font-medium">{contact.businessName}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{contact.contactType}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{contact.email}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{contact.phone}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{contact.createdAt}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{contact.updatedAt}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1 text-muted-foreground hover:text-accent transition-colors">
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                        <MagnifyingGlassIcon className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">No contacts found</p>
                      <p className="text-sm text-muted-foreground">Try adjusting your search</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {paginatedContacts.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 bg-muted/30 backdrop-blur-sm border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="px-2 py-1 bg-background border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {startIndex + 1}-{Math.min(startIndex + rowsPerPage, sortedContacts.length)} of{" "}
                {sortedContacts.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {paginatedContacts.length > 0 ? (
          paginatedContacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-lg hover:bg-white/15 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-gray-900 text-lg">{contact.businessName}</h3>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      {contact.contactType}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">Email: {contact.email}</p>
                  <p className="text-gray-700 text-sm">Phone: {contact.phone}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors">
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-100 rounded-lg transition-colors">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <MagnifyingGlassIcon className="w-6 h-6 text-gray-500" />
              </div>
              <p className="text-gray-700">No contacts found</p>
              <p className="text-sm text-gray-500">Try adjusting your search</p>
            </div>
          </div>
        )}

        {/* Mobile Pagination */}
        {paginatedContacts.length > 0 && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span>Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">
                  {startIndex + 1}-{Math.min(startIndex + rowsPerPage, sortedContacts.length)} of{" "}
                  {sortedContacts.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Contact Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Contact">
        <CreateContactForm onSubmit={handleCreateContact} onCancel={() => setIsCreateModalOpen(false)} />
      </Modal>
    </div>
  )
}