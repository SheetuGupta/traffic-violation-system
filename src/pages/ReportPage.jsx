import { useTheme }  from "../context/ThemeContext";
import GlitchText  from "../components/ui/GlitchText";
import ReportForm  from "../components/citizen/ReportForm";

export default function ReportPage({ setTab }) {
  const { c } = useTheme();
  return (
    <div style={{ maxWidth: 620, margin: "0 auto" }}>
      <div className="fade-up" style={{ marginBottom: 22 }}>
        <GlitchText text="Report a Violation" color={c.text} size={21} />
        <div style={{ color: c.muted, fontSize: 13, marginTop: 6 }}>
          Upload evidence · OCR auto-extracts plate · Submit instantly
        </div>
      </div>
      <ReportForm onSuccess={() => setTab("myreports")} />
    </div>
  );
}
