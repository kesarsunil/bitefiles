"""
Ransomware Detection Model Training Script
Trains the XGBoost and Random Forest models and saves them for use by the API.
"""

import pandas as pd
import numpy as np
import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
import xgboost as xgb
import warnings
warnings.filterwarnings('ignore')

def load_and_prepare_data(dataset_path='../public/ransomware_dataset.csv'):
    """Load and prepare the ransomware dataset"""
    try:
        # Load the dataset
        df = pd.read_csv(dataset_path)
        print(f"Dataset loaded successfully. Shape: {df.shape}")
        
        # Check for missing values
        if df.isnull().sum().sum() > 0:
            print("Handling missing values...")
            numeric_columns = df.select_dtypes(include=[np.number]).columns
            df[numeric_columns] = df[numeric_columns].fillna(df[numeric_columns].median())
        
        # Separate features and target
        X = df.drop('Label', axis=1)
        y = df['Label']
        
        print(f"Features: {list(X.columns)}")
        print(f"Class distribution: {y.value_counts().to_dict()}")
        
        return X, y
        
    except FileNotFoundError:
        print(f"Dataset not found at {dataset_path}. Creating synthetic data for demo...")
        return create_synthetic_data()
    except Exception as e:
        print(f"Error loading dataset: {e}. Creating synthetic data for demo...")
        return create_synthetic_data()

def create_synthetic_data():
    """Create synthetic ransomware detection data for demonstration"""
    np.random.seed(42)
    n_samples = 5000
    
    # Feature names based on our analysis
    feature_names = [
        'entropy', 'packed', 'suspicious_api_calls', 'file_size',
        'imports_count', 'sections_count', 'exports_count',
        'resources_count', 'debug_info', 'digital_signature'
    ]
    
    # Create realistic feature distributions
    data = {}
    
    # Generate features with different distributions for benign vs ransomware
    n_benign = int(n_samples * 0.7)
    n_ransomware = n_samples - n_benign
    
    # Entropy (ransomware typically has higher entropy)
    benign_entropy = np.random.normal(4.5, 1.2, n_benign)
    ransomware_entropy = np.random.normal(7.2, 0.8, n_ransomware)
    data['entropy'] = np.concatenate([benign_entropy, ransomware_entropy])
    
    # Packed (ransomware more likely to be packed)
    benign_packed = np.random.choice([0, 1], n_benign, p=[0.85, 0.15])
    ransomware_packed = np.random.choice([0, 1], n_ransomware, p=[0.3, 0.7])
    data['packed'] = np.concatenate([benign_packed, ransomware_packed])
    
    # Suspicious API calls (ransomware uses more suspicious APIs)
    benign_apis = np.random.poisson(3, n_benign)
    ransomware_apis = np.random.poisson(15, n_ransomware)
    data['suspicious_api_calls'] = np.concatenate([benign_apis, ransomware_apis])
    
    # File size (log-normal distribution)
    benign_size = np.random.lognormal(12, 1.5, n_benign)
    ransomware_size = np.random.lognormal(13, 1.2, n_ransomware)
    data['file_size'] = np.concatenate([benign_size, ransomware_size])
    
    # Imports count
    benign_imports = np.random.poisson(25, n_benign)
    ransomware_imports = np.random.poisson(45, n_ransomware)
    data['imports_count'] = np.concatenate([benign_imports, ransomware_imports])
    
    # Sections count
    benign_sections = np.random.poisson(4, n_benign)
    ransomware_sections = np.random.poisson(6, n_ransomware)
    data['sections_count'] = np.concatenate([benign_sections, ransomware_sections])
    
    # Exports count (benign software more likely to have exports)
    benign_exports = np.random.poisson(8, n_benign)
    ransomware_exports = np.random.poisson(2, n_ransomware)
    data['exports_count'] = np.concatenate([benign_exports, ransomware_exports])
    
    # Resources count
    benign_resources = np.random.poisson(3, n_benign)
    ransomware_resources = np.random.poisson(5, n_ransomware)
    data['resources_count'] = np.concatenate([benign_resources, ransomware_resources])
    
    # Debug info (legitimate software more likely to have debug info)
    benign_debug = np.random.choice([0, 1], n_benign, p=[0.6, 0.4])
    ransomware_debug = np.random.choice([0, 1], n_ransomware, p=[0.9, 0.1])
    data['debug_info'] = np.concatenate([benign_debug, ransomware_debug])
    
    # Digital signature (legitimate software more likely to be signed)
    benign_signature = np.random.choice([0, 1], n_benign, p=[0.3, 0.7])
    ransomware_signature = np.random.choice([0, 1], n_ransomware, p=[0.95, 0.05])
    data['digital_signature'] = np.concatenate([benign_signature, ransomware_signature])
    
    # Create labels
    labels = np.concatenate([np.zeros(n_benign), np.ones(n_ransomware)])
    
    # Create DataFrame
    X = pd.DataFrame(data)
    y = pd.Series(labels, name='Label')
    
    # Shuffle the data
    indices = np.random.permutation(len(X))
    X = X.iloc[indices].reset_index(drop=True)
    y = y.iloc[indices].reset_index(drop=True)
    
    print(f"Synthetic dataset created. Shape: {X.shape}")
    print(f"Class distribution: {y.value_counts().to_dict()}")
    
    return X, y

def train_models(X, y):
    """Train Random Forest and XGBoost models"""
    print("Splitting data into train/test sets...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print("Scaling features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    models = {}
    
    # Train Random Forest
    print("Training Random Forest...")
    rf_model = RandomForestClassifier(
        n_estimators=100,
        random_state=42,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2
    )
    rf_model.fit(X_train_scaled, y_train)
    
    # Evaluate Random Forest
    rf_pred = rf_model.predict(X_test_scaled)
    rf_proba = rf_model.predict_proba(X_test_scaled)[:, 1]
    
    rf_metrics = {
        'accuracy': accuracy_score(y_test, rf_pred),
        'precision': precision_score(y_test, rf_pred),
        'recall': recall_score(y_test, rf_pred),
        'f1_score': f1_score(y_test, rf_pred),
        'roc_auc': roc_auc_score(y_test, rf_proba)
    }
    
    models['random_forest'] = {
        'model': rf_model,
        'metrics': rf_metrics
    }
    
    print("Random Forest Results:")
    for metric, value in rf_metrics.items():
        print(f"  {metric}: {value:.4f}")
    
    # Train XGBoost
    print("\nTraining XGBoost...")
    xgb_model = xgb.XGBClassifier(
        n_estimators=100,
        random_state=42,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8
    )
    xgb_model.fit(X_train_scaled, y_train)
    
    # Evaluate XGBoost
    xgb_pred = xgb_model.predict(X_test_scaled)
    xgb_proba = xgb_model.predict_proba(X_test_scaled)[:, 1]
    
    xgb_metrics = {
        'accuracy': accuracy_score(y_test, xgb_pred),
        'precision': precision_score(y_test, xgb_pred),
        'recall': recall_score(y_test, xgb_pred),
        'f1_score': f1_score(y_test, xgb_pred),
        'roc_auc': roc_auc_score(y_test, xgb_proba)
    }
    
    models['xgboost'] = {
        'model': xgb_model,
        'metrics': xgb_metrics
    }
    
    print("XGBoost Results:")
    for metric, value in xgb_metrics.items():
        print(f"  {metric}: {value:.4f}")
    
    # Determine best model
    best_model_name = 'xgboost' if xgb_metrics['accuracy'] > rf_metrics['accuracy'] else 'random_forest'
    best_model = models[best_model_name]['model']
    
    print(f"\nBest model: {best_model_name.upper()}")
    
    return models, scaler, best_model, best_model_name, X.columns.tolist()

def save_models(models, scaler, best_model, best_model_name, feature_names):
    """Save trained models and scaler"""
    os.makedirs('models', exist_ok=True)
    
    # Save individual models
    with open('models/random_forest_model.pkl', 'wb') as f:
        pickle.dump(models['random_forest']['model'], f)
    
    with open('models/xgboost_model.pkl', 'wb') as f:
        pickle.dump(models['xgboost']['model'], f)
    
    # Save scaler
    with open('models/scaler.pkl', 'wb') as f:
        pickle.dump(scaler, f)
    
    # Save best model
    with open('models/best_model.pkl', 'wb') as f:
        pickle.dump(best_model, f)
    
    # Save model metadata
    metadata = {
        'best_model_name': best_model_name,
        'feature_names': feature_names,
        'rf_metrics': models['random_forest']['metrics'],
        'xgb_metrics': models['xgboost']['metrics']
    }
    
    with open('models/metadata.pkl', 'wb') as f:
        pickle.dump(metadata, f)
    
    print(f"\nModels saved successfully in 'models/' directory:")
    print(f"  - random_forest_model.pkl")
    print(f"  - xgboost_model.pkl") 
    print(f"  - best_model.pkl ({best_model_name})")
    print(f"  - scaler.pkl")
    print(f"  - metadata.pkl")

def main():
    """Main training pipeline"""
    print("=" * 60)
    print("RANSOMWARE DETECTION MODEL TRAINING")
    print("=" * 60)
    
    # Load data
    X, y = load_and_prepare_data()
    
    # Train models
    models, scaler, best_model, best_model_name, feature_names = train_models(X, y)
    
    # Save models
    save_models(models, scaler, best_model, best_model_name, feature_names)
    
    print("\n" + "=" * 60)
    print("TRAINING COMPLETED SUCCESSFULLY!")
    print("=" * 60)
    print("Models are ready to be used by the Flask API.")

if __name__ == '__main__':
    main()