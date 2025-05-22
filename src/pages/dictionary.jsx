import { useState, useEffect } from "react"
import Sidebar from "../components/layout/sidebar"
import SearchBar from "../components/dictionary/search-bar"
import WordCard from "../components/dictionary/word-card"
import api from "../config/api"

export default function DictionaryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [wordCards, setWordCards] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (searchTerm) {
      searchWords()
    }
  }, [searchTerm])

  const searchWords = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get(`/vocabulary/search?keyword=${searchTerm}`)
      setWordCards(response.data)
    } catch (err) {
      if (err.response?.status === 404) {
        setError("Không tìm thấy từ vựng")
      } else {
        setError("Không thể tìm kiếm từ vựng")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F5FBFF]">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="flex justify-center mb-8">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
        </div>

        {loading && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 mb-4">{error}</div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {wordCards.map((card) => (
              <WordCard
                key={card.word_id}
                title={card.word}
                meaning={card.definition}
                example={card.example}
                color="bg-red-500"
                image={card.image || "/placeholder.svg?height=100&width=100"}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

