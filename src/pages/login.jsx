"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()
    // Xử lý đăng nhập (thực tế sẽ gọi API)
    console.log("Đăng nhập với:", { email, password })
    
    // Chuyển hướng sau khi đăng nhập thành công
    navigate("/chu-ky-hoc")
  }

  return (
    <div className="min-h-screen bg-[#F5FBFF] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-600 mb-2">StuLang</h1>
          <p className="text-gray-500">Đăng nhập để tiếp tục học tập</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Email hoặc tên đăng nhập</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Nhập email hoặc tên đăng nhập"
            //   required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Mật khẩu</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Nhập mật khẩu"
                // required
              />
              <button 
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="flex justify-end mt-2">
              <a href="\" className="text-sm text-green-600 hover:underline">Quên mật khẩu?</a>
            </div>
          </div>

          <button 
            type="submit"
            herf="/"
            className="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
          >
            Đăng nhập
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Chưa có tài khoản? 
            <Link to="/dang-ky" className="ml-1 text-green-600 font-medium hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500 mb-4">Hoặc đăng nhập với</p>
          <div className="flex gap-4 justify-center">
            <button className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <div className="h-5 w-5 mx-auto text-red-500">G</div>
            </button>
            <button className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <div className="h-5 w-5 mx-auto text-blue-600">f</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
