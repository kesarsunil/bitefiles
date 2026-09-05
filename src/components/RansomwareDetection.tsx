import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, Target, BarChart3, Brain, AlertTriangle, CheckCircle, Scan, RefreshCw, AlertCircle, Play, Square } from "lucide-react";
import { gsap } from "gsap";
import { motion, AnimatePresence } from "framer-motion";
import { WebGLBackground } from "./WebGLBackground";
import { FloatingShapes } from "./FloatingShapes";
import { PremiumCard3D } from "./PremiumCard3D";
import { AnimatedStat } from "./AnimatedStat";
import { GlowButton } from "./GlowButton";
import { CyberGrid } from "./CyberGrid";
import { MatrixRain } from "./MatrixRain";
import { Scanlines } from "./Scanlines";
import { HexagonPattern } from "./HexagonPattern";
import { GlitchText } from "./GlitchText";
import { NeonCard } from "./NeonCard";

// Backend API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Types for API responses
interface PredictionResult {
  prediction: string;
  confidence: number;
  probability_benign: number;
  probability_ransomware: number;
  risk_level: string;
}

interface ScanStatus {
  status: string;
  progress: number;
  total_files: number;
  scanned_files: number;
  threats_found: number;
  results: Array<{
    file_path: string;
    file_name: string;
    threat_level: string;
    risk_score: number;
    indicators: any;
    ml_prediction?: PredictionResult;
  }>;
  summary?: {
    scan_completed_at: string;
    total_files_scanned: number;
    threats_detected: number;
    suspicious_files: number;
    encrypted_files: number;
    scan_duration: string;
  };
  threat_breakdown?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  recommendations?: string[];
}

interface SystemInfo {
  platform: string;
  cpu_count: number;
  memory_total: number;
  memory_available: number;
  running_processes: number;
  timestamp: string;
}

// Mock data for demonstration when backend is not available
const mockModelResults = {
  randomForest: {
    accuracy: 0.956,
    precision: 0.943,
    recall: 0.967,
    f1Score: 0.955,
    rocAuc: 0.982
  },
  xgboost: {
    accuracy: 0.971,
    precision: 0.965,
    recall: 0.975,
    f1Score: 0.970,
    rocAuc: 0.987
  }
};

const topFeatures = [
  { name: "entropy", importance: 0.156, description: "File entropy measure" },
  { name: "packed", importance: 0.134, description: "Indicates if file is packed" },
  { name: "suspicious_api_calls", importance: 0.128, description: "Number of suspicious API calls" },
  { name: "file_size", importance: 0.094, description: "Size of the executable file" },
  { name: "imports_count", importance: 0.087, description: "Number of imported functions" },
  { name: "sections_count", importance: 0.073, description: "Number of PE sections" },
  { name: "exports_count", importance: 0.069, description: "Number of exported functions" },
  { name: "resources_count", importance: 0.061, description: "Number of resources" },
  { name: "debug_info", importance: 0.058, description: "Presence of debug information" },
  { name: "digital_signature", importance: 0.055, description: "Valid digital signature" }
];

const ConfusionMatrix = ({ model }: { model: 'randomForest' | 'xgboost' }) => {
  const data = model === 'randomForest' 
    ? [[1847, 23], [31, 899]]
    : [[1856, 14], [19, 911]];
  
  return (
    <div className="grid grid-cols-2 gap-2 w-fit mx-auto">
      <div 
        className="text-xs col-span-2 text-center mb-2 font-medium"
        style={{
          color: '#ffffff',
        }}
      >
        PREDICTED
      </div>
      <div 
        className="text-xs rotate-90 text-center font-medium"
        style={{
          color: '#ffffff',
        }}
      >
        ACTUAL
      </div>
      <div></div>
      
      <div 
        className="p-4 rounded border text-center backdrop-blur"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          borderColor: 'rgba(255, 255, 255, 0.5)',
          boxShadow: '0 0 15px rgba(255, 255, 255, 0.2)',
        }}
      >
        <div 
          className="text-2xl font-bold"
          style={{
            color: '#ffffff',
          }}
        >
          {data[0][0]}
        </div>
        <div 
          className="text-xs"
          style={{
            color: '#ffffff',
            opacity: 0.9,
          }}
        >
          True Negative
        </div>
      </div>
      <div 
        className="p-4 rounded border text-center backdrop-blur"
        style={{
          background: 'rgba(255, 0, 0, 0.15)',
          borderColor: 'rgba(255, 0, 0, 0.5)',
          boxShadow: '0 0 15px rgba(255, 0, 0, 0.2)',
        }}
      >
        <div 
          className="text-2xl font-bold"
          style={{
            color: '#ffffff',
            textShadow: '0 0 20px rgba(255, 0, 0, 0.6)',
          }}
        >
          {data[0][1]}
        </div>
        <div 
          className="text-xs"
          style={{
            color: '#ffffff',
            opacity: 0.9,
            textShadow: '0 0 10px rgba(255, 0, 0, 0.3)',
          }}
        >
          False Positive
        </div>
      </div>
      
      <div 
        className="p-4 rounded border text-center backdrop-blur"
        style={{
          background: 'rgba(255, 0, 0, 0.15)',
          borderColor: 'rgba(255, 0, 0, 0.5)',
          boxShadow: '0 0 15px rgba(255, 0, 0, 0.2)',
        }}
      >
        <div 
          className="text-2xl font-bold"
          style={{
            color: '#ffffff',
            textShadow: '0 0 20px rgba(255, 0, 0, 0.6)',
          }}
        >
          {data[1][0]}
        </div>
        <div 
          className="text-xs"
          style={{
            color: '#ffffff',
            opacity: 0.9,
            textShadow: '0 0 10px rgba(255, 0, 0, 0.3)',
          }}
        >
          False Negative
        </div>
      </div>
      <div 
        className="p-4 rounded border text-center backdrop-blur"
        style={{
          background: 'rgba(255, 255, 255, 0.15)',
          borderColor: 'rgba(255, 255, 255, 0.5)',
          boxShadow: '0 0 15px rgba(255, 255, 255, 0.2)',
        }}
      >
        <div 
          className="text-2xl font-bold"
          style={{
            color: '#ffffff',
          }}
        >
          {data[1][1]}
        </div>
        <div 
          className="text-xs"
          style={{
            color: '#ffffff',
            opacity: 0.9,
          }}
        >
          True Positive
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, isPercentage = true }: { title: string; value: number; isPercentage?: boolean }) => (
  <Card 
    className="backdrop-blur border-2 overflow-hidden relative"
    style={{
      background: 'rgba(13, 13, 13, 0.85)',
      borderColor: 'rgba(255, 255, 255, 0.5)',
      boxShadow: '0 0 20px rgba(255, 255, 255, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.05)',
    }}
  >
    <CardContent className="p-4 relative z-10">
      <div 
        className="text-2xl font-bold"
        style={{
          color: '#ffffff',
        }}
      >
        {isPercentage ? `${(value * 100).toFixed(1)}%` : value.toFixed(3)}
      </div>
      <div 
        className="text-sm font-medium"
        style={{
          color: '#ffffff',
        }}
      >
        {title}
      </div>
    </CardContent>
    {/* Corner accents */}
    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white" />
    <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white" />
    <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white" />
    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white" />
  </Card>
);

const FeatureImportance = () => (
  <div className="space-y-3">
    {topFeatures.map((feature, index) => (
      <div key={feature.name} className="space-y-1">
        <div className="flex justify-between items-center">
          <span 
            className="text-sm font-medium"
            style={{
              color: '#ffffff',
            }}
          >
            {feature.name}
          </span>
          <span 
            className="text-xs"
            style={{
              color: '#ffffff',
              opacity: 0.9,
            }}
          >
            {(feature.importance * 100).toFixed(1)}%
          </span>
        </div>
        <Progress 
          value={feature.importance * 100} 
          className="h-2"
          style={{
            background: 'rgba(0, 26, 0, 0.5)',
          }}
        />
        <div 
          className="text-xs"
          style={{
            color: '#ffffff',
            opacity: 0.8,
          }}
        >
          {feature.description}
        </div>
      </div>
    ))}
  </div>
);

export const RansomwareDetection = () => {
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [scanStatus, setScanStatus] = useState<ScanStatus>({
    status: 'idle',
    progress: 0,
    total_files: 0,
    scanned_files: 0,
    threats_found: 0,
    results: []
  });
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [backendConnected, setBackendConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedThreatLevel, setSelectedThreatLevel] = useState<string | null>(null);
  const [features, setFeatures] = useState({
    entropy: '7.2',
    packed: '1',
    suspicious_api_calls: '15',
    file_size: '1048576',
    imports_count: '45',
    sections_count: '6',
    exports_count: '2',
    resources_count: '5',
    debug_info: '0',
    digital_signature: '0'
  });

  // Check backend health and load system info
  useEffect(() => {
    checkBackendHealth();
    loadSystemInfo();
  }, []);

  // Poll scan status when scanning
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (scanStatus.status === 'scanning') {
      interval = setInterval(checkScanStatus, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [scanStatus.status]);

  const checkBackendHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        setBackendConnected(true);
      }
    } catch (error) {
      setBackendConnected(false);
      console.warn('Backend not available, using demo mode');
    }
  };

  const loadSystemInfo = async () => {
    if (!backendConnected) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/system/info`);
      if (response.ok) {
        const data = await response.json();
        setSystemInfo(data);
      }
    } catch (error) {
      console.error('Failed to load system info:', error);
    }
  };

  const startScan = async (scanType: 'quick' | 'full' = 'quick') => {
    if (!backendConnected) {
      // Demo mode - simulate scan
      runDemoScan();
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/scan/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scan_type: scanType
        }),
      });

      if (response.ok) {
        setScanStatus(prev => ({ ...prev, status: 'scanning' }));
      }
    } catch (error) {
      console.error('Failed to start scan:', error);
    } finally {
      setLoading(false);
    }
  };

  const stopScan = async () => {
    if (!backendConnected) return;

    try {
      await fetch(`${API_BASE_URL}/scan/stop`, {
        method: 'POST',
      });
      setScanStatus(prev => ({ ...prev, status: 'stopped' }));
    } catch (error) {
      console.error('Failed to stop scan:', error);
    }
  };

  const checkScanStatus = async () => {
    if (!backendConnected) return;

    try {
      const response = await fetch(`${API_BASE_URL}/scan/status`);
      if (response.ok) {
        const data = await response.json();
        setScanStatus(data);
      }
    } catch (error) {
      console.error('Failed to check scan status:', error);
    }
  };

  const runDemoScan = async () => {
    setScanStatus({
      status: 'scanning',
      progress: 0,
      total_files: 1250,
      scanned_files: 0,
      threats_found: 0,
      results: []
    });

    // Simulate scanning progress
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 150));
      setScanStatus(prev => ({
        ...prev,
        progress: i,
        scanned_files: Math.floor((i / 100) * 1250),
        threats_found: i > 70 ? 3 : i > 40 ? 1 : 0
      }));
    }

    // Set demo results
    setScanStatus({
      status: 'completed',
      progress: 100,
      total_files: 1250,
      scanned_files: 1250,
      threats_found: 12,
      results: [
        {
          file_path: 'C:\\Users\\Downloads\\suspicious_file.exe',
          file_name: 'suspicious_file.exe',
          threat_level: 'critical',
          risk_score: 95,
          indicators: { high_entropy: true, suspicious_strings: true, packed: true }
        },
        {
          file_path: 'C:\\Temp\\encrypted_data.bin',
          file_name: 'encrypted_data.bin', 
          threat_level: 'high',
          risk_score: 78,
          indicators: { encrypted_content: true, suspicious_api_calls: true }
        },
        {
          file_path: 'C:\\Windows\\System32\\malware.dll',
          file_name: 'malware.dll',
          threat_level: 'critical',
          risk_score: 98,
          indicators: { high_entropy: true, suspicious_strings: true, no_signature: true }
        },
        {
          file_path: 'C:\\Program Files\\Unknown\\trojan.exe',
          file_name: 'trojan.exe',
          threat_level: 'high',
          risk_score: 85,
          indicators: { packed: true, suspicious_api_calls: true }
        },
        {
          file_path: 'C:\\Users\\Documents\\phishing.doc',
          file_name: 'phishing.doc',
          threat_level: 'medium',
          risk_score: 65,
          indicators: { suspicious_macros: true }
        },
        {
          file_path: 'C:\\Temp\\adware.exe',
          file_name: 'adware.exe',
          threat_level: 'medium',
          risk_score: 58,
          indicators: { suspicious_strings: true }
        },
        {
          file_path: 'C:\\Downloads\\suspicious_installer.msi',
          file_name: 'suspicious_installer.msi',
          threat_level: 'medium',
          risk_score: 62,
          indicators: { unsigned: true, suspicious_strings: true }
        },
        {
          file_path: 'C:\\Users\\AppData\\Local\\temp_file.tmp',
          file_name: 'temp_file.tmp',
          threat_level: 'low',
          risk_score: 35,
          indicators: { temporary_file: true }
        },
        {
          file_path: 'C:\\Program Files\\Outdated\\old_software.exe',
          file_name: 'old_software.exe',
          threat_level: 'low',
          risk_score: 28,
          indicators: { outdated: true }
        },
        {
          file_path: 'C:\\Windows\\Temp\\cache_file.dat',
          file_name: 'cache_file.dat',
          threat_level: 'low',
          risk_score: 15,
          indicators: { cache_file: true }
        },
        {
          file_path: 'C:\\Users\\Downloads\\unknown_app.exe',
          file_name: 'unknown_app.exe',
          threat_level: 'medium',
          risk_score: 72,
          indicators: { unknown_publisher: true, suspicious_strings: true }
        },
        {
          file_path: 'C:\\System\\hidden_process.exe',
          file_name: 'hidden_process.exe',
          threat_level: 'critical',
          risk_score: 92,
          indicators: { hidden: true, high_entropy: true, suspicious_api_calls: true }
        }
      ],
      summary: {
        scan_completed_at: new Date().toISOString(),
        total_files_scanned: 1250,
        threats_detected: 12,
        suspicious_files: 8,
        encrypted_files: 15,
        scan_duration: '45.3 seconds'
      },
      threat_breakdown: {
        critical: 3,
        high: 3,
        medium: 4,
        low: 2
      },
      recommendations: [
        'URGENT: Critical threats detected! Disconnect from network immediately.',
        'Large number of encrypted files detected. This may indicate ransomware activity.',
        'Review and quarantine high-risk files found during scan.'
      ]
    });
  };

  const handlePredict = async () => {
    if (!backendConnected) {
      // Demo mode prediction
      setPrediction({
        prediction: 'Ransomware',
        confidence: 0.94 + Math.random() * 0.05,
        probability_benign: 0.05,
        probability_ransomware: 0.95,
        risk_level: 'High'
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          features: Object.fromEntries(
            Object.entries(features).map(([key, value]) => [
              key,
              key === 'packed' || key === 'debug_info' || key === 'digital_signature'
                ? parseInt(value) || 0
                : parseFloat(value) || 0
            ])
          )
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPrediction(data);
      }
    } catch (error) {
      console.error('Failed to make prediction:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter results based on selected threat level
  const filteredResults = selectedThreatLevel 
    ? scanStatus.results.filter(result => result.threat_level === selectedThreatLevel)
    : scanStatus.results;

  const headerRef = useRef<HTMLDivElement>(null);
  const shieldRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (shieldRef.current) {
      gsap.to(shieldRef.current, {
        rotation: 360,
        duration: 20,
        repeat: -1,
        ease: "none",
      });
    }

    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -50 },
        { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-background p-6 relative overflow-hidden">
      {/* Cyberpunk Background Layers */}
      <WebGLBackground />
      <CyberGrid />
      <MatrixRain />
      <FloatingShapes />
      <HexagonPattern />
      <Scanlines />
      
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Cyberpunk Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: -60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center space-y-6"
        >
          <div className="flex items-center justify-center gap-4">
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.15, 1],
              }}
              transition={{
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
              }}
              className="relative"
            >
              <div className="hidden" 
                   style={{ 
                     boxShadow: '0 0 60px rgba(255, 255, 255, 0.6), 0 0 100px rgba(255, 255, 255, 0.4)',
                     animation: 'neonPulse 2s ease-in-out infinite'
                   }} />
              <Shield ref={shieldRef} className="h-16 w-16 text-white relative z-10" />
            </motion.div>
            <GlitchText className="text-6xl font-bold tracking-tight">
              <h1 className="text-white">
                Ransomware Detection System
              </h1>
            </GlitchText>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-white text-xl max-w-3xl mx-auto font-medium"
          >
            Advanced machine learning system for detecting ransomware using static analysis features
          </motion.p>
          
          {/* Backend Status */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex items-center justify-center gap-3"
          >
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [1, 0.6, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className={`w-3 h-3 rounded-full ${backendConnected ? 'bg-white shadow-lg shadow-white/50' : 'bg-red-400 shadow-lg shadow-red-400/50'}`}
              style={{ 
                boxShadow: backendConnected 
                  ? '0 0 20px rgba(255,255,255,0.8)' 
                  : '0 0 20px rgba(255,0,0,0.8)' 
              }}
            />
            <span className="text-base font-semibold"
                  style={{ 
                    color: '#ffffff',
                  }}>
              {backendConnected ? '✓ BACKEND CONNECTED' : '⚠ DEMO MODE (BACKEND OFFLINE)'}
            </span>
          </motion.div>
        </motion.div>

        {/* System Info with Cyberpunk AnimatedStat */}
        {systemInfo && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <AnimatedStat
              value={systemInfo.cpu_count}
              label="CPU Cores"
              icon="💻"
              color="#ffffff"
              delay={0.1}
            />
            <AnimatedStat
              value={`${Math.round(systemInfo.memory_available / 1024 / 1024 / 1024)}GB`}
              label="Available RAM"
              icon="🧠"
              color="#cccccc"
              delay={0.2}
            />
            <AnimatedStat
              value={systemInfo.running_processes}
              label="Running Processes"
              icon="⚙️"
              color="#999999"
              delay={0.3}
            />
            <AnimatedStat
              value={systemInfo.platform}
              label="Platform"
              icon="🖥️"
              color="#ffffff"
              delay={0.4}
            />
          </div>
        )}

        {/* Scan Controls */}
        <PremiumCard3D delay={0.5}>
          <NeonCard glowColor="green" className="p-0">
            <CardHeader className="border-b border-green-900/60 bg-transparent">
              <CardTitle className="flex items-center gap-3 text-3xl"
                         style={{ 
                           color: '#ffffff',
                         }}>
                    <Scan className="h-8 w-8" />
                SYSTEM SCANNER
              </CardTitle>
              <CardDescription className="text-white text-lg">
                Scan your system for ransomware threats and suspicious files
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              <div className="flex gap-4 flex-wrap justify-center">
                <GlowButton
                  onClick={() => startScan('quick')}
                  disabled={loading || scanStatus.status === 'scanning'}
                  variant="primary"
                  className="flex items-center gap-3 px-8 py-4 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 text-lg"
                  style={{
                    background: '#166534',
                    boxShadow: 'none',
                    border: '1px solid rgba(74, 222, 128, 0.45)',
                  }}
                >
                  {loading || scanStatus.status === 'scanning' ? (
                    <RefreshCw className="h-6 w-6 animate-spin" 
                               style={{ filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.8))' }} />
                  ) : (
                    <Play className="h-6 w-6" />
                  )}
                  QUICK SCAN
                </GlowButton>
                <GlowButton
                  onClick={() => startScan('full')}
                  disabled={loading || scanStatus.status === 'scanning'}
                  variant="secondary"
                  className="flex items-center gap-3 px-8 py-4 font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 text-lg"
                  style={{
                    background: 'transparent',
                    color: '#ffffff',
                    boxShadow: 'none',
                    border: '1px solid rgba(74, 222, 128, 0.45)',
                  }}
                >
                  <Scan className="h-6 w-6" />
                  FULL SCAN
                </GlowButton>
                {scanStatus.status === 'scanning' && (
                  <GlowButton
                    onClick={stopScan}
                    variant="danger"
                    className="flex items-center gap-3 px-8 py-4 font-bold rounded-xl transition-all duration-500 text-lg"
                    style={{
                      background: 'linear-gradient(135deg, #ff0000, #ff0055)',
                      color: '#ffffff',
                      boxShadow: '0 0 20px rgba(255, 0, 0, 0.5), 0 0 40px rgba(255, 0, 0, 0.3)',
                      border: '2px solid rgba(255, 0, 0, 0.5)',
                    }}
                  >
                    <Square className="h-6 w-6" />
                    STOP SCAN
                  </GlowButton>
                )}
              </div>
            </CardContent>
          </NeonCard>
        </PremiumCard3D>

        {/* Scan Progress */}
        {scanStatus.status === 'scanning' && (
          <Alert className="border-warning bg-warning/10">
            <Scan className="h-4 w-4 animate-spin" />
            <AlertTitle>System Scan in Progress</AlertTitle>
            <AlertDescription>
              Scanning your system for ransomware threats...
              <div className="mt-2 space-y-1">
                <Progress value={scanStatus.progress} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {scanStatus.scanned_files} / {scanStatus.total_files} files scanned
                  {scanStatus.threats_found > 0 && (
                    <span className="text-destructive ml-2">
                      • {scanStatus.threats_found} threats detected
                    </span>
                  )}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Scan Results */}
        {scanStatus.status === 'completed' && scanStatus.threats_found > 0 && (
          <Alert className="border-destructive bg-destructive/10 border-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-destructive font-bold text-lg">
              ⚠️ THREATS DETECTED ON YOUR SYSTEM!
            </AlertTitle>
            <AlertDescription className="text-destructive">
              <div className="space-y-2 mt-2">
                <p><strong>Threats Found:</strong> {scanStatus.threats_found}</p>
                <p><strong>Files Scanned:</strong> {scanStatus.scanned_files}</p>
                {scanStatus.summary && (
                  <>
                    <p><strong>Scan Duration:</strong> {scanStatus.summary.scan_duration}</p>
                    <p><strong>Encrypted Files:</strong> {scanStatus.summary.encrypted_files}</p>
                  </>
                )}
                {scanStatus.recommendations && scanStatus.recommendations.length > 0 && (
                  <div className="mt-3">
                    <p><strong>Recommendations:</strong></p>
                    <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                      {scanStatus.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {scanStatus.status === 'completed' && scanStatus.threats_found === 0 && (
          <Alert className="border-white bg-white/10">
            <CheckCircle className="h-4 w-4 text-white" />
            <AlertTitle className="text-white">System Clean</AlertTitle>
            <AlertDescription>
              No ransomware threats detected. Your system appears to be safe.
              <div className="text-xs mt-2 opacity-80">
                Scanned {scanStatus.scanned_files} files in {scanStatus.summary?.scan_duration || 'unknown time'}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-secondary/50">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="scan-results" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Scan Results
            </TabsTrigger>
            <TabsTrigger value="models" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Models
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Features
            </TabsTrigger>
            <TabsTrigger value="predict" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Predict
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-primary/20 backdrop-blur" style={{ background: 'rgba(0, 255, 0, 0.15)' }}>
                <CardHeader>
                  <CardTitle className="text-white">Dataset Overview</CardTitle>
                  <CardDescription className="text-white">Ransomware detection dataset statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-white">10,000</div>
                      <div className="text-sm text-white">Total samples</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">95</div>
                      <div className="text-sm text-white">Features</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">3,200</div>
                      <div className="text-sm text-white">Ransomware</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">6,800</div>
                      <div className="text-sm text-white">Benign</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20 backdrop-blur" style={{ background: 'rgba(0, 255, 0, 0.15)' }}>
                <CardHeader>
                  <CardTitle className="text-white">Best Model Performance</CardTitle>
                  <CardDescription className="text-white">XGBoost classifier results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <MetricCard title="Accuracy" value={mockModelResults.xgboost.accuracy} />
                    <MetricCard title="ROC AUC" value={mockModelResults.xgboost.rocAuc} />
                    <MetricCard title="Precision" value={mockModelResults.xgboost.precision} />
                    <MetricCard title="Recall" value={mockModelResults.xgboost.recall} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Scan Results Tab */}
          <TabsContent value="scan-results" className="space-y-6">
            {scanStatus.status === 'idle' && (
              <Card className="border-primary/20 bg-card/50 backdrop-blur">
                <CardContent className="p-8 text-center">
                  <Scan className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Scan Results Available</h3>
                  <p className="text-muted-foreground mb-4">
                    Start a system scan to view detailed results and threat analysis.
                  </p>
                  <Button onClick={() => startScan('quick')}>Start Quick Scan</Button>
                </CardContent>
              </Card>
            )}

            {scanStatus.status === 'completed' && (
              <div className="space-y-6">
                {/* Threat Breakdown */}
                {scanStatus.threat_breakdown && (
                  <Card className="border-primary/20 bg-card/50 backdrop-blur">
                    <CardHeader>
                      <CardTitle>Threat Level Breakdown</CardTitle>
                      <CardDescription>Click on a threat level to filter results</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-4">
                        <button 
                          className={`text-center p-4 bg-destructive/10 rounded-lg border-2 transition-all hover:bg-destructive/20 ${
                            selectedThreatLevel === 'critical' ? 'border-destructive ring-2 ring-destructive/50' : 'border-transparent'
                          }`}
                          onClick={() => setSelectedThreatLevel(selectedThreatLevel === 'critical' ? null : 'critical')}
                        >
                          <div className="text-2xl font-bold text-white">{scanStatus.threat_breakdown.critical}</div>
                          <div className="text-sm text-muted-foreground">Critical</div>
                        </button>
                        <button 
                          className={`text-center p-4 bg-orange-500/10 rounded-lg border-2 transition-all hover:bg-orange-500/20 ${
                            selectedThreatLevel === 'high' ? 'border-orange-500 ring-2 ring-orange-500/50' : 'border-transparent'
                          }`}
                          onClick={() => setSelectedThreatLevel(selectedThreatLevel === 'high' ? null : 'high')}
                        >
                          <div className="text-2xl font-bold text-white">{scanStatus.threat_breakdown.high}</div>
                          <div className="text-sm text-muted-foreground">High</div>
                        </button>
                        <button 
                          className={`text-center p-4 bg-yellow-500/10 rounded-lg border-2 transition-all hover:bg-yellow-500/20 ${
                            selectedThreatLevel === 'medium' ? 'border-yellow-500 ring-2 ring-yellow-500/50' : 'border-transparent'
                          }`}
                          onClick={() => setSelectedThreatLevel(selectedThreatLevel === 'medium' ? null : 'medium')}
                        >
                          <div className="text-2xl font-bold text-white">{scanStatus.threat_breakdown.medium}</div>
                          <div className="text-sm text-muted-foreground">Medium</div>
                        </button>
                        <button 
                          className={`text-center p-4 bg-white/10 rounded-lg border-2 transition-all hover:bg-white/20 ${
                            selectedThreatLevel === 'low' ? 'border-white ring-2 ring-white/50' : 'border-transparent'
                          }`}
                          onClick={() => setSelectedThreatLevel(selectedThreatLevel === 'low' ? null : 'low')}
                        >
                          <div className="text-2xl font-bold text-white">{scanStatus.threat_breakdown.low}</div>
                          <div className="text-sm text-muted-foreground">Low</div>
                        </button>
                      </div>
                      {selectedThreatLevel && (
                        <div className="mt-4 text-center">
                          <Badge variant="outline" className="bg-primary/10">
                            Filtering by: {selectedThreatLevel.toUpperCase()} threats
                            <button 
                              onClick={() => setSelectedThreatLevel(null)}
                              className="ml-2 hover:text-destructive"
                            >
                              ✕
                            </button>
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Detailed Results */}
                <Card className="border-primary/20 bg-card/50 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Detected Threats</span>
                      <span className="text-sm font-normal text-muted-foreground">
                        {selectedThreatLevel 
                          ? `${filteredResults.length} ${selectedThreatLevel} threat(s)`
                          : `${scanStatus.results.length} total threats`
                        }
                      </span>
                    </CardTitle>
                    <CardDescription>
                      {selectedThreatLevel 
                        ? `Files flagged as ${selectedThreatLevel} risk level`
                        : 'Files flagged as potential ransomware'
                      }
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {filteredResults.length > 0 ? (
                      <div className="max-h-96 overflow-y-auto pr-2 space-y-3 scrollbar-thin">
                        {filteredResults.map((result, index) => (
                          <div key={index} className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                            result.threat_level === 'critical' ? 'border-destructive bg-destructive/5 hover:bg-destructive/10' :
                            result.threat_level === 'high' ? 'border-orange-500 bg-orange-500/5 hover:bg-orange-500/10' :
                            result.threat_level === 'medium' ? 'border-yellow-500 bg-yellow-500/5 hover:bg-yellow-500/10' :
                            'border-white bg-white/5 hover:bg-white/10'
                          }`}>
                            <div className="flex justify-between items-start">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{result.file_name}</div>
                                <div className="text-sm text-muted-foreground truncate">
                                  {result.file_path}
                                </div>
                                {result.indicators && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {Object.entries(result.indicators).map(([key, value]) => 
                                      value && (
                                        <Badge key={key} variant="outline" className="text-xs">
                                          {key.replace('_', ' ')}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="text-right ml-4 flex-shrink-0">
                                <Badge variant={
                                  result.threat_level === 'critical' ? 'destructive' :
                                  result.threat_level === 'high' ? 'default' : 
                                  result.threat_level === 'medium' ? 'secondary' : 'outline'
                                }>
                                  {result.threat_level.toUpperCase()}
                                </Badge>
                                <div className="text-sm text-muted-foreground mt-1">
                                  Risk: {result.risk_score}%
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : selectedThreatLevel ? (
                      <div className="text-center py-8">
                        <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No {selectedThreatLevel} Threats</h3>
                        <p className="text-muted-foreground">No files found with {selectedThreatLevel} risk level.</p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => setSelectedThreatLevel(null)}
                        >
                          Show All Threats
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="h-16 w-16 text-white mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Threats Detected</h3>
                        <p className="text-muted-foreground">Your system scan completed successfully with no threats found.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Models Tab */}
          <TabsContent value="models" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-primary/20 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Random Forest
                  </CardTitle>
                  <CardDescription>Ensemble method with decision trees</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <MetricCard title="Accuracy" value={mockModelResults.randomForest.accuracy} />
                    <MetricCard title="Precision" value={mockModelResults.randomForest.precision} />
                    <MetricCard title="Recall" value={mockModelResults.randomForest.recall} />
                    <MetricCard title="F1-Score" value={mockModelResults.randomForest.f1Score} />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Confusion Matrix</h4>
                    <ConfusionMatrix model="randomForest" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    XGBoost
                  </CardTitle>
                  <CardDescription>Gradient boosting framework</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <MetricCard title="Accuracy" value={mockModelResults.xgboost.accuracy} />
                    <MetricCard title="Precision" value={mockModelResults.xgboost.precision} />
                    <MetricCard title="Recall" value={mockModelResults.xgboost.recall} />
                    <MetricCard title="F1-Score" value={mockModelResults.xgboost.f1Score} />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Confusion Matrix</h4>
                    <ConfusionMatrix model="xgboost" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-primary/20 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>ROC Curves</CardTitle>
                <CardDescription>Receiver Operating Characteristic comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/10 rounded-lg">
                  <div className="text-center space-y-2">
                    <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto" />
                    <div className="text-muted-foreground">ROC Curve Visualization</div>
                    <div className="text-sm text-muted-foreground">
                      XGBoost AUC: {mockModelResults.xgboost.rocAuc} | Random Forest AUC: {mockModelResults.randomForest.rocAuc}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <Card className="border-primary/20 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Top 10 Feature Importances</CardTitle>
                <CardDescription>Most influential features for ransomware detection</CardDescription>
              </CardHeader>
              <CardContent>
                <FeatureImportance />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Predict Tab */}
          <TabsContent value="predict" className="space-y-6">
            <Card className="border-primary/20 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle>Predict New Sample</CardTitle>
                <CardDescription>Enter file features to predict if it's ransomware</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(features).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key} className="capitalize">{key.replace('_', ' ')}</Label>
                      <Input
                        id={key}
                        value={value}
                        onChange={(e) => setFeatures(prev => ({ ...prev, [key]: e.target.value }))}
                        placeholder="Enter value"
                      />
                    </div>
                  ))}
                </div>
                
                <Button 
                  onClick={handlePredict} 
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Shield className="h-4 w-4 mr-2" />
                  )}
                  Predict Sample
                </Button>

                {prediction && (
                  <Card className={`border-2 ${prediction.prediction === 'Ransomware' 
                    ? 'border-destructive bg-destructive/10' 
                    : 'border-success bg-success/10'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        {prediction.prediction === 'Ransomware' 
                          ? <AlertTriangle className="h-6 w-6 text-destructive" />
                          : <CheckCircle className="h-6 w-6 text-white" />
                        }
                        <div>
                          <div className="text-lg font-bold">
                            Prediction: {prediction.prediction}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Confidence: {(prediction.confidence * 100).toFixed(1)}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Risk Level: {prediction.risk_level}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Benign Probability:</span>
                          <span className="ml-2 font-medium">{(prediction.probability_benign * 100).toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Ransomware Probability:</span>
                          <span className="ml-2 font-medium">{(prediction.probability_ransomware * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};