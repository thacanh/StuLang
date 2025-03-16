"use client"

import Sidebar from "../components/layout/sidebar"
import { useState, useEffect } from "react"
import { ArrowLeft, ArrowRight, RotateCw, Volume2, Check, X } from "lucide-react"
import { Link } from "react-router-dom"

export default function FlashcardPage() {
  const userData = {
    name: "Nguyễn Thạc Anh",
    wordsLearned: 100,
    timeLeft: "22:30:01",
    wordsNeeded: 20,
  }

  // Dữ liệu mẫu từ vựng
  const vocabularyItems = [
    { id: 1, english: "make sense", vietnamese: "hợp lý" },
    { id: 2, english: "make up your mind", vietnamese: "ra quyết định" },
    { id: 3, english: "pay attention to", vietnamese: "chú ý" },
    { id: 4, english: "see no point in", vietnamese: "thấy bất hợp lý" },
    { id: 5, english: "on your own", vietnamese: "tự mình, tự lực cánh sinh" },
    { id: 6, english: "learn about", vietnamese: "học về (cái gì)" },
  ]

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [progress, setProgress] = useState(0)
  const [knownWords, setKnownWords] = useState([])
  const [unknownWords, setUnknownWords] = useState([])

  // Tính toán tiến độ - sửa ở đây để hiển thị đúng
  useEffect(() => {
    // Dùng currentIndex + 1 để tính từ 1-6 thay vì từ 0-5
    const newProgress = ((currentIndex + 1) / vocabularyItems.length) * 100
    setProgress(newProgress)
  }, [currentIndex, vocabularyItems.length])

  // Chuyển sang từ tiếp theo
  const goToNextCard = () => {
    if (currentIndex < vocabularyItems.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    }
  }

  // Quay lại từ trước
  const goToPrevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  // Lật thẻ
  const flipCard = () => {
    setIsFlipped(!isFlipped)
  }

  // Đánh dấu từ là đã biết
  const markAsKnown = () => {
    const currentWord = vocabularyItems[currentIndex]
    if (!knownWords.includes(currentWord.id)) {
      setKnownWords([...knownWords, currentWord.id])
    }
    goToNextCard()
  }

  // Đánh dấu từ là chưa biết
  const markAsUnknown = () => {
    const currentWord = vocabularyItems[currentIndex]
    if (!unknownWords.includes(currentWord.id)) {
      setUnknownWords([...unknownWords, currentWord.id])
    }
    goToNextCard()
  }

  // Làm mới các từ và bắt đầu lại
  const resetCards = () => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setKnownWords([])
    setUnknownWords([])
  }

  // Lấy từ hiện tại
  const currentWord = vocabularyItems[currentIndex]

  return (
    <div className="flex min-h-screen bg-[#F5FBFF]">
      <Sidebar userData={userData} />
      <div className="flex-1 p-6">
        <div className="mb-6">
          <Link to="/" className="text-gray-500 hover:text-gray-700 flex items-center">
            <ArrowLeft className="mr-2 h-5 w-5" />
            <span>Quay lại</span>
          </Link>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">Tiến độ học</span>
            <span className="text-sm font-medium">
              {currentIndex + 1}/{vocabularyItems.length}
            </span>
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Flashcard */}
        <div className="relative w-full max-w-2xl mx-auto">
          <div 
            className="w-full h-80 rounded-2xl shadow-lg cursor-pointer overflow-hidden transition-all duration-500"
            onClick={flipCard}
            style={{ perspective: "1000px" }}
          >
            <div 
              className={`relative w-full h-full transition-transform duration-500`}
              style={{ 
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
              }}
            >
              {/* Front Side */}
              <div 
                className="absolute w-full h-full bg-white p-6 flex flex-col items-center justify-center rounded-2xl"
                style={{ backfaceVisibility: "hidden" }}
              >
                <h2 className="text-3xl font-bold text-center mb-6">{currentWord.english}</h2>
                <button className="text-green-500 hover:text-green-600">
                  <Volume2 className="h-10 w-10" />
                </button>
                <p className="text-gray-500 text-center mt-8">Nhấp để xem nghĩa</p>
              </div>
              
              {/* Back Side */}
              <div 
                className="absolute w-full h-full bg-green-50 p-6 flex flex-col items-center justify-center rounded-2xl"
                style={{ 
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)"
                }}
              >
                <h2 className="text-xl text-gray-500 mb-2">Tiếng Việt</h2>
                <p className="text-3xl font-bold text-center">{currentWord.vietnamese}</p>
                <p className="text-gray-500 text-center mt-8">Nhấp để xem từ tiếng Anh</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card Controls */}
        <div className="flex justify-between items-center mt-8 max-w-2xl mx-auto">
          <button 
            onClick={goToPrevCard}
            disabled={currentIndex === 0}
            className={`p-3 rounded-full ${currentIndex === 0 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <ArrowLeft className="h-6 w-6" />
          </button>

          <div className="flex gap-4">
            <button 
              onClick={markAsUnknown}
              className="bg-red-500 hover:bg-red-600 text-white rounded-full px-5 py-2 flex items-center"
            >
              <X className="h-5 w-5 mr-2" />
              <span>Chưa biết</span>
            </button>
            
            <button 
              onClick={flipCard}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-5 py-2 flex items-center"
            >
              <RotateCw className="h-5 w-5 mr-2" />
              <span>Lật thẻ</span>
            </button>
            
            <button 
              onClick={markAsKnown}
              className="bg-green-500 hover:bg-green-600 text-white rounded-full px-5 py-2 flex items-center"
            >
              <Check className="h-5 w-5 mr-2" />
              <span>Đã biết</span>
            </button>
          </div>

          <button 
            onClick={goToNextCard}
            disabled={currentIndex === vocabularyItems.length - 1}
            className={`p-3 rounded-full ${currentIndex === vocabularyItems.length - 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <ArrowRight className="h-6 w-6" />
          </button>
        </div>

        {/* Results when complete */}
        {currentIndex === vocabularyItems.length - 1 && (
          <div className="mt-8 p-6 bg-white rounded-xl shadow-sm max-w-2xl mx-auto">
            <h3 className="text-xl font-medium mb-4">Kết quả ôn tập</h3>
            <div className="flex gap-8">
              <div>
                <p className="text-green-500 font-medium">Đã biết: {knownWords.length}</p>
                <p className="text-sm text-gray-500">{Math.round((knownWords.length / vocabularyItems.length) * 100)}% từ vựng</p>
              </div>
              <div>
                <p className="text-red-500 font-medium">Chưa biết: {unknownWords.length}</p>
                <p className="text-sm text-gray-500">{Math.round((unknownWords.length / vocabularyItems.length) * 100)}% từ vựng</p>
              </div>
            </div>
            <button 
              onClick={resetCards}
              className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full px-5 py-2 flex items-center"
            >
              <RotateCw className="h-5 w-5 mr-2" />
              <span>Học lại</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
