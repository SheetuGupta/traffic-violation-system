import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useReports } from "../../context/ReportsContext";
import { useTheme } from "../../context/ThemeContext";

// Fix for default leaflet marker icon issue in react
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// A simple mock geocoder to map some common text locations to coords
// in a real app, this would use an actual geocoding API.
const getCoordinates = (locationText) => {
  if (!locationText || locationText === "N/A") return null;
  const t = locationText.toLowerCase();
  
  // Base coordinates (e.g. Delhi center)
  let lat = 28.6139;
  let lng = 77.2090;

  // Add some pseudo-random jitter based on the string to spread markers around
  let hash = 0;
  for (let i = 0; i < t.length; i++) {
    hash = t.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const jitterLat = (hash % 100) / 10000;
  const jitterLng = ((hash >> 4) % 100) / 10000;

  return [lat + jitterLat, lng + jitterLng];
};

export default function ViolationMap() {
  const { reports } = useReports();
  const { c } = useTheme();

  const markers = useMemo(() => {
    const arr = [];
    reports.forEach(r => {
      const coords = getCoordinates(r.location);
      if (coords) {
        arr.push({ ...r, coords });
      }
    });
    return arr;
  }, [reports]);

  if (reports.length === 0) return null;

  return (
    <div style={{ 
      height: 400, 
      width: "100%", 
      borderRadius: 12, 
      overflow: "hidden",
      border: `1px solid ${c.border}` 
    }}>
      <MapContainer 
        center={[28.6139, 77.2090]} 
        zoom={12} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {markers.map(m => (
          <CircleMarker 
            key={m.id} 
            center={m.coords}
            radius={8}
            pathOptions={{ 
              color: m.status === 'PENDING' ? c.yellow : 
                     m.status === 'APPROVED' ? c.green : 
                     m.status === 'REJECTED' ? c.red : c.purple,
              fillColor: m.status === 'PENDING' ? c.yellow : 
                         m.status === 'APPROVED' ? c.green : 
                         m.status === 'REJECTED' ? c.red : c.purple,
              fillOpacity: 0.7 
            }}
          >
            <Popup>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <strong>{m.vehicleNumber}</strong>
                <span>{m.type}</span>
                <span style={{ color: "red" }}>₹{m.fine}</span>
                <span>{m.location}</span>
                <span>{m.status}</span>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
