# Byte Sentinel - Ransomware Detection System

A comprehensive ransomware detection system using machine learning to analyze system files and detect potential threats.

## Features

- **Real-time System Scanning**: Scan your system files for ransomware indicators
- **Machine Learning Detection**: Uses XGBoost and Random Forest models for accurate detection
- **Advanced File Analysis**: Analyzes file entropy, API calls, and behavioral patterns
- **Web Interface**: Modern React frontend with real-time scanning progress
- **REST API**: Python Flask backend for integration with other tools

## Quick Start

### Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn

### Installation

1. **Set up Python Backend**
   ```bash
   cd backend
   pip install -r ../requirements.txt
   python train_models.py  # Train the ML models (optional - will auto-train if missing)
   python app.py          # Start the backend server
   ```

2. **Set up React Frontend**
   ```bash
   # In a new terminal
   npm install
   npm run dev
   ```

3. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## Usage

### Web Interface

1. Open your browser to http://localhost:5173
2. The system will automatically check backend connectivity
3. Click "Quick Scan" to scan critical system areas
4. Click "Full Scan" for comprehensive system analysis
5. View detailed results in the "Scan Results" tab
6. Use the "Predict" tab to analyze individual files

## Architecture

### Backend (Python)
- **Flask API**: REST endpoints for scanning and prediction
- **Machine Learning**: XGBoost and Random Forest models
- **File Scanner**: Advanced analysis of file characteristics
- **Process Monitor**: Detection of suspicious system behavior

### Frontend (React)
- **Modern UI**: Built with shadcn/ui components
- **Real-time Updates**: Live scan progress and results
- **Interactive Charts**: Model performance visualization
- **Responsive Design**: Works on desktop and mobile

## Detection Methods

### Static Analysis
- **File Entropy**: High entropy indicates possible encryption
- **API Calls**: Detection of suspicious system calls
- **PE Structure**: Analysis of executable file format
- **Digital Signatures**: Verification of file authenticity

### Behavioral Analysis
- **Process Monitoring**: Detection of ransomware-like behavior
- **File System Changes**: Monitoring for mass encryption

### Machine Learning Features
- File size and structure metrics
- Import/export function counts
- Resource and section analysis
- Entropy and packing detection

## Security Considerations

- **Safe Analysis**: No malware execution - only static analysis
- **Privacy**: All analysis is performed locally
- **Isolated Environment**: Backend runs in controlled environment
- **Minimal Permissions**: Only reads necessary file metadata
