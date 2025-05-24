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
        days: Số ngày (bắt buộc nhập)
        hours: Số giờ (bắt buộc nhập)
        minutes: Số phút (bắt buộc nhập)
        seconds: Số giây (bắt buộc nhập)
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
            "expired_since": str(now - cycle.end_datetime)
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
                                  (cycle.end_datetime - cycle.start_datetime).total_seconds()) * 100)
    }

@router.post("/vocabulary", response_model=schemas.CycleVocabulary)
def add_vocabulary_to_cycle(
    cycle_vocab: schemas.CycleVocabularyCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_active_user)
):
    # Check if user has an active cycle
    cycle = db.query(models.UserCycle).filter(
        models.UserCycle.user_id == current_user.user_id
    ).first()
    
    if not cycle:
        raise HTTPException(status_code=404, detail="No active learning cycle found")
    
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

@router.get("/vocabulary", response_model=List[schemas.CycleVocabulary])
def get_cycle_vocabulary(
    status: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_active_user)
):
    # Kiểm tra nếu người dùng có chu kỳ học
    cycle = db.query(models.UserCycle).filter(
        models.UserCycle.user_id == current_user.user_id
    ).first()
    
    if not cycle:
        raise HTTPException(status_code=404, detail="No active learning cycle found")
    
    # Truy vấn trực tiếp từ vựng trong chu kỳ
    query = db.query(models.CycleVocabulary).filter(
        models.CycleVocabulary.user_id == current_user.user_id
    )
    
    if status:
        query = query.filter(models.CycleVocabulary.status == status)
    
    # Tùy chọn: Tải thêm thông tin vocabulary
    query = query.options(joinedload(models.CycleVocabulary.vocabulary))
    
    cycle_vocab = query.all()
    return cycle_vocab

@router.put("/vocabulary/{word_id}", response_model=schemas.CycleVocabulary)
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
    
    # Update status
    cycle_vocab.status = update.status
    
    # If marked as learned, also update UserVocabulary
    if update.status == "learned":
        user_vocab = db.query(models.UserVocabulary).filter(
            models.UserVocabulary.user_id == current_user.user_id,
            models.UserVocabulary.word_id == word_id
        ).first()
        
        if user_vocab:
            user_vocab.learned_at = datetime.now()
        else:
            user_vocab = models.UserVocabulary(
                user_id=current_user.user_id,
                word_id=word_id
            )
            db.add(user_vocab)
    
    db.commit()
    db.refresh(cycle_vocab)
    
    return cycle_vocab

@router.post("/practice-results", response_model=schemas.PracticeResult)
def submit_practice_results(
    practice_data: schemas.VocabularyPractice,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_active_user)
):
    """
    Cập nhật kết quả kiểm tra cho nhiều từ vựng cùng lúc
    """
    # Lấy chu kỳ hiện tại
    current_cycle = db.query(models.UserCycle).filter(
        models.UserCycle.user_id == current_user.user_id
    ).first()
    
    if not current_cycle:
        raise HTTPException(status_code=404, detail="No active learning cycle found")
    
    # Cập nhật trạng thái các từ vựng
    total_words = len(practice_data.word_results)
    learned_count = 0
    pending_count = 0
    
    for result in practice_data.word_results:
        # Tìm từ vựng trong chu kỳ
        cycle_vocab = db.query(models.CycleVocabulary).filter(
            models.CycleVocabulary.user_id == current_user.user_id,
            models.CycleVocabulary.word_id == result.word_id
        ).first()
        
        if not cycle_vocab:
            continue  # Bỏ qua nếu không tìm thấy
        
        # Cập nhật trạng thái
        if result.is_correct:
            cycle_vocab.status = "learned"
            learned_count += 1
            
            # Thêm vào UserVocabulary nếu chưa có
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
        else:
            # Từ trả lời sai vẫn giữ nguyên "pending"
            pending_count += 1
    
    db.commit()
    
    # Tính điểm số
    score = int((learned_count / total_words) * 100) if total_words > 0 else 0
    
    return {
        "total_words": total_words,
        "learned_words": learned_count,
        "pending_words": pending_count,
        "score": score
    }

@router.get("/practice-set", response_model=List[schemas.VocabularyForPractice])
def get_vocabulary_for_practice(
    count: int = 10,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_active_user)
):
    """
    Lấy danh sách từ vựng ngẫu nhiên từ chu kỳ hiện tại để kiểm tra
    """
    # Kiểm tra chu kỳ hiện tại
    cycle = db.query(models.UserCycle).filter(
        models.UserCycle.user_id == current_user.user_id
    ).first()
    
    if not cycle:
        raise HTTPException(status_code=404, detail="No active learning cycle found")
    
    # Lấy danh sách từ vựng chưa học (pending) - ưu tiên
    query = db.query(models.CycleVocabulary).filter(
        models.CycleVocabulary.user_id == current_user.user_id,
        models.CycleVocabulary.status == "pending"
    ).join(models.Vocabulary)
    
    # Sử dụng func.random() hoặc func.rand() tùy thuộc vào cơ sở dữ liệu
    try:
        pending_vocabs = query.order_by(func.random()).limit(count).all()
    except:
        # Nếu random() không hoạt động, thử rand() (MySQL)
        pending_vocabs = query.order_by(func.rand()).limit(count).all()
    
    # Nếu không đủ số lượng, bổ sung bằng từ vựng đã học
    if len(pending_vocabs) < count:
        remaining = count - len(pending_vocabs)
        
        learned_query = db.query(models.CycleVocabulary).filter(
            models.CycleVocabulary.user_id == current_user.user_id,
            models.CycleVocabulary.status == "learned"
        ).join(models.Vocabulary)
        
        try:
            learned_vocabs = learned_query.order_by(func.random()).limit(remaining).all()
        except:
            learned_vocabs = learned_query.order_by(func.rand()).limit(remaining).all()
        
        practice_vocabs = pending_vocabs + learned_vocabs
    else:
        practice_vocabs = pending_vocabs
    
    result = []
    for cv in practice_vocabs:
        vocab = cv.vocabulary
        result.append({
            "word_id": vocab.word_id,
            "word": vocab.word,
            "definition": vocab.definition,
            "example": vocab.example,
            "level": vocab.level,
            "topic": vocab.topic,
            "pronunciation": vocab.pronunciation,
            "status": cv.status
        })
    
    return result

@router.post("/end-current", response_model=schemas.UserCycle)
def end_current_cycle(
    new_cycle_data: schemas.UserCycleCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_active_user)
):
    """Kết thúc chu kỳ hiện tại và tạo chu kỳ mới"""
    # Lấy chu kỳ hiện tại
    current_cycle = db.query(models.UserCycle).filter(
        models.UserCycle.user_id == current_user.user_id
    ).first()
    
    if not current_cycle:
        raise HTTPException(status_code=404, detail="No active learning cycle found")
    
    # Tính toán end_datetime cho chu kỳ mới
    start_time = datetime.now()
    
    if new_cycle_data.duration:
        duration_delta = timedelta(
            days=new_cycle_data.duration.days,
            hours=new_cycle_data.duration.hours,
            minutes=new_cycle_data.duration.minutes,
            seconds=new_cycle_data.duration.seconds
        )
        end_datetime = start_time + duration_delta
    elif new_cycle_data.end_datetime:
        end_datetime = new_cycle_data.end_datetime
    else:
        # Mặc định 7 ngày
        end_datetime = start_time + timedelta(days=7)
    
    # Đếm số từ vựng chưa thuộc
    pending_count = db.query(models.CycleVocabulary).filter(
        models.CycleVocabulary.user_id == current_user.user_id,
        models.CycleVocabulary.status == "pending"
    ).count()
    
    # Tạo chu kỳ mới
    new_cycle = models.UserCycle(
        user_id=current_user.user_id,
        start_datetime=start_time,
        end_datetime=end_datetime
    )
    
    # Xóa chu kỳ cũ và thêm chu kỳ mới
    db.delete(current_cycle)
    db.add(new_cycle)
    db.commit()
    db.refresh(new_cycle)
    
    return new_cycle