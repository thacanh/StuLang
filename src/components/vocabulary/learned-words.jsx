import { useState, useEffect } from "react"
import api from "../../config/api"
import { Volume2 } from "lucide-react"

export default function LearnedWords({ isOpen, onClose, onWordsCountChange }) {
  const [words, setWords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [audioUrls, setAudioUrls] = useState({})

  useEffect(() => {
    if (isOpen) {
      fetchLearnedWords()
    }
  }, [isOpen])

  const fetchLearnedWords = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/users/vocabulary')
      setWords(response.data)
      // Cập nhật số lượng từ đã học
      onWordsCountChange?.(response.data.length)
      
      // Fetch pronunciation for each word
      const urls = {}
      for (const word of response.data) {
        try {
          const dictResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.vocabulary.word}`)
          const dictData = await dictResponse.json()
          if (dictData[0]?.phonetics?.[0]?.audio) {
            urls[word.word_id] = dictData[0].phonetics[0].audio
          }
        } catch (err) {
          console.error(`Error fetching pronunciation for ${word.vocabulary.word}:`, err)
        }
      }
      setAudioUrls(urls)
    } catch (err) {
      setError("Không thể tải danh sách từ vựng. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  const playPronunciation = (wordId) => {
    const audio = new Audio(audioUrls[wordId])
    audio.play()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Từ vựng đã học</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-2">Đang tải...</p>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-4">{error}</div>
        ) : words.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            Bạn chưa học từ vựng nào
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Từ vựng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phát âm</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Định nghĩa</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ví dụ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cấp độ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chủ đề</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày học</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {words.map((word, index) => (
                  <tr key={word.word_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{index + 1}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{word.vocabulary.word}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {audioUrls[word.word_id] && (
                        <button
                          onClick={() => playPronunciation(word.word_id)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Phát âm"
                        >
                          <Volume2 className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{word.vocabulary.definition}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 italic">{word.vocabulary.example}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {word.vocabulary.level.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{word.vocabulary.topic}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(word.learned_at).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
} 