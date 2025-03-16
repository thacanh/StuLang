"use client"

import { Bookmark } from "lucide-react"
import PeriodSelector from "./period-selector"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function StudyPeriod({ checkTime }) {
  const [selectedPeriod, setSelectedPeriod] = useState("3 ngày")
  const navigate = useNavigate()
  
  // Kiểm tra xem thời gian có phải là 00:00:00 không
  const isCheckAvailable = checkTime === "00:00:00"

  const handlePractice = () => {
    // Điều hướng đến trang flashcard khi nhấn nút "Luyện tập"
    navigate("/luyen-tap")
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl text-green-500 font-medium mb-2">Chu kỳ</h2>
          <PeriodSelector selectedPeriod={selectedPeriod} onChange={setSelectedPeriod} />
        </div>
        <div>
          <p className="text-green-500 font-medium mb-2">Kiểm tra sau: {checkTime}</p>
          <button 
            className={`${isCheckAvailable ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"} rounded-full px-4 py-1 transition-colors`}
            disabled={!isCheckAvailable}
          >
            Kiểm tra
          </button>
        </div>
      </div>

      <div className="flex items-center mb-6">
        <Bookmark className="text-green-500 mr-2" />
        <span className="text-green-500 font-medium">Từ cần học trong chu kỳ này</span>
      </div>

      <button 
        onClick={handlePractice}
        className="bg-green-500 text-white rounded-full px-6 py-2 font-medium hover:bg-green-600 transition-colors"
      >
        Luyện tập
      </button>
    </div>
  )
}
