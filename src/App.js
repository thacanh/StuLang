import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import HomePage from "./pages/home"
import DictionaryPage from "./pages/dictionary"
import VocabularyPage from "./pages/vocabulary"
import VocabularyLevelPage from "./pages/vocabulary-level"
import ConversationPage from "./pages/conversation" // Thêm import mới
import AccountPage from "./pages/account"
import AdminPage from "./pages/admin"
import AddVocabularyPage from "./pages/add-vocabulary"
import ManageAccountsPage from "./pages/manage-accounts"
import FlashcardPage from "./pages/flashcard"
import LoginPage from "./pages/login"
import RegisterPage from "./pages/register"

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth routes */}
        <Route path="/dang-nhap" element={<LoginPage />} />
        <Route path="/dang-ky" element={<RegisterPage />} />
        
        {/* App routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/chu-ky-hoc" element={<HomePage />} />
        <Route path="/tu-dien" element={<DictionaryPage />} />
        
        {/* Vocabulary routes */}
        <Route path="/tu-vung" element={<VocabularyPage />} />
        <Route path="/tu-vung/:level" element={<VocabularyLevelPage />} />
        
        {/* Flashcard route */}
        <Route path="/luyen-tap" element={<FlashcardPage />} />

        {/* Conversation route */}
        <Route path="/giao-tiep" element={<ConversationPage />} /> {/* Thêm route mới */}
        
        <Route path="/tai-khoan" element={<AccountPage />} />

        {/* Admin routes */}
        <Route path="/quan-tri-vien" element={<AdminPage />} />
        <Route path="/quan-tri-vien/them-tu-vung" element={<AddVocabularyPage />} />
        <Route path="/quan-tri-vien/quan-ly-tai-khoan" element={<ManageAccountsPage />} />

        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
