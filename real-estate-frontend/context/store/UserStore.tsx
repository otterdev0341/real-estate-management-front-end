"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { AuthService } from "@/service/auth/authService"
import { UserData } from "@/domain/user/UserDataDto"
import { isLeft, isRight } from "@/implementation/Either"

interface UserContextValue {
  user: UserData | null
  loading: boolean
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextValue>({
  user: null,
  loading: true,
  refreshUser: async () => {},
})

export const useUserContext = () => useContext(UserContext)

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = async () => {
    setLoading(true)
    const result = await AuthService.instance.fetchCurrentUser()
    if (isRight(result)) {
      setUser(result.value)
    } else {
      setUser(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return (
    <UserContext.Provider value={{ user, loading, refreshUser: fetchUser }}>
      {children}
    </UserContext.Provider>
    )
}