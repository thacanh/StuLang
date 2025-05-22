"use client"

import { useState, useEffect } from "react"
import Sidebar from "../components/layout/sidebar"
import { Search, Plus, X, Filter } from "lucide-react"
import { Link } from "react-router-dom"
import api from "../config/api"

export default function ManageVocabularyPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [vocabularyItems, setVocabularyItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedLevel, setSelectedLevel] = useState("")
  const [selectedTopic, setSelectedTopic] = useState("")

  useEffect(() => {
    fetchVocabulary()
  }, [selectedLevel, selectedTopic])

  const fetchVocabulary = async () => {
    try {
      setLoading(true)
      setError(null)
      let url = '/vocabulary/'
      if (selectedLevel) url += `level=${selectedLevel}&`
      if (selectedTopic) url += `topic=${selectedTopic}`
      const response = await api.get(url)
      setVocabularyItems(response.data)
    } catch (err) {
      setError("Không thể tải danh sách từ vựng")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteVocabulary = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa từ vựng này?")) {
      try {
        await api.delete(`/vocabulary/${id}`)
        fetchVocabulary()
      } catch (err) {
        setError("Không thể xóa từ vựng")
      }
    }
  }

  const filteredItems = vocabularyItems.filter(item => 
    item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.meaning.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-bold">Quản lý từ vựng</h1>
          <div className="flex gap-4">
            <Link
              to="/quan-tri-vien/them-tu-vung"
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Thêm từ vựng</span>
            </Link>
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
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm từ vựng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                />
              </div>
              <div className="flex gap-4">
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                >
                  <option value="">Tất cả cấp độ</option>
                  <option value="A1">A1</option>
                  <option value="A2">A2</option>
                  <option value="B1">B1</option>
                  <option value="B2">B2</option>
                  <option value="C1">C1</option>
                  <option value="C2">C2</option>
                </select>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                >
                  <option value="">Tất cả chủ đề</option>
                  <option value="family">Gia đình</option>
                  <option value="food">Thức ăn</option>
                  <option value="travel">Du lịch</option>
                  <option value="work">Công việc</option>
                  <option value="education">Giáo dục</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Từ vựng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nghĩa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cấp độ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chủ đề
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.word}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.meaning}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.level}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.topic}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/quan-tri-vien/sua-tu-vung/${item.id}`}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Sửa
                      </Link>
                      <button
                        onClick={() => handleDeleteVocabulary(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
} 