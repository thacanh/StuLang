"use client"

import { Pencil } from "lucide-react"
import { useState } from "react"


export default function ProfileForm({ initialName, userId }) {
  const [name, setName] = useState(initialName)

  return (
    <div className="p-8">
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-purple-900"></div>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm mb-1">Email người dùng:</label>
        <div className="flex items-center">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 p-2 border-b border-gray-300 focus:outline-none focus:border-green-500"
          />
          <button className="ml-2">
            <Pencil className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm mb-1">ID người dùng</label>
        <div className="p-2 border-b border-gray-300">#{userId}</div>
      </div>

      <div className="mb-6">
        <label className="block text-sm mb-1">Đổi mật khẩu</label>
        <input
          type="password"
          placeholder="Mật khẩu hiện tại"
          className="w-full p-2 mb-2 border-b border-gray-300 focus:outline-none focus:border-green-500"
        />
        <input
          type="password"
          placeholder="Mật khẩu mới"
          className="w-full p-2 mb-2 border-b border-gray-300 focus:outline-none focus:border-green-500"
        />
        <input
          type="password"
          placeholder="Xác nhận mật khẩu"
          className="w-full p-2 mb-4 border-b border-gray-300 focus:outline-none focus:border-green-500"
        />
        <button className="bg-green-500 text-white rounded-md px-4 py-2">Đổi mật khẩu</button>
      </div>
    </div>
  )
}
