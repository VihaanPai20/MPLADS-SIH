import pandas as pd
from sklearn.ensemble import IsolationForest
import joblib
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'model_artifacts', 'isolation_forest.joblib')

class AnomalyDetector:
    def __init__(self, contamination=0.05):
        self.contamination = contamination
        self.model = IsolationForest(contamination=self.contamination, random_state=42)
        self.is_trained = False
        self.feature_cols = ['log_amount', 'amount_zscore_state']
        
    def train(self, features_df: pd.DataFrame):
        X = features_df[self.feature_cols].fillna(0)
        self.model.fit(X)
        self.is_trained = True
        
        # Save model
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        joblib.dump(self.model, MODEL_PATH)
        
    def load(self):
        if os.path.exists(MODEL_PATH):
            self.model = joblib.load(MODEL_PATH)
            self.is_trained = True
            return True
        return False
        
    def predict(self, features_df: pd.DataFrame) -> pd.DataFrame:
        if not self.is_trained:
            if not self.load():
                raise RuntimeError("Model is not trained and no saved artifact found.")
                
        X = features_df[self.feature_cols].fillna(0)
        
        # predict returns 1 for inliers, -1 for outliers
        preds = self.model.predict(X)
        
        # score_samples returns opposite of anomaly score (lower is more anomalous)
        # We invert it so higher score = more anomalous
        scores = -self.model.score_samples(X)
        
        # Normalize scores roughly between 0 and 100 for UI
        min_score, max_score = scores.min(), scores.max()
        if max_score > min_score:
            normalized_scores = ((scores - min_score) / (max_score - min_score)) * 100
        else:
            normalized_scores = scores * 0
            
        results = pd.DataFrame({
            'is_anomaly': preds == -1,
            'anomaly_score': normalized_scores
        }, index=features_df.index)
        
        return results
