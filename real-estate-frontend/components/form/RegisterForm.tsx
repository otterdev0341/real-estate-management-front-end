"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { ReqCreateUserDto } from "@/domain/user/ReqCreateUserDto"
import { redirect } from "next/navigation"

export function RegisterForm() {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    firstName: "",
    lastName: "",
    gender: "",
    dob: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (field === "confirmPassword" || field === "password") {
      setError("")
    }
  }

  const formatDob = (dateStr: string) => {
    return dateStr + "T00:00:00"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }
    setError("")
    setSuccess("")
    setLoading(true)

    // Prepare DTO
    const dto: ReqCreateUserDto = {
      email: formData.email,
      password: formData.password,
      username: formData.username,
      firstName: formData.firstName,
      lastName: formData.lastName,
      gender: formData.gender,
      dob: formatDob(formData.dob),
    }

    console.log("Submitting registration:", dto);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      })

      setLoading(false)

      if (!res.ok) {
        const data = await res.json()
        setError(data.message || "Registration failed")
        console.log(data);
        return
      }

      setSuccess("Registration successful! Redirecting to Login Page...")
      setShowToast(true)
      setTimeout(() => {
        setShowToast(false)
        redirect('/auth/login')
      }, 2000)
    } catch (err) {
      setLoading(false)
      setError("Network error. Please try again.")
    }
  }

  return (
    <div className="card bg-base-100 shadow-xl w-full max-w-md mx-auto">
      <div className="card-body">
        <h2 className="card-title text-2xl font-bold mb-2 text-center">Register</h2>
        <p className="text-center text-base-content/70 mb-6">
          Create your account to access our real estate management platform
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 px-4 py-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="input input-bordered w-full"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Username</span>
            </label>
            <input
              type="text"
              placeholder="Choose a username"
              className="input input-bordered w-full"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              required
            />
          </div>

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
              <span className="label-text">Password</span>
            </label>
            <input
              type="password"
              placeholder="Create a password"
              className="input input-bordered w-full"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Confirm Password</span>
            </label>
            <input
              type="password"
              placeholder="Confirm your password"
              className="input input-bordered w-full"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="text-center text-red-500 text-sm">{error}</div>
          )}
          <button type="submit" className="btn btn-primary bg-blue-500 w-full bg-blue rounded-lg" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Login here
          </Link>
        </div>
      </div>
      {/* Toast */}
      {showToast && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-500 text-white px-6 py-3 rounded shadow-lg font-semibold">
            {success}
          </div>
        </div>
      )}
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white px-6 py-4 rounded shadow-lg text-lg font-semibold">
            Creating your account...
          </div>
        </div>
      )}
    </div>
  )
}
