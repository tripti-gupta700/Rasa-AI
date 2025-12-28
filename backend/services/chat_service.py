from transformers import pipeline
from typing import Generator
import time

class ChatService:
    def __init__(self):
        self._model = None

    def _load_model(self):
        if self._model is None:
            self._model = pipeline(
                "text-generation",
                model="gpt2",
                max_new_tokens=150
            )

    # -------- Normal (non-stream) response --------
    def chat(self, message: str) -> str:
        self._load_model()
        result = self._model(message)
        return result[0]["generated_text"]

    # -------- Streaming response --------
    def stream(self, message: str) -> Generator[str, None, None]:
        """
        GPT-2 does NOT truly stream tokens,
        so we simulate streaming by chunking output.
        """
        self._load_model()
        result = self._model(message)[0]["generated_text"]

        for word in result.split(" "):
            yield word + " "
            time.sleep(0.03)  # smooth streaming effect


chat_service = ChatService()

if __name__ == "__main__":
    print(chat_service.chat("Hello, how are you?"))