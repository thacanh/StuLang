// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./config/AuthContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";

import HomePage from "./pages/home";
import DictionaryPage from "./pages/dictionary";
import VocabularyPage from "./pages/vocabulary";
import VocabularyLevelPage from "./pages/vocabulary-level";
import ConversationPage from "./pages/conversation";
import AccountPage from "./pages/account";
import AdminPage from "./pages/admin";
import AddVocabularyPage from "./pages/add-vocabulary";
import ManageAccountsPage from "./pages/manage-accounts";
import FlashcardPage from "./pages/flashcard";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth routes - Không cần xác thực */}
          <Route path="/dang-nhap" element={<LoginPage />} />
          <Route path="/dang-ky" element={<RegisterPage />} />
          
          {/* App routes - Cần xác thực */}
          <Route path="/" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          <Route path="/chu-ky-hoc" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          <Route path="/tu-dien" element={
            <ProtectedRoute>
              <DictionaryPage />
            </ProtectedRoute>
          } />
          
          {/* Vocabulary routes */}
          <Route path="/tu-vung" element={
            <ProtectedRoute>
              <VocabularyPage />
            </ProtectedRoute>
          } />
          <Route path="/tu-vung/:level" element={
            <ProtectedRoute>
              <VocabularyLevelPage />
            </ProtectedRoute>
          } />
          
          {/* Flashcard route */}
          <Route path="/luyen-tap" element={
            <ProtectedRoute>
              <FlashcardPage />
            </ProtectedRoute>
          } />

          {/* Conversation route */}
          <Route path="/giao-tiep" element={
            <ProtectedRoute>
              <ConversationPage />
            </ProtectedRoute>
          } />
          
          <Route path="/tai-khoan" element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          } />

          {/* Admin routes - Chỉ admin mới truy cập được */}
          <Route path="/quan-tri-vien" element={
            <ProtectedRoute adminOnly={true}>
              <AdminPage />
            </ProtectedRoute>
          } />
          <Route path="/quan-tri-vien/them-tu-vung" element={
            <ProtectedRoute adminOnly={true}>
              <AddVocabularyPage />
            </ProtectedRoute>
          } />
          <Route path="/quan-tri-vien/quan-ly-tai-khoan" element={
            <ProtectedRoute adminOnly={true}>
              <ManageAccountsPage />
            </ProtectedRoute>
          } />

          {/* Redirect any unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
