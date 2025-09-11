"use client"

import { useState } from "react"
import UserService from "@/service/user/UserService"
import ReqChangeEmailDto from "@/domain/user/ReqChangeEmailDto"
import { isLeft, isRight } from "@/implementation/Either"

const ChangeEmailForm = () => {
  const [formData, setFormData] = useState({
    oldEmail: "",
    newEmail: "",
    password: "",
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
    const errors: { [key: string]: string } = {}
    if (!formData.oldEmail.trim()) errors.oldEmail = "Old email is required"
    if (!formData.newEmail.trim()) errors.newEmail = "New email is required"
    if (!formData.password.trim()) errors.password = "Password is required"
    setError(Object.values(errors).join(", "))
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    if (!validateForm()) return

    setLoading(true)
    const dto = new ReqChangeEmailDto(formData.oldEmail, formData.newEmail, formData.password)
    const result = await UserService.instance.changeEmail(dto)
    setLoading(false)
    if (isRight(result)) {
      setSuccess("Email changed successfully!")
      setFormData({ oldEmail: "", newEmail: "", password: "" })
    } else if (isLeft(result)) {
      setError(result.value.message || "Failed to change email")
    } else {
      setError("Unexpected error occurred")
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto bg-card/80 border border-border rounded-xl shadow-xl p-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-foreground">Change Email</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-2">Old Email *</label>
            <input
              type="email"
              name="oldEmail"
              value={formData.oldEmail}
              onChange={(e) => handleInputChange("oldEmail", e.target.value)}
              placeholder="Enter your old email"
              className={`w-full px-3 py-2 bg-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm sm:text-base ${
                error && !formData.oldEmail ? "border-red-500" : "border-border"
              }`}
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-2">New Email *</label>
            <input
              type="email"
              name="newEmail"
              value={formData.newEmail}
              onChange={(e) => handleInputChange("newEmail", e.target.value)}
              placeholder="Enter your new email"
              className={`w-full px-3 py-2 bg-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm sm:text-base ${
                error && !formData.newEmail ? "border-red-500" : "border-border"
              }`}
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Password *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            placeholder="Enter your password"
            className={`w-full px-3 py-2 bg-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm sm:text-base ${
              error && !formData.password ? "border-red-500" : "border-border"
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
          {loading ? "Changing..." : "Change Email"}
        </button>
      </form>
    </div>
  )
}

export default ChangeEmailForm