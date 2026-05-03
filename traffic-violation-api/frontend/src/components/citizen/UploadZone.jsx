import { useState } from "react";
import { Camera, CheckCircle2, Search, AlertTriangle } from "lucide-react/dist/cjs/lucide-react";
import { useTheme } from "../../context/ThemeContext";
import Shimmer from "../ui/Shimmer";

// ✅ API key — simulateOCR import hata diya
const API_KEY = "0659fd03c96123b493befa95d6ea89a9585a83eb";

export default function UploadZone({ onOCR, onFileSelect }) {
  const { c }          = useTheme();
  const [file,     setFile]     = useState(null);
  const [ocr,      setOcr]      = useState("");
  const [scanning, setScanning] = useState(false);
  const [drag,     setDrag]     = useState(false);
  const [ocrError, setOcrError] = useState(null);

  const handleFile = async (f) => {
    if (!f) return;
    setFile(f);
    onFileSelect?.(f);   // ✅ file ReportForm ko pass karo
    setScanning(true);
    setOcr("");
    setOcrError(null);

    try {
      // ✅ Real Plate Recognizer API call
      const formData = new FormData();
      formData.append("upload", f);

      const res = await fetch("https://api.platerecognizer.com/v1/plate-reader/", {
        method: "POST",
        headers: {
          "Authorization": `Token ${API_KEY}`
        },
        body: formData
      });

      const data = await res.json();
      const plate = data.results?.[0]?.plate?.toUpperCase();

      if (plate) {
        setOcr(plate);
        onOCR?.(plate);  // ✅ ReportForm ko plate pass karo
      } else {
        setOcrError("No plate detected — enter manually.");
      }

    } catch (e) {
      console.warn("OCR failed:", e);
      setOcrError("OCR failed — enter plate manually.");
    } finally {
      setScanning(false);
    }
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
            <img
              src={URL.createObjectURL(file)}
              alt="evidence preview"
              style={{
                maxHeight: 140, maxWidth: "100%",
                borderRadius: 8, marginBottom: 10,
                objectFit: "cover"
              }}
            />
            <div style={{ color: c.green, fontWeight: 700, fontSize: 14, display: "inline-flex", alignItems: "center", gap: 8 }}>
              <CheckCircle2 size={18} /> {file.name}
            </div>
            <div style={{ color: c.muted, fontSize: 12, marginTop: 4 }}>
              {scanning ? "Detecting plate..." : "Photo selected"}
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 42, marginBottom: 10 }}><Camera size={42} /></div>
            <div style={{ color: c.text, fontWeight: 700, fontSize: 14 }}>
              Drop or click to upload evidence
            </div>
            <div style={{ color: c.muted, fontSize: 12, marginTop: 5 }}>
              JPG · PNG · HEIC · Max 10MB
            </div>
          </>
        )}
      </div>

      {/* OCR Result */}
      {(scanning || ocr || ocrError) && (
        <div style={{
          background: c.hi,
          border: `1px solid ${ocr ? c.green + "55" : ocrError ? c.red + "55" : c.border}`,
          borderRadius: 11, padding: "13px 16px",
          display: "flex", alignItems: "center", gap: 13,
        }}>
          <div style={{ fontSize: 22 }}>
            {scanning ? <Search size={22} /> : ocr ? <CheckCircle2 size={22} color={c.green} /> : <AlertTriangle size={22} color={c.red} />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: c.muted, letterSpacing: "0.08em", marginBottom: 4 }}>
              OCR — NUMBER PLATE DETECTION
            </div>

            {scanning ? (
              <div style={{ display: "flex", gap: 4 }}>
                {[...Array(8)].map((_, i) => <Shimmer key={i} w={22} h={18} r={4} />)}
              </div>
            ) : ocr ? (
              <div style={{ color: c.green, fontSize: 22, fontWeight: 900, fontFamily: "monospace", letterSpacing: 4 }}>
                {ocr}
              </div>
            ) : (
              <div style={{ color: c.red, fontSize: 13, fontWeight: 600 }}>
                {ocrError}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}