import { ChevronDown, Check } from "lucide-react"
import { useState } from "react"

export default function PeriodSelector({ selectedPeriod, onChange }) {
  const [tempPeriod, setTempPeriod] = useState(selectedPeriod)

  const handleChange = (e) => {
    setTempPeriod(e.target.value)
  }

  const handleConfirm = () => {
    onChange(tempPeriod)
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative inline-block">
        <select
          value={tempPeriod}
          onChange={handleChange}
          className="appearance-none bg-white border border-gray-200 rounded-md py-2 px-4 pr-8 text-green-500 font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="3 ngày">3 ngày</option>
          <option value="7 ngày">7 ngày</option>
          <option value="14 ngày">14 ngày</option>
          <option value="30 ngày">30 ngày</option>
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>
      
      <button 
        onClick={handleConfirm}
        className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md flex items-center transition-colors"
      >
        <Check className="h-4 w-4 mr-1" />
        Xác nhận
      </button>
    </div>
  )
}
