export default function LevelCard({ level, color }) {
    return (
      <div className="flex flex-col items-center">
        <div className={`w-24 h-24 rounded-full ${color} flex items-center justify-center text-white text-3xl font-bold`}>
          {level}
        </div>
      </div>
    )
  }
  
  