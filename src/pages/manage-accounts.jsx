"use client"

import Sidebar from "../components/layout/sidebar"
import { useState } from "react"
import { Search, Edit, Trash2, UserPlus, X, Filter } from "lucide-react"

export default function ManageAccountsPage() {
  const userData = {
    name: "Nguyễn Thạc Anh",
    wordsLearned: 100,
    timeLeft: "22:30:01",
    wordsNeeded: 20,
  }

  const [searchTerm, setSearchTerm] = useState("")

  // Sample user data
  const users = [
    { id: "4251", name: "Nguyễn Thạc Anh", email: "thac.anh@example.com", role: "User", status: "Active" },
    { id: "3892", name: "Trần Văn Bình", email: "van.binh@example.com", role: "User", status: "Active" },
    { id: "2781", name: "Lê Thị Cúc", email: "thi.cuc@example.com", role: "User", status: "Inactive" },
    { id: "1945", name: "Phạm Đức Dũng", email: "duc.dung@example.com", role: "Premium", status: "Active" },
  ]

  return (
    <div className="flex min-h-screen bg-[#F5FBFF]">
      <Sidebar userData={userData} />
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Quản lý tài khoản</h1>
          <div className="flex gap-4">
            <button
              onClick={() => window.history.back()}
              className="flex items-center text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5 mr-1" />
              Quay lại
            </button>
            <button className="bg-green-500 text-white rounded-md px-4 py-2 flex items-center">
              <UserPlus className="w-5 h-5 mr-2" />
              Thêm người dùng
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm người dùng..."
                  className="w-full py-2 px-4 pr-10 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <button className="px-4 py-2 border border-gray-300 rounded-md flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Lọc
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 flex items-center justify-between border-t">
            <div className="text-sm text-gray-500">Hiển thị 1-4 của 4 kết quả</div>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-gray-300 rounded-md bg-gray-50">Trước</button>
              <button className="px-3 py-1 border border-gray-300 rounded-md bg-green-500 text-white">1</button>
              <button className="px-3 py-1 border border-gray-300 rounded-md bg-gray-50">Sau</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

