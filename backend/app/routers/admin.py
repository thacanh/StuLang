from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import pandas as pd
import io
from datetime import datetime

from .. import models, schemas, authentication
from ..database import get_db

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    responses={404: {"description": "Not found"}},
)

@router.get("/users", response_model=List[schemas.User])
def get_all_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_admin_user)
):
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@router.get("/users/{user_id}", response_model=schemas.User)
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_admin_user)
):
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/users/{user_id}", response_model=schemas.User)
def update_user(
    user_id: int,
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_admin_user)
):
    # Prevent admin from modifying themselves through this endpoint
    if user_id == current_user.user_id:
        raise HTTPException(
            status_code=400,
            detail="Cannot modify own account through admin endpoint"
        )
    
    db_user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update user fields if provided
    if user_update.username is not None:
        # Check if username already exists
        existing_user = db.query(models.User).filter(
            models.User.username == user_update.username,
            models.User.user_id != user_id
        ).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already taken")
        db_user.username = user_update.username
    
    if user_update.email is not None:
        # Check if email already exists
        existing_email = db.query(models.User).filter(
            models.User.email == user_update.email,
            models.User.user_id != user_id
        ).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already registered")
        db_user.email = user_update.email
    
    if user_update.password is not None:
        db_user.password = authentication.get_password_hash(user_update.password)
    
    if user_update.role is not None:
        db_user.role = user_update.role
    
    # Log admin action
    admin_action = models.AdminUserAction(
        admin_id=current_user.user_id,
        action_type="edit_user",
        target_user_id=user_id
    )
    db.add(admin_action)
    
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_admin_user)
):
    # Prevent admin from deleting themselves
    if user_id == current_user.user_id:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete own account"
        )
    
    db_user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Log admin action
    admin_action = models.AdminUserAction(
        admin_id=current_user.user_id,
        action_type="delete_user",
        target_user_id=user_id
    )
    db.add(admin_action)
    db.commit()
    
    # Delete user
    db.delete(db_user)
    db.commit()
    
    return None

@router.put("/users/{user_id}/role", status_code=status.HTTP_200_OK)
def change_user_role(
    user_id: int,
    role: schemas.UserRole,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_admin_user)
):
    # Prevent admin from changing their own role
    if user_id == current_user.user_id:
        raise HTTPException(
            status_code=400,
            detail="Cannot change own role"
        )
    
    db_user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_user.role = role
    
    # Log admin action
    admin_action = models.AdminUserAction(
        admin_id=current_user.user_id,
        action_type="change_role",
        target_user_id=user_id
    )
    db.add(admin_action)
    
    db.commit()
    return {"message": f"User role changed to {role}"}

# === THÊM CÁC CHỨC NĂNG VOCABULARY ===

@router.post("/vocabulary", response_model=schemas.Vocabulary)
def create_vocabulary(
    vocabulary: schemas.VocabularyCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_admin_user)
):
    # Check if word already exists
    db_vocabulary = db.query(models.Vocabulary).filter(models.Vocabulary.word == vocabulary.word).first()
    if db_vocabulary:
        raise HTTPException(status_code=400, detail="Word already exists")
    
    # Create new vocabulary
    db_vocabulary = models.Vocabulary(**vocabulary.dict())
    db.add(db_vocabulary)
    db.commit()
    db.refresh(db_vocabulary)
    
    # Log admin action
    admin_action = models.AdminVocabAction(
        admin_id=current_user.user_id,
        action_type="add_vocab",
        word_id=db_vocabulary.word_id
    )
    db.add(admin_action)
    db.commit()
    
    return db_vocabulary

@router.put("/vocabulary/{word_id}", response_model=schemas.Vocabulary)
def update_vocabulary(
    word_id: int,
    vocabulary: schemas.VocabularyUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_admin_user)
):
    db_vocabulary = db.query(models.Vocabulary).filter(models.Vocabulary.word_id == word_id).first()
    if db_vocabulary is None:
        raise HTTPException(status_code=404, detail="Vocabulary not found")
    
    # Update vocabulary fields
    for key, value in vocabulary.dict(exclude_unset=True).items():
        setattr(db_vocabulary, key, value)
    
    # Log admin action
    admin_action = models.AdminVocabAction(
        admin_id=current_user.user_id,
        action_type="edit_vocab",
        word_id=word_id
    )
    db.add(admin_action)
    
    db.commit()
    db.refresh(db_vocabulary)
    return db_vocabulary

@router.delete("/vocabulary/{word_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vocabulary(
    word_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_admin_user)
):
    db_vocabulary = db.query(models.Vocabulary).filter(models.Vocabulary.word_id == word_id).first()
    if db_vocabulary is None:
        raise HTTPException(status_code=404, detail="Vocabulary not found")
    
    # Log admin action before deleting
    admin_action = models.AdminVocabAction(
        admin_id=current_user.user_id,
        action_type="delete_vocab",
        word_id=word_id
    )
    db.add(admin_action)
    db.commit()
    
    # Delete vocabulary
    db.delete(db_vocabulary)
    db.commit()
    
    return None

@router.get("/actions/users", response_model=List[schemas.AdminUserAction])
def get_user_actions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_admin_user)
):
    actions = db.query(models.AdminUserAction).order_by(
        models.AdminUserAction.action_time.desc()
    ).offset(skip).limit(limit).all()
    
    return actions

@router.get("/actions/vocabulary", response_model=List[schemas.AdminVocabAction])
def get_vocabulary_actions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_admin_user)
):
    actions = db.query(models.AdminVocabAction).order_by(
        models.AdminVocabAction.action_time.desc()
    ).offset(skip).limit(limit).all()
    
    return actions

@router.post("/vocabulary/import-excel", response_model=schemas.ImportResult)
async def import_vocabulary_from_excel(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_admin_user)
):
    """
    Nhập từ vựng từ file Excel
    
    File Excel phải có các cột: word, definition, example, level, topic
    Các cột không bắt buộc: pronunciation, audio_url, synonyms
    """
    # Kiểm tra định dạng file
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(
            status_code=400,
            detail="Chỉ chấp nhận file Excel (.xlsx, .xls)"
        )
    
    try:
        # Đọc file Excel
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        
        # Kiểm tra các cột bắt buộc
        required_columns = ['word', 'definition', 'level', 'topic']
        for col in required_columns:
            if col not in df.columns:
                raise HTTPException(
                    status_code=400,
                    detail=f"Thiếu cột bắt buộc: {col}"
                )
        
        # Kiểm tra giá trị level hợp lệ
        valid_levels = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2']
        invalid_levels = df[~df['level'].isin(valid_levels)]['level'].unique()
        if len(invalid_levels) > 0:
            raise HTTPException(
                status_code=400,
                detail=f"Giá trị level không hợp lệ: {', '.join(map(str, invalid_levels))}. Giá trị hợp lệ: {', '.join(valid_levels)}"
            )
        
        # Thêm từ vựng vào cơ sở dữ liệu
        success_count = 0
        duplicate_count = 0
        error_count = 0
        error_details = []
        
        for index, row in df.iterrows():
            try:
                # Kiểm tra từ đã tồn tại chưa
                existing_word = db.query(models.Vocabulary).filter(
                    models.Vocabulary.word == row['word']
                ).first()
                
                if existing_word:
                    duplicate_count += 1
                    continue
                
                # Chuẩn bị dữ liệu
                vocab_data = {
                    'word': row['word'],
                    'definition': row['definition'],
                    'level': row['level'],
                    'topic': row['topic'],
                }
                
                # Thêm các trường không bắt buộc nếu có
                optional_fields = ['example', 'pronunciation', 'audio_url', 'synonyms']
                for field in optional_fields:
                    if field in df.columns and not pd.isna(row[field]):
                        vocab_data[field] = row[field]
                
                # Tạo từ vựng mới
                new_vocab = models.Vocabulary(**vocab_data)
                db.add(new_vocab)
                db.flush()  # Lấy ID mà không commit
                
                # Ghi log hành động của admin
                admin_action = models.AdminVocabAction(
                    admin_id=current_user.user_id,
                    action_type="add_vocab",
                    word_id=new_vocab.word_id
                )
                db.add(admin_action)
                
                success_count += 1
                
            except Exception as e:
                error_count += 1
                error_details.append(f"Lỗi ở dòng {index + 2}: {str(e)}")
        
        # Commit tất cả thay đổi
        db.commit()
        
        # Trả về kết quả
        return {
            "total_rows": len(df),
            "success_count": success_count,
            "duplicate_count": duplicate_count,
            "error_count": error_count,
            "error_details": error_details
        }
        
    except Exception as e:
        # Xử lý lỗi tổng thể
        raise HTTPException(
            status_code=500,
            detail=f"Lỗi khi xử lý file Excel: {str(e)}"
        )
        
@router.get("/vocabulary/excel-template")
def get_excel_template(
    current_user: models.User = Depends(authentication.get_current_admin_user)
):
    """
    Tải về file Excel mẫu để nhập từ vựng
    """
    # Tạo DataFrame mẫu
    sample_data = {
        'word': ['example', 'vocabulary', 'import'],
        'definition': ['a thing characteristic of its kind', 'the body of words used in a language', 'bring goods into a country'],
        'example': ['This is an example sentence.', 'He has a wide vocabulary.', 'The country imports oil.'],
        'level': ['a1', 'b1', 'b2'],
        'topic': ['general', 'education', 'business'],
        'pronunciation': ['/ɪɡˈzɑːmpl/', '/vəʊˈkæbjʊləri/', '/ˈɪmpɔːt/'],
        'audio_url': ['', '', ''],
        'synonyms': ['instance, case', 'terminology, lexicon', 'bring in, introduce']
    }
    
    df = pd.DataFrame(sample_data)
    
    # Tạo buffer để lưu file Excel
    buffer = io.BytesIO()
    with pd.ExcelWriter(buffer, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='VocabularyTemplate')
        
        # Thêm sheet hướng dẫn
        instructions = pd.DataFrame({
            'Column': ['word', 'definition', 'example', 'level', 'topic', 'pronunciation', 'audio_url', 'synonyms'],
            'Required': ['Yes', 'Yes', 'No', 'Yes', 'Yes', 'No', 'No', 'No'],
            'Description': [
                'Từ vựng cần thêm',
                'Định nghĩa của từ',
                'Ví dụ sử dụng từ',
                'Cấp độ (a1, a2, b1, b2, c1, c2)',
                'Chủ đề của từ',
                'Phát âm (IPA)',
                'Đường dẫn đến file âm thanh',
                'Các từ đồng nghĩa, phân cách bằng dấu phẩy'
            ]
        })
        instructions.to_excel(writer, index=False, sheet_name='Instructions')
    
    buffer.seek(0)
    
    # Trả về file Excel
    from fastapi.responses import StreamingResponse
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=vocabulary_template.xlsx"}
    )
