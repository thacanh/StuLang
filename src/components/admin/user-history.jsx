import { useState, useEffect } from "react"
import api from "../../config/api"
import { X } from "lucide-react"

export default function UserHistory({ isOpen, onClose }) {
  const [actions, setActions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (isOpen) {
      fetchActions()
    }
  }, [isOpen, activeTab])

  const fetchActions = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/actions/users')
      setActions(response.data)
    } catch (err) {
      setError("Không thể tải lịch sử thao tác")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString("vi-VN")
  }

  const getActionText = (actionType) => {
    switch (actionType) {
      case "edit_user":
        return "Sửa thông tin người dùng"
      case "delete_user":
        return "Xóa người dùng"
      case "change_role":
        return "Thay đổi vai trò"
      default:
        return actionType
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[800px] max-h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Lịch sử thao tác người dùng</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : actions.length === 0 ? (
            <div className="text-gray-500 text-center">Không có lịch sử thao tác nào</div>
          ) : (
            <div className="space-y-4">
              {actions.map((action) => (
                <div
                  key={action.action_id}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium text-gray-800">
                        {getActionText(action.action_type)}
                      </span>
                      <span className="mx-2">·</span>
                      <span className="text-gray-600">ID người dùng: {action.target_user_id}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(action.action_time)}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Admin ID: {action.admin_id}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 