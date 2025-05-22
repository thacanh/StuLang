import { useState, useEffect } from "react"
import Sidebar from "../components/layout/sidebar"
import ProfileForm from "../components/account/profile-form"
import api from "../config/api"

export default function AccountPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F5FBFF] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-[#F5FBFF] items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#F5FBFF]">
      <Sidebar />
      <div className="flex-1">
        <ProfileForm />
      </div>
    </div>
  )
}

