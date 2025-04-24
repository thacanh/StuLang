"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, CheckCircle } from "lucide-react"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()

  const handleRegister = (e) => {
    e.preventDefault()
    
    // Kiểm tra mật khẩu
    if (password !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!")
      return
    }
    
    // Xử lý đăng ký (thực tế sẽ gọi API)
    console.log("Đăng ký với:", { name, email, password })
    
    // Chuyển hướng sau khi đăng ký thành công
    navigate("/dang-nhap")
  }

  const passwordStrength = () => {
    if (!password) return { level: 0, text: "" }
    
    if (password.length < 6) {
      return { level: 1, text: "Yếu" }
    } else if (password.length < 8) {
      return { level: 2, text: "Trung bình" }
    } else if (password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)) {
      return { level: 4, text: "Mạnh" }
    } else {
      return { level: 3, text: "Khá" }
    }
  }

  const strength = passwordStrength()

  return (
    <div className="min-h-screen bg-[#F5FBFF] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-600 mb-2">StuLang</h1>
          <p className="text-gray-500">Tạo tài khoản mới</p>
        </div>

        <form onSubmit={handleRegister}>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Họ và tên</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Nhập họ và tên"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Nhập email"
              required
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
                placeholder="Tạo mật khẩu"
                required
                minLength={6}
              />
              <button 
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            {password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">Độ mạnh mật khẩu: {strength.text}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      strength.level === 1 ? 'bg-red-500' : 
                      strength.level === 2 ? 'bg-yellow-500' : 
                      strength.level === 3 ? 'bg-blue-500' : 'bg-green-500'
                    }`} 
                    style={{ width: `${(strength.level * 25)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium mb-2">Xác nhận mật khẩu</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Nhập lại mật khẩu"
                required
              />
              <button 
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            {confirmPassword && password === confirmPassword && (
              <div className="flex items-center text-green-500 mt-2">
                <CheckCircle size={16} className="mr-1" />
                <span className="text-xs">Mật khẩu khớp</span>
              </div>
            )}
            
            {confirmPassword && password !== confirmPassword && (
              <div className="text-red-500 text-xs mt-2">
                Mật khẩu xác nhận không khớp
              </div>
            )}
          </div>

          <button 
            type="submit"
            className="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
          >
            Đăng ký
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Đã có tài khoản? 
            <Link to="/dang-nhap" className="ml-1 text-green-600 font-medium hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
