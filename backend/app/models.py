#models.py
from sqlalchemy import Column, Integer, String, Text, Enum, DateTime, ForeignKey, Date, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "Users"

    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    role = Column(Enum('user', 'admin', name='user_role'), nullable=False)

    # Relationships
    cycle = relationship("UserCycle", uselist=False, back_populates="user")
    vocabularies = relationship("UserVocabulary", back_populates="user")
    chat_logs = relationship("ChatLog", back_populates="user")
    search_history = relationship("SearchHistory", back_populates="user")

class Vocabulary(Base):
    __tablename__ = "Vocabulary"

    word_id = Column(Integer, primary_key=True, index=True)
    word = Column(String(100), unique=True, nullable=False)
    definition = Column(Text, nullable=False)
    example = Column(Text)
    level = Column(Enum('a1', 'a2', 'b1', 'b2', 'c1', 'c2', name='vocab_level'), nullable=False)
    topic = Column(String(50), nullable=False)
    pronunciation = Column(String(100))
    audio_url = Column(String(255))
    synonyms = Column(Text)
    part_of_speech = Column(
        Enum('noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'interjection'),
        nullable=False,
        default='noun'
    )

    # Relationships
    user_vocabularies = relationship("UserVocabulary", back_populates="vocabulary")
    cycle_vocabularies = relationship("CycleVocabulary", back_populates="vocabulary")

class UserCycle(Base):
    __tablename__ = "UserCycle"

    user_id = Column(Integer, ForeignKey("Users.user_id", ondelete="CASCADE"), primary_key=True)
    start_datetime = Column(DateTime, nullable=False, default=datetime.now)
    end_datetime = Column(DateTime, nullable=False)

    # Relationships
    user = relationship("User", back_populates="cycle")

class CycleVocabulary(Base):
    __tablename__ = "CycleVocabulary"

    user_id = Column(Integer, ForeignKey("Users.user_id", ondelete="CASCADE"), primary_key=True)
    word_id = Column(Integer, ForeignKey("Vocabulary.word_id", ondelete="CASCADE"), primary_key=True)
    status = Column(Enum('pending', 'learned', name='vocab_status'), nullable=False, default='pending')

    # Relationships - chỉ giữ mối quan hệ với Vocabulary
    # Đã bỏ cycle relationship
    vocabulary = relationship("Vocabulary", back_populates="cycle_vocabularies")

class UserVocabulary(Base):
    __tablename__ = "UserVocabulary"

    user_id = Column(Integer, ForeignKey("Users.user_id", ondelete="CASCADE"), primary_key=True)
    word_id = Column(Integer, ForeignKey("Vocabulary.word_id", ondelete="CASCADE"), primary_key=True)
    learned_at = Column(DateTime, default=datetime.now)

    # Relationships
    user = relationship("User", back_populates="vocabularies")
    vocabulary = relationship("Vocabulary", back_populates="user_vocabularies")

class ChatLog(Base):
    __tablename__ = "ChatLogs"

    chat_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("Users.user_id", ondelete="CASCADE"), nullable=False)
    message = Column(Text, nullable=False)
    ai_response = Column(Text, nullable=False)
    chat_time = Column(DateTime, default=datetime.now)

    # Relationships
    user = relationship("User", back_populates="chat_logs")

class AdminVocabAction(Base):
    __tablename__ = "AdminVocabActions"

    action_id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("Users.user_id", ondelete="CASCADE"), nullable=False)
    action_type = Column(Enum('add_vocab', 'edit_vocab', 'delete_vocab', name='vocab_action_type'), nullable=False)
    word_id = Column(Integer, ForeignKey("Vocabulary.word_id", ondelete="CASCADE"), nullable=False)
    action_time = Column(DateTime, default=datetime.now)

class AdminUserAction(Base):
    __tablename__ = "AdminUserActions"

    action_id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("Users.user_id", ondelete="CASCADE"), nullable=False)
    action_type = Column(Enum('edit_user', 'delete_user', 'change_role', name='user_action_type'), nullable=False)
    target_user_id = Column(Integer, ForeignKey("Users.user_id", ondelete="NO ACTION", onupdate="NO ACTION"), nullable=False)
    action_time = Column(DateTime, default=datetime.now)

class SearchHistory(Base):
    __tablename__ = "SearchHistory"

    search_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("Users.user_id", ondelete="CASCADE"), nullable=False)
    word_id = Column(Integer, ForeignKey("Vocabulary.word_id", ondelete="CASCADE"), nullable=False)
    searched_at = Column(DateTime, default=datetime.now)

    # Relationships
    user = relationship("User", back_populates="search_history")
    vocabulary = relationship("Vocabulary")