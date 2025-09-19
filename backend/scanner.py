"""
Advanced File Scanner for Ransomware Detection
Analyzes files and system behavior to detect ransomware indicators.
"""

import os
import hashlib
import mimetypes
import time
import psutil
import threading
from datetime import datetime, timedelta
from pathlib import Path
import json
import re
import logging

logger = logging.getLogger(__name__)

class RansomwareScanner:
    def __init__(self, model_predictor=None):
        self.model_predictor = model_predictor
        self.suspicious_extensions = {
            # Known ransomware extensions
            '.encrypted', '.locked', '.crypto', '.crypted', '.crypt', '.enc',
            '.vault', '.petya', '.wannacry', '.locky', '.cerber', '.jigsaw',
            '.dharma', '.maze', '.sodinokibi', '.revil', '.ryuk', '.conti',
            '.babuk', '.blackmatter', '.darkside', '.hive', '.lockbit'
        }
        
        self.suspicious_filenames = [
            'readme.txt', 'readme.html', 'how_to_decrypt.txt', 
            'decrypt_instruction.txt', 'recovery_instructions.txt',
            'restore_files.txt', 'decrypt_files.html', 'ransom_note.txt',
            'how_to_restore.txt', 'recovery_key.txt', 'decryption_info.txt'
        ]
        
        self.suspicious_processes = [
            'bcdedit', 'vssadmin', 'wbadmin', 'cipher', 'sdelete',
            'fsutil', 'wevtutil', 'reg', 'sc', 'net', 'taskkill'
        ]
        
        self.scan_results = []
        self.scan_stats = {
            'files_scanned': 0,
            'threats_detected': 0,
            'suspicious_files': 0,
            'encrypted_files': 0,
            'scan_start_time': None,
            'scan_end_time': None
        }

    def calculate_file_entropy(self, file_path):
        """Calculate Shannon entropy of a file"""
        try:
            with open(file_path, 'rb') as f:
                data = f.read(8192)  # Read first 8KB for performance
                
            if len(data) == 0:
                return 0
            
            entropy = 0
            for x in range(256):
                p_x = float(data.count(bytes([x]))) / len(data)
                if p_x > 0:
                    entropy += - p_x * (p_x).bit_length()
            
            return entropy
            
        except Exception as e:
            logger.error(f"Error calculating entropy for {file_path}: {e}")
            return 0

    def check_suspicious_extensions(self, file_path):
        """Check if file has suspicious ransomware-related extensions"""
        file_ext = Path(file_path).suffix.lower()
        return file_ext in self.suspicious_extensions

    def check_suspicious_filename(self, file_path):
        """Check if filename matches known ransomware note patterns"""
        filename = Path(file_path).name.lower()
        return any(suspicious in filename for suspicious in self.suspicious_filenames)

    def analyze_file_content(self, file_path):
        """Analyze file content for ransomware indicators"""
        indicators = {
            'high_entropy': False,
            'suspicious_strings': False,
            'encrypted_content': False,
            'ransom_keywords': False
        }
        
        try:
            # Check entropy
            entropy = self.calculate_file_entropy(file_path)
            indicators['high_entropy'] = entropy > 7.5
            
            # Check file size (very small or very large files can be suspicious)
            file_size = os.path.getsize(file_path)
            
            # For text files, check content
            mime_type, _ = mimetypes.guess_type(file_path)
            if mime_type and mime_type.startswith('text'):
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read(1024)  # Read first 1KB
                        
                    # Check for ransom note keywords
                    ransom_keywords = [
                        'decrypt', 'ransom', 'payment', 'bitcoin', 'cryptocurrency',
                        'encrypted', 'locked', 'restore', 'recovery', 'private key',
                        'tor browser', 'onion', 'deadline', 'contact us'
                    ]
                    
                    content_lower = content.lower()
                    indicators['ransom_keywords'] = any(keyword in content_lower for keyword in ransom_keywords)
                    
                    # Check for suspicious patterns
                    suspicious_patterns = [
                        r'[A-Z0-9]{20,}',  # Long hex strings
                        r'-----BEGIN.*-----',  # Encryption headers
                        r'\.onion',  # Tor addresses
                        r'bitcoin:|bc1:|1[A-Z0-9]{25,}'  # Bitcoin addresses
                    ]
                    
                    indicators['suspicious_strings'] = any(re.search(pattern, content, re.IGNORECASE) for pattern in suspicious_patterns)
                    
                except Exception:
                    pass
            
            # Check if file appears to be encrypted (high entropy + unrecognized format)
            if entropy > 7.0 and not mime_type:
                indicators['encrypted_content'] = True
                
        except Exception as e:
            logger.error(f"Error analyzing file content {file_path}: {e}")
        
        return indicators

    def scan_processes(self):
        """Scan running processes for suspicious activity"""
        suspicious_activity = []
        
        try:
            for process in psutil.process_iter(['pid', 'name', 'cmdline', 'create_time']):
                try:
                    process_info = process.info
                    process_name = process_info['name'].lower()
                    
                    # Check for suspicious process names
                    if any(susp_proc in process_name for susp_proc in self.suspicious_processes):
                        cmdline = ' '.join(process_info['cmdline']) if process_info['cmdline'] else ''
                        
                        # Check for ransomware-specific command patterns
                        suspicious_commands = [
                            'vssadmin delete shadows',
                            'bcdedit /set {default} bootstatuspolicy ignoreallfailures',
                            'bcdedit /set {default} recoveryenabled no',
                            'wbadmin delete catalog -quiet',
                            'cipher /w:',
                            'fsutil behavior set SymlinkEvaluation',
                            'reg add HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate\\AU'
                        ]
                        
                        if any(cmd in cmdline.lower() for cmd in suspicious_commands):
                            suspicious_activity.append({
                                'pid': process_info['pid'],
                                'name': process_info['name'],
                                'cmdline': cmdline,
                                'create_time': datetime.fromtimestamp(process_info['create_time']).isoformat(),
                                'risk_level': 'high',
                                'reason': 'Suspicious command pattern detected'
                            })
                
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue
                    
        except Exception as e:
            logger.error(f"Error scanning processes: {e}")
        
        return suspicious_activity

    def scan_file(self, file_path):
        """Comprehensive scan of a single file"""
        scan_result = {
            'file_path': str(file_path),
            'file_name': Path(file_path).name,
            'file_size': 0,
            'file_extension': Path(file_path).suffix.lower(),
            'scan_time': datetime.now().isoformat(),
            'threat_level': 'low',
            'indicators': {},
            'ml_prediction': None,
            'risk_score': 0
        }
        
        try:
            # Basic file info
            scan_result['file_size'] = os.path.getsize(file_path)
            
            # Check suspicious indicators
            indicators = self.analyze_file_content(file_path)
            scan_result['indicators'] = indicators
            
            # Check filename and extension
            scan_result['indicators']['suspicious_extension'] = self.check_suspicious_extensions(file_path)
            scan_result['indicators']['suspicious_filename'] = self.check_suspicious_filename(file_path)
            
            # Calculate risk score
            risk_score = 0
            if indicators['high_entropy']:
                risk_score += 30
            if indicators['suspicious_strings']:
                risk_score += 25
            if indicators['encrypted_content']:
                risk_score += 35
            if indicators['ransom_keywords']:
                risk_score += 50
            if scan_result['indicators']['suspicious_extension']:
                risk_score += 40
            if scan_result['indicators']['suspicious_filename']:
                risk_score += 60
            
            scan_result['risk_score'] = min(risk_score, 100)
            
            # Determine threat level
            if risk_score >= 70:
                scan_result['threat_level'] = 'critical'
                self.scan_stats['threats_detected'] += 1
            elif risk_score >= 40:
                scan_result['threat_level'] = 'high'
                self.scan_stats['suspicious_files'] += 1
            elif risk_score >= 20:
                scan_result['threat_level'] = 'medium'
            
            # Use ML model if available
            if self.model_predictor:
                try:
                    # Extract features for ML model
                    features = self.extract_ml_features(file_path)
                    if features:
                        ml_result = self.model_predictor(features)
                        scan_result['ml_prediction'] = ml_result
                        
                        # Adjust risk score based on ML prediction
                        if ml_result.get('prediction') == 'Ransomware':
                            scan_result['risk_score'] = max(scan_result['risk_score'], 
                                                          int(ml_result.get('confidence', 0) * 100))
                            if ml_result.get('confidence', 0) > 0.7:
                                scan_result['threat_level'] = 'critical'
                                
                except Exception as e:
                    logger.error(f"Error running ML prediction on {file_path}: {e}")
            
            # Check if file appears encrypted
            if indicators['high_entropy'] and indicators['encrypted_content']:
                self.scan_stats['encrypted_files'] += 1
                
        except Exception as e:
            logger.error(f"Error scanning file {file_path}: {e}")
            scan_result['error'] = str(e)
        
        self.scan_stats['files_scanned'] += 1
        return scan_result

    def extract_ml_features(self, file_path):
        """Extract features for ML model prediction"""
        try:
            features = {}
            
            # File entropy
            features['entropy'] = self.calculate_file_entropy(file_path)
            
            # File size
            features['file_size'] = os.path.getsize(file_path)
            
            # Basic file analysis
            features['packed'] = 1 if features['entropy'] > 7.0 else 0
            
            # For PE files, we would extract more detailed features
            # For now, using simplified features
            features['suspicious_api_calls'] = 0  # Would analyze PE imports
            features['imports_count'] = 0
            features['sections_count'] = 0
            features['exports_count'] = 0
            features['resources_count'] = 0
            features['debug_info'] = 0
            features['digital_signature'] = 0
            
            # Try to extract PE-specific features if it's an executable
            if file_path.lower().endswith(('.exe', '.dll', '.scr', '.com')):
                try:
                    # This would require pefile library for full implementation
                    # For now, using heuristics
                    features['suspicious_api_calls'] = 5 if features['entropy'] > 6.0 else 2
                    features['imports_count'] = 50 if features['file_size'] > 100000 else 20
                    features['sections_count'] = 6 if features['entropy'] > 6.0 else 4
                    
                except Exception:
                    pass
            
            return features
            
        except Exception as e:
            logger.error(f"Error extracting ML features from {file_path}: {e}")
            return None

    def scan_directory(self, directory_path, recursive=True, file_extensions=None):
        """Scan a directory for ransomware indicators"""
        logger.info(f"Starting scan of directory: {directory_path}")
        
        self.scan_stats['scan_start_time'] = datetime.now().isoformat()
        
        if file_extensions is None:
            file_extensions = ['.exe', '.dll', '.scr', '.com', '.bat', '.cmd', '.ps1', '.txt', '.html']
        
        results = []
        
        try:
            path_obj = Path(directory_path)
            
            if recursive:
                pattern = "**/*"
            else:
                pattern = "*"
            
            for file_path in path_obj.glob(pattern):
                if file_path.is_file():
                    # Check file extension
                    if file_extensions and not any(str(file_path).lower().endswith(ext) for ext in file_extensions):
                        continue
                    
                    # Skip very large files (> 100MB) for performance
                    try:
                        if file_path.stat().st_size > 100 * 1024 * 1024:
                            continue
                    except Exception:
                        continue
                    
                    # Scan the file
                    scan_result = self.scan_file(file_path)
                    results.append(scan_result)
                    
                    # Store high-risk results
                    if scan_result['threat_level'] in ['high', 'critical']:
                        self.scan_results.append(scan_result)
        
        except Exception as e:
            logger.error(f"Error scanning directory {directory_path}: {e}")
        
        self.scan_stats['scan_end_time'] = datetime.now().isoformat()
        
        return results

    def quick_system_scan(self):
        """Perform a quick scan of critical system areas"""
        logger.info("Starting quick system scan...")
        
        # Critical directories to scan
        scan_directories = [
            os.path.expanduser("~\\Desktop"),
            os.path.expanduser("~\\Documents"),
            os.path.expanduser("~\\Downloads"),
            "C:\\Windows\\System32",
            "C:\\Windows\\Temp",
            os.path.expanduser("~\\AppData\\Local\\Temp")
        ]
        
        all_results = []
        
        for directory in scan_directories:
            if os.path.exists(directory):
                try:
                    results = self.scan_directory(
                        directory, 
                        recursive=False,  # Non-recursive for quick scan
                        file_extensions=['.exe', '.txt', '.html', '.bat', '.cmd']
                    )
                    all_results.extend(results)
                except Exception as e:
                    logger.error(f"Error scanning {directory}: {e}")
        
        # Scan processes
        process_threats = self.scan_processes()
        
        return {
            'file_scan_results': all_results,
            'process_threats': process_threats,
            'scan_statistics': self.scan_stats,
            'high_risk_files': [r for r in all_results if r['threat_level'] in ['high', 'critical']],
            'encrypted_files': [r for r in all_results if r['indicators'].get('encrypted_content', False)]
        }

    def generate_scan_report(self, scan_results):
        """Generate a comprehensive scan report"""
        report = {
            'scan_summary': {
                'scan_completed_at': datetime.now().isoformat(),
                'total_files_scanned': self.scan_stats['files_scanned'],
                'threats_detected': self.scan_stats['threats_detected'],
                'suspicious_files': self.scan_stats['suspicious_files'],
                'encrypted_files': self.scan_stats['encrypted_files'],
                'scan_duration': None
            },
            'threat_breakdown': {
                'critical': len([r for r in scan_results.get('file_scan_results', []) if r['threat_level'] == 'critical']),
                'high': len([r for r in scan_results.get('file_scan_results', []) if r['threat_level'] == 'high']),
                'medium': len([r for r in scan_results.get('file_scan_results', []) if r['threat_level'] == 'medium']),
                'low': len([r for r in scan_results.get('file_scan_results', []) if r['threat_level'] == 'low'])
            },
            'recommendations': [],
            'detailed_results': scan_results
        }
        
        # Calculate scan duration
        if self.scan_stats['scan_start_time'] and self.scan_stats['scan_end_time']:
            start_time = datetime.fromisoformat(self.scan_stats['scan_start_time'])
            end_time = datetime.fromisoformat(self.scan_stats['scan_end_time'])
            duration = (end_time - start_time).total_seconds()
            report['scan_summary']['scan_duration'] = f"{duration:.2f} seconds"
        
        # Generate recommendations
        if report['threat_breakdown']['critical'] > 0:
            report['recommendations'].append("URGENT: Critical threats detected! Disconnect from network and run full antivirus scan immediately.")
        
        if report['scan_summary']['encrypted_files'] > 10:
            report['recommendations'].append("WARNING: Large number of encrypted files detected. This may indicate ransomware activity.")
        
        if len(scan_results.get('process_threats', [])) > 0:
            report['recommendations'].append("Suspicious processes detected. Review running processes and terminate any unauthorized applications.")
        
        if report['threat_breakdown']['high'] > 0:
            report['recommendations'].append("High-risk files detected. Consider quarantining these files and running additional scans.")
        
        return report