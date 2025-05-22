"use client"

import { Search } from "lucide-react"

export default function SearchBar({ value, onChange, onSearch }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch?.()
    }
  }

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Tìm kiếm từ..."
        className="w-full py-3 px-4 pr-10 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      <button 
        onClick={() => onSearch?.()}
        className="absolute inset-y-0 right-0 flex items-center pr-3 hover:text-green-500 transition-colors"
      >
        <Search className="h-5 w-5 text-gray-400" />
      </button>
    </div>
  )
}

