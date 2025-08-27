"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { ContactTypeService } from "@/service/contact/ContactTypeService"
import ResEntryContactTypeDto from "@/domain/contact/contactType/ResEntryContactTypeDto"
import { BaseQuery } from "@/domain/utility/BaseQueryDto"
import { isRight } from "@/implementation/Either"

interface ContactTypeContextValue {
  contactTypes: ResEntryContactTypeDto[]
  loading: boolean
  refreshContactTypes: () => Promise<void>
}

const ContactTypeContext = createContext<ContactTypeContextValue>({
  contactTypes: [],
  loading: true,
  refreshContactTypes: async () => {},
})

export const useContactTypeContext = () => useContext(ContactTypeContext)

export const ContactTypeProvider = ({ children }: { children: React.ReactNode }) => {
  const [contactTypes, setContactTypes] = useState<ResEntryContactTypeDto[]>([])
  const [loading, setLoading] = useState(true)

  const fetchContactTypes = async () => {
    setLoading(true)
    const result = await ContactTypeService.instance.fetchAllContactTypes({} as BaseQuery)
    if (isRight(result) && Array.isArray(result.value)) {
      setContactTypes(result.value)
    } else {
      setContactTypes([])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchContactTypes()
  }, [])

  return (
    <ContactTypeContext.Provider value={{ contactTypes, loading, refreshContactTypes: fetchContactTypes }}>
      {children}
    </ContactTypeContext.Provider>
  )
}