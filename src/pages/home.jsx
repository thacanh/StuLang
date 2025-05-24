import { useState, useEffect } from "react"
import Sidebar from "../components/layout/sidebar"
import { Calendar, Clock, Play, CheckCircle2, Volume2, ChevronLeft, ChevronRightIcon } from "lucide-react"
import api from "../config/api"
import { useNavigate } from "react-router-dom"
import SearchBar from "../components/dictionary/search-bar"

export default function HomePage() {
  const [vocabularyItems, setVocabularyItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentCycle, setCurrentCycle] = useState(null)
  const [selectedTime, setSelectedTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 30
  })
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [cycleVocabulary, setCycleVocabulary] = useState([])
  const [isExpired, setIsExpired] = useState(false)
  const [formError, setFormError] = useState("")
  const navigate = useNavigate()

  // Add new state variables for sorting and filtering
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
  const ITEMS_PER_PAGE = 5

  useEffect(() => {
    fetchVocabulary()
    fetchCurrentCycle()
    fetchLevelsAndTopics()
  }, [selectedLevel, selectedTopic, selectedPartOfSpeech, currentPage, sortBy, sortOrder])

  useEffect(() => {
    if (currentCycle) {
      fetchCycleVocabulary()
      startCountdown()
    }
  }, [currentCycle])

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

  const startCountdown = () => {
    const updateCountdown = () => {
      const now = new Date()
      const end = new Date(currentCycle.end_datetime)
      const diff = end - now

      if (diff <= 0) {
        setTimeRemaining(null)
        setIsExpired(true)
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeRemaining({ days, hours, minutes, seconds })
      setIsExpired(false)
    }

    // Update immediately
    updateCountdown()
    // Then update every second
    const interval = setInterval(updateCountdown, 1000)

    // Cleanup on unmount
    return () => clearInterval(interval)
  }

  const fetchVocabulary = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/vocabulary')
      setVocabularyItems(response.data.items)
    } catch (err) {
      setError("Không thể tải danh sách từ vựng")
    } finally {
      setLoading(false)
    }
  }

  const fetchCurrentCycle = async () => {
    try {
      const response = await api.get('/cycles')
      setCurrentCycle(response.data)
    } catch (err) {
      if (err.response?.status !== 404) {
        setError("Không thể tải thông tin chu kỳ học")
      }
    }
  }

  const fetchCycleVocabulary = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedLevel) params.append('level', selectedLevel.toLowerCase())
      if (selectedTopic) params.append('topic', selectedTopic)
      if (selectedPartOfSpeech) params.append('part_of_speech', selectedPartOfSpeech)
      if (searchTerm) params.append('search', searchTerm)
      params.append('skip', ((currentPage - 1) * ITEMS_PER_PAGE).toString())
      params.append('limit', ITEMS_PER_PAGE.toString())
      params.append('sort_by', sortBy)
      params.append('sort_order', sortOrder)

      const response = await api.get(`/cycles/vocabulary?${params.toString()}`)
      if (Array.isArray(response.data)) {
      setCycleVocabulary(response.data)
        setTotalItems(response.data.length)
        setTotalPages(Math.ceil(response.data.length / ITEMS_PER_PAGE))
      } else if (response.data.items && Array.isArray(response.data.items)) {
        setCycleVocabulary(response.data.items)
        setTotalItems(response.data.total)
        setTotalPages(response.data.pages)
      }
    } catch (err) {
      console.error('Error fetching cycle vocabulary:', err)
      setError("Không thể tải danh sách từ vựng trong chu kỳ")
    }
  }

  const handleCreateCycle = async () => {
    try {
      setFormError("")
      setError(null)

      await api.post('/cycles', {
        duration: {
          days: selectedTime.days,
          hours: selectedTime.hours,
          minutes: selectedTime.minutes,
          seconds: selectedTime.seconds
        }
      })
      
      fetchCurrentCycle()
      setFormError("")
      window.location.reload()
    } catch (err) {
      if (err.response?.data?.detail) {
        setFormError(err.response.data.detail)
      } else {
        setError("Không thể tạo chu kỳ học mới")
      }
    }
  }

  const handleTimeChange = (field, value) => {
    const numValue = Math.max(0, parseInt(value) || 0)
    const constrainedValue = field === 'days' ? numValue :
                           Math.min(numValue, field === 'hours' ? 23 : 59)
    
    setSelectedTime(prev => ({
      ...prev,
      [field]: constrainedValue
    }))
  }

  const handleStartLearning = () => {
    navigate('/luyen-tap')
  }

  const handleStartTest = () => {
    navigate('/kiem-tra')
  }

  const handlePlayAudio = async (word) => {
    if (!word) return
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

  const searchVocabulary = async () => {
    if (!searchTerm.trim()) {
      fetchCycleVocabulary()
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await api.get(`/vocabulary/search?keyword=${encodeURIComponent(searchTerm)}`)

      if (!response.data) {
        setCycleVocabulary([])
        setTotalItems(0)
        setTotalPages(1)
        return
      }

      // Handle array response
      if (Array.isArray(response.data)) {
        const items = response.data.map(item => ({
          ...item,
          vocabulary: item // Ensure consistent structure with cycle vocabulary
        }))
        setCycleVocabulary(items)
        setTotalItems(items.length)
        setTotalPages(Math.ceil(items.length / ITEMS_PER_PAGE))
      } 
      // Handle paginated response
      else if (response.data.items && Array.isArray(response.data.items)) {
        const items = response.data.items.map(item => ({
          ...item,
          vocabulary: item // Ensure consistent structure with cycle vocabulary
        }))
        setCycleVocabulary(items)
        setTotalItems(response.data.total || items.length)
        setTotalPages(response.data.pages || Math.ceil(items.length / ITEMS_PER_PAGE))
      } 
      // Handle unexpected response format
      else {
        console.error('Invalid search response format:', response.data)
        setCycleVocabulary([])
        setTotalItems(0)
        setTotalPages(1)
      }
    } catch (err) {
      console.error('Search error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      })

      if (err.response?.status === 401) {
        navigate('/login')
      } else if (err.response?.status === 404) {
        setCycleVocabulary([])
        setTotalItems(0)
        setTotalPages(1)
      } else {
        setError("Không thể tìm kiếm từ vựng")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleSearchSubmit = () => {
    searchVocabulary()
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
      <div className="flex-1">
        <div className="p-6">
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium flex items-center text-green-600">
                <Calendar className="mr-2" />
                Chu kỳ học tập
              </h2>
            </div>

            {/* Phần chọn thời gian - luôn hiển thị */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
              <h2 className="text-xl font-medium mb-4 flex items-center text-green-600">
                <Clock className="mr-2" />
                Thời gian học tập
              </h2>
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={selectedTime.days}
                      onChange={(e) => handleTimeChange('days', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giờ
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={selectedTime.hours}
                      onChange={(e) => handleTimeChange('hours', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phút
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={selectedTime.minutes}
                      onChange={(e) => handleTimeChange('minutes', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giây
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={selectedTime.seconds}
                      onChange={(e) => handleTimeChange('seconds', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
                {formError && (
                  <div className="text-red-500 text-sm">{formError}</div>
                )}
                <button
                  onClick={handleCreateCycle}
                  disabled={selectedTime.days === 0 && selectedTime.hours === 0 && selectedTime.minutes === 0 && selectedTime.seconds === 0}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed w-full"
                >
                  Tạo chu kỳ học mới
                </button>
              </div>
            </div>

            {/* Phần hiển thị chu kỳ hiện tại */}
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium flex items-center text-green-600">
                  <Calendar className="mr-2" />
                  Chu kỳ học tập hiện tại
                </h2>
              </div>

              {currentCycle ? (
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                      <div className="text-sm text-gray-500 mb-1">Thời gian còn lại</div>
                      <div className="flex items-center text-2xl font-semibold text-gray-800">
                        <Clock className="w-6 h-6 mr-2 text-green-500" />
                        {timeRemaining ? (
                          <span>
                            {timeRemaining.days} ngày {timeRemaining.hours} giờ {timeRemaining.minutes} phút {timeRemaining.seconds} giây
                          </span>
                        ) : (
                          <span className="text-red-500">Đã kết thúc</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Kết thúc lúc: {new Date(currentCycle.end_datetime).toLocaleString('vi-VN')}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleStartLearning}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center"
                      >
                        <Play className="w-5 h-5 mr-2" />
                        Bắt đầu học
                      </button>
                      <button
                        onClick={handleStartTest}
                        disabled={!isExpired}
                        className={`px-4 py-2 rounded-lg flex items-center ${
                          isExpired 
                            ? 'bg-blue-500 text-white hover:bg-blue-600' 
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Kiểm tra
                      </button>
                    </div>
                  </div>

                  {/* Add search and filter section */}
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

                  {/* Update vocabulary table */}
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
                              Trạng thái
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {cycleVocabulary.length > 0 ? (
                            cycleVocabulary.map((item) => (
                              <tr 
                          key={item.word_id}
                                className={`hover:bg-gray-50 ${
                                  item.status === 'learned' ? 'bg-green-50' : ''
                                }`}
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-500">{item.word_id}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="text-sm font-medium text-gray-900">
                                      {item.vocabulary?.word}
                                    </div>
                                    <button 
                                      onClick={() => handlePlayAudio(item.vocabulary?.word)}
                                      className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                                    >
                                      <Volume2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-900">{item.vocabulary?.pronunciation}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-900">{item.vocabulary?.definition}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-900 italic">{item.vocabulary?.example}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-900">
                                    {item.vocabulary?.synonyms ? item.vocabulary.synonyms.split(',').map((synonym, index) => (
                                      <span key={index} className="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs font-semibold text-gray-700 mr-1 mb-1">
                                        {synonym.trim()}
                                      </span>
                                    )) : '-'}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                    item.vocabulary?.level === 'a1' ? 'bg-cyan-100 text-cyan-800' :
                                    item.vocabulary?.level === 'a2' ? 'bg-cyan-200 text-cyan-800' :
                                    item.vocabulary?.level === 'b1' ? 'bg-cyan-300 text-cyan-900' :
                                    item.vocabulary?.level === 'b2' ? 'bg-cyan-400 text-cyan-900' :
                                    item.vocabulary?.level === 'c1' ? 'bg-cyan-500 text-white' :
                                    'bg-cyan-600 text-white'
                                  }`}>
                                    {item.vocabulary?.level.toUpperCase()}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{item.vocabulary?.topic}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                    {item.vocabulary?.part_of_speech}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            item.status === 'learned' 
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {item.status === 'learned' ? 'Đã học' : 'Đang học'}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="10" className="px-6 py-4 text-center text-gray-500">
                                {searchTerm ? "Không tìm thấy từ vựng phù hợp" : "Chưa có từ vựng nào trong chu kỳ học"}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Add pagination */}
                    {cycleVocabulary.length > 0 && (
                      <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                        <div className="flex-1 flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-700">
                              Hiển thị <span className="font-medium">{cycleVocabulary.length}</span> trong tổng số{' '}
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
              ) : (
                <div className="text-gray-500 text-center py-8">
                  Chưa có chu kỳ học nào đang chạy
                </div>
              )}
            </div>
          </div>

          {/* Thêm các phần khác của trang home ở đây */}
        </div>
      </div>
    </div>
  )
}

