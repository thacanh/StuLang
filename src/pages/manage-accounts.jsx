"use client"

import { useState, useEffect } from "react"
import Sidebar from "../components/layout/sidebar"
import { Search, Edit, Trash2, UserPlus, X, Filter, History, Key } from "lucide-react"
import api from "../config/api"
import UserHistory from "../components/admin/user-history"
import { useAuth } from "../config/AuthContext"

export default function ManageAccountsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [editedValues, setEditedValues] = useState({})
  const { user: currentUser } = useAuth()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/admin/users')
      // Log để kiểm tra dữ liệu từ API
      console.log('Users from API:', response.data)
      
      // Lọc bỏ các user trùng lặp dựa trên ID
      const uniqueUsers = Array.from(new Map(response.data.map(user => [user.user_id, user])).values())
      setUsers(uniqueUsers)
    } catch (err) {
      setError("Không thể tải danh sách người dùng")
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    // Không cho phép xóa chính mình hoặc xóa admin khác
    const targetUser = users.find(u => u.id === userId)
    if (userId === currentUser?.id) {
      setError("Không thể xóa tài khoản của chính mình")
      return
    }
    if (targetUser?.role === 'admin' && currentUser?.role === 'admin') {
      setError("Không thể xóa tài khoản admin khác")
      return
    }

    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      try {
        await api.delete(`/admin/users/${userId}`)
        fetchUsers()
      } catch (err) {
        setError("Không thể xóa người dùng")
      }
    }
  }

  const canEditUser = (targetUser) => {
    const currentUserId = parseInt(currentUser?.user_id)
    const targetUserId = parseInt(targetUser.user_id)
    
    if (targetUserId === currentUserId) return false
    if (targetUser.role === 'admin') return false
    return targetUser.role === 'user'
  }

  const handleInputChange = (user, field, value) => {
    if (!canEditUser(user)) return

    setUsers(prevUsers => 
      prevUsers.map(u => {
        if (u.user_id === user.user_id) {
          return { ...u, [field]: value }
        }
        return u
      })
    )
  }

  const handleInputBlur = async (user, field) => {
    if (!canEditUser(user)) return

    try {
      await api.put(`/admin/users/${user.user_id}`, {
        [field]: user[field]
      })
      fetchUsers() // Refresh data after update
    } catch (err) {
      setError("Không thể cập nhật thông tin người dùng")
      fetchUsers() // Refresh to revert changes if failed
    }
  }

  const handleEdit = (user) => {
    if (!canEditUser(user)) {
      setError("Không có quyền chỉnh sửa tài khoản này")
      return
    }
    setEditingUser(user.user_id)
    setEditedValues({
      username: user.username,
      email: user.email,
      role: user.role,
      password: '' // Thêm trường password nhưng để trống
    })
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
    setEditedValues({})
    setError(null)
  }

  const handleSaveEdit = async (userId) => {
    try {
      // Chỉ gửi password nếu có nhập mới
      const dataToUpdate = { ...editedValues }
      if (!dataToUpdate.password) {
        delete dataToUpdate.password
      }
      
      await api.put(`/admin/users/${userId}`, dataToUpdate)
      setEditingUser(null)
      setEditedValues({})
      setError(null)
      fetchUsers()
    } catch (err) {
      setError("Không thể cập nhật thông tin người dùng")
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    const targetUser = users.find(u => u.id === userId)
    if (!canEditUser(targetUser)) {
      setError("Không có quyền thay đổi vai trò của tài khoản này")
      return
    }
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole })
      fetchUsers()
    } catch (err) {
      setError("Không thể thay đổi vai trò người dùng")
    }
  }

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F5FBFF] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#F5FBFF]">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Quản lý tài khoản</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <History className="w-5 h-5" />
              <span>Lịch sử thao tác</span>
            </button>
            <button
              onClick={() => window.history.back()}
              className="flex items-center text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5 mr-1" />
              Quay lại
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên hoặc email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                />
              </div>
              <button className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
                <Filter className="w-5 h-5" />
                <span>Lọc</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mật khẩu
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{user.user_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingUser === user.user_id ? (
                        <input
                          type="text"
                          value={editedValues.username}
                          onChange={(e) => setEditedValues({ ...editedValues, username: e.target.value })}
                          className="w-full px-2 py-1 border-b border-gray-300 focus:border-green-500 focus:outline-none"
                        />
                      ) : (
                        user.username
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingUser === user.user_id ? (
                        <input
                          type="email"
                          value={editedValues.email}
                          onChange={(e) => setEditedValues({ ...editedValues, email: e.target.value })}
                          className="w-full px-2 py-1 border-b border-gray-300 focus:border-green-500 focus:outline-none"
                        />
                      ) : (
                        user.email
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingUser === user.user_id ? (
                        <select
                          value={editedValues.role}
                          onChange={(e) => setEditedValues({ ...editedValues, role: e.target.value })}
                          className="w-full px-2 py-1 border-b border-gray-300 focus:border-green-500 focus:outline-none"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingUser === user.user_id ? (
                        <div className="flex items-center">
                          <input
                            type="password"
                            value={editedValues.password || ''}
                            onChange={(e) => setEditedValues({ ...editedValues, password: e.target.value })}
                            placeholder="Nhập mật khẩu mới"
                            className="w-full px-2 py-1 border-b border-gray-300 focus:border-green-500 focus:outline-none"
                          />
                          <Key className="w-4 h-4 ml-2 text-gray-400" />
                        </div>
                      ) : (
                        <span className="text-gray-400">••••••••</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingUser === user.user_id ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleSaveEdit(user.user_id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Lưu
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          {canEditUser(user) && (
                            <>
                              <button
                                onClick={() => handleEdit(user)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(user.user_id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <UserHistory isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
    </div>
  )
}


