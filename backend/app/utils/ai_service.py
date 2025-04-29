import os
import httpx
from dotenv import load_dotenv
from typing import List, Dict, Optional
import json

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

async def get_ai_response(message: str, context: Optional[List[Dict[str, str]]] = None) -> str:
    """
    Get AI response using Google's Gemini API via HTTP request.

    Args:
        message: The user's message
        context: List of previous messages for conversation history

    Returns:
        AI response text
    """
    if not GOOGLE_API_KEY:
        return "AI service is not configured. Please set GOOGLE_API_KEY in .env file."

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GOOGLE_API_KEY}"
    
    headers = {
        "Content-Type": "application/json"
    }
    
    # Chuẩn bị nội dung với lịch sử hội thoại nếu có
    contents = []
    
    # Thêm lịch sử hội thoại nếu có
    if context and len(context) > 0:
        for msg in context:
            contents.append({
                "role": msg["role"],
                "parts": [{"text": msg["content"]}]
            })
    
    # Thêm tin nhắn hiện tại
    contents.append({
        "role": "user",
        "parts": [{"text": message}]
    })
    
    # Tạo payload
    payload = {
        "contents": contents,
        "generationConfig": {
            "temperature": 0.7,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": 1000,
        },
        "safetySettings": [
            {
                "category": "HARM_CATEGORY_HARASSMENT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                "category": "HARM_CATEGORY_HATE_SPEECH",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                "threshold": "BLOCK_MEDIUM_AND_ABOVE"
            }
        ]
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            
            # In ra data để debug
            print(f"API Response: {json.dumps(data, indent=2)}")
            
            # Trích xuất nội dung trả về
            if 'candidates' in data and len(data['candidates']) > 0:
                if 'content' in data['candidates'][0]:
                    if 'parts' in data['candidates'][0]['content'] and len(data['candidates'][0]['content']['parts']) > 0:
                        return data['candidates'][0]['content']['parts'][0]['text']
            
            return "Sorry, I couldn't generate a proper response."

    except httpx.HTTPStatusError as e:
        print(f"HTTP Error: {e.response.status_code} - {e.response.text}")
        return f"Sorry, there was an API error: {e.response.status_code}"
    except httpx.RequestError as e:
        print(f"Request Error: {str(e)}")
        return "Sorry, I couldn't connect to the AI service."
    except Exception as e:
        print(f"Unexpected Error: {str(e)}")
        return "Sorry, an unexpected error occurred."
