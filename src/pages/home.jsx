import { useState, useEffect } from "react"
import Sidebar from "../components/layout/sidebar"
import { Calendar, Clock, ChevronRight, Play, X, CheckCircle2 } from "lucide-react"
import api from "../config/api"
import { useNavigate } from "react-router-dom"

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

  useEffect(() => {
    fetchVocabulary()
    fetchCurrentCycle()
  }, [])

  useEffect(() => {
    if (currentCycle) {
      fetchCycleVocabulary()
      startCountdown()
    }
  }, [currentCycle])

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
      const response = await api.get('/cycles/vocabulary')
      setCycleVocabulary(response.data)
    } catch (err) {
      console.error('Error fetching cycle vocabulary:', err)
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
    navigate('/practice')
  }

  const handleStartTest = () => {
    navigate('/test')
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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm text-blue-600 mb-1">Tổng số từ</div>
                      <div className="text-2xl font-semibold text-blue-700">
                        {cycleVocabulary.length}
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm text-green-600 mb-1">Đã học</div>
                      <div className="text-2xl font-semibold text-green-700">
                        {cycleVocabulary.filter(v => v.status === 'learned').length}
                      </div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-sm text-yellow-600 mb-1">Cần học</div>
                      <div className="text-2xl font-semibold text-yellow-700">
                        {cycleVocabulary.filter(v => v.status === 'pending').length}
                      </div>
                    </div>
                  </div>

                  {/* Danh sách từ vựng trong chu kỳ */}
                  <div>
                    <h3 className="text-lg font-medium mb-3">Từ vựng trong chu kỳ</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {cycleVocabulary.map((item) => (
                        <div 
                          key={item.word_id}
                          className={`p-4 rounded-lg border ${
                            item.status === 'learned' 
                              ? 'border-green-200 bg-green-50' 
                              : 'border-yellow-200 bg-yellow-50'
                          }`}
                        >
                          <div className="font-medium">{item.vocabulary?.word}</div>
                          <div className="text-sm text-gray-600">{item.vocabulary?.definition}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Trạng thái: {item.status === 'learned' ? 'Đã học' : 'Đang học'}
                          </div>
                        </div>
                      ))}
                    </div>
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

