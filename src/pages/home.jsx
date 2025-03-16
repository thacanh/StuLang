import Sidebar from "../components/layout/sidebar"
import StudyPeriod from "../components/study-period/study-period"
import VocabularyTable from "../components/vocabulary/vocabulary-table"

const vocabularyItems = [
  { english: "make sense", vietnamese: "hợp lý" },
  { english: "make up your mind", vietnamese: "ra quyết định" },
  { english: "pay attention to", vietnamese: "chú ý" },
  { english: "see no point in", vietnamese: "thấy bất hợp lý" },
  { english: "on your own", vietnamese: "tự mình, tự lực cánh sinh" },
  { english: "learn about", vietnamese: "học về (cái gì)" },
  { english: "boast of/ about", vietnamese: "tự hào về" },
  { english: "complain about", vietnamese: "phàn nàn về" },
  { english: "succeed in", vietnamese: "thành công về" },
  { english: "teach to sb about sth", vietnamese: "dạy cho ai đó về điều gì" },
  { english: "be similar to", vietnamese: "giống nhau, tương tự" },
  { english: "be suitable for", vietnamese: "phù hợp cho" },
  { english: "be happy with/ about", vietnamese: "vui với về điều gì" },
  { english: "consist of", vietnamese: "bao gồm" },
]

export default function HomePage() {
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
        <StudyPeriod checkTime="22:30:01" />
        <div className="p-6">
          <VocabularyTable items={vocabularyItems} />
        </div>
      </div>
    </div>
  )
}

