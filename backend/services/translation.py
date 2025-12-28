from transformers import pipeline

class TranslationService:
    def __init__(self):
        self._translator = None

    def _load_model(self):
        if self._translator is None:
            self._translator = pipeline(
                "translation",
                model="Helsinki-NLP/opus-mt-en-hi"
            )

    def translate(self, text: str):
        self._load_model()
        return self._translator(text)[0]["translation_text"]


translation_service = TranslationService()
