import { useState, useEffect } from "react"
import api from "../../config/api"
import { X } from "lucide-react"

export default function VocabularyHistory({ isOpen, onClose }) {
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
      let endpoint = "/admin/actions/vocabulary"
      if (activeTab !== "all") {
        endpoint = `/admin/actions/vocabulary/${activeTab}`
      }
      const response = await api.get(endpoint)
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
      case "add_vocab":
        return "Thêm từ vựng"
      case "edit_vocab":
        return "Sửa từ vựng"
      case "delete_vocab":
        return "Xóa từ vựng"
      default:
        return actionType
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[800px] max-h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Lịch sử thao tác từ vựng</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 border-b">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-lg ${
                activeTab === "all"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setActiveTab("add_vocab")}
              className={`px-4 py-2 rounded-lg ${
                activeTab === "add_vocab"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Thêm từ vựng
            </button>
            <button
              onClick={() => setActiveTab("edit_vocab")}
              className={`px-4 py-2 rounded-lg ${
                activeTab === "edit_vocab"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Sửa từ vựng
            </button>
            <button
              onClick={() => setActiveTab("delete_vocab")}
              className={`px-4 py-2 rounded-lg ${
                activeTab === "delete_vocab"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Xóa từ vựng
            </button>
          </div>
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
                      <span className="text-gray-600">ID từ vựng: {action.word_id}</span>
                      <span className="mx-2">·</span>
                      <span className="text-gray-600">Từ: {action.word_name}</span>
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