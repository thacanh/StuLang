from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct
from typing import List, Optional, Dict
from datetime import datetime

from .. import models, schemas, authentication
from ..database import get_db

router = APIRouter(
    prefix="/vocabulary",
    tags=["vocabulary"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=schemas.PaginatedVocabulary)
def get_vocabulary(
    skip: int = 0,
    limit: int = 5,
    level: Optional[str] = None,
    topic: Optional[str] = None,
    part_of_speech: Optional[str] = None,
    sort_by: Optional[str] = "word_id",
    sort_order: Optional[str] = "asc",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_active_user)
):
    # Xây dựng query cơ bản
    query = db.query(models.Vocabulary)
    
    # Áp dụng bộ lọc
    if level:
        query = query.filter(models.Vocabulary.level == level)
    
    if topic:
        query = query.filter(models.Vocabulary.topic == topic)
        
    if part_of_speech:
        query = query.filter(models.Vocabulary.part_of_speech == part_of_speech)
    
    # Đếm tổng số từ vựng thỏa mãn điều kiện (trước khi phân trang)
    total_count = query.count()
    
    # Áp dụng sắp xếp
    valid_sort_fields = ["word_id", "word", "level", "topic", "created_at"]
    if sort_by in valid_sort_fields:
        sort_column = getattr(models.Vocabulary, sort_by)
        
        if sort_order.lower() == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())
    
    # Áp dụng phân trang
    vocabulary = query.offset(skip).limit(limit).all()
    
    # Trả về kết quả kèm theo thông tin phân trang
    return {
        "items": vocabulary,
        "total": total_count,
        "page": skip // limit + 1 if limit > 0 else 1,
        "pages": (total_count + limit - 1) // limit if limit > 0 else 1
    }

@router.get("/topics", response_model=List[str])
def get_topics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_active_user)
):
    """Lấy danh sách tất cả các chủ đề từ vựng hiện có"""
    topics = db.query(distinct(models.Vocabulary.topic)).all()
    return [topic[0] for topic in topics if topic[0]]  # Loại bỏ các giá trị None

@router.get("/levels", response_model=List[str])
def get_levels(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_active_user)
):
    """Lấy danh sách tất cả các cấp độ từ vựng hiện có"""
    levels = db.query(distinct(models.Vocabulary.level)).all()
    return [level[0] for level in levels if level[0]]  # Loại bỏ các giá trị None

@router.get("/statistics", response_model=schemas.VocabularyStatistics)
def get_vocabulary_statistics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_active_user)
):
    """Lấy thống kê về từ vựng"""
    # Tổng số từ vựng
    total_count = db.query(func.count(models.Vocabulary.word_id)).scalar()
    
    # Số từ đã học
    learned_count = db.query(func.count(models.UserVocabulary.word_id)).filter(
        models.UserVocabulary.user_id == current_user.user_id
    ).scalar()
    
    # Phân loại theo cấp độ
    level_stats = db.query(
        models.Vocabulary.level, 
        func.count(models.Vocabulary.word_id).label('count')
    ).group_by(models.Vocabulary.level).all()
    
    # Phân loại theo chủ đề
    topic_stats = db.query(
        models.Vocabulary.topic, 
        func.count(models.Vocabulary.word_id).label('count')
    ).group_by(models.Vocabulary.topic).all()
    
    return {
        "total_count": total_count,
        "learned_count": learned_count,
        "remaining_count": total_count - learned_count,
        "level_distribution": {level: count for level, count in level_stats if level},
        "topic_distribution": {topic: count for topic, count in topic_stats if topic}
    }

@router.get("/search", response_model=List[schemas.Vocabulary])
def search_vocabulary(
    keyword: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_active_user)
):
    # Search for vocabulary
    vocabulary = db.query(models.Vocabulary).filter(
        models.Vocabulary.word.ilike(f"%{keyword}%")
    ).all()
    
    if not vocabulary:
        raise HTTPException(status_code=404, detail="No vocabulary found")
    
    # Save search history with the first result
    if vocabulary and len(vocabulary) > 0:
        search_history = models.SearchHistory(
            user_id=current_user.user_id,
            word_id=vocabulary[0].word_id
        )
        db.add(search_history)
        db.commit()
    
    return vocabulary

@router.get("/{word_id}", response_model=schemas.Vocabulary)
def get_vocabulary_by_id(
    word_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_active_user)
):
    vocabulary = db.query(models.Vocabulary).filter(models.Vocabulary.word_id == word_id).first()
    if vocabulary is None:
        raise HTTPException(status_code=404, detail="Vocabulary not found")
    return vocabulary

@router.post("/mark-learned/{word_id}", response_model=schemas.UserVocabulary)
def mark_vocabulary_learned(
    word_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_active_user)
):
    # Check if vocabulary exists
    vocabulary = db.query(models.Vocabulary).filter(models.Vocabulary.word_id == word_id).first()
    if vocabulary is None:
        raise HTTPException(status_code=404, detail="Vocabulary not found")
    
    # Check if already marked as learned
    user_vocab = db.query(models.UserVocabulary).filter(
        models.UserVocabulary.user_id == current_user.user_id,
        models.UserVocabulary.word_id == word_id
    ).first()
    
    if user_vocab:
        # Update existing record
        user_vocab.learned_at = datetime.now()
    else:
        # Create new record
        user_vocab = models.UserVocabulary(
            user_id=current_user.user_id,
            word_id=word_id
        )
        db.add(user_vocab)
    
    db.commit()
    db.refresh(user_vocab)
    return user_vocab
