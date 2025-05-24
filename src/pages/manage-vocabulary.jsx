"use client"

import { useState, useEffect } from "react"
import Sidebar from "../components/layout/sidebar"
import { Search, Plus, X, Filter, ChevronLeft, ChevronRight, Volume2, ChevronRight as ChevronRightIcon, History } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import api from "../config/api"
import SearchBar from "../components/dictionary/search-bar"
import { useAuth } from "../config/AuthContext"
import VocabularyHistory from "../components/admin/vocabulary-history"

export default function ManageVocabularyPage() {
  const [vocabularyItems, setVocabularyItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("")
  const [selectedTopic, setSelectedTopic] = useState("")
  const [selectedPartOfSpeech, setSelectedPartOfSpeech] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [sortBy, setSortBy] = useState("word_id")
  const [sortOrder, setSortOrder] = useState("asc")
  const [levels, setLevels] = useState([])
  const [topics, setTopics] = useState([])
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const ITEMS_PER_PAGE = 5
  const [editingItem, setEditingItem] = useState(null)
  const [editedValues, setEditedValues] = useState({})
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
      return
    }
    if (user) {
    fetchVocabulary()
      fetchLevelsAndTopics()
    }
  }, [selectedLevel, selectedTopic, selectedPartOfSpeech, currentPage, sortBy, sortOrder])

  const fetchLevelsAndTopics = async () => {
    try {
      const [levelsResponse, topicsResponse] = await Promise.all([
        api.get('/vocabulary/levels'),
        api.get('/vocabulary/topics')
      ])
      
      if (Array.isArray(levelsResponse.data)) {
        setLevels(levelsResponse.data)
      }
      
      if (Array.isArray(topicsResponse.data)) {
        setTopics(topicsResponse.data)
      }
    } catch (err) {
      console.error('Error fetching levels and topics:', err)
    }
  }

  const fetchVocabulary = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      if (selectedLevel) params.append('level', selectedLevel.toLowerCase())
      if (selectedTopic) params.append('topic', selectedTopic)
      if (selectedPartOfSpeech) params.append('part_of_speech', selectedPartOfSpeech)
      params.append('skip', ((currentPage - 1) * ITEMS_PER_PAGE).toString())
      params.append('limit', ITEMS_PER_PAGE.toString())
      params.append('sort_by', sortBy)
      params.append('sort_order', sortOrder)
      
      console.log('Fetching vocabulary with params:', params.toString())
      const response = await api.get(`/vocabulary?${params.toString()}`)
      console.log('API Response:', response.data)

      if (!response.data) {
        console.error('No data in response')
        setError("Không nhận được dữ liệu từ máy chủ")
        setVocabularyItems([])
        return
      }

      if (response.data.items && Array.isArray(response.data.items)) {
        setVocabularyItems(response.data.items)
        setTotalItems(response.data.total)
        setTotalPages(response.data.pages)
      } else {
        console.error('Invalid data format:', response.data)
        setError("Dữ liệu không đúng định dạng")
        setVocabularyItems([])
      }
    } catch (err) {
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      })

      if (err.response?.status === 401) {
        navigate('/login')
      } else {
        setError(`Không thể tải danh sách từ vựng: ${err.message}`)
        setVocabularyItems([])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item.word_id)
    setEditedValues({
      word: item.word,
      definition: item.definition,
      example: item.example,
      pronunciation: item.pronunciation,
      level: item.level,
      topic: item.topic,
      part_of_speech: item.part_of_speech,
      synonyms: item.synonyms
    })
  }

  const handleCancelEdit = () => {
    setEditingItem(null)
    setEditedValues({})
  }

  const handleSaveEdit = async (wordId) => {
    try {
      await api.put(`/admin/vocabulary/${wordId}`, editedValues)
      setEditingItem(null)
      setEditedValues({})
      fetchVocabulary() // Refresh the list
    } catch (err) {
      console.error('Error updating vocabulary:', err)
      alert('Không thể cập nhật từ vựng')
    }
  }

  const handleDeleteVocabulary = async (wordId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa từ vựng này không?')) {
      try {
        await api.delete(`/admin/vocabulary/${wordId}`)
        fetchVocabulary() // Refresh the list
      } catch (err) {
        console.error('Error deleting vocabulary:', err)
        alert('Không thể xóa từ vựng')
      }
    }
  }

  const handleInputChange = (field, value) => {
    setEditedValues(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
    setCurrentPage(1)
  }

  const getSortIcon = (field) => {
    if (sortBy !== field) return null
    return sortOrder === 'asc' ? '↑' : '↓'
  }

  const handleSearch = (value) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleSearchSubmit = () => {
    if (!searchTerm.trim()) {
      fetchVocabulary()
      return
    }

    // Implement search functionality
  }

  const handlePlayAudio = async (word) => {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
      const data = await response.json()
      if (data && data[0]?.phonetics?.[0]?.audio) {
        const audio = new Audio(data[0].phonetics[0].audio)
        audio.play()
      }
    } catch (err) {
      console.error('Error playing audio:', err)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen bg-[#F5FBFF] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-[#F5FBFF]">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl text-green-500 font-medium flex items-center">
              Quản lý từ vựng
              <ChevronRight className="ml-2" />
            </h2>
            <div className="flex gap-4">
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <History className="w-5 h-5" />
                <span>Lịch sử thao tác</span>
              </button>
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
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

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
                onChange={(e) => {
                  setSelectedLevel(e.target.value)
                  setCurrentPage(1)
                }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                >
                  <option value="">Tất cả cấp độ</option>
                {levels.map(level => (
                  <option key={level} value={level}>
                    {level.toUpperCase()}
                  </option>
                ))}
                </select>
                <select
                  value={selectedTopic}
                onChange={(e) => {
                  setSelectedTopic(e.target.value)
                  setCurrentPage(1)
                }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                >
                  <option value="">Tất cả chủ đề</option>
                {topics.map(topic => (
                  <option key={topic} value={topic}>
                    {topic.charAt(0).toUpperCase() + topic.slice(1)}
                  </option>
                ))}
              </select>
              <select
                value={selectedPartOfSpeech}
                onChange={(e) => {
                  setSelectedPartOfSpeech(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
              >
                <option value="">Tất cả loại từ</option>
                <option value="noun">Danh từ</option>
                <option value="verb">Động từ</option>
                <option value="adjective">Tính từ</option>
                <option value="adverb">Trạng từ</option>
                <option value="preposition">Giới từ</option>
                <option value="conjunction">Liên từ</option>
                <option value="pronoun">Đại từ</option>
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
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('word_id')}
                  >
                    ID {getSortIcon('word_id')}
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('word')}
                  >
                    Từ vựng {getSortIcon('word')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phát âm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nghĩa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ví dụ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Từ đồng nghĩa
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('level')}
                  >
                    Cấp độ {getSortIcon('level')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chủ đề
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại từ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vocabularyItems.map((item) => (
                  <tr key={item.word_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{item.word_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {editingItem === item.word_id ? (
                          <input
                            type="text"
                            value={editedValues.word}
                            onChange={(e) => handleInputChange('word', e.target.value)}
                            className="w-full px-2 py-1 border rounded focus:outline-none focus:border-green-500"
                          />
                        ) : (
                          <>
                            <div className="text-sm font-medium text-gray-900">{item.word}</div>
                            <button 
                              onClick={() => handlePlayAudio(item.word)}
                              className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingItem === item.word_id ? (
                        <input
                          type="text"
                          value={editedValues.pronunciation}
                          onChange={(e) => handleInputChange('pronunciation', e.target.value)}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:border-green-500"
                        />
                      ) : (
                        <div className="text-sm text-gray-900">{item.pronunciation}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingItem === item.word_id ? (
                        <input
                          type="text"
                          value={editedValues.definition}
                          onChange={(e) => handleInputChange('definition', e.target.value)}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:border-green-500"
                        />
                      ) : (
                        <div className="text-sm text-gray-900">{item.definition}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingItem === item.word_id ? (
                        <input
                          type="text"
                          value={editedValues.example}
                          onChange={(e) => handleInputChange('example', e.target.value)}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:border-green-500"
                        />
                      ) : (
                        <div className="text-sm text-gray-900 italic">{item.example}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingItem === item.word_id ? (
                        <input
                          type="text"
                          value={editedValues.synonyms || ''}
                          onChange={(e) => handleInputChange('synonyms', e.target.value)}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:border-green-500"
                          placeholder="Phân cách bằng dấu phẩy"
                        />
                      ) : (
                        <div className="text-sm text-gray-900">
                          {item.synonyms ? item.synonyms.split(',').map((synonym, index) => (
                            <span key={index} className="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs font-semibold text-gray-700 mr-1 mb-1">
                              {synonym.trim()}
                            </span>
                          )) : '-'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingItem === item.word_id ? (
                        <select
                          value={editedValues.level}
                          onChange={(e) => handleInputChange('level', e.target.value)}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:border-green-500"
                        >
                          {levels.map(level => (
                            <option key={level} value={level}>
                              {level.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      ) : (
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
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingItem === item.word_id ? (
                        <select
                          value={editedValues.topic}
                          onChange={(e) => handleInputChange('topic', e.target.value)}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:border-green-500"
                        >
                          {topics.map(topic => (
                            <option key={topic} value={topic}>
                              {topic.charAt(0).toUpperCase() + topic.slice(1)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="text-sm text-gray-900">{item.topic}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingItem === item.word_id ? (
                        <select
                          value={editedValues.part_of_speech}
                          onChange={(e) => handleInputChange('part_of_speech', e.target.value)}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:border-green-500"
                        >
                          <option value="noun">Danh từ</option>
                          <option value="verb">Động từ</option>
                          <option value="adjective">Tính từ</option>
                          <option value="adverb">Trạng từ</option>
                          <option value="preposition">Giới từ</option>
                          <option value="conjunction">Liên từ</option>
                          <option value="pronoun">Đại từ</option>
                        </select>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          {item.part_of_speech}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingItem === item.word_id ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleSaveEdit(item.word_id)}
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
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Sửa
                          </button>
                      <button
                            onClick={() => handleDeleteVocabulary(item.word_id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Xóa
                      </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {vocabularyItems.length > 0 && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-700">
                    Hiển thị <span className="font-medium">{vocabularyItems.length}</span> trong tổng số{' '}
                    <span className="font-medium">{totalItems}</span> từ vựng
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 border rounded-md ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="px-4 py-2 text-gray-700">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 border rounded-md ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <VocabularyHistory isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
    </div>
  )
} 