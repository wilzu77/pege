'use client';
import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
const QR_STRING =
  '00020101021126610014COM.GO-JEK.WWW01189360091432912413060210G2912413060303UMI51440014ID.CO.QRIS.WWW0215ID10265466090450303UMI5204899953033605802ID5925wilzu stro, Digital & Kre6008SUKABUMI61054336262070703A016304EF97';
export default function StaticQR() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        QR_STRING,
        { width: 220, margin: 2 },
        (error) => {
          if (error) console.error('QR Gagal generate:', error);
        }
      );
    }
  }, []);

  return (
    <div className="qr-box">
      <canvas ref={canvasRef} />
      <p style={{ marginTop: '8px', fontSize: '0.8rem', color: '#6b5a4a', textAlign: 'center' }}>
        ↻ Scan QRIS Statik ini & input nominal
      </p>
    </div>
  );
}
