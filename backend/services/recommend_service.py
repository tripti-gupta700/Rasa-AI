import json
from pathlib import Path

class RecommendService:
    def __init__(self):
        self._data = None

    def _load_data(self):
        if self._data is None:
            data_path = Path("datasets/ayurveda_kb.json")
            with open(data_path, "r", encoding="utf-8") as f:
                self._data = json.load(f)

    def recommend(self, query: str):
        self._load_data()
        return self._data[:3]  # simple baseline


recommend_service = RecommendService()
