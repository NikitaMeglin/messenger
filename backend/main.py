import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request
from typing import Dict
import json
from datetime import datetime
from dotenv import load_dotenv

# Загружаем переменные из .env файла
load_dotenv()

# Настройки из переменных окружения
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://messenger:secret123@postgres:5432/messenger")
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379")
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
DEBUG = os.getenv("DEBUG", "True").lower() == "true"

# Остальной код оставляем как есть...
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        print(f"✅ Пользователь {user_id} подключился")

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        print(f"❌ Пользователь {user_id} отключился")

    async def send_to_user(self, user_id: str, data: dict):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_text(json.dumps(data))

manager = ConnectionManager()

# Хранилище данных (потом заменим на PostgreSQL)
users = {}
messages = []
next_user_id = 1

@app.get("/")
async def root():
    return {"message": "Messenger API v4.0"}

@app.post("/auth/send-code")
async def send_code(request: Request):
    try:
        body = await request.json()
        phone = body.get("phone")
        print(f"📱 Отправка кода на {phone}")
        return {"status": "ok", "code": "123456"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/auth/verify")
async def verify_code(request: Request):
    try:
        body = await request.json()
        phone = body.get("phone")
        code = body.get("code")
        username = body.get("username")
        
        if code != "123456":
            return {"error": "Неверный код"}, 400
        
        global next_user_id
        
        # Проверяем существование пользователя
        existing_user = None
        for uid, user in users.items():
            if user["phone"] == phone:
                existing_user = user
                break
        
        if existing_user:
            # Обновляем username если изменился
            existing_user["username"] = username
            return {
                "status": "ok",
                "user_id": existing_user["id"],
                "username": existing_user["username"],
                "display_name": existing_user["display_name"],
                "bio": existing_user["bio"],
                "avatar_color": existing_user["avatar_color"],
                "phone": existing_user["phone"],
                "email": existing_user.get("email", "")
            }
        else:
            # Создаём нового пользователя
            user_id = next_user_id
            next_user_id += 1
            
            users[str(user_id)] = {
                "id": user_id,
                "phone": phone,
                "username": username,
                "display_name": username,
                "bio": "",
                "avatar_color": "#667eea",
                "email": ""
            }
            
            return {
                "status": "ok",
                "user_id": user_id,
                "username": username,
                "display_name": username,
                "bio": "",
                "avatar_color": "#667eea",
                "phone": phone,
                "email": ""
            }
    except Exception as e:
        print(f"❌ Ошибка verify: {e}")
        return {"status": "error", "message": str(e)}, 500

@app.get("/user/{user_id}")
async def get_user(user_id: int):
    if str(user_id) in users:
        user = users[str(user_id)]
        return {
            "id": user["id"],
            "username": user["username"],
            "display_name": user["display_name"],
            "bio": user["bio"],
            "avatar_color": user["avatar_color"],
            "phone": user["phone"],
            "email": user.get("email", "")
        }
    return {"error": "User not found"}, 404

@app.get("/search/{query}")
async def search_users(query: str):
    results = []
    query_lower = query.lower()
    for uid, user in users.items():
        if (query_lower in user["username"].lower() or 
            query_lower in user["display_name"].lower() or
            query_lower in user["phone"].lower()):
            results.append({
                "id": user["id"],
                "username": user["username"],
                "display_name": user["display_name"],
                "bio": user["bio"],
                "avatar_color": user["avatar_color"],
                "phone": user["phone"]
            })
    return results

@app.get("/chats/{user_id}")
async def get_chats(user_id: int):
    chats = []
    for uid, user in users.items():
        if int(uid) != user_id:
            # Проверяем, есть ли сообщения между пользователями
            has_messages = any(
                (m["from"] == user_id and m["to"] == int(uid)) or 
                (m["from"] == int(uid) and m["to"] == user_id)
                for m in messages
            )
            
            if has_messages:
                # Получаем последнее сообщение
                last_msg = None
                for m in reversed(messages):
                    if (m["from"] == user_id and m["to"] == int(uid)) or (m["from"] == int(uid) and m["to"] == user_id):
                        last_msg = m
                        break
                
                chats.append({
                    "id": user["id"],
                    "name": user["display_name"],
                    "username": user["username"],
                    "last_message": last_msg["text"] if last_msg else "",
                    "last_message_time": last_msg["timestamp"] if last_msg else "",
                    "unread": 0,
                    "is_channel": False
                })
    # Сортируем по времени последнего сообщения
    chats.sort(key=lambda x: x["last_message_time"], reverse=True)
    return chats

@app.get("/messages/{user_id}/{other_id}")
async def get_messages(user_id: int, other_id: int):
    user_msgs = [
        {
            "id": m["id"],
            "from": m["from"],
            "text": m["text"],
            "timestamp": m["timestamp"]
        }
        for m in messages 
        if (m["from"] == user_id and m["to"] == other_id) or (m["from"] == other_id and m["to"] == user_id)
    ]
    return user_msgs

@app.delete("/chat/{user_id}/{other_id}")
async def delete_chat(user_id: int, other_id: int):
    global messages
    # Удаляем все сообщения между пользователями
    messages = [
        m for m in messages 
        if not ((m["from"] == user_id and m["to"] == other_id) or (m["from"] == other_id and m["to"] == user_id))
    ]
    return {"status": "ok"}

@app.post("/update-profile/{user_id}")
async def update_profile(user_id: int, request: Request):
    try:
        body = await request.json()
        
        if str(user_id) not in users:
            return {"error": "User not found"}, 404
        
        user = users[str(user_id)]
        
        if "display_name" in body:
            user["display_name"] = body["display_name"]
        if "bio" in body:
            user["bio"] = body["bio"]
        if "username" in body:
            # Проверяем уникальность username
            for uid, u in users.items():
                if u["username"] == body["username"] and int(uid) != user_id:
                    return {"error": "Username already taken"}, 400
            user["username"] = body["username"]
        if "email" in body:
            user["email"] = body["email"]
        if "phone" in body:
            user["phone"] = body["phone"]
        if "avatar_color" in body:
            user["avatar_color"] = body["avatar_color"]
        
        return {
            "status": "ok",
            "user_id": user["id"],
            "username": user["username"],
            "display_name": user["display_name"],
            "bio": user["bio"],
            "avatar_color": user["avatar_color"],
            "phone": user["phone"],
            "email": user["email"]
        }
    except Exception as e:
        return {"error": str(e)}, 500

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await manager.connect(str(user_id), websocket)
    
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            if message_data.get("type") == "message":
                to_username = message_data.get("to")
                
                # Находим получателя
                to_user = None
                for uid, user in users.items():
                    if user["username"] == to_username:
                        to_user = uid
                        break
                
                if to_user:
                    msg = {
                        "id": len(messages),
                        "from": user_id,
                        "to": int(to_user),
                        "text": message_data["text"],
                        "timestamp": datetime.now().isoformat()
                    }
                    messages.append(msg)
                    print(f"📨 Сообщение от {user_id} к {to_user}: {message_data['text']}")
                    
                    # Отправляем отправителю
                    await manager.send_to_user(str(user_id), {
                        "type": "message_sent",
                        "message": msg
                    })
                    
                    # Отправляем получателю
                    await manager.send_to_user(to_user, {
                        "type": "new_message",
                        "message": msg,
                        "from_user": {
                            "username": users[str(user_id)]["username"],
                            "display_name": users[str(user_id)]["display_name"]
                        }
                    })
                    
    except WebSocketDisconnect:
        manager.disconnect(str(user_id))