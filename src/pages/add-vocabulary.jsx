"use client"

import Sidebar from "../components/layout/sidebar"
import { useState, useEffect } from "react"
import { Save, Plus, X, Upload, Link as LinkIcon, FileAudio, Download } from "lucide-react"
import api from "../config/api"

export default function AddVocabularyPage() {
  const userData = {
    name: "Nguyễn Thạc Anh",
    wordsLearned: 100,
    timeLeft: "22:30:01",
    wordsNeeded: 20,
  }

  const [word, setWord] = useState({
    word: "",
    definition: "",
    pronunciation: "",
    example: "",
    level: "a1",
    topic: "general",
    synonyms: "",
    part_of_speech: "noun"
  })

  const levels = ["a1", "a2", "b1", "b2", "c1", "c2"]
  const partsOfSpeech = [
    "noun", "verb", "adjective", "adverb", "pronoun", 
    "preposition", "conjunction", "interjection"
  ]
  const [existingTopics, setExistingTopics] = useState([])
  const [isLoadingTopics, setIsLoadingTopics] = useState(true)
  const [topicError, setTopicError] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [importResult, setImportResult] = useState(null)
  const [isImporting, setIsImporting] = useState(false)

  useEffect(() => {
    fetchExistingTopics()
  }, [])

  const fetchExistingTopics = async () => {
    try {
      setIsLoadingTopics(true)
      setTopicError(null)
      const response = await api.get('/vocabulary/topics')
      setExistingTopics(response.data)
    } catch (err) {
      setTopicError("Không thể tải danh sách chủ đề")
      console.error('Error fetching topics:', err)
    } finally {
      setIsLoadingTopics(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const formData = {
        word: word.word,
        definition: word.definition,
        level: word.level,
        topic: word.topic,
        part_of_speech: word.part_of_speech,
        example: word.example || undefined,
        pronunciation: word.pronunciation || undefined,
        synonyms: word.synonyms || undefined
      }
      
      const response = await api.post('/admin/vocabulary', formData)
      console.log('API Response:', response)
      
      // Show success message
      setSuccessMessage("Thêm từ vựng thành công!")
      
      // Reset form after successful submission
    setWord({
        word: "",
        definition: "",
        pronunciation: "",
      example: "",
        level: "a1",
        topic: "general",
        synonyms: "",
        part_of_speech: "noun"
      })
      
      // Optionally refresh topics list if a new topic was added
      if (!existingTopics.includes(formData.topic)) {
        fetchExistingTopics()
      }

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (err) {
      console.error('Error submitting vocabulary:', err)
      let errorMessage = "Lỗi: Không thể thêm từ vựng!"
      
      // Check for specific error messages from the API
      if (err.response) {
        if (err.response.status === 400) {
          errorMessage = `Lỗi: ${err.response.data.detail || 'Dữ liệu không hợp lệ'}`
        } else if (err.response.status === 401) {
          errorMessage = "Lỗi: Bạn không có quyền thực hiện thao tác này"
        } else if (err.response.status === 409) {
          errorMessage = "Lỗi: Từ vựng này đã tồn tại"
        }
      }
      
      setSuccessMessage(errorMessage)
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    }
  }

  // Thêm useEffect để kiểm tra token và quyền admin
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get('/admin/users') // Thử gọi một API admin để kiểm tra quyền
      } catch (err) {
        if (err.response && err.response.status === 401) {
          setSuccessMessage("Lỗi: Bạn cần đăng nhập với tài khoản admin")
          setTimeout(() => {
            window.location.href = '/login' // Chuyển về trang login nếu chưa đăng nhập
          }, 2000)
        }
      }
    }
    checkAuth()
  }, [])

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get('/admin/vocabulary/excel-template', {
        responseType: 'blob'
      })
      
      // Tạo URL cho blob và tải xuống
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'vocabulary_template.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error downloading template:', err)
      setSuccessMessage("Lỗi: Không thể tải template")
      setTimeout(() => setSuccessMessage(""), 3000)
    }
  }

  const handleImportExcel = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Kiểm tra định dạng file
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setSuccessMessage("Lỗi: Chỉ chấp nhận file Excel (.xlsx, .xls)")
      setTimeout(() => setSuccessMessage(""), 3000)
      return
    }

    try {
      setIsImporting(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post('/admin/vocabulary/import-excel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setImportResult(response.data)
      setSuccessMessage(`Nhập từ vựng thành công! Đã thêm ${response.data.success_count} từ.`)
      
      // Reset file input
      e.target.value = ''
    } catch (err) {
      console.error('Error importing Excel:', err)
      let errorMessage = "Lỗi: Không thể nhập file Excel"
      if (err.response?.data?.detail) {
        errorMessage = `Lỗi: ${err.response.data.detail}`
      }
      setSuccessMessage(errorMessage)
    } finally {
      setIsImporting(false)
      setTimeout(() => setSuccessMessage(""), 3000)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F5FBFF]">
      <Sidebar userData={userData} />
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Thêm từ vựng</h1>
          <button onClick={() => window.history.back()} className="flex items-center text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5 mr-1" />
            Quay lại
          </button>
        </div>

        {successMessage && (
          <div className={`mb-4 p-3 rounded-md ${
            successMessage.startsWith("Lỗi") 
              ? "bg-red-100 text-red-700" 
              : "bg-green-100 text-green-700"
          }`}>
            {successMessage}
          </div>
        )}

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Từ tiếng Anh</label>
                <input
                  type="text"
                  value={word.word}
                  onChange={(e) => setWord({ ...word, word: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Nhập từ tiếng Anh"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phiên âm</label>
                <input
                  type="text"
                  value={word.pronunciation}
                  onChange={(e) => setWord({ ...word, pronunciation: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Nhập phiên âm (VD: /həˈloʊ/)"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Định nghĩa</label>
              <input
                type="text"
                value={word.definition}
                onChange={(e) => setWord({ ...word, definition: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Nhập định nghĩa của từ"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Từ đồng nghĩa</label>
                    <input
                type="text"
                value={word.synonyms}
                onChange={(e) => setWord({ ...word, synonyms: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Nhập các từ đồng nghĩa, phân cách bằng dấu phẩy"
                />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Ví dụ</label>
              <textarea
                value={word.example}
                onChange={(e) => setWord({ ...word, example: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Nhập ví dụ sử dụng từ này"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Cấp độ</label>
                <select
                  value={word.level}
                  onChange={(e) => setWord({ ...word, level: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {levels.map((level) => (
                    <option key={level} value={level}>
                      {level.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Loại từ</label>
                <select
                  value={word.part_of_speech}
                  onChange={(e) => setWord({ ...word, part_of_speech: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {partsOfSpeech.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos.charAt(0).toUpperCase() + pos.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Chủ đề</label>
                <div className="relative">
                  <input
                    type="text"
                    value={word.topic}
                    onChange={(e) => setWord({ ...word, topic: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Nhập hoặc chọn chủ đề"
                    list="topics-list"
                  />
                  <datalist id="topics-list">
                    {existingTopics.map((topic) => (
                      <option key={topic} value={topic}>
                        {topic.charAt(0).toUpperCase() + topic.slice(1)}
                      </option>
                    ))}
                  </datalist>
                  {isLoadingTopics && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500"></div>
                    </div>
                  )}
                </div>
                {topicError && (
                  <p className="mt-1 text-sm text-red-600">{topicError}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center"
              >
                <Save className="w-5 h-5 mr-2" />
                Lưu từ vựng
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 bg-white rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Thêm nhiều từ vựng</h2>
            <div className="flex gap-3">
              <button 
                onClick={handleDownloadTemplate}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
              >
                <Download className="w-5 h-5 mr-2" />
                Tải template
              </button>
              <label className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center cursor-pointer">
                <Upload className="w-5 h-5 mr-2" />
              Nhập từ Excel
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImportExcel}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          
          <p className="text-gray-500 mb-4">
            Bạn có thể nhập nhiều từ vựng cùng lúc bằng cách tải template và điền thông tin vào file Excel.
          </p>

          {importResult && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Kết quả nhập file:</h3>
              <ul className="space-y-1 text-sm">
                <li>Tổng số từ: {importResult.total_rows}</li>
                <li className="text-green-600">Thêm thành công: {importResult.success_count}</li>
                <li className="text-yellow-600">Từ trùng lặp: {importResult.duplicate_count}</li>
                <li className="text-red-600">Lỗi: {importResult.error_count}</li>
                {importResult.error_details && importResult.error_details.length > 0 && (
                  <li className="mt-2">
                    <p className="font-medium text-red-600">Chi tiết lỗi:</p>
                    <ul className="ml-4 mt-1 list-disc">
                      {importResult.error_details.map((error, index) => (
                        <li key={index} className="text-red-600">{error}</li>
                      ))}
                    </ul>
                  </li>
                )}
              </ul>
            </div>
          )}

          {isImporting && (
            <div className="mt-4 flex items-center text-gray-500">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-500 mr-3"></div>
              Đang xử lý file Excel...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
