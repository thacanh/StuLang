from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from .. import models, schemas, authentication
from ..database import get_db
from ..utils.ai_service import get_ai_response

router = APIRouter(
    prefix="/chat",
    tags=["chat"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.ChatResponse)
async def chat_with_ai(
    message: schemas.ChatMessage,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_active_user)
):
    try:
        # Get recent chat history for context
        chat_history = db.query(models.ChatLog).filter(
            models.ChatLog.user_id == current_user.user_id
        ).order_by(models.ChatLog.chat_time.desc()).limit(5).all()
        
        # Format chat history for AI context
        context = []
        for chat in reversed(chat_history):
            context.append({"role": "user", "content": chat.message})
            context.append({"role": "assistant", "content": chat.ai_response})
        
        # Get AI response
        ai_response_text = await get_ai_response(message.message, context)
        
        # Save chat log with both message and response
        chat_log = models.ChatLog(
            user_id=current_user.user_id,
            message=message.message,
            ai_response=ai_response_text
        )
        db.add(chat_log)
        db.commit()
        
        return {"response": ai_response_text}
    except Exception as e:
        # Log the error
        print(f"Chat error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing chat: {str(e)}"
        )

@router.get("/history", response_model=List[schemas.ChatLog])
def get_chat_history(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(authentication.get_current_active_user)
):
    chat_logs = db.query(models.ChatLog).filter(
        models.ChatLog.user_id == current_user.user_id
    ).order_by(models.ChatLog.chat_time.desc()).offset(skip).limit(limit).all()
    
    return chat_logs
