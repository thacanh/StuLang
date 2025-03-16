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
        <label className="block text-sm mb-1">Tên người dùng:</label>
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

      <div className="flex justify-between mt-8">
        <button className="border border-green-500 text-green-500 rounded-full px-6 py-2">Phản hồi</button>
        <button className="border border-red-500 text-red-500 rounded-full px-6 py-2 flex items-center">
          Đăng xuất
          <svg className="ml-2 w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 17L21 12L16 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}

