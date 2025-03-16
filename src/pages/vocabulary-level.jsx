import Sidebar from "../components/layout/sidebar"
import { useState } from "react"
import { ChevronRight, Search, Volume2, ArrowLeft, Filter } from "lucide-react"
import { Link, useParams } from "react-router-dom"

export default function VocabularyLevelPage() {
  const { level } = useParams(); // Get level from URL
  const [activeFilter, setActiveFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTopic, setSelectedTopic] = useState(null)

  const userData = {
    name: "Nguyễn Thạc Anh",
    wordsLearned: 100,
    timeLeft: "22:30:01",
    wordsNeeded: 20,
  }

  // Mock topics data
  const topics = [
    { id: 1, name: "Cơ thể", englishName: "Fit body", icon: "🧍", color: "bg-green-100" },
    { id: 2, name: "Động vật", englishName: "Animal", icon: "🐕", color: "bg-orange-100" },
    { id: 3, name: "Quần áo", englishName: "Clothes shop", icon: "👕", color: "bg-blue-100" },
    { id: 4, name: "Gia đình", englishName: "Family", icon: "👪", color: "bg-purple-100" },
    { id: 5, name: "Nhà cửa", englishName: "House", icon: "🏠", color: "bg-yellow-100" },
  ];

  // Mock vocabulary data
  const vocabularyItems = [
    {
      id: 1,
      english: "body",
      vietnamese: "cơ thể",
      phonetic: "/ˈbɒdi/",
      example: "He has a strong body.",
      type: "Noun",
      topic: 1,
      learned: true,
    },
    {
      id: 2,
      english: "dog",
      vietnamese: "chó",
      phonetic: "/dɒɡ/",
      example: "That's a cute dog.",
      type: "Noun",
      topic: 2,
      learned: false,
    },
    {
      id: 3,
      english: "shirt",
      vietnamese: "áo sơ mi",
      phonetic: "/ʃɜːt/",
      example: "He bought a new shirt yesterday.",
      type: "Noun",
      topic: 3,
      learned: true,
    },
    {
      id: 4,
      english: "family",
      vietnamese: "gia đình",
      phonetic: "/ˈfæməli/",
      example: "I have a big family.",
      type: "Noun",
      topic: 4,
      learned: false,
    },
    {
      id: 5,
      english: "house",
      vietnamese: "nhà",
      phonetic: "/haʊs/",
      example: "They live in a beautiful house.",
      type: "Noun",
      topic: 5,
      learned: true,
    },
  ];

  // Filter vocabulary by search term and selected topic
  const filteredVocabulary = vocabularyItems.filter(item => {
    // Filter by search term
    const matchesSearch = searchTerm === "" || 
      item.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vietnamese.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by topic
    const matchesTopic = selectedTopic === null || item.topic === selectedTopic;
    
    // Filter by learned status
    const matchesLearned = 
      activeFilter === "all" || 
      (activeFilter === "learned" && item.learned) || 
      (activeFilter === "not-learned" && !item.learned);
    
    return matchesSearch && matchesTopic && matchesLearned;
  });

  // Topic card component - Sửa lại viền bao quanh
  const TopicCard = ({ topic }) => (
    <button 
      onClick={() => setSelectedTopic(selectedTopic === topic.id ? null : topic.id)}
      className={`relative flex-shrink-0 ${topic.color} rounded-lg p-4 flex flex-col items-center justify-center h-32 w-32
        ${selectedTopic === topic.id ? 'ring-2 ring-green-500' : ''} hover:shadow-md transition-shadow overflow-hidden`}
      style={{
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        border: selectedTopic === topic.id ? "2px solid #22c55e" : "1px solid rgba(0,0,0,0.1)"
      }}
    >
      <div className="text-3xl mb-2">{topic.icon}</div>
      <div className="text-center text-sm">
        <div className="font-medium">{topic.name}</div>
        <div className="text-xs text-gray-500">{topic.englishName}</div>
      </div>
    </button>
  );

  // Filter All button component
  const FilterAllButton = () => (
    <button 
      onClick={() => setSelectedTopic(null)}
      className={`flex-shrink-0 bg-white rounded-lg p-4 flex flex-col items-center justify-center h-32 w-32
        ${selectedTopic === null ? 'ring-2 ring-green-500' : ''} hover:shadow-md transition-shadow`}
      style={{
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        border: selectedTopic === null ? "2px solid #22c55e" : "1px solid rgba(0,0,0,0.1)"
      }}
    >
      <div className="text-3xl mb-2 text-green-500">
        <Filter size={32} />
      </div>
      <div className="text-center text-sm">
        <div className="font-medium">Tất cả</div>
        <div className="text-xs text-gray-500">All topics</div>
      </div>
    </button>
  );

  // Vocabulary card component
  const VocabularyCard = ({ item }) => (
    <div className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold">{item.english}</h3>
          <div className="flex items-center text-gray-500 mb-2">
            <span className="text-sm mr-2">{item.phonetic}</span>
            <button className="text-green-500 hover:text-green-600">
              <Volume2 size={16} />
            </button>
          </div>
        </div>
        <span className="px-2 py-1 bg-gray-100 text-xs font-medium rounded">{item.type}</span>
      </div>
      
      <p className="text-gray-700 mb-3">{item.vietnamese}</p>
      
      <div className="border-t pt-3">
        <p className="text-sm text-gray-600 italic">"{item.example}"</p>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <span className={`w-3 h-3 rounded-full ${item.learned ? 'bg-green-500' : 'bg-gray-300'}`}></span>
        <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">
          Thêm vào danh sách học
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F5FBFF]">
      <Sidebar userData={userData} />
      <div className="flex-1 p-6">
        {/* Header with navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link 
              to="/tu-vung" 
              className="flex items-center text-gray-500 hover:text-gray-700 mr-2"
            >
              <ArrowLeft size={18} className="mr-1" />
              <span>Trở lại</span>
            </Link>
            <div className="flex items-center text-green-500 font-medium">
              <span>Từ vựng theo cấp độ</span>
              <ChevronRight size={16} className="mx-1" />
              <span className="text-xl font-bold uppercase">{level}</span>
            </div>
          </div>
          
          {/* <Link to="/quan-tri-vien/them-tu-vung" className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center">
            <Plus size={18} className="mr-1" />
            Thêm từ mới
          </Link> */}
        </div>

        {/* Topics horizontal scroll */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Chủ đề</h3>
          <div className="w-full overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
              <FilterAllButton />
              {topics.map(topic => (
                <TopicCard key={topic.id} topic={topic} />
              ))}
            </div>
          </div>
        </div>

        {/* Search and filter */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full md:w-2/3">
            <input
              type="text"
              placeholder="Tìm kiếm từ vựng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button 
              onClick={() => setActiveFilter("all")}
              className={`px-4 py-2 rounded-md ${activeFilter === "all" ? "bg-green-500 text-white" : "bg-white text-gray-700"}`}
            >
              Tất cả
            </button>
            <button 
              onClick={() => setActiveFilter("learned")}
              className={`px-4 py-2 rounded-md ${activeFilter === "learned" ? "bg-green-500 text-white" : "bg-white text-gray-700"}`}
            >
              Đã học
            </button>
            <button 
              onClick={() => setActiveFilter("not-learned")}
              className={`px-4 py-2 rounded-md ${activeFilter === "not-learned" ? "bg-green-500 text-white" : "bg-white text-gray-700"}`}
            >
              Chưa học
            </button>
          </div>
        </div>

        {/* Vocabulary list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVocabulary.length > 0 ? (
            filteredVocabulary.map(item => (
              <VocabularyCard key={item.id} item={item} />
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500">Không tìm thấy từ vựng phù hợp</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
