from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from .. import models, schemas, authentication
from ..database import get_db

router = APIRouter(
    prefix="/vocabulary",
    tags=["vocabulary"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[schemas.Vocabulary])
def get_vocabulary(
    skip: int = 0,
    limit: int = 100,
    level: Optional[str] = None,
    topic: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_active_user)
):
    query = db.query(models.Vocabulary)
    
    if level:
        query = query.filter(models.Vocabulary.level == level)
    
    if topic:
        query = query.filter(models.Vocabulary.topic == topic)
    
    vocabulary = query.offset(skip).limit(limit).all()
    return vocabulary

@router.get("/search", response_model=List[schemas.Vocabulary])
def search_vocabulary(
    keyword: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_active_user)
):
    # Search for vocabulary
    vocabulary = db.query(models.Vocabulary).filter(
        models.Vocabulary.word.like(f"%{keyword}%")
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
