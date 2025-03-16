"use client"

import Sidebar from "../components/layout/sidebar"
import { useState } from "react"
import { Save, Plus, X, Upload, Link as LinkIcon, FileAudio } from "lucide-react"

export default function AddVocabularyPage() {
  const userData = {
    name: "Nguyễn Thạc Anh",
    wordsLearned: 100,
    timeLeft: "22:30:01",
    wordsNeeded: 20,
  }

  const [word, setWord] = useState({
    english: "",
    vietnamese: "",
    phonetic: "",
    example: "",
    level: "A1",
    type: "Verb",
    audio: null,
    audioLink: "",
  })

  const [audioType, setAudioType] = useState("upload") // "upload" or "link"
  const [fileName, setFileName] = useState("")

  const levels = ["A1", "A2", "B1", "B2", "C1", "C2"]
  const wordTypes = ["Noun", "Verb", "Adjective", "Adverb", "Preposition", "Conjunction", "Pronoun", "Interjection"]

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission
    console.log("Submitted:", word)
    // Reset form
    setWord({
      english: "",
      vietnamese: "",
      phonetic: "",
      example: "",
      level: "A1",
      type: "Verb",
      audio: null,
      audioLink: "",
    })
    setFileName("")
  }

  const handleAudioUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setWord({ ...word, audio: file })
      setFileName(file.name)
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

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Từ tiếng Anh</label>
                <input
                  type="text"
                  value={word.english}
                  onChange={(e) => setWord({ ...word, english: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Nhập từ tiếng Anh"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phiên âm</label>
                <input
                  type="text"
                  value={word.phonetic}
                  onChange={(e) => setWord({ ...word, phonetic: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Nhập phiên âm (VD: /həˈloʊ/)"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Nghĩa tiếng Việt</label>
              <input
                type="text"
                value={word.vietnamese}
                onChange={(e) => setWord({ ...word, vietnamese: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Nhập nghĩa Tiếng Việt"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Âm thanh</label>
              <div className="flex gap-4 mb-3">
                <button
                  type="button"
                  className={`px-4 py-2 rounded-md flex items-center ${
                    audioType === "upload" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => setAudioType("upload")}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Tải lên
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded-md flex items-center ${
                    audioType === "link" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700"
                  }`}
                  onClick={() => setAudioType("link")}
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Thêm link
                </button>
              </div>

              {audioType === "upload" ? (
                <div className="border border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="relative w-full">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      id="audio-upload"
                    />
                    <label htmlFor="audio-upload" className="flex flex-col items-center justify-center cursor-pointer">
                      {!fileName ? (
                        <>
                          <FileAudio className="w-12 h-12 text-green-500 mb-3" />
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-700">Kéo thả file hoặc nhấn để chọn</p>
                            <p className="text-xs text-gray-500 mt-1">Định dạng hỗ trợ: MP3, WAV (tối đa 5MB)</p>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-center bg-green-100 py-3 px-4 rounded-lg w-full">
                          <FileAudio className="w-6 h-6 text-green-500 mr-2" />
                          <span className="text-sm font-medium text-gray-700 truncate max-w-xs">{fileName}</span>
                          <button 
                            type="button" 
                            className="ml-auto text-red-500 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation()
                              setFileName("")
                              setWord({...word, audio: null})
                              document.getElementById('audio-upload').value = ''
                            }}
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              ) : (
                <input
                  type="url"
                  value={word.audioLink}
                  onChange={(e) => setWord({ ...word, audioLink: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Nhập đường dẫn tới file âm thanh"
                />
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Mô tả bằng Tiếng Anh và ví dụ</label>
              <textarea
                value={word.example}
                onChange={(e) => setWord({ ...word, example: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Nhập mô tả và ví dụ sử dụng từ này"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Cấp độ</label>
                <select
                  value={word.level}
                  onChange={(e) => setWord({ ...word, level: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {levels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Loại từ</label>
                <select
                  value={word.type}
                  onChange={(e) => setWord({ ...word, type: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {wordTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
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
            <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Nhập từ Excel
            </button>
          </div>
          <p className="text-gray-500">Bạn có thể nhập nhiều từ vựng cùng lúc bằng cách tải lên file Excel theo mẫu.</p>
        </div>
      </div>
    </div>
  )
}
