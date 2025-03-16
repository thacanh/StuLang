import Sidebar from "../components/layout/sidebar"
import { ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"

export default function VocabularyPage() {
  const userData = {
    name: "Nguyễn Thạc Anh",
    wordsLearned: 100,
    timeLeft: "22:30:01",
    wordsNeeded: 20,
  }

  const levels = [
    { level: "A1", color: "bg-cyan-300", textColor: "text-cyan-900" },
    { level: "A2", color: "bg-cyan-400", textColor: "text-cyan-900" },
    { level: "B1", color: "bg-cyan-500", textColor: "text-white" },
    { level: "B2", color: "bg-cyan-600", textColor: "text-white" },
    { level: "C1", color: "bg-cyan-700", textColor: "text-white" },
    { level: "C2", color: "bg-cyan-800", textColor: "text-white" },
  ]

  const LevelButton = ({ levelData, color, textColor }) => (
    <Link 
      to={`/tu-vung/${levelData.toLowerCase()}`}
      className={`${color} ${textColor} min-w-[150px] h-24 rounded-lg shadow-sm flex items-center justify-center 
      font-bold text-2xl transition-transform hover:scale-105 hover:shadow-md cursor-pointer`}
    >
      {levelData}
    </Link>
  );

  return (
    <div className="flex min-h-screen bg-[#F5FBFF]">
      <Sidebar userData={userData} />
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-xl text-green-500 font-medium flex items-center">
            Từ vựng theo cấp độ
            <ChevronRight className="ml-2" />
          </h2>
        </div>

        <div className="w-full overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {levels.map((levelItem, index) => (
              <LevelButton 
                key={index} 
                levelData={levelItem.level} 
                color={levelItem.color} 
                textColor={levelItem.textColor}
              />
            ))}
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-medium mb-4">Chọn một cấp độ để xem từ vựng</h3>
          <p className="text-gray-500">
            Các từ vựng được sắp xếp theo cấp độ từ A1 (cơ bản) đến C2 (nâng cao).
          </p>
        </div>
      </div>
    </div>
  )
}
