export interface Technician {
    id: string;
    name: string;
    contact: string;
    experience: number;
    rating: number;
    status: "Available" | "Busy" | "Dispatched";
    skill: "Aerial Specialist" | "General";
    zone: string;
    assigned_to: string | null;
    lat: number;
    lon: number;
}

export interface Segment {
    segment_id: string;
    district?: string;
    latitude: number;
    longitude: number;
    risk_score: number;
    risk_level: "High" | "Moderate" | "Low";

    // Core parameters
    soil_type: string;
    fiber_type: string;
    fiber_age: number;
    maintenance_gap: number;
    past_faults?: number;

    // Environmental factors
    rainfall_mm?: number;
    groundwater?: number;
    zone_type?: string;
    cyclone_exposure?: number;
    flood_risk?: number;
    soil_shrinkage?: number;
    heat_stress_index?: number;
    landslide_risk_index?: number;
    terrain_instability_index?: number;

    // Infrastructure factors
    wind_speed?: number;
    traffic_congestion_index?: number;
    crowd_intensity_index?: number;
    signal_degradation_rate?: number;
    construction_proximity_km?: number;
    accident_density_index?: number;
    traffic_density?: number;

    // NASA & Integrated Telemetry
    nasa_rainfall_mm?: number;
    alert_type?: string | null;
    vulnerability_flag?: boolean;
    technician_required?: boolean;
    dispatch_priority_score?: number;

    // Operations & Fleet
    assigned_technician_id?: number | null;
    assigned_technician_name?: string | null;
    assigned_technician_contact?: string | null;
    estimated_arrival_time?: number | null;
    dispatch_status?: string;

    // Hybrid & Engineered Features
    is_hybrid_mode?: boolean;
    is_real_weather?: boolean;
    wind_risk_score?: number;
    rainfall_impact_score?: number;
    engineered_soil_instab?: number;
    soil_instability_index?: number;
    aerial_exposure_factor?: number;

    // Disaster Intelligence
    disaster_proximity_km?: number;
    earthquake_magnitude?: number;
    earthquake_distance_km?: number;
    composite_disaster_index?: number;
    disaster_alert_reason?: string;

    // Crowd Intelligence
    nearest_festival_name?: string;
    festival_proximity_km?: number;
}
