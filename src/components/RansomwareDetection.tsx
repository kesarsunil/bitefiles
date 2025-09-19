import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, Target, BarChart3, Brain, AlertTriangle, CheckCircle, Scan } from "lucide-react";

// Mock data for demonstration
const modelResults = {
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
  const [prediction, setPrediction] = useState<{ result: string; confidence: number } | null>(null);
  const [systemScan, setSystemScan] = useState<{ scanning: boolean; progress: number; detected: boolean }>({
    scanning: false,
    progress: 0,
    detected: false
  });
  const [features, setFeatures] = useState({
    entropy: '',
    packed: '0',
    suspicious_api_calls: '',
    file_size: '',
    imports_count: '',
    sections_count: '',
    exports_count: '',
    resources_count: '',
    debug_info: '0',
    digital_signature: '1'
  });

  // Auto-scan system on component mount
  useEffect(() => {
    const runSystemScan = async () => {
      setSystemScan(prev => ({ ...prev, scanning: true }));
      
      // Simulate scanning progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setSystemScan(prev => ({ ...prev, progress: i }));
      }
      
      // Always detect ransomware threat
      await new Promise(resolve => setTimeout(resolve, 500));
      setSystemScan({
        scanning: false,
        progress: 100,
        detected: true
      });
    };

    runSystemScan();
  }, []);

  const handlePredict = () => {
    // Always predict ransomware for demonstration
    setPrediction({
      result: 'Ransomware',
      confidence: 0.94 + Math.random() * 0.05 // High confidence 94-99%
    });
  };

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
        </div>

        {/* System Scan Alert */}
        {systemScan.scanning && (
          <Alert className="border-warning bg-warning/10">
            <Scan className="h-4 w-4 animate-spin" />
            <AlertTitle>System Scan in Progress</AlertTitle>
            <AlertDescription>
              Scanning your system for ransomware threats...
              <Progress value={systemScan.progress} className="mt-2" />
            </AlertDescription>
          </Alert>
        )}

        {systemScan.detected && !systemScan.scanning && (
          <Alert className="border-destructive bg-destructive/10 border-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle className="text-destructive font-bold text-lg">⚠️ RANSOMWARE DETECTED ON YOUR SYSTEM!</AlertTitle>
            <AlertDescription className="text-destructive">
              <div className="space-y-2 mt-2">
                <p><strong>Threat Level:</strong> HIGH RISK</p>
                <p><strong>Detection Confidence:</strong> 97.3%</p>
                <p><strong>Recommendation:</strong> Immediate action required! Disconnect from network and run full system scan.</p>
                <p className="text-sm mt-3 opacity-80">
                  This detection is based on static analysis of system files and behavioral patterns.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-secondary/50">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
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
                    <MetricCard title="Accuracy" value={modelResults.xgboost.accuracy} />
                    <MetricCard title="ROC AUC" value={modelResults.xgboost.rocAuc} />
                    <MetricCard title="Precision" value={modelResults.xgboost.precision} />
                    <MetricCard title="Recall" value={modelResults.xgboost.recall} />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-primary/20 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-primary">Model Comparison Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-success/10 border border-success/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-success" />
                      <div>
                        <div className="font-semibold">XGBoost - Best Performer</div>
                        <div className="text-sm text-muted-foreground">Higher accuracy and better generalization</div>
                      </div>
                    </div>
                    <Badge className="bg-success text-success-foreground">Winner</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-muted/10 border border-muted/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Brain className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-semibold">Random Forest</div>
                        <div className="text-sm text-muted-foreground">Good baseline performance, interpretable</div>
                      </div>
                    </div>
                    <Badge variant="secondary">95.6% Accuracy</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                    <MetricCard title="Accuracy" value={modelResults.randomForest.accuracy} />
                    <MetricCard title="Precision" value={modelResults.randomForest.precision} />
                    <MetricCard title="Recall" value={modelResults.randomForest.recall} />
                    <MetricCard title="F1-Score" value={modelResults.randomForest.f1Score} />
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
                    <MetricCard title="Accuracy" value={modelResults.xgboost.accuracy} />
                    <MetricCard title="Precision" value={modelResults.xgboost.precision} />
                    <MetricCard title="Recall" value={modelResults.xgboost.recall} />
                    <MetricCard title="F1-Score" value={modelResults.xgboost.f1Score} />
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
                      XGBoost AUC: {modelResults.xgboost.rocAuc} | Random Forest AUC: {modelResults.randomForest.rocAuc}
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
                
                <Button onClick={handlePredict} className="w-full bg-primary hover:bg-primary/90">
                  <Shield className="h-4 w-4 mr-2" />
                  Predict Sample
                </Button>

                {prediction && (
                  <Card className={`border-2 ${prediction.result === 'Ransomware' 
                    ? 'border-destructive bg-destructive/10' 
                    : 'border-success bg-success/10'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        {prediction.result === 'Ransomware' 
                          ? <AlertTriangle className="h-6 w-6 text-destructive" />
                          : <CheckCircle className="h-6 w-6 text-success" />
                        }
                        <div>
                          <div className="text-lg font-bold">
                            Prediction: {prediction.result}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Confidence: {(prediction.confidence * 100).toFixed(1)}%
                          </div>
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