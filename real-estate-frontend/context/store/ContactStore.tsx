"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { ContactService } from "@/service/contact/ContactService"
import { ContactDto } from "@/domain/contact/contact/ResEntryContactDto"
import { BaseQuery } from "@/domain/utility/BaseQueryDto"
import { isRight } from "@/implementation/Either"

interface ContactContextValue {
  contacts: ContactDto[]
  loading: boolean
  refreshContacts: () => Promise<void>
}

const ContactContext = createContext<ContactContextValue>({
  contacts: [],
  loading: true,
  refreshContacts: async () => {},
})

export const useContactContext = () => useContext(ContactContext)

export const ContactProvider = ({ children }: { children: React.ReactNode }) => {
  const [contacts, setContacts] = useState<ContactDto[]>([])
  const [loading, setLoading] = useState(true)

  const fetchContacts = async () => {
    setLoading(true)
    const result = await ContactService.instance.fetchAllContacts({} as BaseQuery)
    if (isRight(result) && Array.isArray(result.value)) {
      setContacts(result.value)
    } else {
      setContacts([])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  return (
    <ContactContext.Provider value={{ contacts, loading, refreshContacts: fetchContacts }}>
      {children}
    </ContactContext.Provider>
  )
}