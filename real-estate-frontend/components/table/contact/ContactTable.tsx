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
import UpdateContactForm from "@/components/form/contact/UpdateContactForm"
import CommonDeleteForm from "@/components/form/delete/CommonDeleteForm"
import { useContactContext } from "@/context/store/ContactStore"
import formatDate from "@/utility/utility"
import { ContactService } from "@/service/contact/ContactService"
import { ContactDto } from "@/domain/contact/contact/ResEntryContactDto"
import { isLeft } from "@/implementation/Either"

const ContactTable = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [sortColumn, setSortColumn] = useState<keyof ContactDto>("businessName")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [updateId, setUpdateId] = useState<string | null>(null)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [updateContactData, setUpdateContactData] = useState<Partial<ContactDto>>({})
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const { contacts, refreshContacts } = useContactContext()

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.internalName ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.contactType ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.email ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.mobilePhone ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const handleSort = (column: keyof ContactDto) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const handleCreateContact = async (contactData: Partial<ContactDto>) => {
    await ContactService.instance.createNewContact(contactData)
    await refreshContacts()
    setIsCreateModalOpen(false)
  }

  const handleUpdateClick = (contact: ContactDto) => {
    setUpdateId(contact.id)
    setUpdateContactData(contact)
    setIsUpdateModalOpen(true)
  }

  const handleCancelUpdate = () => {
    setIsUpdateModalOpen(false)
    setUpdateId(null)
    setUpdateContactData({})
  }

  const handleDeleteClick = (id: string) => {
    setDeleteId(id)
    setIsDeleteModalOpen(true)
    setDeleteError("")
  }

  const handleConfirmDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    setDeleteError("")
    const result = await ContactService.instance.deleteContact(deleteId)
    setIsDeleting(false)
    if (result && "isLeft" in result && isLeft(result)) {
      setDeleteError(result.value.message || "Failed to delete contact")
      return
    }
    setIsDeleteModalOpen(false)
    setDeleteId(null)
    await refreshContacts()
  }

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false)
    setDeleteId(null)
    setDeleteError("")
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
                  { key: "businessName", label: "Business Name" },
                  { key: "internalName", label: "Internal Name" },
                  { key: "contactType", label: "Type" },
                  { key: "mobilePhone", label: "Mobile Phone" },
                  { key: "email", label: "Email" },
                ].map((column) => (
                  <th
                    key={column.key}
                    onClick={() => handleSort(column.key as keyof ContactDto)}
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
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{contact.businessName}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{contact.internalName}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{contact.contactType}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{contact.mobilePhone}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{contact.email}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-1 text-muted-foreground hover:text-accent transition-colors"
                          onClick={() => handleUpdateClick(contact)}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                          onClick={() => handleDeleteClick(contact.id)}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
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
              className="bg-card/60 backdrop-blur-xl border border-border rounded-xl p-4 shadow-lg hover:bg-card/80 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-foreground text-lg">{contact.businessName}</h3>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      {contact.contactType}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">Internal: {contact.internalName}</p>
                  <p className="text-muted-foreground text-sm">Mobile: {contact.mobilePhone}</p>
                  <p className="text-muted-foreground text-sm">Email: {contact.email}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button className="p-2 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-lg transition-colors">
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-card/60 backdrop-blur-xl border border-border rounded-xl p-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <MagnifyingGlassIcon className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-foreground">No contacts found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Contact Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Contact">
        <CreateContactForm
          onSuccess={async () => {
            setIsCreateModalOpen(false)
            await refreshContacts()
          }}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isUpdateModalOpen}
        onClose={handleCancelUpdate}
        title="Update Contact"
        maxWidth="sm"
      >
        {updateId && (
          <UpdateContactForm
            id={updateContactData.id ?? ""}
            businessName={updateContactData.businessName ?? ""}
            internalName={updateContactData.internalName ?? ""}
            detail={updateContactData.detail ?? ""}
            note={updateContactData.note ?? ""}
            contactType={updateContactData.contactType ?? ""}
            address={updateContactData.address ?? ""}
            phone={updateContactData.phone ?? ""}
            mobilePhone={updateContactData.mobilePhone ?? ""}
            line={updateContactData.line ?? ""}
            email={updateContactData.email ?? ""}
            onCancel={handleCancelUpdate}
            onSuccess={async () => {
              setIsUpdateModalOpen(false)
              setUpdateId(null)
              setUpdateContactData({})
              await refreshContacts()
            }}
          />
        )}
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        title="Delete Contact"
        maxWidth="sm"
      >
        {deleteId && (
          <CommonDeleteForm
            description={`Delete contact: "${contacts.find(c => c.id === deleteId)?.businessName}"? This action cannot be undone.`}
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
            isSubmitting={isDeleting}
            error={deleteError}
          />
        )}
      </Modal>
    </div>
  )
}

export default ContactTable