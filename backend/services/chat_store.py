from typing import Dict, List
from models.chat import ChatMessage as Message

# In-memory store: { user_id: [messages] }
chat_db: Dict[str, List[Message]] = {}
