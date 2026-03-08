"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Segment, Technician } from "@/types/segment";
import { useState } from "react";

interface Props {
    segments: Segment[];
    technicians?: Technician[];
    onSelect?: (segment: Segment) => void;
}

function markerColor(level: string) {
    if (level === "High") return "#ef4444";     // red-500
    if (level === "Moderate") return "#f97316"; // orange-500
    return "#22c55e";                            // green-500
}

export default function MapComponent({ segments, technicians, onSelect }: Props) {
    const [constructionSites, setConstructionSites] = useState<{ lat: number, lon: number }[]>([]);
    const [disasters, setDisasters] = useState<{ disasters: any[], earthquakes: any[] }>({ disasters: [], earthquakes: [] });

    useEffect(() => {
        const fetchSites = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { 'Authorization': `Bearer ${token}` };
                const res = await fetch("http://127.0.0.1:8000/predictions/construction-sites", { headers });
                if (res.ok) setConstructionSites(await res.json());

                const dRes = await fetch("http://127.0.0.1:8000/predictions/disasters", { headers });
                if (dRes.ok) setDisasters(await dRes.json());
            } catch (e) {
                console.error("Failed to fetch data", e);
            }
        };
        fetchSites();
    }, []);

    const center: [number, number] = [11.1271, 78.6569]; // Center of Tamil Nadu

    return (
        <MapContainer
            center={center}
            zoom={7}
            className="w-full h-full rounded-xl z-0"
            style={{ minHeight: "420px" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Segments Layer */}
            {(Array.isArray(segments) ? segments : []).map((seg) => (
                <CircleMarker
                    key={seg.segment_id}
                    center={[seg.latitude, seg.longitude]}
                    radius={8}
                    pathOptions={{
                        fillColor: markerColor(seg.risk_level),
                        color: "#fff",
                        weight: 1.2,
                        fillOpacity: 0.85,
                    }}
                    eventHandlers={{
                        click: () => onSelect?.(seg)
                    }}
                >
                    <Tooltip>
                        <div className="text-xs leading-snug font-sans">
                            <p className="font-bold border-b border-gray-200 pb-1 mb-1">{seg.segment_id} ({seg.district})</p>
                            <p className="text-blue-600 font-semibold">{seg.zone_type} Zone</p>
                            <p className="mt-1">Risk: <span className={seg.risk_level === 'High' ? 'text-red-500 font-bold' : ''}>{seg.risk_level}</span></p>
                            <p>Score: {(seg.risk_score * 100).toFixed(1)}%</p>

                            <div className="mt-2 pt-1 border-t border-gray-100 flex flex-col gap-0.5">
                                {seg.disaster_alert_reason ? <p className="text-red-500 font-bold">⚠️ {seg.disaster_alert_reason}</p> : null}
                                {seg.cyclone_exposure ? <p>Cyclone Exp: {seg.cyclone_exposure}</p> : null}
                                {seg.flood_risk ? <p>Flood Risk: {seg.flood_risk}</p> : null}
                                {seg.earthquake_magnitude ? <p>Seismic (M): {seg.earthquake_magnitude}</p> : null}
                                {seg.nearest_festival_name ? <p className="text-purple-600 font-black">🎉 Crowd Risk: {seg.nearest_festival_name}</p> : null}
                            </div>
                        </div>
                    </Tooltip>
                </CircleMarker>
            ))}

            {/* NASA Disaster Layer */}
            {disasters.disasters.map((d, idx) => (
                <CircleMarker
                    key={`d-${idx}`}
                    center={[d.lat, d.lon]}
                    radius={12}
                    pathOptions={{
                        fillColor: "#9333ea", // purple-600
                        color: "#fff",
                        weight: 2,
                        fillOpacity: 0.6,
                    }}
                >
                    <Tooltip permanent={false}>
                        <div className="text-[10px] p-1">
                            <p className="font-black text-purple-600">📡 NASA EVENT</p>
                            <p className="font-bold">{d.type}</p>
                            <p className="text-gray-500 text-[9px]">{d.title}</p>
                        </div>
                    </Tooltip>
                </CircleMarker>
            ))}

            {/* USGS Earthquake Layer */}
            {disasters.earthquakes.map((eq, idx) => (
                <CircleMarker
                    key={`eq-${idx}`}
                    center={[eq.lat, eq.lon]}
                    radius={eq.mag * 3}
                    pathOptions={{
                        fillColor: "#dc2626", // red-600
                        color: "#fff",
                        weight: 1.5,
                        fillOpacity: 0.4,
                    }}
                >
                    <Tooltip>
                        <div className="text-[10px] p-1">
                            <p className="font-black text-red-600">🔴 EARTHQUAKE M{eq.mag}</p>
                            <p>{eq.place}</p>
                        </div>
                    </Tooltip>
                </CircleMarker>
            ))}

            {(Array.isArray(technicians) ? technicians : []).map((tech: Technician) => (
                <CircleMarker
                    key={tech.id}
                    center={[tech.lat, tech.lon]}
                    radius={5}
                    pathOptions={{
                        fillColor: tech.status === "Available" ? "#3b82f6" : "#eab308",
                        color: "#fff",
                        weight: 1,
                        fillOpacity: 1,
                    }}
                >
                    <Tooltip>
                        <div className="text-[10px] leading-tight font-sans">
                            <p className="font-bold text-blue-600 border-b border-gray-100 pb-0.5 mb-0.5">{tech.name} ({tech.id})</p>
                            <p className="font-bold uppercase tracking-tighter">Status: <span className={tech.status === 'Available' ? 'text-green-500' : 'text-yellow-600'}>{tech.status}</span></p>
                            <p>Skill: {tech.skill}</p>
                        </div>
                    </Tooltip>
                </CircleMarker>
            ))}

            {constructionSites.map((site, idx) => (
                <CircleMarker
                    key={`cs-${idx}`}
                    center={[site.lat, site.lon]}
                    radius={6}
                    pathOptions={{
                        fillColor: "#eab308", // yellow-500
                        color: "#fff",
                        weight: 1.5,
                        fillOpacity: 0.9,
                        dashArray: "4 4"
                    }}
                >
                    <Tooltip>
                        <div className="text-[10px] leading-tight font-sans text-center">
                            <p className="font-bold text-yellow-600 border-b border-gray-100 pb-0.5 mb-0.5 uppercase tracking-widest">⚠️ Gov Construction Zone</p>
                        </div>
                    </Tooltip>
                </CircleMarker>
            ))}
        </MapContainer>
    );
}
