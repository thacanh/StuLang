import { Calendar, BookOpen, BookText, UserCircle, Sun, Flame, Bell, Crown, Settings, MessageCircle, LogOut } from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../config/AuthContext"
import { useState, useEffect } from "react"
import LearnedWords from "../vocabulary/learned-words"
import api from "../../config/api"

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, loading } = useAuth()
  const [isLearnedWordsOpen, setIsLearnedWordsOpen] = useState(false)
  const [learnedWordsCount, setLearnedWordsCount] = useState(0)

  useEffect(() => {
    if (user) {
      fetchVocabularyCount()
    }
  }, [user])

  const fetchVocabularyCount = async () => {
    try {
      const response = await api.get('/users/vocabulary')
      setLearnedWordsCount(response.data.length)
    } catch (err) {
      console.error('Error fetching vocabulary count:', err)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/dang-nhap')
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-4 bg-[#F5FBFF] min-h-screen">
        <div className="text-4xl font-bold text-green-600 mb-2 px-2 mx-auto w-fit">
          StuLang
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
          <div className="h-24"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 bg-[#F5FBFF] min-h-screen">
      <div className="text-4xl font-bold text-green-600 mb-2 px-2 mx-auto w-fit">
        StuLang
      </div>
      {/* User Profile Card */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-blue-500 overflow-hidden">
            {user?.avatar && (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            )}
          </div>
          <div>
            <div className="text-sm text-gray-500">Xin chào</div>
            <div className="font-bold">{user?.username || 'Người dùng'}</div>
            <div className="text-xs text-green-500 font-medium">
              {user?.role === 'admin' ? 'Admin' : 'Người dùng'}
            </div>
          </div>
        </div>

        <div className="mb-3">
          <button 
            onClick={() => setIsLearnedWordsOpen(true)}
            className="flex items-center text-yellow-500 font-medium hover:text-yellow-600 transition-colors"
          >
            <Crown className="w-4 h-4 mr-1" />
            <span>Bạn đã học: {learnedWordsCount} từ</span>
          </button>
        </div>
      </div>

      {/* Navigation Card */}
      <div className="bg-white rounded-xl p-4 shadow-sm flex-1 w-[220px] max-h-[400px] overflow-y-auto">
        <nav className="flex flex-col space-y-5">
          <Link
            to="/chu-ky-hoc"
            className={`flex items-center ${location.pathname === "/" || location.pathname === "/chu-ky-hoc" ? "text-green-500" : ""}`}
          >
            <Calendar className="w-5 h-5 mr-3" />
            <span className="font-medium">Chu kỳ học</span>
          </Link>

          <Link
            to="/tu-vung"
            className={`flex items-center ${location.pathname.startsWith("/tu-vung") ? "text-green-500" : ""}`}
          >
            <BookText className="w-5 h-5 mr-3" />
            <span className="font-medium">Từ vựng</span>
          </Link>

          <Link
            to="/giao-tiep"
            className={`flex items-center ${location.pathname === "/giao-tiep" ? "text-green-500" : ""}`}
          >
            <MessageCircle className="w-5 h-5 mr-3" />
            <span className="font-medium">Giao tiếp</span>
          </Link>

          <Link
            to="/tu-dien"
            className={`flex items-center ${location.pathname === "/tu-dien" ? "text-green-500" : ""}`}
          >
            <BookOpen className="w-5 h-5 mr-3" />
            <span className="font-medium">Từ điển</span>
          </Link>

          <Link
            to="/tai-khoan"
            className={`flex items-center ${location.pathname === "/tai-khoan" ? "text-green-500" : ""}`}
          >
            <UserCircle className="w-5 h-5 mr-3" />
            <span className="font-medium">Tài khoản</span>
          </Link>

          {user?.role === 'admin' && (
            <Link
              to="/quan-tri-vien"
              className={`flex items-center ${location.pathname.startsWith("/quan-tri-vien") ? "text-green-500" : ""}`}
            >
              <Settings className="w-5 h-5 mr-3" />
              <span className="font-medium">Quản trị viên</span>
            </Link>
          )}
          
          {/* Thêm nút đăng xuất */}
          <button
            onClick={handleLogout}
            className="flex items-center text-red-500 hover:text-red-600 transition-colors mt-auto"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-medium">Đăng xuất</span>
          </button>
        </nav>
      </div>

      {/* Learned Words Modal */}
      <LearnedWords 
        isOpen={isLearnedWordsOpen} 
        onClose={() => setIsLearnedWordsOpen(false)}
        onWordsCountChange={setLearnedWordsCount}
      />
    </div>
  )
}
