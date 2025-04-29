import Sidebar from "../components/layout/sidebar"
import ProfileForm from "../components/account/profile-form"

export default function AccountPage() {
  const userData = {
    name: "Nguyễn Thạc Anh",
    wordsLearned: 100,
    timeLeft: "22:30:01",
    wordsNeeded: 20,
  }

  return (
    <div className="flex min-h-screen bg-[#F5FBFF]">
      <Sidebar userData={userData} />
      <div className="flex-1">
        <ProfileForm initialName="thacanhdepzai@gmail.com" userId="1" />
      </div>
    </div>
  )
}

