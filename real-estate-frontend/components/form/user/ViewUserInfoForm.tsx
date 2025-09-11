"use client"

import { useUserContext } from "@/context/store/UserStore"
import { Skeleton } from "@/components/ui/skeleton"

const ViewUserInfoForm = () => {
  const { user, loading } = useUserContext()

  if (loading) {
    return (
      <div className="w-full max-w-lg mx-auto">
        <div className="bg-card/80 border border-border rounded-xl shadow-xl p-6">
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-20 w-full mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-6 w-1/3 mt-2" />
        </div>
      </div>
    )
  }

  if (!user) {
    return <div className="text-muted-foreground text-center">User not found.</div>
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-card/80 border border-border rounded-xl shadow-xl p-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          <div className="space-y-4">
            <div>
              <div className="text-sm font-semibold text-gray-600 mb-2">Username</div>
              <div className="text-xl font-bold text-gray-900">{user.username}</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600 mb-2">Email</div>
              <div className="text-base text-gray-800">{user.email}</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600 mb-2">First Name</div>
              <div className="text-base text-gray-800">{user.firstName}</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600 mb-2">Last Name</div>
              <div className="text-base text-gray-800">{user.lastName}</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600 mb-2">Gender</div>
              <div className="text-base text-gray-800">{user.gender ?? "-"}</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600 mb-2">Date of Birth</div>
              <div className="text-base text-gray-800">{user.dob ? new Date(user.dob).toLocaleDateString() : "-"}</div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-sm font-semibold text-gray-600 mb-2">Role</div>
              <div className="text-base text-gray-800">{user.role ?? "-"}</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-600 mb-2">User ID</div>
              <div className="text-base text-gray-800 break-all">{user.id?.slice(0, 4) ?? "-"}</div>
            </div>
            {/* Add more user info fields here if needed */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewUserInfoForm