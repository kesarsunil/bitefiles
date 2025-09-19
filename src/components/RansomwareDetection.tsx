import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, Target, BarChart3, Brain, AlertTriangle, CheckCircle, Scan, RefreshCw, AlertCircle, Play, Square } from "lucide-react";

// Backend API configuration
const API_BASE_URL = 'http://localhost:5000/api';

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
      <div className="text-xs text-muted-foreground col-span-2 text-center mb-2">Predicted</div>
      <div className="text-xs text-muted-foreground rotate-90 text-center">Actual</div>
      <div></div>
      
      <div className="bg-cyber-green/20 p-4 rounded border border-cyber-green/30 text-center">
        <div className="text-2xl font-bold text-cyber-green">{data[0][0]}</div>
        <div className="text-xs text-muted-foreground">True Negative</div>
      </div>
      <div className="bg-destructive/20 p-4 rounded border border-destructive/30 text-center">
        <div className="text-2xl font-bold text-destructive">{data[0][1]}</div>
        <div className="text-xs text-muted-foreground">False Positive</div>
      </div>
      
      <div className="bg-destructive/20 p-4 rounded border border-destructive/30 text-center">
        <div className="text-2xl font-bold text-destructive">{data[1][0]}</div>
        <div className="text-xs text-muted-foreground">False Negative</div>
      </div>
      <div className="bg-cyber-green/20 p-4 rounded border border-cyber-green/30 text-center">
        <div className="text-2xl font-bold text-cyber-green">{data[1][1]}</div>
        <div className="text-xs text-muted-foreground">True Positive</div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, isPercentage = true }: { title: string; value: number; isPercentage?: boolean }) => (
  <Card className="border-primary/20 bg-card/50 backdrop-blur">
    <CardContent className="p-4">
      <div className="text-2xl font-bold text-primary">
        {isPercentage ? `${(value * 100).toFixed(1)}%` : value.toFixed(3)}
      </div>
      <div className="text-sm text-muted-foreground">{title}</div>
    </CardContent>
  </Card>
);

const FeatureImportance = () => (
  <div className="space-y-3">
    {topFeatures.map((feature, index) => (
      <div key={feature.name} className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">{feature.name}</span>
          <span className="text-xs text-muted-foreground">{(feature.importance * 100).toFixed(1)}%</span>
        </div>
        <Progress value={feature.importance * 100} className="h-2" />
        <div className="text-xs text-muted-foreground">{feature.description}</div>
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

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-cyber-cyan bg-clip-text text-transparent">
              Ransomware Detection System
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Advanced machine learning system for detecting ransomware using static analysis features
          </p>
          
          {/* Backend Status */}
          <div className="flex items-center justify-center gap-2">
            <div className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span className="text-sm text-muted-foreground">
              {backendConnected ? 'Backend Connected' : 'Demo Mode (Backend Offline)'}
            </span>
          </div>
        </div>

        {/* System Info Card */}
        {systemInfo && (
          <Card className="border-primary/20 bg-card/50 backdrop-blur">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold">{systemInfo.cpu_count}</div>
                  <div className="text-xs text-muted-foreground">CPU Cores</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{Math.round(systemInfo.memory_available / 1024 / 1024 / 1024)}GB</div>
                  <div className="text-xs text-muted-foreground">Available RAM</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{systemInfo.running_processes}</div>
                  <div className="text-xs text-muted-foreground">Running Processes</div>
                </div>
                <div>
                  <div className="text-lg font-bold">{systemInfo.platform}</div>
                  <div className="text-xs text-muted-foreground">Platform</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scan Controls */}
        <Card className="border-primary/20 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scan className="h-5 w-5" />
              System Scanner
            </CardTitle>
            <CardDescription>
              Scan your system for ransomware threats and suspicious files
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button 
                onClick={() => startScan('quick')} 
                disabled={loading || scanStatus.status === 'scanning'}
                className="flex items-center gap-2"
              >
                {loading || scanStatus.status === 'scanning' ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Quick Scan
              </Button>
              <Button 
                onClick={() => startScan('full')} 
                disabled={loading || scanStatus.status === 'scanning'}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Scan className="h-4 w-4" />
                Full Scan
              </Button>
              {scanStatus.status === 'scanning' && (
                <Button 
                  onClick={stopScan} 
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <Square className="h-4 w-4" />
                  Stop Scan
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

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
          <Alert className="border-green-500 bg-green-500/10">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-500">System Clean</AlertTitle>
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
              <Card className="border-primary/20 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-primary">Dataset Overview</CardTitle>
                  <CardDescription>Ransomware detection dataset statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold">10,000</div>
                      <div className="text-sm text-muted-foreground">Total samples</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">95</div>
                      <div className="text-sm text-muted-foreground">Features</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-destructive">3,200</div>
                      <div className="text-sm text-muted-foreground">Ransomware</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-success">6,800</div>
                      <div className="text-sm text-muted-foreground">Benign</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-primary">Best Model Performance</CardTitle>
                  <CardDescription>XGBoost classifier results</CardDescription>
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
                          <div className="text-2xl font-bold text-destructive">{scanStatus.threat_breakdown.critical}</div>
                          <div className="text-sm text-muted-foreground">Critical</div>
                        </button>
                        <button 
                          className={`text-center p-4 bg-orange-500/10 rounded-lg border-2 transition-all hover:bg-orange-500/20 ${
                            selectedThreatLevel === 'high' ? 'border-orange-500 ring-2 ring-orange-500/50' : 'border-transparent'
                          }`}
                          onClick={() => setSelectedThreatLevel(selectedThreatLevel === 'high' ? null : 'high')}
                        >
                          <div className="text-2xl font-bold text-orange-500">{scanStatus.threat_breakdown.high}</div>
                          <div className="text-sm text-muted-foreground">High</div>
                        </button>
                        <button 
                          className={`text-center p-4 bg-yellow-500/10 rounded-lg border-2 transition-all hover:bg-yellow-500/20 ${
                            selectedThreatLevel === 'medium' ? 'border-yellow-500 ring-2 ring-yellow-500/50' : 'border-transparent'
                          }`}
                          onClick={() => setSelectedThreatLevel(selectedThreatLevel === 'medium' ? null : 'medium')}
                        >
                          <div className="text-2xl font-bold text-yellow-500">{scanStatus.threat_breakdown.medium}</div>
                          <div className="text-sm text-muted-foreground">Medium</div>
                        </button>
                        <button 
                          className={`text-center p-4 bg-green-500/10 rounded-lg border-2 transition-all hover:bg-green-500/20 ${
                            selectedThreatLevel === 'low' ? 'border-green-500 ring-2 ring-green-500/50' : 'border-transparent'
                          }`}
                          onClick={() => setSelectedThreatLevel(selectedThreatLevel === 'low' ? null : 'low')}
                        >
                          <div className="text-2xl font-bold text-green-500">{scanStatus.threat_breakdown.low}</div>
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
                            'border-green-500 bg-green-500/5 hover:bg-green-500/10'
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
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
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
                          : <CheckCircle className="h-6 w-6 text-success" />
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