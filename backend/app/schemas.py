#schemas.py
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime, date
from enum import Enum

# Enums
class UserRole(str, Enum):
    user = "user"
    admin = "admin"

class VocabLevel(str, Enum):
    a1 = "a1"
    a2 = "a2"
    b1 = "b1"
    b2 = "b2"
    c1 = "c1"
    c2 = "c2"

class VocabStatus(str, Enum):
    pending = "pending"
    learned = "learned"

# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None

class User(UserBase):
    user_id: int
    role: UserRole

    class Config:
        orm_mode = True

# Authentication schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

# Vocabulary schemas
class VocabularyBase(BaseModel):
    word: str
    definition: str
    example: Optional[str] = None
    level: str
    topic: str
    pronunciation: Optional[str] = None
    audio_url: Optional[str] = None
    synonyms: Optional[str] = None
    part_of_speech: str = 'noun'

class VocabularyCreate(VocabularyBase):
    pass

class VocabularyUpdate(BaseModel):
    definition: Optional[str] = None
    example: Optional[str] = None
    level: Optional[VocabLevel] = None
    topic: Optional[str] = None
    pronunciation: Optional[str] = None
    audio_url: Optional[str] = None
    synonyms: Optional[str] = None

class Vocabulary(VocabularyBase):
    word_id: int

    class Config:
        orm_mode = True

# User Cycle schemas
class UserCycleBase(BaseModel):
    end_datetime: datetime

class UserCycleCreate(UserCycleBase):
    pass

class UserCycle(UserCycleBase):
    user_id: int
    start_datetime: datetime

    class Config:
        orm_mode = True

# Cycle Vocabulary schemas
class CycleVocabularyBase(BaseModel):
    word_id: int

class CycleVocabularyCreate(CycleVocabularyBase):
    pass

class CycleVocabularyUpdate(BaseModel):
    status: VocabStatus

class CycleVocabulary(CycleVocabularyBase):
    user_id: int
    status: VocabStatus
    vocabulary: Optional[Vocabulary] = None

    class Config:
        orm_mode = True

# User Vocabulary schemas
class UserVocabularyBase(BaseModel):
    word_id: int

class UserVocabularyCreate(UserVocabularyBase):
    pass

class UserVocabulary(UserVocabularyBase):
    user_id: int
    learned_at: datetime
    vocabulary: Optional[Vocabulary] = None

    class Config:
        orm_mode = True

# Chat schemas
class ChatMessageBase(BaseModel):
    message: str

class ChatMessage(ChatMessageBase):
    pass

class ChatResponse(BaseModel):
    response: str

class ChatLog(BaseModel):
    chat_id: int
    user_id: int
    message: str
    ai_response: str
    chat_time: datetime

    class Config:
        orm_mode = True

# Search schemas
class SearchQuery(BaseModel):
    keyword: str

class SearchResult(BaseModel):
    word_id: int
    word: str
    definition: str
    level: str

class SearchHistory(BaseModel):
    search_id: int
    user_id: int
    word_id: int
    searched_at: datetime

    class Config:
        orm_mode = True

# Admin action schemas
class AdminVocabAction(BaseModel):
    action_id: int
    admin_id: int
    action_type: str
    word_id: int
    action_time: datetime

    class Config:
        orm_mode = True

class AdminUserAction(BaseModel):
    action_id: int
    admin_id: int
    action_type: str
    target_user_id: int
    action_time: datetime

    class Config:
        orm_mode = True

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str

class EmailUpdate(BaseModel):
    email: EmailStr

class WordResult(BaseModel):
    word_id: int
    is_correct: bool

class VocabularyPractice(BaseModel):
    word_results: List[WordResult]

class PracticeResult(BaseModel):
    total_words: int
    learned_words: int
    pending_words: int
    score: int

class VocabularyForPractice(BaseModel):
    word_id: int
    word: str
    definition: str
    example: Optional[str] = None
    level: str
    topic: str
    pronunciation: Optional[str] = None
    status: str

    class Config:
        orm_mode = True

class ImportResult(BaseModel):
    total_rows: int
    success_count: int
    duplicate_count: int
    error_count: int
    error_details: List[str]