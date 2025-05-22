#router/cycles.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
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
    # Check if user already has a cycle
    existing_cycle = db.query(models.UserCycle).filter(
        models.UserCycle.user_id == current_user.user_id
    ).first()
    
    if existing_cycle:
        # Update existing cycle
        existing_cycle.start_datetime = datetime.now()
        existing_cycle.end_datetime = cycle.end_datetime
        db.commit()
        db.refresh(existing_cycle)
        return existing_cycle
    
    # Create new cycle
    db_cycle = models.UserCycle(
        user_id=current_user.user_id,
        start_datetime=datetime.now(),
        end_datetime=cycle.end_datetime
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
@router.post("/cycles/practice-results", response_model=schemas.PracticeResult)
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
@router.get("/cycles/practice-set", response_model=List[schemas.VocabularyForPractice])
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
@router.post("/cycles/end-current", response_model=schemas.UserCycle)
def end_current_cycle(
    new_cycle_data: schemas.UserCycleCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_active_user)
):
    """
    Kết thúc chu kỳ hiện tại và tạo chu kỳ mới với các từ chưa thuộc
    """
    # Lấy chu kỳ hiện tại
    current_cycle = db.query(models.UserCycle).filter(
        models.UserCycle.user_id == current_user.user_id
    ).first()
    
    if not current_cycle:
        raise HTTPException(status_code=404, detail="No active learning cycle found")
    
    # Đếm số từ vựng chưa thuộc
    pending_count = db.query(models.CycleVocabulary).filter(
        models.CycleVocabulary.user_id == current_user.user_id,
        models.CycleVocabulary.status == "pending"
    ).count()
    
    # Tạo chu kỳ mới
    new_cycle = models.UserCycle(
        user_id=current_user.user_id,
        start_datetime=datetime.now(),
        end_datetime=new_cycle_data.end_datetime
    )
    
    # Xóa chu kỳ cũ và thêm chu kỳ mới
    db.delete(current_cycle)
    db.add(new_cycle)
    db.commit()
    db.refresh(new_cycle)
    
    # Thêm thông tin về số từ đã chuyển vào response
    response_data = {
        "user_id": new_cycle.user_id,
        "start_datetime": new_cycle.start_datetime,
        "end_datetime": new_cycle.end_datetime,
        "pending_words_carried": pending_count
    }
    
    return response_data
