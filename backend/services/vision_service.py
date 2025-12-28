from transformers import pipeline

class VisionService:
    def __init__(self):
        self._model = None

    def _load_model(self):
        if self._model is None:
            self._model = pipeline(
                "image-to-text",
                model="Salesforce/blip-image-captioning-base"
            )

    def analyze(self, image_bytes: bytes):
        self._load_model()
        return self._model(image_bytes)[0]["generated_text"]


vision_service = VisionService()
