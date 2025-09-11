"use client"

import { useState } from "react"
import UserService from "@/service/user/UserService"
import ReqChangePasswordDto from "@/domain/user/ReqChangePasswordDto"
import { isLeft, isRight } from "@/implementation/Either"

const ChangePasswordForm = () => {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
    setSuccess("")
  }

  const validateForm = () => {
    if (!formData.oldPassword.trim() || !formData.newPassword.trim() || !formData.confirmNewPassword.trim()) {
      setError("All fields are required")
      return false
    }
    if (formData.newPassword !== formData.confirmNewPassword) {
      setError("New passwords do not match")
      return false
    }
    setError("")
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    if (!validateForm()) return

    setLoading(true)
    const dto = new ReqChangePasswordDto(formData.newPassword, formData.confirmNewPassword, formData.oldPassword)
    const result = await UserService.instance.changePassword(dto)
    setLoading(false)
    if (isRight(result)) {
      setSuccess("Password changed successfully!")
      setFormData({ oldPassword: "", newPassword: "", confirmNewPassword: "" })
    } else if (isLeft(result)) {
      setError(result.value.message || "Failed to change password")
    } else {
      setError("Unexpected error occurred")
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto bg-card/80 border border-border rounded-xl shadow-xl p-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-foreground">Change Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Old Password *</label>
          <input
            type="password"
            name="oldPassword"
            value={formData.oldPassword}
            onChange={(e) => handleInputChange("oldPassword", e.target.value)}
            placeholder="Enter your old password"
            className={`w-full px-3 py-2 bg-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm sm:text-base ${
              error && !formData.oldPassword ? "border-red-500" : "border-border"
            }`}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">New Password *</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={(e) => handleInputChange("newPassword", e.target.value)}
            placeholder="Enter your new password"
            className={`w-full px-3 py-2 bg-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm sm:text-base ${
              error && !formData.newPassword ? "border-red-500" : "border-border"
            }`}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Confirm New Password *</label>
          <input
            type="password"
            name="confirmNewPassword"
            value={formData.confirmNewPassword}
            onChange={(e) => handleInputChange("confirmNewPassword", e.target.value)}
            placeholder="Confirm your new password"
            className={`w-full px-3 py-2 bg-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm sm:text-base ${
              error && !formData.confirmNewPassword ? "border-red-500" : "border-border"
            }`}
            required
          />
        </div>
        {error && (
          <div className="text-center text-red-500 text-sm">{error}</div>
        )}
        {success && (
          <div className="text-center text-green-600 text-sm">{success}</div>
        )}
        <button
          type="submit"
          className="w-full px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Changing..." : "Change Password"}
        </button>
      </form>
    </div>
  )
}

export default ChangePasswordForm