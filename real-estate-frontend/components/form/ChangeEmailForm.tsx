"use client"

import { useState } from "react"

const ChangeEmailForm = () => {
  const [formData, setFormData] = useState({
    oldEmail: "",
    newEmail: "",
    password: "",
  })
  const [error, setError] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.oldEmail || !formData.newEmail || !formData.password) {
      setError("All fields are required")
      return
    }
    setError("")
    // Send formData to API
    console.log("Change email submitted:", formData)
  }

  return (
    <div className="card bg-base-100 shadow-xl w-full max-w-md mx-auto">
      <div className="card-body">
        <h2 className="card-title text-2xl font-bold mb-2 text-center">Change Email</h2>
        <form onSubmit={handleSubmit} className="space-y-4 px-4 py-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Old Email</span>
            </label>
            <input
              type="email"
              placeholder="Enter your old email"
              className="input input-bordered w-full"
              value={formData.oldEmail}
              onChange={(e) => handleInputChange("oldEmail", e.target.value)}
              required
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">New Email</span>
            </label>
            <input
              type="email"
              placeholder="Enter your new email"
              className="input input-bordered w-full"
              value={formData.newEmail}
              onChange={(e) => handleInputChange("newEmail", e.target.value)}
              required
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="input input-bordered w-full"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="text-center text-red-500 text-sm">{error}</div>
          )}
          <button type="submit" className="btn btn-primary w-full">
            Change Email
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChangeEmailForm