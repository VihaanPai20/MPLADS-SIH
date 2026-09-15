import pandas as pd
import numpy as np

def extract_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Extracts features for ML models from the normalized Member dataframe.
    """
    features = pd.DataFrame(index=df.index)
    
    # Financial features
    # Since we only have allocated_amount, we'll create some derived features
    # such as log-transformed amount, and state-relative allocation.
    
    if 'allocated_amount' in df.columns:
        features['allocated_amount'] = df['allocated_amount']
        # Handle zero or negative amounts just in case
        features['log_amount'] = np.log1p(df['allocated_amount'].clip(lower=0))
        
        # State-relative allocation
        if 'state' in df.columns:
            state_means = df.groupby('state')['allocated_amount'].transform('mean')
            state_stds = df.groupby('state')['allocated_amount'].transform('std').replace(0, 1)
            features['amount_zscore_state'] = (df['allocated_amount'] - state_means) / state_stds
            
            # Fill NaNs for states with only 1 member
            features['amount_zscore_state'] = features['amount_zscore_state'].fillna(0)
    
    return features
