import Sidebar from "../components/layout/sidebar"
import { UserPlus, BookPlus } from "lucide-react"
import { Link } from "react-router-dom"

export default function AdminPage() {
  const userData = {
    name: "Nguyễn Thạc Anh",
    wordsLearned: 100,
    timeLeft: "22:30:01",
    wordsNeeded: 20,
  }

  const adminOptions = [
    {
      title: "Thêm từ vựng",
      description: "Thêm từ vựng mới vào hệ thống",
      icon: <BookPlus className="w-12 h-12 text-green-500" />,
      path: "/quan-tri-vien/them-tu-vung",
    },
    {
      title: "Quản lý tài khoản",
      description: "Quản lý tài khoản người dùng",
      icon: <UserPlus className="w-12 h-12 text-green-500" />,
      path: "/quan-tri-vien/quan-ly-tai-khoan",
    },
  ]

  return (
    <div className="flex min-h-screen bg-[#F5FBFF]">
      <Sidebar userData={userData} />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Quản trị viên</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {adminOptions.map((option, index) => (
            <Link to={option.path} key={index}>
              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-6">
                <div className="flex-shrink-0">{option.icon}</div>
                <div>
                  <h2 className="text-xl font-medium mb-2">{option.title}</h2>
                  <p className="text-gray-500">{option.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

