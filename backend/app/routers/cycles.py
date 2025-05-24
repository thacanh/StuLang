from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import joinedload
from sqlalchemy import func

from .. import models, schemas, authentication
from ..database import get_db

router = APIRouter(
    prefix="/cycles",
    tags=["cycles"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.UserCycle)
def create_cycle(
    cycle: schemas.UserCycleCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_active_user)
):
    # Tính toán end_datetime
    start_time = datetime.now()
    
    if cycle.duration:
        # Sử dụng duration để tính end_datetime
        duration_delta = timedelta(
            days=cycle.duration.days,
            hours=cycle.duration.hours,
            minutes=cycle.duration.minutes,
            seconds=cycle.duration.seconds
        )
        end_datetime = start_time + duration_delta
    elif cycle.end_datetime:
        # Sử dụng end_datetime trực tiếp (backward compatibility)
        end_datetime = cycle.end_datetime
    else:
        # Mặc định 7 ngày nếu không có thông tin
        end_datetime = start_time + timedelta(days=7)
    
    # Kiểm tra end_datetime phải sau start_time
    if end_datetime <= start_time:
        raise HTTPException(
            status_code=400,
            detail="End time must be after start time"
        )
    
    # Check if user already has a cycle
    existing_cycle = db.query(models.UserCycle).filter(
        models.UserCycle.user_id == current_user.user_id
    ).first()
    
    if existing_cycle:
        # Update existing cycle
        existing_cycle.start_datetime = start_time
        existing_cycle.end_datetime = end_datetime
        db.commit()
        db.refresh(existing_cycle)
        return existing_cycle
    
    # Create new cycle
    db_cycle = models.UserCycle(
        user_id=current_user.user_id,
        start_datetime=start_time,
        end_datetime=end_datetime
    )
    db.add(db_cycle)
    db.commit()
    db.refresh(db_cycle)
    
    return db_cycle

@router.post("/quick-create", response_model=schemas.UserCycle)
def create_quick_cycle(
    days: int = 0,      
    hours: int = 0,     
    minutes: int = 0,   
    seconds: int = 0,   
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_active_user)
):
    """
    Tạo chu kỳ học với thời gian do người dùng nhập
    
    Args:
        days: Số ngày
        hours: Số giờ
        minutes: Số phút
        seconds: Số giây
    """
    # Validate input
    if days < 0 or hours < 0 or minutes < 0 or seconds < 0:
        raise HTTPException(
            status_code=400,
            detail="Time values must be non-negative"
        )
    
    # Validate giờ, phút, giây không vượt quá giới hạn
    if hours > 23:
        raise HTTPException(
            status_code=400,
            detail="Hours must be between 0-23"
        )
    
    if minutes > 59:
        raise HTTPException(
            status_code=400,
            detail="Minutes must be between 0-59"
        )
    
    if seconds > 59:
        raise HTTPException(
            status_code=400,
            detail="Seconds must be between 0-59"
        )
    
    # Tính toán thời gian
    start_time = datetime.now()
    duration = timedelta(days=days, hours=hours, minutes=minutes, seconds=seconds)
    end_datetime = start_time + duration
    
    # Check if user already has a cycle
    existing_cycle = db.query(models.UserCycle).filter(
        models.UserCycle.user_id == current_user.user_id
    ).first()
    
    if existing_cycle:
        # Update existing cycle
        existing_cycle.start_datetime = start_time
        existing_cycle.end_datetime = end_datetime
        db.commit()
        db.refresh(existing_cycle)
        return existing_cycle
    
    # Create new cycle
    db_cycle = models.UserCycle(
        user_id=current_user.user_id,
        start_datetime=start_time,
        end_datetime=end_datetime
    )
    db.add(db_cycle)
    db.commit()
    db.refresh(db_cycle)
    
    return db_cycle

@router.get("/", response_model=schemas.UserCycle)
def get_user_cycle(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_active_user)
):
    cycle = db.query(models.UserCycle).filter(
        models.UserCycle.user_id == current_user.user_id
    ).first()
    
    if not cycle:
        raise HTTPException(status_code=404, detail="No learning cycle found")
    
    return cycle

@router.get("/time-remaining")
def get_cycle_time_remaining(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_active_user)
):
    """Xem thời gian còn lại của chu kỳ hiện tại"""
    cycle = db.query(models.UserCycle).filter(
        models.UserCycle.user_id == current_user.user_id
    ).first()
    
    if not cycle:
        raise HTTPException(status_code=404, detail="No learning cycle found")
    
    now = datetime.now()
    
    if cycle.end_datetime <= now:
        return {
            "status": "expired",
            "message": "Chu kỳ học đã kết thúc",
            "expired_since": str(now - cycle.end_datetime),
            "can_add_vocabulary": False
        }
    
    time_remaining = cycle.end_datetime - now
    
    # Tính toán thời gian còn lại
    days = time_remaining.days
    hours, remainder = divmod(time_remaining.seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    
    return {
        "status": "active",
        "start_datetime": cycle.start_datetime,
        "end_datetime": cycle.end_datetime,
        "time_remaining": {
            "days": days,
            "hours": hours,
            "minutes": minutes,
            "seconds": seconds,
            "total_seconds": int(time_remaining.total_seconds())
        },
        "progress_percentage": int(((now - cycle.start_datetime).total_seconds() / 
                                  (cycle.end_datetime - cycle.start_datetime).total_seconds()) * 100),
        "can_add_vocabulary": True
    }

@router.get("/statistics")
def get_cycle_statistics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_active_user)
):
    """Thống kê chu kỳ hiện tại"""
    cycle = db.query(models.UserCycle).filter(
        models.UserCycle.user_id == current_user.user_id
    ).first()
    
    if not cycle:
        raise HTTPException(status_code=404, detail="No learning cycle found")
    
    # Đếm từ trong cycle (chỉ còn pending)
    total_in_cycle = db.query(models.CycleVocabulary).filter(
        models.CycleVocabulary.user_id == current_user.user_id
    ).count()
    
    # Đếm từ đã học (tổng)
    total_learned = db.query(models.UserVocabulary).filter(
        models.UserVocabulary.user_id == current_user.user_id
    ).count()
    
    return {
        "cycle_words_remaining": total_in_cycle,
        "total_words_learned": total_learned,
        "cycle_start": cycle.start_datetime,
        "cycle_end": cycle.end_datetime
    }

@router.post("/vocabulary", response_model=schemas.CycleVocabulary)
def add_vocabulary_to_cycle(
    cycle_vocab: schemas.CycleVocabularyCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_active_user)
):
    """
    Thêm từ vựng vào chu kỳ - chỉ khi chu kỳ còn hoạt động
    """
    # Check if user has an active cycle
    cycle = db.query(models.UserCycle).filter(
        models.UserCycle.user_id == current_user.user_id
    ).first()
    
    if not cycle:
        raise HTTPException(status_code=404, detail="No active learning cycle found")
    
    # Kiểm tra chu kỳ còn hoạt động không
    now = datetime.now()
    if cycle.end_datetime <= now:
        raise HTTPException(
            status_code=400, 
            detail="Cannot add vocabulary to expired cycle. Please create a new cycle."
        )
    
    # Check if vocabulary exists
    vocabulary = db.query(models.Vocabulary).filter(
        models.Vocabulary.word_id == cycle_vocab.word_id
    ).first()
    
    if not vocabulary:
        raise HTTPException(status_code=404, detail="Vocabulary not found")
    
    # Check if vocabulary is already in cycle
    existing = db.query(models.CycleVocabulary).filter(
        models.CycleVocabulary.user_id == current_user.user_id,
        models.CycleVocabulary.word_id == cycle_vocab.word_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Vocabulary already in cycle")
    
    # Check if vocabulary is already learned
    learned = db.query(models.UserVocabulary).filter(
        models.UserVocabulary.user_id == current_user.user_id,
        models.UserVocabulary.word_id == cycle_vocab.word_id
    ).first()
    
    if learned:
        raise HTTPException(status_code=400, detail="Vocabulary already learned")
    
    # Add vocabulary to cycle
    db_cycle_vocab = models.CycleVocabulary(
        user_id=current_user.user_id,
        word_id=cycle_vocab.word_id,
        status="pending"
    )
    
    db.add(db_cycle_vocab)
    db.commit()
    db.refresh(db_cycle_vocab)
    
    return db_cycle_vocab

@router.get("/vocabulary", response_model=schemas.PaginatedCycleVocabulary)
def get_cycle_vocabulary(
    skip: int = 0,
    limit: int = 20,
    status: Optional[str] = None,
    level: Optional[str] = None,
    topic: Optional[str] = None,
    part_of_speech: Optional[str] = None,
    sort_by: Optional[str] = "word_id",
    sort_order: Optional[str] = "asc",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_active_user)
):
    """
    Lấy danh sách từ vựng trong chu kỳ với phân trang và filter
    """
    # Kiểm tra chu kỳ
    cycle = db.query(models.UserCycle).filter(
        models.UserCycle.user_id == current_user.user_id
    ).first()
    
    if not cycle:
        raise HTTPException(status_code=404, detail="No active learning cycle found")
    
    # Xây dựng query cơ bản với JOIN
    query = db.query(models.CycleVocabulary).join(
        models.Vocabulary, models.CycleVocabulary.word_id == models.Vocabulary.word_id
    ).filter(
        models.CycleVocabulary.user_id == current_user.user_id
    )
    
    # Áp dụng bộ lọc
    if status:
        query = query.filter(models.CycleVocabulary.status == status)
    
    if level:
        query = query.filter(models.Vocabulary.level == level)
    
    if topic:
        query = query.filter(models.Vocabulary.topic == topic)
        
    if part_of_speech:
        query = query.filter(models.Vocabulary.part_of_speech == part_of_speech)
    
    # Đếm tổng số từ vựng thỏa mãn điều kiện (trước khi phân trang)
    total_count = query.count()
    
    # Áp dụng sắp xếp
    valid_sort_fields = ["word_id", "word", "level", "topic", "status", "part_of_speech"]
    if sort_by in valid_sort_fields:
        if sort_by in ["word_id", "word", "level", "topic", "part_of_speech"]:
            sort_column = getattr(models.Vocabulary, sort_by)
        elif sort_by == "status":
            sort_column = getattr(models.CycleVocabulary, sort_by)
        else:
            sort_column = models.Vocabulary.word_id  # default
        
        if sort_order.lower() == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())
    
    # Áp dụng phân trang và load vocabulary data
    cycle_vocabulary = query.options(
        joinedload(models.CycleVocabulary.vocabulary)
    ).offset(skip).limit(limit).all()
    
    # Trả về kết quả kèm theo thông tin phân trang
    return {
        "items": cycle_vocabulary,
        "total": total_count,
        "page": skip // limit + 1 if limit > 0 else 1,
        "pages": (total_count + limit - 1) // limit if limit > 0 else 1
    }

@router.put("/vocabulary/{word_id}")
def update_vocabulary_status(
    word_id: int,
    update: schemas.CycleVocabularyUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_active_user)
):
    # Find the cycle vocabulary
    cycle_vocab = db.query(models.CycleVocabulary).filter(
        models.CycleVocabulary.user_id == current_user.user_id,
        models.CycleVocabulary.word_id == word_id
    ).first()
    
    if not cycle_vocab:
        raise HTTPException(status_code=404, detail="Vocabulary not found in cycle")
    
    # If marked as learned, mark learned và xóa khỏi cycle
    if update.status == "learned":
        # Mark learned
        user_vocab = db.query(models.UserVocabulary).filter(
            models.UserVocabulary.user_id == current_user.user_id,
            models.UserVocabulary.word_id == word_id
        ).first()
        
        if not user_vocab:
            user_vocab = models.UserVocabulary(
                user_id=current_user.user_id,
                word_id=word_id,
                learned_at=datetime.now()
            )
            db.add(user_vocab)
        else:
            user_vocab.learned_at = datetime.now()
        
        # Xóa khỏi cycle
        db.delete(cycle_vocab)
        db.commit()
        
        # Return thông báo thay vì cycle_vocab (vì đã xóa)
        return {
            "message": "Vocabulary marked as learned and removed from cycle",
            "word_id": word_id
        }
    else:
        # Update status bình thường
        cycle_vocab.status = update.status
        db.commit()
        db.refresh(cycle_vocab)
        return cycle_vocab

@router.delete("/vocabulary/{word_id}")
def remove_vocabulary_from_cycle(
    word_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_active_user)
):
    """Xóa từ vựng khỏi chu kỳ"""
    cycle_vocab = db.query(models.CycleVocabulary).filter(
        models.CycleVocabulary.user_id == current_user.user_id,
        models.CycleVocabulary.word_id == word_id
    ).first()
    
    if not cycle_vocab:
        raise HTTPException(status_code=404, detail="Vocabulary not found in cycle")
    
    db.delete(cycle_vocab)
    db.commit()
    
    return {"message": "Vocabulary removed from cycle successfully"}

@router.get("/practice-set", response_model=List[schemas.VocabularyQuiz])
def get_vocabulary_for_practice(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_active_user)
):
    """
    Tạo bộ câu hỏi trắc nghiệm từ tất cả từ vựng trong chu kỳ
    """
    # Kiểm tra chu kỳ hiện tại
    cycle = db.query(models.UserCycle).filter(
        models.UserCycle.user_id == current_user.user_id
    ).first()
    
    if not cycle:
        raise HTTPException(status_code=404, detail="No active learning cycle found")
    
    # Lấy TẤT CẢ từ vựng trong chu kỳ
    cycle_words = db.query(models.CycleVocabulary).join(
        models.Vocabulary, models.CycleVocabulary.word_id == models.Vocabulary.word_id
    ).filter(
        models.CycleVocabulary.user_id == current_user.user_id
    ).options(joinedload(models.CycleVocabulary.vocabulary)).all()
    
    if not cycle_words:
        raise HTTPException(status_code=404, detail="No vocabulary found in cycle")
    
    # Lấy tất cả định nghĩa từ toàn bộ database để làm câu trả lời sai
    all_definitions = db.query(models.Vocabulary.definition).all()
    all_definitions = [def_tuple[0] for def_tuple in all_definitions]
    
    if len(all_definitions) < 4:
        raise HTTPException(
            status_code=400,
            detail="Not enough vocabulary in database to create multiple choice questions"
        )
    
    import random
    
    quiz_questions = []
    
    # Tạo câu hỏi cho TẤT CẢ từ trong cycle
    for cycle_vocab in cycle_words:
        vocab = cycle_vocab.vocabulary
        correct_definition = vocab.definition
        
        # Lấy 3 định nghĩa sai từ toàn bộ database
        wrong_definitions = [d for d in all_definitions if d != correct_definition]
        
        if len(wrong_definitions) < 3:
            while len(wrong_definitions) < 3:
                wrong_definitions.append(f"Định nghĩa không chính xác {len(wrong_definitions) + 1}")
        
        selected_wrong = random.sample(wrong_definitions, 3)
        
        # Tạo danh sách 4 lựa chọn
        all_choices = [correct_definition] + selected_wrong
        random.shuffle(all_choices)
        correct_answer_index = all_choices.index(correct_definition)
        
        quiz_question = {
            "word_id": vocab.word_id,
            "word": vocab.word,
            "pronunciation": vocab.pronunciation,
            "example": vocab.example,
            "level": vocab.level,
            "topic": vocab.topic,
            "status": cycle_vocab.status,
            "choices": all_choices,
            "correct_answer": correct_answer_index
        }
        
        quiz_questions.append(quiz_question)
    
    # Xáo trộn thứ tự câu hỏi
    random.shuffle(quiz_questions)
    
    return quiz_questions

@router.post("/practice-results")
def submit_practice_results(
    practice_data: schemas.VocabularyPracticeQuiz,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_active_user)
):
    """
    Cập nhật kết quả kiểm tra - xóa từ learned khỏi cycle
    """
    current_cycle = db.query(models.UserCycle).filter(
        models.UserCycle.user_id == current_user.user_id
    ).first()
    
    if not current_cycle:
        raise HTTPException(status_code=404, detail="No active learning cycle found")
    
    learned_words = []
    
    for result in practice_data.quiz_results:
        cycle_vocab = db.query(models.CycleVocabulary).filter(
            models.CycleVocabulary.user_id == current_user.user_id,
            models.CycleVocabulary.word_id == result.word_id
        ).first()
        
        if not cycle_vocab:
            continue
        
        # Nếu trả lời đúng
        if result.is_correct:
            # Mark-learned: Thêm vào UserVocabulary
            user_vocab = db.query(models.UserVocabulary).filter(
                models.UserVocabulary.user_id == current_user.user_id,
                models.UserVocabulary.word_id == result.word_id
            ).first()
            
            if not user_vocab:
                user_vocab = models.UserVocabulary(
                    user_id=current_user.user_id,
                    word_id=result.word_id,
                    learned_at=datetime.now()
                )
                db.add(user_vocab)
            else:
                user_vocab.learned_at = datetime.now()
            
            # XÓA khỏi cycle (thay vì chuyển thành learned)
            db.delete(cycle_vocab)
            learned_words.append(result.word_id)
    
    db.commit()
    
    return {
        "message": "Practice results updated successfully",
        "learned_words": learned_words,
        "total_learned": len(learned_words)
    }

@router.post("/end-current")
def end_current_cycle(
    new_cycle_data: schemas.UserCycleCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_active_user)
):
    """
    Kết thúc chu kỳ hiện tại và tạo chu kỳ mới - đơn giản
    """
    current_cycle = db.query(models.UserCycle).filter(
        models.UserCycle.user_id == current_user.user_id
    ).first()
    
    if not current_cycle:
        raise HTTPException(status_code=404, detail="No active learning cycle found")
    
    # Đếm từ còn lại
    remaining_words = db.query(models.CycleVocabulary).filter(
        models.CycleVocabulary.user_id == current_user.user_id
    ).count()
    
    # Tính thời gian mới
    start_time = datetime.now()
    if new_cycle_data.duration:
        duration_delta = timedelta(
            days=new_cycle_data.duration.days,
            hours=new_cycle_data.duration.hours,
            minutes=new_cycle_data.duration.minutes,
            seconds=new_cycle_data.duration.seconds
        )
        end_datetime = start_time + duration_delta
    else:
        end_datetime = start_time + timedelta(days=7)
    
    # Cập nhật thời gian chu kỳ
    current_cycle.start_datetime = start_time
    current_cycle.end_datetime = end_datetime
    
    db.commit()
    
    return {
        "message": "Cycle renewed successfully",
        "remaining_words": remaining_words,
        "new_end_time": end_datetime
    }
