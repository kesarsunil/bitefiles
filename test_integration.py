"""
Integration Test for Byte Sentinel Ransomware Detection System
Tests the backend API endpoints and frontend connectivity.
"""

import requests
import json
import time
import sys
import os

# Add backend directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

def test_backend_health():
    """Test if backend is running and healthy"""
    try:
        response = requests.get('http://localhost:5000/api/health', timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Backend Health Check: PASSED")
            print(f"   Status: {data.get('status')}")
            print(f"   Models Loaded: {data.get('models_loaded')}")
            return True
        else:
            print(f"❌ Backend Health Check: FAILED (Status: {response.status_code})")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Backend Health Check: FAILED (Connection Error: {e})")
        return False

def test_system_info():
    """Test system info endpoint"""
    try:
        response = requests.get('http://localhost:5000/api/system/info', timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ System Info: PASSED")
            print(f"   Platform: {data.get('platform')}")
            print(f"   CPU Cores: {data.get('cpu_count')}")
            print(f"   Running Processes: {data.get('running_processes')}")
            return True
        else:
            print(f"❌ System Info: FAILED (Status: {response.status_code})")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ System Info: FAILED (Error: {e})")
        return False

def test_prediction():
    """Test ransomware prediction endpoint"""
    try:
        # Test with sample features
        features = {
            'entropy': 7.5,
            'packed': 1,
            'suspicious_api_calls': 15,
            'file_size': 1048576,
            'imports_count': 45,
            'sections_count': 6,
            'exports_count': 2,
            'resources_count': 5,
            'debug_info': 0,
            'digital_signature': 0
        }
        
        response = requests.post(
            'http://localhost:5000/api/predict',
            json={'features': features},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Prediction Test: PASSED")
            print(f"   Prediction: {data.get('prediction')}")
            print(f"   Confidence: {data.get('confidence', 0):.2f}")
            print(f"   Risk Level: {data.get('risk_level')}")
            return True
        else:
            print(f"❌ Prediction Test: FAILED (Status: {response.status_code})")
            print(f"   Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Prediction Test: FAILED (Error: {e})")
        return False

def test_scan_start():
    """Test scan start endpoint"""
    try:
        response = requests.post(
            'http://localhost:5000/api/scan/start',
            json={'scan_type': 'quick'},
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Scan Start: PASSED")
            print(f"   Message: {data.get('message')}")
            print(f"   Status: {data.get('status')}")
            return True
        else:
            print(f"❌ Scan Start: FAILED (Status: {response.status_code})")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Scan Start: FAILED (Error: {e})")
        return False

def test_scan_status():
    """Test scan status endpoint"""
    try:
        response = requests.get('http://localhost:5000/api/scan/status', timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Scan Status: PASSED")
            print(f"   Status: {data.get('status')}")
            print(f"   Progress: {data.get('progress')}%")
            print(f"   Files Scanned: {data.get('scanned_files')}")
            print(f"   Threats Found: {data.get('threats_found')}")
            return True
        else:
            print(f"❌ Scan Status: FAILED (Status: {response.status_code})")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Scan Status: FAILED (Error: {e})")
        return False

def main():
    """Run all integration tests"""
    print("=" * 60)
    print("BYTE SENTINEL - INTEGRATION TESTS")
    print("=" * 60)
    print()
    
    print("Testing Backend API Endpoints...")
    print("-" * 40)
    
    tests = [
        ("Backend Health Check", test_backend_health),
        ("System Information", test_system_info),
        ("Ransomware Prediction", test_prediction),
        ("Scan Start", test_scan_start),
        ("Scan Status", test_scan_status)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        if test_func():
            passed += 1
        time.sleep(1)  # Brief pause between tests
    
    print("\n" + "=" * 60)
    print("TEST RESULTS SUMMARY")
    print("=" * 60)
    print(f"Passed: {passed}/{total}")
    print(f"Success Rate: {(passed/total)*100:.1f}%")
    
    if passed == total:
        print("🎉 ALL TESTS PASSED! System is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the backend server status.")
    
    print("\nTo start the full system:")
    print("1. Run 'python backend/app.py' to start the backend")
    print("2. Run 'npm run dev' to start the frontend")
    print("3. Open http://localhost:5173 in your browser")

if __name__ == "__main__":
    main()