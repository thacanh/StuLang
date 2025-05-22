"use client"

import { Pencil, Check, X } from "lucide-react"
import { useState, useEffect } from "react"
import api from "../../config/api"

export default function ProfileForm() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  
  // Form states
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/users/me')
      setUser(response.data)
      setNewEmail(response.data.email)
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
      } else {
        setError("Không thể tải thông tin người dùng. Vui lòng thử lại sau.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEmailUpdate = async () => {
    try {
      setError(null)
      setSuccess(null)
      await api.put('/users/me/email', { email: newEmail })
      setSuccess("Email đã được cập nhật thành công")
      setIsEditingEmail(false)
      fetchUserProfile()
    } catch (err) {
      if (err.response?.status === 400) {
        setError("Email này đã được sử dụng bởi tài khoản khác")
      } else {
        setError("Không thể cập nhật email. Vui lòng thử lại sau.")
      }
    }
  }

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới không khớp")
      return
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự")
      return
    }

    try {
      setError(null)
      setSuccess(null)
      await api.put('/users/me/password', {
        current_password: currentPassword,
        new_password: newPassword
      })
      setSuccess("Mật khẩu đã được cập nhật thành công")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      if (err.response?.status === 400) {
        setError("Mật khẩu hiện tại không đúng")
      } else {
        setError("Không thể cập nhật mật khẩu. Vui lòng thử lại sau.")
      }
    }
  }

  if (loading) return (
    <div className="p-8 text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
      <p className="mt-2">Đang tải thông tin...</p>
    </div>
  )

  if (!user) return (
    <div className="p-8 text-center">
      <div className="text-red-500 mb-4">{error}</div>
      <button 
        onClick={fetchUserProfile}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Thử lại
      </button>
    </div>
  )

  return (
    <div className="p-8">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="text-green-700 hover:text-green-900">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-purple-900"></div>
        </div>
        <h2 className="text-xl font-semibold">{user.username}</h2>
      </div>

      <div className="mb-6">
        <label className="block text-sm mb-1">Email người dùng:</label>
        <div className="flex items-center">
          {isEditingEmail ? (
            <>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="flex-1 p-2 border-b border-gray-300 focus:outline-none focus:border-green-500"
                placeholder="Nhập email mới"
              />
              <button 
                onClick={handleEmailUpdate}
                className="ml-2 text-green-500 hover:text-green-700"
                title="Lưu thay đổi"
              >
                <Check className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {
                  setIsEditingEmail(false)
                  setNewEmail(user.email)
                }}
                className="ml-2 text-red-500 hover:text-red-700"
                title="Hủy thay đổi"
              >
                <X className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <div className="flex-1 p-2 border-b border-gray-300">{user.email}</div>
              <button 
                onClick={() => setIsEditingEmail(true)}
                className="ml-2 text-gray-500 hover:text-gray-700"
                title="Chỉnh sửa email"
              >
                <Pencil className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm mb-1">Đổi mật khẩu</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Mật khẩu hiện tại"
          className="w-full p-2 mb-2 border-b border-gray-300 focus:outline-none focus:border-green-500"
        />
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Mật khẩu mới"
          className="w-full p-2 mb-2 border-b border-gray-300 focus:outline-none focus:border-green-500"
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Xác nhận mật khẩu"
          className="w-full p-2 mb-4 border-b border-gray-300 focus:outline-none focus:border-green-500"
        />
        <button 
          onClick={handlePasswordUpdate}
          className="bg-green-500 text-white rounded-md px-4 py-2 hover:bg-green-600 transition-colors"
        >
          Đổi mật khẩu
        </button>
      </div>
    </div>
  )
}
