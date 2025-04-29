#main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from .routers import users, vocabulary, cycles, chat, admin
from .database import get_db
from . import authentication,schemas
app = FastAPI(
    title="Vocabulary Learning API",
    description="API for vocabulary learning application",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router)
app.include_router(vocabulary.router)
app.include_router(cycles.router)
# app.include_router(test.router)
app.include_router(chat.router)
app.include_router(admin.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Vocabulary Learning API", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/db-test")
def test_db_connection(db: Session = Depends(get_db)):
    try:
        # Try a simple query
        result = db.execute("SELECT 1").fetchone()
        if result:
            return {"status": "Database connection successful", "result": result[0]}
        return {"status": "Unknown error"}
    except Exception as e:
        return {"status": "Database connection failed", "error": str(e)}

@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authentication.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=authentication.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = authentication.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
