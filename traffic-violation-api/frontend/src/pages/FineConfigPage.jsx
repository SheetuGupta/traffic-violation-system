import { useState, useEffect } from "react";
import api from "../axiosConfig";
import { useTheme } from "../context/ThemeContext";
import SpotlightCard from "../components/ui/SpotlightCard";

export default function FineConfigPage() {
  const { c } = useTheme();
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);

  // default violations
  const DEFAULT_TYPES = [
    "Red Light Jump",
    "No Helmet",
    "Overspeeding",
    "Wrong Parking",
    "Driving on Wrong Side"
  ];

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const res = await api.get("/fine-configurations");
      
      const merged = DEFAULT_TYPES.map(type => {
        const existing = res.data.find(c => c.violationType === type);
        return existing || { violationType: type, amount: 0 };
      });
      
      // Add any custom ones from db
      res.data.forEach(dbConfig => {
        if (!DEFAULT_TYPES.includes(dbConfig.violationType)) {
          merged.push(dbConfig);
        }
      });
      
      setConfigs(merged);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (violationType, amount) => {
    try {
      await api.post("/fine-configurations", { violationType, amount: Number(amount) });
      fetchConfigs();
    } catch (err) {
      console.error(err);
    }
  };

  const inp = {
    padding: "8px 12px", borderRadius: 8, fontSize: 13,
    background: c.hi, border: `1px solid ${c.border}`,
    color: c.text, outline: "none", fontFamily: "inherit",
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <SpotlightCard style={{ padding: 22 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: c.text, marginBottom: 16 }}>
          DYNAMIC FINE CONFIGURATION
        </div>
        <div style={{ fontSize: 12, color: c.muted, marginBottom: 20 }}>
          Set the default fine amounts for each violation type. These values will be used when new violations are detected.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {configs.map(config => (
            <div key={config.violationType} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 16px", background: c.hi, borderRadius: 10, border: `1px solid ${c.border}`
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: c.text }}>
                {config.violationType}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: c.muted, fontSize: 14 }}>₹</span>
                <input
                  type="number"
                  style={{ ...inp, width: 100 }}
                  defaultValue={config.amount}
                  onBlur={(e) => handleUpdate(config.violationType, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </SpotlightCard>
    </div>
  );
}
