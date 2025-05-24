import { useState, useEffect } from "react"
import Sidebar from "../components/layout/sidebar"
import { ArrowLeft, Volume2, Check, X } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import api from "../config/api"

export default function TestPage() {
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const response = await api.get('/cycles/practice-set')
      setQuestions(response.data)
    } catch (err) {
      if (err.response?.status === 404) {
        setError("Không tìm thấy chu kỳ học nào đang hoạt động hoặc không có từ vựng nào trong chu kỳ")
      } else {
        setError("Không thể tải bộ câu hỏi")
      }
      console.error('Error fetching questions:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answerIndex
    })
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

  const handleSubmit = async () => {
    try {
      // Kiểm tra tất cả câu hỏi đã được trả lời
      const unansweredQuestions = questions.filter((_, index) => 
        selectedAnswers[index] === undefined
      )
      
      if (unansweredQuestions.length > 0) {
        setError("Vui lòng trả lời tất cả câu hỏi trước khi nộp bài")
        return
      }

      // Chuẩn bị dữ liệu với validation
      const quizResults = {
        quiz_results: questions.map((question, index) => {
          const selectedAnswer = selectedAnswers[index]
          
          return {
            word_id: parseInt(question.word_id),
            selected_answer: parseInt(selectedAnswer),
            is_correct: selectedAnswer === question.correct_answer
          }
        })
      }

      console.log('Submitting results:', quizResults)

      // Validate dữ liệu trước khi gửi
      const isValidData = quizResults.quiz_results.every(result => 
        typeof result.word_id === 'number' &&
        typeof result.selected_answer === 'number' &&
        typeof result.is_correct === 'boolean'
      )
      
      if (!isValidData) {
        setError("Dữ liệu không hợp lệ")
        return
      }

      // Gửi kết quả lên server (từ đúng sẽ tự động bị xóa khỏi cycle)
      const response = await api.post('/cycles/practice-results', quizResults)
      console.log('Server response:', response.data)

      // Tính điểm
      const correctAnswers = quizResults.quiz_results.filter(result => result.is_correct).length
      setScore((correctAnswers / questions.length) * 100)
      setShowResults(true)
      
    } catch (err) {
      console.error('Error submitting results:', err)
      console.log('Error response:', err.response?.data)
      
      if (err.response?.status === 422) {
        const detail = err.response.data?.detail
        if (Array.isArray(detail)) {
          const errorMsg = detail.map(e => `${e.loc?.join('.')}: ${e.msg}`).join('; ')
          setError(`Lỗi dữ liệu: ${errorMsg}`)
        } else {
          setError("Dữ liệu gửi lên không đúng định dạng")
        }
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail)
      } else {
        setError("Không thể gửi kết quả kiểm tra")
      }
    }
  }

  const handlePracticeAgain = () => {
    // Reset states và fetch questions mới
    setQuestions([])
    setCurrentIndex(0)
    setSelectedAnswers({})
    setShowResults(false)
    setScore(0)
    setError(null)
    fetchQuestions()
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
      <div className="flex min-h-screen bg-[#F5FBFF]">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="mb-6">
            <Link to="/" className="text-gray-500 hover:text-gray-700 flex items-center">
              <ArrowLeft className="mr-2 h-5 w-5" />
              <span>Quay lại</span>
            </Link>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-sm max-w-2xl mx-auto text-center">
            <div className="text-red-500 mb-4">{error}</div>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]

  if (showResults) {
    const correctCount = questions.filter((_, index) => 
      selectedAnswers[index] === questions[index].correct_answer
    ).length

    return (
      <div className="flex min-h-screen bg-[#F5FBFF]">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="mb-6">
            <Link to="/" className="text-gray-500 hover:text-gray-700 flex items-center">
              <ArrowLeft className="mr-2 h-5 w-5" />
              <span>Quay lại</span>
            </Link>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-sm max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-6">Kết quả kiểm tra</h2>
            <div className="text-center mb-8">
              <div className="text-4xl font-bold text-green-500 mb-2">{Math.round(score)}%</div>
              <p className="text-gray-600">
                Trả lời đúng {correctCount}/{questions.length} câu hỏi
              </p>
              {correctCount > 0 && (
                <p className="text-green-600 font-medium mt-2">
                  🎉 {correctCount} từ đã được đánh dấu là đã học và loại khỏi chu kỳ!
                </p>
              )}
              {questions.length - correctCount > 0 && (
                <p className="text-blue-600 mt-1">
                  📚 {questions.length - correctCount} từ vẫn ở trong chu kỳ để học tiếp
                </p>
              )}
            </div>
            
            <div className="space-y-6">
              {questions.map((question, index) => (
                <div key={index} className={`p-4 rounded-lg ${
                  selectedAnswers[index] === question.correct_answer
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{question.word}</div>
                    <div className="flex items-center space-x-2">
                      {selectedAnswers[index] === question.correct_answer ? (
                        <>
                          <Check className="text-green-500 w-5 h-5" />
                          <span className="text-xs text-green-600 font-medium">Đã học</span>
                        </>
                      ) : (
                        <>
                          <X className="text-red-500 w-5 h-5" />
                          <span className="text-xs text-blue-600 font-medium">Còn trong chu kỳ</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Đáp án đúng:</strong> {question.choices[question.correct_answer]}
                  </div>
                  {selectedAnswers[index] !== question.correct_answer && (
                    <div className="text-sm text-red-600">
                      <strong>Đáp án của bạn:</strong> {question.choices[selectedAnswers[index]]}
                    </div>
                  )}
                  {question.example && (
                    <div className="text-sm text-gray-500 mt-2 italic">
                      <strong>Ví dụ:</strong> {question.example}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex justify-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Quay lại trang chủ
              </button>
              {questions.length - correctCount > 0 && (
                <button
                  onClick={handlePracticeAgain}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Luyện tập tiếp ({questions.length - correctCount} từ còn lại)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Nếu không có câu hỏi nào
  if (!questions || questions.length === 0) {
    return (
      <div className="flex min-h-screen bg-[#F5FBFF]">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="mb-6">
            <Link to="/" className="text-gray-500 hover:text-gray-700 flex items-center">
              <ArrowLeft className="mr-2 h-5 w-5" />
              <span>Quay lại</span>
            </Link>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-sm max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Không có từ vựng để kiểm tra</h2>
            <p className="text-gray-600 mb-6">
              Chu kỳ học hiện tại không có từ vựng nào hoặc bạn đã học hết tất cả từ vựng.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#F5FBFF]">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="mb-6">
          <Link to="/" className="text-gray-500 hover:text-gray-700 flex items-center">
            <ArrowLeft className="mr-2 h-5 w-5" />
            <span>Quay lại</span>
          </Link>
        </div>

        {/* Progress bar */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">Câu hỏi {currentIndex + 1}/{questions.length}</span>
            <span className="text-sm font-medium">
              {Math.round(((currentIndex + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full transition-all duration-300" 
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question card */}
        {currentQuestion && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{currentQuestion.word}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-600 rounded">
                      {currentQuestion.level?.toUpperCase()}
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                      {currentQuestion.topic}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => handlePlayAudio(currentQuestion.word)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                  title="Phát âm"
                >
                  <Volume2 className="w-6 h-6" />
                </button>
              </div>
              
              {currentQuestion.pronunciation && (
                <p className="text-gray-600 mb-2 font-mono">
                  <strong>Phát âm:</strong> {currentQuestion.pronunciation}
                </p>
              )}
              
              {currentQuestion.example && (
                <p className="text-gray-600 mb-6 italic">
                  <strong>Ví dụ:</strong> "{currentQuestion.example}"
                </p>
              )}

              <div className="mb-4">
                <h3 className="text-lg font-medium mb-3">Chọn nghĩa đúng của từ:</h3>
              </div>

              {/* Answer choices */}
              <div className="space-y-3">
                {currentQuestion.choices.map((choice, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(currentIndex, index)}
                    className={`w-full p-4 text-left rounded-lg border transition-all ${
                      selectedAnswers[currentIndex] === index
                        ? 'border-green-500 bg-green-50 shadow-md'
                        : 'border-gray-200 hover:border-green-200 hover:bg-green-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-gray-300 mr-3 flex items-center justify-center text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="flex-1">{choice}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentIndex(currentIndex - 1)}
                disabled={currentIndex === 0}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  currentIndex === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border shadow-sm'
                }`}
              >
                ← Câu trước
              </button>

              {currentIndex === questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={Object.keys(selectedAnswers).length !== questions.length}
                  className={`px-6 py-2 rounded-lg transition-colors ${
                    Object.keys(selectedAnswers).length === questions.length
                      ? 'bg-green-500 text-white hover:bg-green-600 shadow-md'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Nộp bài ✓
                </button>
              ) : (
                <button
                  onClick={() => setCurrentIndex(currentIndex + 1)}
                  disabled={!selectedAnswers.hasOwnProperty(currentIndex)}
                  className={`px-6 py-2 rounded-lg transition-colors ${
                    selectedAnswers.hasOwnProperty(currentIndex)
                      ? 'bg-green-500 text-white hover:bg-green-600 shadow-md'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Câu tiếp →
                </button>
              )}
            </div>

            {/* Progress indicator */}
            <div className="mt-6 text-center text-sm text-gray-500">
              Đã trả lời: {Object.keys(selectedAnswers).length}/{questions.length} câu hỏi
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
