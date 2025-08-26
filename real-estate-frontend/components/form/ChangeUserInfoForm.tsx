"use client"

import { useState } from "react"

const UpdateUserInfoForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    password: "",
  })
  const [error, setError] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.dob ||
      !formData.gender ||
      !formData.password
    ) {
      setError("All fields are required")
      return
    }
    setError("")
    // Send formData to API
    console.log("Update user info submitted:", formData)
  }

  return (
    <div className="card bg-base-100 shadow-xl w-full max-w-md mx-auto">
      <div className="card-body">
        <h2 className="card-title text-2xl font-bold mb-2 text-center">Update User Info</h2>
        <form onSubmit={handleSubmit} className="space-y-4 px-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">First Name</span>
              </label>
              <input
                type="text"
                placeholder="First name"
                className="input input-bordered w-full"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Last Name</span>
              </label>
              <input
                type="text"
                placeholder="Last name"
                className="input input-bordered w-full"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Date of Birth</span>
            </label>
            <input
              type="date"
              className="input input-bordered w-full"
              value={formData.dob}
              onChange={(e) => handleInputChange("dob", e.target.value)}
              required
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Gender</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={formData.gender}
              onChange={(e) => handleInputChange("gender", e.target.value)}
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
            Update Info
          </button>
        </form>
      </div>
    </div>
  )
}

export default UpdateUserInfoForm