"""
Ransomware Detection Backend API
A Flask-based REST API that provides ransomware detection capabilities using machine learning.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import pickle
import os
import hashlib
import psutil
import threading
import time
from datetime import datetime
from pathlib import Path
from sklearn.preprocessing import StandardScaler
import xgboost as xgb
from sklearn.ensemble import RandomForestClassifier
import logging
from scanner import RansomwareScanner

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Global variables for models and scanner
rf_model = None
xgb_model = None
scaler = None
best_model = None
best_model_name = None
scanner = None

# File scanning results storage
scan_results = {
    'status': 'idle',
    'progress': 0,
    'total_files': 0,
    'scanned_files': 0,
    'threats_found': 0,
    'results': [],
    'last_scan': None,
    'scan_report': None
}

def load_models():
    """Load pre-trained models and scaler"""
    global rf_model, xgb_model, scaler, best_model, best_model_name
    
    try:
        models_dir = Path(__file__).resolve().parent / 'models'
        
        # Check if models exist
        if os.path.exists(os.path.join(models_dir, 'best_model.pkl')):
            logger.info("Loading pre-trained models...")
            
            # Load best model
            with open(os.path.join(models_dir, 'best_model.pkl'), 'rb') as f:
                best_model = pickle.load(f)
            
            # Load scaler
            with open(os.path.join(models_dir, 'scaler.pkl'), 'rb') as f:
                scaler = pickle.load(f)
            
            # Load metadata
            with open(os.path.join(models_dir, 'metadata.pkl'), 'rb') as f:
                metadata = pickle.load(f)
                best_model_name = metadata['best_model_name']
            
            # Load individual models
            with open(os.path.join(models_dir, 'random_forest_model.pkl'), 'rb') as f:
                rf_model = pickle.load(f)
            
            with open(os.path.join(models_dir, 'xgboost_model.pkl'), 'rb') as f:
                xgb_model = pickle.load(f)
            
            logger.info(f"Models loaded successfully! Best model: {best_model_name}")
            return True
            
        else:
            logger.warning("Pre-trained models not found. Training new models...")
            return train_models_on_startup()
        
    except Exception as e:
        logger.error(f"Error loading models: {str(e)}")
        logger.info("Falling back to training new models...")
        return train_models_on_startup()

def train_models_on_startup():
    """Train models on startup if no pre-trained models are available"""
    global rf_model, xgb_model, scaler, best_model, best_model_name
    
    try:
        logger.info("Training ransomware detection models...")
        
        # Load sample data for training
        from sklearn.model_selection import train_test_split
        from sklearn.preprocessing import StandardScaler
        
        # Create sample data (replace with actual dataset loading)
        np.random.seed(42)
        n_samples = 2000
        
        # Generate synthetic feature data with realistic distributions
        data = {}
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
        
        # Suspicious API calls
        benign_apis = np.random.poisson(3, n_benign)
        ransomware_apis = np.random.poisson(15, n_ransomware)
        data['suspicious_api_calls'] = np.concatenate([benign_apis, ransomware_apis])
        
        # File size
        benign_size = np.random.lognormal(12, 1.5, n_benign)
        ransomware_size = np.random.lognormal(13, 1.2, n_ransomware)
        data['file_size'] = np.concatenate([benign_size, ransomware_size])
        
        # Other features
        for feature in ['imports_count', 'sections_count', 'exports_count', 'resources_count']:
            benign_vals = np.random.poisson(5, n_benign)
            ransomware_vals = np.random.poisson(8, n_ransomware)
            data[feature] = np.concatenate([benign_vals, ransomware_vals])
        
        # Binary features
        for feature in ['debug_info', 'digital_signature']:
            benign_vals = np.random.choice([0, 1], n_benign, p=[0.5, 0.5])
            ransomware_vals = np.random.choice([0, 1], n_ransomware, p=[0.8, 0.2])
            data[feature] = np.concatenate([benign_vals, ransomware_vals])
        
        # Create features and labels
        feature_names = ['entropy', 'packed', 'suspicious_api_calls', 'file_size', 
                        'imports_count', 'sections_count', 'exports_count', 
                        'resources_count', 'debug_info', 'digital_signature']
        
        X = pd.DataFrame(data)
        y = np.concatenate([np.zeros(n_benign), np.ones(n_ransomware)])
        
        # Shuffle the data
        indices = np.random.permutation(len(X))
        X = X.iloc[indices].reset_index(drop=True)
        y = y[indices]
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Initialize and fit scaler
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Train Random Forest
        rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
        rf_model.fit(X_train_scaled, y_train)
        
        # Train XGBoost
        xgb_model = xgb.XGBClassifier(n_estimators=100, random_state=42)
        xgb_model.fit(X_train_scaled, y_train)
        
        # Choose best model (for demo, we'll use XGBoost)
        best_model = xgb_model
        best_model_name = "XGBoost"
        
        logger.info("Models trained successfully!")
        return True
        
    except Exception as e:
        logger.error(f"Error training models: {str(e)}")
        return False

def initialize_scanner():
    """Initialize the ransomware scanner with model predictor"""
    global scanner
    
    def model_predictor(features):
        """Model prediction function for the scanner"""
        return predict_file(features)
    
    scanner = RansomwareScanner(model_predictor=model_predictor)
    logger.info("Ransomware scanner initialized successfully!")

def predict_file(features):
    """Predict if a file is ransomware based on extracted features"""
    try:
        if not best_model or not scaler:
            return {"error": "Models not loaded"}
        
        # Convert features to DataFrame
        feature_names = ['entropy', 'packed', 'suspicious_api_calls', 'file_size', 
                        'imports_count', 'sections_count', 'exports_count', 
                        'resources_count', 'debug_info', 'digital_signature']
        
        # Ensure all features are present
        feature_vector = []
        for feature_name in feature_names:
            feature_vector.append(features.get(feature_name, 0))
        
        # Scale features
        features_scaled = scaler.transform([feature_vector])
        
        # Make prediction
        prediction = best_model.predict(features_scaled)[0]
        probability = best_model.predict_proba(features_scaled)[0]
        
        result = {
            "prediction": "Ransomware" if prediction == 1 else "Benign",
            "confidence": float(probability[prediction]),
            "probability_benign": float(probability[0]),
            "probability_ransomware": float(probability[1]),
            "risk_level": "High" if probability[1] > 0.7 else "Medium" if probability[1] > 0.3 else "Low"
        }
        
        return result
        
    except Exception as e:
        logger.error(f"Error making prediction: {str(e)}")
        return {"error": str(e)}

def scan_system_files(directories=None, file_extensions=None, scan_type='quick'):
    """Scan system files for ransomware using the advanced scanner"""
    global scan_results, scanner
    
    if not scanner:
        initialize_scanner()
    
    scan_results['status'] = 'scanning'
    scan_results['progress'] = 0
    scan_results['scanned_files'] = 0
    scan_results['threats_found'] = 0
    scan_results['results'] = []
    scan_results['last_scan'] = datetime.now().isoformat()
    
    try:
        if scan_type == 'quick':
            # Use the scanner's quick scan
            results = scanner.quick_system_scan()
        else:
            # Custom directory scan
            if directories is None:
                directories = [
                    os.path.expanduser("~\\Documents"),
                    os.path.expanduser("~\\Downloads"),
                    os.path.expanduser("~\\Desktop")
                ]
            
            all_results = []
            for directory in directories:
                if os.path.exists(directory):
                    dir_results = scanner.scan_directory(
                        directory, 
                        recursive=True,
                        file_extensions=file_extensions
                    )
                    all_results.extend(dir_results)
            
            results = {
                'file_scan_results': all_results,
                'process_threats': scanner.scan_processes(),
                'scan_statistics': scanner.scan_stats
            }
        
        # Update scan results
        scan_results['total_files'] = scanner.scan_stats['files_scanned']
        scan_results['scanned_files'] = scanner.scan_stats['files_scanned']
        scan_results['threats_found'] = scanner.scan_stats['threats_detected']
        scan_results['results'] = results.get('file_scan_results', [])
        scan_results['scan_report'] = scanner.generate_scan_report(results)
        
    except Exception as e:
        logger.error(f"Error during scan: {str(e)}")
        scan_results['error'] = str(e)
    
    scan_results['status'] = 'completed'
    scan_results['progress'] = 100

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'models_loaded': best_model is not None,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/predict', methods=['POST'])
def predict_endpoint():
    """Predict if uploaded file features indicate ransomware"""
    try:
        data = request.get_json()
        
        if not data or 'features' not in data:
            return jsonify({'error': 'Features data required'}), 400
        
        result = predict_file(data['features'])
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in predict endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/scan/start', methods=['POST'])
def start_scan():
    """Start system file scan"""
    try:
        data = request.get_json() or {}
        directories = data.get('directories')
        extensions = data.get('extensions')
        scan_type = data.get('scan_type', 'quick')  # 'quick' or 'full'
        
        # Start scan in background thread
        scan_thread = threading.Thread(
            target=scan_system_files,
            args=(directories, extensions, scan_type)
        )
        scan_thread.daemon = True
        scan_thread.start()
        
        return jsonify({
            'message': f'{scan_type.capitalize()} scan started',
            'status': 'started',
            'scan_type': scan_type
        })
        
    except Exception as e:
        logger.error(f"Error starting scan: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/scan/status', methods=['GET'])
def get_scan_status():
    """Get current scan status with enhanced information"""
    response = dict(scan_results)
    
    # Add summary statistics if scan is completed
    if response['status'] == 'completed' and response.get('scan_report'):
        response['summary'] = response['scan_report']['scan_summary']
        response['threat_breakdown'] = response['scan_report']['threat_breakdown']
        response['recommendations'] = response['scan_report']['recommendations']
    
    return jsonify(response)

@app.route('/api/scan/report', methods=['GET'])
def get_scan_report():
    """Get detailed scan report"""
    if scan_results.get('scan_report'):
        return jsonify(scan_results['scan_report'])
    else:
        return jsonify({'error': 'No scan report available'}), 404

@app.route('/api/scan/stop', methods=['POST'])
def stop_scan():
    """Stop current scan"""
    scan_results['status'] = 'stopped'
    return jsonify({'message': 'Scan stopped'})

@app.route('/api/system/info', methods=['GET'])
def get_system_info():
    """Get system information"""
    try:
        info = {
            'platform': os.name,
            'cpu_count': psutil.cpu_count(),
            'memory_total': psutil.virtual_memory().total,
            'memory_available': psutil.virtual_memory().available,
            'disk_usage': {
                partition.device: {
                    'total': psutil.disk_usage(partition.mountpoint).total,
                    'used': psutil.disk_usage(partition.mountpoint).used,
                    'free': psutil.disk_usage(partition.mountpoint).free
                }
                for partition in psutil.disk_partitions()
            },
            'running_processes': len(psutil.pids()),
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify(info)
        
    except Exception as e:
        logger.error(f"Error getting system info: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/models/info', methods=['GET'])
def get_models_info():
    """Get information about loaded models"""
    return jsonify({
        'best_model': best_model_name,
        'models_available': ['Random Forest', 'XGBoost'],
        'features_required': [
            'entropy', 'packed', 'suspicious_api_calls', 'file_size',
            'imports_count', 'sections_count', 'exports_count',
            'resources_count', 'debug_info', 'digital_signature'
        ],
        'model_loaded': best_model is not None,
        'scaler_loaded': scaler is not None
    })

if __name__ == '__main__':
    logger.info("Starting Ransomware Detection Backend...")
    
    # Load models on startup
    if load_models():
        # Initialize scanner
        initialize_scanner()
        
        logger.info("Starting Flask server...")
        app.run(
            debug=os.environ.get('FLASK_DEBUG', '0') == '1',
            host='0.0.0.0',
            port=int(os.environ.get('PORT', '5000'))
        )
    else:
        logger.error("Failed to load models. Exiting.")