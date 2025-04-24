"use client"

import { useState, useEffect, useRef } from "react"
import Sidebar from "../components/layout/sidebar"
import { ArrowLeft, Mic, MicOff, Volume2, Send} from "lucide-react"
import { Link } from "react-router-dom"

export default function ConversationPage() {
  const userData = {
    name: "Nguyễn Thạc Anh",
    wordsLearned: 100,
    timeLeft: "22:30:01",
    wordsNeeded: 20,
  }

  const [userMessage, setUserMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [isRecording, setIsRecording] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState("")
  const [availableVoices, setAvailableVoices] = useState([])
  const recognitionRef = useRef(null)
  const messageContainerRef = useRef(null)
  
  // Tải danh sách giọng đọc
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      // Lọc các giọng tiếng Anh
      const englishVoices = voices.filter(voice => voice.lang.includes('en'))
      setAvailableVoices(englishVoices)
      
      // Đặt giọng mặc định
      if (englishVoices.length > 0) {
        setSelectedVoice(englishVoices[0].name)
      }
    }
    
    // Chrome cần event này để lấy voices
    window.speechSynthesis.onvoiceschanged = loadVoices
    loadVoices()
    
    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [])
  
  // Cuộn xuống khi có tin nhắn mới
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight
    }
  }, [messages])

  // Khởi tạo Web Speech API
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US' // Tiếng Anh (US)
      
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('')
        
        setUserMessage(transcript)
      }
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error)
        setIsRecording(false)
      }
      
      recognitionRef.current.onend = () => {
        setIsRecording(false)
      }
    } else {
      alert('Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói')
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  // Bắt đầu/dừng ghi âm
  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
    } else {
      recognitionRef.current.start()
      setIsRecording(true)
      setUserMessage('')
    }
  }

  // Gửi tin nhắn văn bản
  const handleSendMessage = (e) => {
    e && e.preventDefault()
    if (userMessage.trim() === "") return

    // Dừng ghi âm nếu đang ghi
    if (isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
    }

    // Gửi tin nhắn người dùng
    const newMessage = { text: userMessage, sender: "user", audio: false }
    setMessages([...messages, newMessage])

    // Giả lập phản hồi AI - trong thực tế sẽ gọi API
    setTimeout(() => {
      // Các câu trả lời mẫu đơn giản
      const responses = [
        "Could you please repeat that?",
        "I understand what you're saying.",
        "That's an interesting point.",
        "Let me think about that for a moment.",
        "Can you elaborate on your thoughts?",
        "I'm not sure I understand completely. Could you explain differently?",
        "That's a great question!",
        "Let's discuss this topic further."
      ]
      
      // Chọn ngẫu nhiên một câu trả lời
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      
      const aiResponse = { text: randomResponse, sender: "ai", audio: true }
      setMessages(prevMessages => [...prevMessages, aiResponse])
      
      // Đọc phản hồi tự động
      speakText(randomResponse)
    }, 1000)

    // Xóa tin nhắn người dùng
    setUserMessage("")
  }

  // Chuyển văn bản thành giọng nói
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      
      // Sử dụng giọng đã chọn
      const voices = window.speechSynthesis.getVoices()
      const selectedVoiceObj = voices.find(voice => voice.name === selectedVoice)
      if (selectedVoiceObj) {
        utterance.voice = selectedVoiceObj
      }
      
      utterance.rate = 0.9 // Tốc độ nói
      utterance.pitch = 1 // Cao độ
      
      setIsListening(true)
      
      utterance.onend = () => {
        setIsListening(false)
      }
      
      window.speechSynthesis.speak(utterance)
    }
  }

  // Đọc lại tin nhắn
  const handleReplayMessage = (text) => {
    // Dừng nếu đang phát
    window.speechSynthesis.cancel()
    speakText(text)
  }

  // Các chủ đề hội thoại mẫu
  const conversationTopics = [
    "Greeting and Introduction",
    "Daily Routine",
    "Hobbies and Interests",
    "Travel Experience",
    "Food and Cuisine",
    "Weather",
    "Family and Friends",
    "Movies and Entertainment"
  ]

  return (
    <div className="flex min-h-screen bg-[#F5FBFF]">
      <Sidebar userData={userData} />
      <div className="flex-1 p-6 flex flex-col h-screen">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center text-gray-500 hover:text-gray-700">
              <ArrowLeft className="mr-2 h-5 w-5" />
              <h2 className="text-xl text-green-500 font-medium">Giao tiếp với AI</h2>
            </Link>
            
            <div className="flex items-center">
              <label htmlFor="voice-select" className="mr-2 text-sm text-gray-600">Giọng:</label>
              <select 
                id="voice-select"
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="p-2 border border-gray-300 rounded-md text-sm"
              >
                {availableVoices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-600">Chủ đề gợi ý:</span>
          {conversationTopics.map((topic, index) => (
            <button 
              key={index}
              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-200"
              onClick={() => setUserMessage(`Let's talk about ${topic}`)}
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Tin nhắn */}
        <div 
          ref={messageContainerRef}
          className="flex-1 overflow-y-auto border border-gray-300 rounded-lg p-4 mb-4 bg-white"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <p className="mb-2">Bắt đầu cuộc trò chuyện bằng cách nói hoặc gõ văn bản</p>
              <p className="text-sm">Nhấn vào biểu tượng mic để nói chuyện</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`mb-4 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                <div className="inline-block max-w-[70%]">
                  <div className={`p-3 rounded-lg ${
                    msg.sender === "user" 
                      ? "bg-blue-500 text-white" 
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {msg.text}
                  </div>
                  
                  {/* Nút phát lại âm thanh */}
                  {msg.sender === "ai" && (
                    <button 
                      onClick={() => handleReplayMessage(msg.text)}
                      className="mt-2 text-gray-500 hover:text-gray-700 flex items-center text-xs"
                    >
                      <Volume2 className="h-3 w-3 mr-1" />
                      Phát lại
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
          
          {/* Hiển thị khi AI đang nói */}
          {isListening && (
            <div className="flex justify-center mt-2 mb-2">
              <div className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm flex items-center">
                <Volume2 className="w-4 h-4 mr-2 animate-pulse" />
                AI đang nói...
              </div>
            </div>
          )}
        </div>

        {/* Nhập tin nhắn */}
        <div className="relative">
          <form onSubmit={handleSendMessage} className="flex items-center">
            <button 
              type="button"
              onClick={toggleRecording}
              className={`p-3 rounded-full mr-2 ${
                isRecording 
                  ? "bg-red-500 text-white animate-pulse" 
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            
            <input
              type="text"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              className="flex-1 p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder={isRecording ? "Đang nghe..." : "Nhập tin nhắn hoặc nhấn vào biểu tượng mic để nói..."}
              disabled={isRecording}
            />
            
            <button 
              type="submit"
              disabled={userMessage.trim() === ""}
              className={`ml-2 p-3 rounded-full ${
                userMessage.trim() === "" 
                  ? "bg-gray-200 text-gray-500" 
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
          
          {isRecording && (
            <div className="absolute bottom-full left-0 mb-2 px-3 py-1 bg-red-100 text-red-800 rounded-lg text-sm">
              Đang ghi âm... Nói một câu tiếng Anh
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
