#router/tests.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from .. import models, schemas, authentication
from ..database import get_db

router = APIRouter(
    prefix="/tests",
    tags=["tests"],
    responses={404: {"description": "Not found"}},
)

@router.post("/cycles/{cycle_id}", response_model=schemas.Test)
def create_cycle_test(
    cycle_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_active_user)
):
    # Check if cycle exists and belongs to user
    cycle = db.query(models.UserCycle).filter(
        models.UserCycle.cycle_id == cycle_id,
        models.UserCycle.user_id == current_user.user_id
    ).first()
    
    if not cycle:
        raise HTTPException(status_code=404, detail="Learning cycle not found")
    
    # Check if there's already an ongoing test for this cycle
    existing_test = db.query(models.Test).filter(
        models.Test.cycle_id == cycle_id,
        models.Test.user_id == current_user.user_id,
        models.Test.status.in_(["created", "in_progress"])
    ).first()
    
    if existing_test:
        raise HTTPException(
            status_code=400, 
            detail=f"There's already a test for this cycle with status: {existing_test.status}"
        )
    
    # Get vocabulary for this cycle
    cycle_vocabulary = db.query(models.CycleVocabulary).filter(
        models.CycleVocabulary.cycle_id == cycle_id,
        models.CycleVocabulary.user_id == current_user.user_id
    ).all()
    
    if not cycle_vocabulary:
        raise HTTPException(status_code=400, detail="No vocabulary in this cycle to test")
    
    # Create new test
    total_words = len(cycle_vocabulary)
    test = models.Test(
        cycle_id=cycle_id,
        user_id=current_user.user_id,
        total_words=total_words,
        status="created"
    )
    db.add(test)
    db.commit()
    db.refresh(test)
    
    # Create test answers (initially empty)
    for cv in cycle_vocabulary:
        test_answer = models.TestAnswer(
            test_id=test.test_id,
            word_id=cv.word_id,
            is_correct=False
        )
        db.add(test_answer)
    
    db.commit()
    
    return test

@router.get("/", response_model=List[schemas.Test])
def get_user_tests(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_active_user)
):
    query = db.query(models.Test).filter(models.Test.user_id == current_user.user_id)
    
    if status:
        query = query.filter(models.Test.status == status)
    
    tests = query.order_by(models.Test.created_at.desc()).offset(skip).limit(limit).all()
    return tests

@router.get("/{test_id}", response_model=schemas.Test)
def get_test_by_id(
    test_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_active_user)
):
    test = db.query(models.Test).filter(
        models.Test.test_id == test_id,
        models.Test.user_id == current_user.user_id
    ).first()
    
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    return test

@router.get("/{test_id}/questions", response_model=List[schemas.TestAnswer])
def get_test_questions(
    test_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_active_user)
):
    # Check if test exists and belongs to user
    test = db.query(models.Test).filter(
        models.Test.test_id == test_id,
        models.Test.user_id == current_user.user_id
    ).first()
    
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    # Get test questions
    test_answers = db.query(models.TestAnswer).filter(
        models.TestAnswer.test_id == test_id
    ).all()
    
    return test_answers

@router.put("/{test_id}/start", response_model=schemas.Test)
def start_test(
    test_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_active_user)
):
    # Check if test exists and belongs to user
    test = db.query(models.Test).filter(
        models.Test.test_id == test_id,
        models.Test.user_id == current_user.user_id
    ).first()
    
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    if test.status != "created":
        raise HTTPException(
            status_code=400,
            detail=f"Test is already in status: {test.status}"
        )
    
    # Update test status
    test.status = "in_progress"
    db.commit()
    db.refresh(test)
    
    return test

@router.put("/{test_id}/answer/{answer_id}", response_model=schemas.TestAnswer)
def submit_answer(
    test_id: int,
    answer_id: int,
    answer: schemas.TestAnswerUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_active_user)
):
    # Check if test exists and belongs to user
    test = db.query(models.Test).filter(
        models.Test.test_id == test_id,
        models.Test.user_id == current_user.user_id
    ).first()
    
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    if test.status != "in_progress":
        raise HTTPException(
            status_code=400,
            detail=f"Test is not in progress. Current status: {test.status}"
        )
    
    # Check if answer exists and belongs to test
    test_answer = db.query(models.TestAnswer).filter(
        models.TestAnswer.answer_id == answer_id,
        models.TestAnswer.test_id == test_id
    ).first()
    
    if not test_answer:
        raise HTTPException(status_code=404, detail="Test answer not found")
    
    # Update answer
    test_answer.user_answer = answer.user_answer
    test_answer.is_correct = answer.is_correct
    test_answer.answered_at = answer.answered_at
    
    db.commit()
    db.refresh(test_answer)
    
    return test_answer

@router.put("/{test_id}/complete", response_model=schemas.Test)
def complete_test(
    test_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_active_user)
):
    # Check if test exists and belongs to user
    test = db.query(models.Test).filter(
        models.Test.test_id == test_id,
        models.Test.user_id == current_user.user_id
    ).first()
    
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    if test.status != "in_progress":
        raise HTTPException(
            status_code=400,
            detail=f"Test is not in progress. Current status: {test.status}"
        )
    
    # Count correct answers
    correct_answers = db.query(models.TestAnswer).filter(
        models.TestAnswer.test_id == test_id,
        models.TestAnswer.is_correct == True
    ).count()
    
    # Calculate score (percentage)
    score = int((correct_answers / test.total_words) * 100) if test.total_words > 0 else 0
    
    # Update test
    test.status = "completed"
    test.completed_at = datetime.now()
    test.correct_words = correct_answers
    test.score = score
    
    # If this is a cycle completion test, update cycle status
    cycle = db.query(models.UserCycle).filter(
        models.UserCycle.cycle_id == test.cycle_id
    ).first()
    
    if cycle and cycle.status == "active":
        cycle.status = "completed"
        cycle.end_date = datetime.now().date()
    
    db.commit()
    db.refresh(test)
    
    return test
