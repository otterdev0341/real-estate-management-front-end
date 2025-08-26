"use client"

import { useState } from "react"

const ChangePasswordForm = () => {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  })
  const [error, setError] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.oldPassword || !formData.newPassword || !formData.confirmNewPassword) {
      setError("All fields are required")
      return
    }
    if (formData.newPassword !== formData.confirmNewPassword) {
      setError("New passwords do not match")
      return
    }
    setError("")
    // Send formData to API
    console.log("Change password submitted:", formData)
  }

  return (
    <div className="card bg-base-100 shadow-xl w-full max-w-md mx-auto">
      <div className="card-body">
        <h2 className="card-title text-2xl font-bold mb-2 text-center">Change Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4 px-4 py-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Old Password</span>
            </label>
            <input
              type="password"
              placeholder="Enter your old password"
              className="input input-bordered w-full"
              value={formData.oldPassword}
              onChange={(e) => handleInputChange("oldPassword", e.target.value)}
              required
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">New Password</span>
            </label>
            <input
              type="password"
              placeholder="Enter your new password"
              className="input input-bordered w-full"
              value={formData.newPassword}
              onChange={(e) => handleInputChange("newPassword", e.target.value)}
              required
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Confirm New Password</span>
            </label>
            <input
              type="password"
              placeholder="Confirm your new password"
              className="input input-bordered w-full"
              value={formData.confirmNewPassword}
              onChange={(e) => handleInputChange("confirmNewPassword", e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="text-center text-red-500 text-sm">{error}</div>
          )}
          <button type="submit" className="btn btn-primary w-full">
            Change Password
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChangePasswordForm