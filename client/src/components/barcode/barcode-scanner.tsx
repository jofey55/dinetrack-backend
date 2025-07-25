import { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import { BrowserMultiFormatReader, DecodeHintType } from "@zxing/library";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, CameraOff, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function BarcodeScanner({ onScanSuccess, onClose, isOpen }: BarcodeScannerProps) {
  const webcamRef = useRef<Webcam>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string>("");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const { toast } = useToast();
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      readerRef.current = new BrowserMultiFormatReader();
      setIsScanning(true);
      startScanning();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [isOpen, facingMode]);

  const startScanning = useCallback(() => {
    if (!webcamRef.current || !readerRef.current) return;

    const scan = async () => {
      try {
        const canvas = webcamRef.current?.getCanvas();
        if (!canvas) return;

        // Create hints for better scanning
        const hints = new Map();
        hints.set(DecodeHintType.TRY_HARDER, true);

        // Simple barcode scanning - create a data URL and decode
        const dataUrl = canvas.toDataURL('image/jpeg');
        const result = await readerRef.current!.decodeFromImage(dataUrl);
        if (result && result.getText() !== lastScannedCode) {
          const scannedCode = result.getText();
          setLastScannedCode(scannedCode);
          
          toast({
            title: "Barcode Scanned!",
            description: `Code: ${scannedCode}`,
          });
          
          onScanSuccess(scannedCode);
          stopScanning();
        }
      } catch (error) {
        // Continue scanning - most "errors" are just failed attempts to read
      }
    };

    scanIntervalRef.current = setInterval(scan, 300);
  }, [lastScannedCode, onScanSuccess, toast]);

  const stopScanning = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsScanning(false);
  }, []);

  const toggleCamera = () => {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
  };

  const resetScanner = () => {
    setLastScannedCode("");
    if (!isScanning) {
      setIsScanning(true);
      startScanning();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Barcode Scanner
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              data-testid="button-close-scanner"
            >
              ✕
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                facingMode: facingMode,
                width: 640,
                height: 480,
              }}
              className="w-full rounded-lg"
              data-testid="webcam-scanner"
            />
            
            {/* Scanning overlay */}
            <div className="absolute inset-0 border-2 border-dashed border-blue-500 rounded-lg pointer-events-none">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-32 border-2 border-blue-500 bg-blue-500/10 rounded-lg"></div>
            </div>
            
            {isScanning && (
              <div className="absolute top-2 left-2">
                <Badge variant="default" className="bg-green-500">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
                  Scanning...
                </Badge>
              </div>
            )}
          </div>

          {lastScannedCode && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800">Last Scanned:</p>
              <p className="text-green-700 font-mono text-sm" data-testid="text-last-scanned">
                {lastScannedCode}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleCamera}
              className="flex-1"
              data-testid="button-toggle-camera"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Flip Camera
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={resetScanner}
              className="flex-1"
              data-testid="button-reset-scanner"
            >
              {isScanning ? <CameraOff className="h-4 w-4 mr-2" /> : <Camera className="h-4 w-4 mr-2" />}
              {isScanning ? "Stop" : "Start"}
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            Position the barcode within the highlighted area
          </div>
        </CardContent>
      </Card>
    </div>
  );
}