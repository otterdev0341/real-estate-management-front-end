"use client"

import { useState } from "react"
import Link from "next/link"
import { ReqLoginDto } from "@/domain/user/ReqLoginDto"
import { UserData } from "@/domain/user/UserDataDto"
import { redirect } from "next/navigation"
import { AuthService } from "@/service/auth/authService"
import { isLeft } from "@/implementation/Either"

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [success, setSuccess] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email || !formData.password) {
      setError("All fields are required")
      return
    }
    setError("")
    setLoading(true)

    const dto: ReqLoginDto = {
      email: formData.email,
      password: formData.password,
    }

    try {
      const result = await AuthService.instance.login(dto)
      if (isLeft(result)) {
        setLoading(false)
        setError(result.value.message || "Login failed")
        return
      }

      const { token, user } = result.value
      document.cookie = `token=${token}; path=/;`
      setUserData(user)
      sessionStorage.setItem("userData", JSON.stringify(user))

      setSuccess("Login successful! Redirecting to Dashboard...")
      setShowToast(true)
      setTimeout(() => {
        setShowToast(false)
        setLoading(true)
        setTimeout(() => {
          setLoading(false)
          redirect("/service/dashboard")
        }, 1200)
      }, 1500)
    } catch (err) {
      setLoading(false)
      setError("Network error. Please try again.")
    }
  }

  return (
    <>
      <div className="card bg-base-100 shadow-xl w-full max-w-md mx-auto">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold mb-2 text-center">Login</h2>
          <p className="text-center text-base-content/70 mb-6">
            Sign in to your account
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
            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary font-semibold hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </div>
      {/* Success Toast */}
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
            Logging in...
          </div>
        </div>
      )}
    </>
  )
}

export default LoginForm