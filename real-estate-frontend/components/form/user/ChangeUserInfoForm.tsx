"use client"

import { useState } from "react"
import UserService from "@/service/user/UserService"
import ReqChangeUserInfoDto from "@/domain/user/ReqChangeUserInfoDto"
import { isLeft, isRight } from "@/implementation/Either"

const initialState = {
  firstName: "",
  lastName: "",
  dob: "",
  gender: "",
  password: "",
}

const ChangeUserInfoForm = () => {
  const [formData, setFormData] = useState(initialState)
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
    if (!formData.firstName.trim()) errors.firstName = "First name is required"
    if (!formData.lastName.trim()) errors.lastName = "Last name is required"
    if (!formData.dob.trim()) errors.dob = "Date of birth is required"
    if (!formData.gender.trim()) errors.gender = "Gender is required"
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
    const dto = new ReqChangeUserInfoDto(
      formData.firstName,
      formData.lastName,
      new Date(formData.dob),
      formData.gender
    )
    // If password is required by API, you may need to add it to dto or send separately
    const result = await UserService.instance.changeUserInfo(dto)
    setLoading(false)
    if (isRight(result)) {
      setSuccess("User info updated successfully!")
      setFormData(initialState)
    } else if (isLeft(result)) {
      setError(result.value.message || "Failed to update user info")
    } else {
      setError("Unexpected error occurred")
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto bg-card/80 border border-border rounded-xl shadow-xl p-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-foreground">Update User Info</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-2">First Name *</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              placeholder="First name"
              className={`w-full px-3 py-2 bg-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm sm:text-base ${
                error && !formData.firstName ? "border-red-500" : "border-border"
              }`}
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-2">Last Name *</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              placeholder="Last name"
              className={`w-full px-3 py-2 bg-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm sm:text-base ${
                error && !formData.lastName ? "border-red-500" : "border-border"
              }`}
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Date of Birth *</label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={(e) => handleInputChange("dob", e.target.value)}
            className={`w-full px-3 py-2 bg-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground text-sm sm:text-base ${
              error && !formData.dob ? "border-red-500" : "border-border"
            }`}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Gender *</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={(e) => handleInputChange("gender", e.target.value)}
            className={`w-full px-3 py-2 bg-input border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground text-sm sm:text-base ${
              error && !formData.gender ? "border-red-500" : "border-border"
            }`}
            required
          >
            <option disabled value="">
              Select gender
            </option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
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
          {loading ? "Updating..." : "Update Info"}
        </button>
      </form>
    </div>
  )
}

export default ChangeUserInfoForm