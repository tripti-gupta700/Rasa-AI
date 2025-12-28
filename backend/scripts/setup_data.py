from datasets import load_dataset
import pandas as pd
import json
import os



def setup_datasets():
    print("🚀 Downloading and processing datasets...")
    os.makedirs('/datasets', exist_ok=True)

    # 1. Recommendation Engine: Custom Ayurveda Knowledge Base
    # We'll create this from a medical dataset or a local JSON
    ayurveda_data = [
        {"tag": "digestion", "content": "Triphala is a classic Ayurvedic herbal formulation used for bowel health."},
        {"tag": "winter", "content": "In winter (Hemanta), warm liquids and ginger are recommended to balance Vata."},
        # Add more or load from a CSV
    ]
    with open('/datasets/ayurveda_tips.json', 'w') as f:
        json.dump(ayurveda_data, f)

    # 2. Chat Context: ChatDoctor Dataset (subset for speed)
    print("Fetching Medical Chat Dataset...")
    medical_ds = load_dataset("lavita/ChatDoctor-HealthCareMagic-100k", split='train[:1000]')
    medical_df = pd.DataFrame(medical_ds)
    medical_df.to_csv('/datasets/medical_context.csv', index=False)

    print("✅ Datasets ready in /datasets/")

if __name__ == "__main__":
    setup_datasets()