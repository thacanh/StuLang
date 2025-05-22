import { useState, useEffect } from "react"
import Sidebar from "../components/layout/sidebar"
import { ChevronRight, Volume2, Filter } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import api from "../config/api"
import SearchBar from "../components/dictionary/search-bar"
import { useAuth } from "../config/AuthContext"

export default function VocabularyPage() {
  const [vocabularyItems, setVocabularyItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("")
  const [selectedTopic, setSelectedTopic] = useState("")
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
      return
    }
    if (user) {
      fetchVocabulary()
    }
  }, [selectedLevel, selectedTopic, user, authLoading])

  const fetchVocabulary = async () => {
    try {
      setLoading(true)
      setError(null)
      let url = '/vocabulary/'
      if (selectedLevel) url += `?level=${selectedLevel.toLowerCase()}`
      if (selectedTopic) url += `${selectedLevel ? '&' : '?'}topic=${selectedTopic}`
      const response = await api.get(url)
      setVocabularyItems(response.data)
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login')
      } else {
        setError("Không thể tải danh sách từ vựng")
      }
    } finally {
      setLoading(false)
    }
  }

  const searchVocabulary = async () => {
    if (!searchTerm.trim()) {
      fetchVocabulary()
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await api.get(`/vocabulary/search?keyword=${searchTerm}`)
      setVocabularyItems(response.data)
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login')
      } else if (err.response?.status === 404) {
        setVocabularyItems([])
      } else {
        setError("Không thể tìm kiếm từ vựng")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value) => {
    setSearchTerm(value)
  }

  const handleSearchSubmit = () => {
    searchVocabulary()
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen bg-[#F5FBFF] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

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
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-xl text-green-500 font-medium flex items-center">
            Danh sách từ vựng
            <ChevronRight className="ml-2" />
          </h2>
        </div>

        {/* Search and filter section */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchBar 
                value={searchTerm} 
                onChange={handleSearch}
                onSearch={handleSearchSubmit}
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

        {/* Vocabulary table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                    Ví dụ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cấp độ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chủ đề
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại từ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vocabularyItems.length > 0 ? (
                  vocabularyItems.map((item) => (
                    <tr key={item.word_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">{item.word}</div>
                          {item.audio_url && (
                            <button className="ml-2 text-blue-600 hover:text-blue-800">
                              <Volume2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{item.definition}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 italic">{item.example}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          item.level === 'a1' ? 'bg-cyan-100 text-cyan-800' :
                          item.level === 'a2' ? 'bg-cyan-200 text-cyan-800' :
                          item.level === 'b1' ? 'bg-cyan-300 text-cyan-900' :
                          item.level === 'b2' ? 'bg-cyan-400 text-cyan-900' :
                          item.level === 'c1' ? 'bg-cyan-500 text-white' :
                          'bg-cyan-600 text-white'
                        }`}>
                          {item.level.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.topic}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          {item.part_of_speech}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      {searchTerm ? "Không tìm thấy từ vựng phù hợp" : "Không có từ vựng nào"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
