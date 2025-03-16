import { useState } from "react"
import Sidebar from "../components/layout/sidebar"
import SearchBar from "../components/dictionary/search-bar"
import WordCard from "../components/dictionary/word-card"

export default function DictionaryPage() {
  const [searchTerm, setSearchTerm] = useState("Take")

  const userData = {
    name: "Nguyễn Thạc Anh",
    wordsLearned: 100,
    timeLeft: "22:30:01",
    wordsNeeded: 20,
  }

  const wordCards = [
    {
      title: "Take",
      meaning: "lấy,nắm",
      example: "to reach for something and hold it",
      color: "bg-red-500",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      title: "Take In",
      meaning: "hiểu,tiếp thu",
      example: "to comprehend something",
      color: "bg-red-500",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      title: "Take On",
      meaning: "thuê,tuyển dụng",
      example: "to hire someone",
      color: "bg-red-500",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      title: "Take To",
      meaning: "bắt đầu,thích,thích thú với",
      example: "to start to like someone or something",
      color: "bg-red-500",
      image: "/placeholder.svg?height=100&width=100",
    },
  ]

  return (
    <div className="flex min-h-screen bg-[#F5FBFF]">
      <Sidebar userData={userData} />
      <div className="flex-1 p-6">
        <div className="flex justify-center mb-8">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
        </div>

        <div className="grid grid-cols-4 gap-8">
          {wordCards.map((card, index) => (
            <WordCard
              key={index}
              title={card.title}
              meaning={card.meaning}
              example={card.example}
              color={card.color}
              image={card.image}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

