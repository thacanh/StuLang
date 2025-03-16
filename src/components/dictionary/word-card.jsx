export default function WordCard({ title, meaning, example, color, image }) {
    return (
      <div className="flex flex-col items-center">
        {/* <img src={image || "/placeholder.svg"} alt={title} className="w-24 h-24 object-contain mb-2" /> */}
        <h3 className="font-medium mb-1">{title}</h3>
        <div className="flex items-center mb-1">
          <div className={`w-4 h-4 rounded-full ${color} mr-2`}></div>
          <span className="text-sm">{meaning}</span>
        </div>
        <p className="text-xs text-gray-600 text-center">{example}</p>
        <div className="mt-2 text-green-500 text-xs">[ Verb ]</div>
      </div>
    )
  }
  
  