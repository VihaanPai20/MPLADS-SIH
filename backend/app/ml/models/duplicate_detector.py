import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import joblib
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'model_artifacts', 'tfidf_vectorizer.joblib')

class DuplicateDetector:
    def __init__(self, threshold=0.85):
        self.threshold = threshold
        self.vectorizer = TfidfVectorizer(stop_words='english', max_features=5000)
        self.is_trained = False
        self.corpus_vectors = None
        self.corpus_indices = None
        
    def _build_text(self, row):
        # Combine relevant fields to find similar portfolios
        name = str(row.get('name', ''))
        state = str(row.get('state', ''))
        const = str(row.get('constituency', ''))
        house = str(row.get('house', ''))
        return f"{name} {state} {const} {house}".lower()
        
    def train(self, df: pd.DataFrame):
        texts = df.apply(self._build_text, axis=1)
        self.corpus_vectors = self.vectorizer.fit_transform(texts)
        self.corpus_indices = df.index.values
        self.is_trained = True
        
        # Save vectorizer
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        joblib.dump(self.vectorizer, MODEL_PATH)
        # In a real system, you might save corpus_vectors in a vector DB
        
    def detect_similar(self, df: pd.DataFrame) -> pd.DataFrame:
        if not self.is_trained:
            # For this prototype, we'll just train on the fly if not trained
            self.train(df)
            
        texts = df.apply(self._build_text, axis=1)
        query_vectors = self.vectorizer.transform(texts)
        
        sim_matrix = cosine_similarity(query_vectors, self.corpus_vectors)
        
        results = []
        for i, row_sims in enumerate(sim_matrix):
            # Find the max similarity excluding itself
            # We set self similarity to 0
            row_sims[i] = 0.0
            max_sim = row_sims.max()
            most_sim_idx = row_sims.argmax()
            
            is_dup = max_sim >= self.threshold
            results.append({
                'max_similarity_score': max_sim * 100, # 0-100 scale
                'is_potential_duplicate': is_dup,
                'similar_to_index': self.corpus_indices[most_sim_idx] if is_dup else None
            })
            
        return pd.DataFrame(results, index=df.index)
