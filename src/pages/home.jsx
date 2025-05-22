import { useState, useEffect } from "react"
import Sidebar from "../components/layout/sidebar"
import StudyPeriod from "../components/study-period/study-period"
import VocabularyTable from "../components/vocabulary/vocabulary-table"
import api from "../config/api"

export default function HomePage() {
  const [vocabularyItems, setVocabularyItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchVocabulary()
  }, [])

  const fetchVocabulary = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/vocabulary')
      setVocabularyItems(response.data)
    } catch (err) {
      setError("Không thể tải danh sách từ vựng")
    } finally {
      setLoading(false)
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

  return (
    <div className="flex min-h-screen bg-[#F5FBFF]">
      <Sidebar />
      <div className="flex-1">
        <StudyPeriod />
        <div className="p-6">
          <VocabularyTable items={vocabularyItems} />
        </div>
      </div>
    </div>
  )
}

