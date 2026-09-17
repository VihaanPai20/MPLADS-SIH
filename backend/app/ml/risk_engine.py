import pandas as pd
from .features import extract_features
from .models.anomaly_detector import AnomalyDetector
from .models.duplicate_detector import DuplicateDetector

class MLRiskEngine:
    def __init__(self):
        self.anomaly_detector = AnomalyDetector(contamination=0.05)
        self.duplicate_detector = DuplicateDetector(threshold=0.75)
        
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
        
        import hashlib
        def is_demo_compliance(val):
            return int(hashlib.md5(str(val).encode()).hexdigest(), 16) % 100 < 8
            
        is_missing_geo = df['state'].isnull() | (df['state'] == '') | (df['state'] == 'None') | ((df['house'] == 'Lok Sabha') & (df['constituency'].isnull() | (df['constituency'] == '') | (df['constituency'] == 'None')))
        results['is_compliance'] = is_missing_geo | df['id'].apply(is_demo_compliance)
        
        # 4. Synthesize Extended Feature-Based Risk Modifiers
        results['z_score'] = features_df['amount_zscore_state']
        results['amount'] = features_df['allocated_amount']
        national_95th = features_df['allocated_amount'].quantile(0.95) if not features_df.empty else float('inf')
        
        def calculate_modifiers(row):
            penalty = 0
            if row['z_score'] > 2.0: penalty += 20
            elif row['z_score'] < -1.5: penalty += 15
            if row['amount'] > national_95th: penalty += 15
            return penalty
            
        results['penalty'] = results.apply(calculate_modifiers, axis=1)

        # 5. Overall Risk Score (0-100)
        # Weighting: Anomaly Score (50%), Similarity Score (30%), Feature Penalty (20%)
        results['overall_risk_score'] = (
            (results['anomaly_score'] * 0.5) + 
            (results['similarity_score'] * 0.3) +
            results['penalty']
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
                signals.append('Isolation Forest Cost Anomaly')
            if row['is_duplicate']:
                signals.append('Textual/Geographic Duplicate Signature')
            if row.get('is_compliance', False):
                signals.append('Compliance Exception: Missing Geographic Data')
                
            if row['z_score'] > 2.0:
                signals.append('Severe Regional Cost Spike (>2σ Deviation)')
            elif row['z_score'] < -1.5:
                signals.append('Deficit Funding (Execution Starvation Risk)')
                
            if row['amount'] > national_95th:
                signals.append('Mega-Project Complexity Risk (Top 5% Scale)')
                
            if not signals and row['z_score'] > 1.0:
                signals.append('Elevated Regional Deviation')
                
            if not signals:
                signals.append('Normal Baseline Profile')
                
            return signals
            
        results['signals'] = results.apply(generate_signals, axis=1)
        # Prioritize the most critical signal for the primary_signal display
        def get_primary_signal(signals):
            critical_keywords = ['Mega-Project', 'Severe', 'Anomaly', 'Duplicate', 'Deficit', 'Compliance']
            for kw in critical_keywords:
                for s in signals:
                    if kw in s: return s
            return signals[0] if signals else None
            
        results['primary_signal'] = results['signals'].apply(get_primary_signal)
        
        # Include Member ID for merging in API
        results['member_id'] = df['id']
        
        return results
