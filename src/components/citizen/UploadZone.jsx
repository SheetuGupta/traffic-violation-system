import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import Shimmer from "../ui/Shimmer";
import { simulateOCR } from "../../utils/helpers";

export default function UploadZone({ onOCR }) {
  const { c } = useTheme();
  const [file,     setFile]     = useState(null);
  const [ocr,      setOcr]      = useState("");
  const [scanning, setScanning] = useState(false);
  const [drag,     setDrag]     = useState(false);

  const handleFile = (f) => {
    setFile(f);
    setScanning(true);
    setOcr("");
    simulateOCR((plate) => {
      setOcr(plate);
      setScanning(false);
      onOCR?.(plate);
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => document.getElementById("upload-input").click()}
        style={{
          border: `2px dashed ${drag ? c.accent : c.border}`,
          borderRadius: 13, padding: "34px 20px", textAlign: "center",
          background: drag ? c.accentGlow : c.hi,
          cursor: "pointer", transition: "all 0.3s",
        }}
      >
        <input
          id="upload-input" type="file" hidden accept="image/*"
          onChange={e => handleFile(e.target.files[0])}
        />
        {file ? (
          <>
            <div style={{ fontSize: 42, marginBottom: 8 }}>📸</div>
            <div style={{ color: c.green, fontWeight: 700, fontSize: 14 }}>{file.name}</div>
            <div style={{ color: c.muted, fontSize: 12, marginTop: 4 }}>OCR engine processing...</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 42, marginBottom: 10 }}>📷</div>
            <div style={{ color: c.text, fontWeight: 700, fontSize: 14 }}>
              Drop or click to upload evidence
            </div>
            <div style={{ color: c.muted, fontSize: 12, marginTop: 5 }}>JPG · PNG · HEIC · Max 10MB</div>
          </>
        )}
      </div>

      {/* OCR Result */}
      {(scanning || ocr) && (
        <div style={{
          background: c.hi,
          border: `1px solid ${ocr ? c.green + "55" : c.border}`,
          borderRadius: 11, padding: "13px 16px",
          display: "flex", alignItems: "center", gap: 13,
        }}>
          <div style={{ fontSize: 22 }}>{scanning ? "🔍" : "✅"}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: c.muted, letterSpacing: "0.08em", marginBottom: 4 }}>
              OCR — NUMBER PLATE DETECTION
            </div>
            {scanning ? (
              <div style={{ display: "flex", gap: 4 }}>
                {[...Array(8)].map((_, i) => <Shimmer key={i} w={22} h={18} r={4} />)}
              </div>
            ) : (
              <div style={{ color: c.green, fontSize: 22, fontWeight: 900, fontFamily: "monospace", letterSpacing: 4 }}>
                {ocr}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
