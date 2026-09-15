import pandas as pd
from .features import extract_features
from .models.anomaly_detector import AnomalyDetector
from .models.duplicate_detector import DuplicateDetector

class MLRiskEngine:
    def __init__(self):
        self.anomaly_detector = AnomalyDetector(contamination=0.05)
        self.duplicate_detector = DuplicateDetector(threshold=0.85)
        
    def train_models(self, df: pd.DataFrame):
        """Train models on the given dataset"""
        features_df = extract_features(df)
        self.anomaly_detector.train(features_df)
        self.duplicate_detector.train(df)
        
    def analyze_risk(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Run the ML pipeline and return risk scores and signals.
        Returns a DataFrame with risk outputs.
        """
        if df.empty:
            return pd.DataFrame()
            
        features_df = extract_features(df)
        
        # 1. Anomaly Detection (Isolation Forest)
        anomaly_results = self.anomaly_detector.predict(features_df)
        
        # 2. Duplicate Detection (TF-IDF Cosine Similarity)
        dup_results = self.duplicate_detector.detect_similar(df)
        
        # 3. Compile Risk Signals
        results = pd.DataFrame(index=df.index)
        results['anomaly_score'] = anomaly_results['anomaly_score']
        results['is_anomaly'] = anomaly_results['is_anomaly']
        results['similarity_score'] = dup_results['max_similarity_score']
        results['is_duplicate'] = dup_results['is_potential_duplicate']
        
        # 4. Overall Risk Score (0-100)
        # Weighting: Anomaly Score (60%), Similarity Score (40%)
        results['overall_risk_score'] = (
            (results['anomaly_score'] * 0.6) + 
            (results['similarity_score'] * 0.4)
        ).clip(upper=100)
        
        # Calculate Risk Level
        def get_risk_level(score):
            if score >= 75: return 'CRITICAL'
            if score >= 50: return 'HIGH'
            if score >= 25: return 'MODERATE'
            return 'LOW'
            
        results['risk_level'] = results['overall_risk_score'].apply(get_risk_level)
        
        # Generate Signals and Evidence
        def generate_signals(row):
            signals = []
            if row['is_anomaly']:
                signals.append('Statistical Cost Anomaly')
            if row['is_duplicate']:
                signals.append('High Similarity (Potential Duplicate)')
            return signals
            
        results['signals'] = results.apply(generate_signals, axis=1)
        results['primary_signal'] = results['signals'].apply(lambda x: x[0] if x else None)
        
        # Include Member ID for merging in API
        results['member_id'] = df['id']
        
        return results
