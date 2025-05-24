"use client"

import Sidebar from "../components/layout/sidebar"
import { useState, useEffect } from "react"
import { ArrowLeft, ArrowRight, RotateCw, Volume2 } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import api from "../config/api"

export default function FlashcardPage() {
  const [vocabularyItems, setVocabularyItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [progress, setProgress] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const ITEMS_PER_PAGE = 20
  const navigate = useNavigate()

  useEffect(() => {
    fetchVocabulary()
  }, [currentPage])

  const fetchVocabulary = async () => {
    try {
      setLoading(true)
      const skip = (currentPage - 1) * ITEMS_PER_PAGE
      const response = await api.get(`/cycles/vocabulary?skip=${skip}&limit=${ITEMS_PER_PAGE}`)
      
      if (response.data) {
        setVocabularyItems(prevItems => {
          // Nếu là trang đầu tiên, reset danh sách
          if (currentPage === 1) {
            return response.data.items
          }
          // Nếu là trang tiếp theo, thêm vào danh sách hiện tại
          return [...prevItems, ...response.data.items]
        })
        setTotalItems(response.data.total)
        setTotalPages(response.data.pages)
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError("Không tìm thấy chu kỳ học nào đang hoạt động")
      } else {
        setError("Không thể tải danh sách từ vựng")
      }
      console.error('Error fetching vocabulary:', err)
    } finally {
      setLoading(false)
    }
  }

  // Tự động tải thêm từ vựng khi gần đến cuối danh sách
  useEffect(() => {
    if (currentIndex > 0 && currentIndex === vocabularyItems.length - 5 && currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }, [currentIndex, vocabularyItems.length, currentPage, totalPages])

  // Tính toán tiến độ dựa trên tổng số từ vựng
  useEffect(() => {
    if (totalItems > 0) {
      const newProgress = ((currentIndex + 1) / totalItems) * 100
      setProgress(newProgress)
    }
  }, [currentIndex, totalItems])

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

  // Phát âm từ
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

  // Lấy từ hiện tại
  const currentWord = vocabularyItems[currentIndex]
  if (!currentWord) return null

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

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">Tiến độ học</span>
            <span className="text-sm font-medium">
              {currentIndex + 1}/{totalItems}
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
              {/* Front Side - Word & Pronunciation */}
              <div 
                className="absolute w-full h-full bg-white p-6 flex flex-col items-center justify-center rounded-2xl"
                style={{ backfaceVisibility: "hidden" }}
              >
                <h2 className="text-3xl font-bold text-center mb-4">{currentWord.vocabulary.word}</h2>
                <p className="text-xl text-gray-600 mb-6">{currentWord.vocabulary.pronunciation}</p>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePlayAudio(currentWord.vocabulary.word)
                  }}
                  className="text-green-500 hover:text-green-600"
                >
                  <Volume2 className="h-10 w-10" />
                </button>
                <p className="text-gray-500 text-center mt-8">Nhấp để xem nghĩa</p>
              </div>
              
              {/* Back Side - Definition, Synonyms & Example */}
              <div 
                className="absolute w-full h-full bg-green-50 p-6 flex flex-col items-center justify-center rounded-2xl"
                style={{ 
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)"
                }}
              >
                <div className="text-center space-y-4">
                  <div>
                    <h3 className="text-lg text-gray-500 mb-2">Nghĩa:</h3>
                    <p className="text-2xl font-bold">{currentWord.vocabulary.definition}</p>
                  </div>
                  
                  {currentWord.vocabulary.synonyms && (
                    <div>
                      <h3 className="text-lg text-gray-500 mb-2">Từ đồng nghĩa:</h3>
                      <div className="flex flex-wrap justify-center gap-2">
                        {currentWord.vocabulary.synonyms.split(',').map((synonym, index) => (
                          <span 
                            key={index} 
                            className="inline-block bg-white rounded-full px-3 py-1 text-sm font-semibold text-gray-700"
                          >
                            {synonym.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-lg text-gray-500 mb-2">Ví dụ:</h3>
                    <p className="text-lg italic">{currentWord.vocabulary.example}</p>
                  </div>
                </div>
                <p className="text-gray-500 text-center mt-8">Nhấp để xem từ</p>
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

          <button 
            onClick={flipCard}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-5 py-2 flex items-center"
          >
            <RotateCw className="h-5 w-5 mr-2" />
            <span>Lật thẻ</span>
          </button>

          <button 
            onClick={goToNextCard}
            disabled={currentIndex === vocabularyItems.length - 1}
            className={`p-3 rounded-full ${currentIndex === vocabularyItems.length - 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <ArrowRight className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  )
}
