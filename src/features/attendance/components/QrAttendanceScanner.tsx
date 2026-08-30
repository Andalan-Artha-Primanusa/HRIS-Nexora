import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, CameraOff, CheckCircle2, Clock, QrCode, RefreshCw, ScanLine } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { showToast } from "@/shared/ui/toast";
import { qrAttendanceService } from "@/features/attendance/api/qr-attendance.service";
import "./QrAttendanceScanner.css";

type Props = {
  mode: "check-in" | "check-out";
};

type BarcodeDetectorLike = {
  detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>;
};

const parseQrToken = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  try {
    const parsed = JSON.parse(trimmed);
    return parsed.token || parsed.qr_token || trimmed;
  } catch {
    return trimmed;
  }
};

const getPosition = () =>
  new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  });

const QrAttendanceScanner = ({ mode }: Props) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [scannerSupported, setScannerSupported] = useState(true);
  const [manualToken, setManualToken] = useState("");
  const [lastToken, setLastToken] = useState("");
  const [status, setStatus] = useState("Siapkan kamera untuk scan QR attendance.");
  const [loading, setLoading] = useState(false);

  const title = mode === "check-in" ? "QR Check In" : "QR Check Out";
  const subtitle = mode === "check-in"
    ? "Scan QR lokasi kerja dengan kamera, lalu sistem memvalidasi GPS dan jadwal."
    : "Scan QR lokasi kerja untuk menutup attendance hari ini.";

  const actionLabel = useMemo(() => (mode === "check-in" ? "Kirim Check In" : "Kirim Check Out"), [mode]);

  const stopCamera = () => {
    scanningRef.current = false;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  useEffect(() => stopCamera, []);

  const submitToken = async (rawValue: string) => {
    const token = parseQrToken(rawValue);
    if (!token || loading) return;
    if (token === lastToken) return;

    setLastToken(token);
    setLoading(true);
    setStatus("QR terbaca. Memvalidasi attendance...");

    try {
      if (mode === "check-in") {
        const position = await getPosition();
        await qrAttendanceService.checkIn({
          token,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      } else {
        await qrAttendanceService.checkOut({ token });
      }

      showToast(`${title} berhasil`, "success");
      setStatus(`${title} berhasil tersimpan.`);
      stopCamera();
    } catch (error: any) {
      const message = error.response?.data?.message || error.response?.data?.error || `${title} gagal`;
      showToast(message, "error");
      setStatus(message);
      setTimeout(() => setLastToken(""), 1600);
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    const Detector = (window as any).BarcodeDetector;
    if (!Detector) {
      setScannerSupported(false);
      showToast("Browser belum mendukung QR scanner native. Gunakan input token manual.", "info");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      setStatus("Kamera aktif. Arahkan ke QR attendance.");
      scanningRef.current = true;

      const detector = new Detector({ formats: ["qr_code"] }) as BarcodeDetectorLike;
      const scan = async () => {
        if (!scanningRef.current || !videoRef.current) return;
        try {
          const barcodes = await detector.detect(videoRef.current);
          const rawValue = barcodes[0]?.rawValue;
          if (rawValue) {
            await submitToken(rawValue);
            return;
          }
        } catch {
          setScannerSupported(false);
          setStatus("Scanner QR tidak tersedia di browser ini. Gunakan input token manual.");
          stopCamera();
          return;
        }
        window.setTimeout(scan, 600);
      };
      void scan();
    } catch {
      showToast("Kamera tidak bisa diakses. Izinkan akses kamera dari browser.", "error");
      setStatus("Kamera tidak bisa diakses.");
    }
  };

  return (
    <div className="qr-attendance">
      <Card className="hero-card">
        <div className="hero-card-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <QrCode size={16} />
              <span>Kehadiran QR</span>
            </div>
            <h1 className="hero-title">{title}</h1>
            <p className="hero-subtitle">{subtitle}</p>
          </div>
          <div className="hero-actions">
            <Button variant="outline" size="md" onClick={cameraActive ? stopCamera : startCamera} disabled={loading}>
              {cameraActive ? <CameraOff size={16} /> : <Camera size={16} />}
              {cameraActive ? "Matikan Kamera" : "Aktifkan Kamera"}
            </Button>
          </div>
        </div>
      </Card>

      <div className="attendance-status-card">
        <CheckCircle2 size={22} />
        <div>
          <p>Status</p>
          <strong>{status}</strong>
        </div>
      </div>

      <Card className="qr-scan-card">
        <div className="qr-video-frame">
          <video ref={videoRef} muted playsInline />
          {!cameraActive && (
            <div className="qr-video-placeholder">
              <ScanLine size={42} />
              <span>Kamera belum aktif</span>
            </div>
          )}
        </div>

        <div className="qr-manual-panel">
          <div>
            <h2>Token QR Manual</h2>
            <p>{scannerSupported ? "Fallback jika kamera sulit membaca QR." : "Browser ini membutuhkan input token manual."}</p>
          </div>
          <div className="qr-manual-form">
            <input value={manualToken} onChange={(event) => setManualToken(event.target.value)} placeholder="Tempel token QR attendance" />
            <Button variant="primary" size="md" onClick={() => submitToken(manualToken)} disabled={loading || !manualToken.trim()}>
              {loading ? <RefreshCw size={16} /> : <Clock size={16} />}
              {loading ? "Memproses..." : actionLabel}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QrAttendanceScanner;
