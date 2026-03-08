import random
import numpy as np

# TN Zone base coordinates for realistic technician placement
_ZONE_BASES = {
    "Coastal":      (13.0827, 80.2707), # Chennai
    "Delta":        (10.7870, 79.1378), # Thanjavur
    "Urban Metro":  (11.0168, 76.9558), # Coimbatore
    "Dry Interior": (9.9252, 78.1198),  # Madurai
    "Hill Region":  (11.4102, 76.6950), # Nilgiris (Ooty)
}

_FIRST_NAMES = ["Ramesh", "Suresh", "Karthik", "Arun", "Vijay", "Senthil", "Manoj", "Prabhu", "Deepak", "Rajesh"]
_LAST_NAMES = ["K.", "M.", "S.", "P.", "R.", "V.", "Anand", "Kumar", "Babu", "Doss"]

class Technician:
    def __init__(self, tech_id, zone, lat, lon, skill):
        self.id = tech_id
        self.name = f"{random.choice(_FIRST_NAMES)} {random.choice(_LAST_NAMES)}"
        self.contact = f"+91 {random.randint(7000, 9999)} {random.randint(10000, 99999)}"
        self.experience_years = random.randint(2, 12)
        self.rating = round(random.uniform(4.0, 5.0), 1)
        self.zone = zone
        self.lat = lat
        self.lon = lon
        self.skill_level = skill
        self.status = "Available"
        self.assigned_segment = None

# Persistent registry
TECHNICIANS = []
_current_id = 1

def _init_techs():
    global TECHNICIANS, _current_id
    if TECHNICIANS: return # Avoid re-init
    
    TECHNICIANS = []
    _current_id = 1
    for zone, coords in _ZONE_BASES.items():
        num_techs = random.randint(4, 7) # Increased fleet size
        for _ in range(num_techs):
            # Place tech within ~35km of zone base
            t_lat = coords[0] + random.uniform(-0.3, 0.3)
            t_lon = coords[1] + random.uniform(-0.3, 0.3)
            skill = random.choice(["Aerial Specialist", "General"])
            
            TECHNICIANS.append(Technician(f"TECH-{_current_id:03d}", zone, t_lat, t_lon, skill))
            _current_id += 1

# Initial seed
_init_techs()

def reset_assignments():
    """Reset status for simulation on each refresh if desired, 
    but for 'persistence' we might want to keep some on mission"""
    for t in TECHNICIANS:
        # 30% chance they stay 'on mission' from previous cycle
        if random.random() > 0.3:
            t.status = "Available"
            t.assigned_segment = None

def get_nearest_technician(segment_lat, segment_lon, fiber_type, zone_type, segment_id):
    """
    Finds and reserves a technician.
    """
    # 1. Try same zone specialists
    avail_specialists = [t for t in TECHNICIANS if t.status == "Available" and t.zone == zone_type and (fiber_type != "Aerial" or t.skill_level == "Aerial Specialist")]
    
    if not avail_specialists:
        # 2. Try same zone any skill
        avail_techs = [t for t in TECHNICIANS if t.status == "Available" and t.zone == zone_type]
    else:
        avail_techs = avail_specialists

    if not avail_techs:
        # 3. State-wide backup
        avail_techs = [t for t in TECHNICIANS if t.status == "Available"]
        
    if not avail_techs:
        return None, None

    # Calculate distances
    best_tech = None
    min_dist = float('inf')

    for t in avail_techs:
        dist = np.sqrt((t.lat - segment_lat)**2 + (t.lon - segment_lon)**2)
        if dist < min_dist:
            min_dist = dist
            best_tech = t

    if best_tech:
        best_tech.status = "On Mission"
        best_tech.assigned_segment = segment_id

    return best_tech, min_dist

def get_all_technicians():
    """Returns serialized technician for API with status"""
    return [
        {
            "id": t.id,
            "name": t.name,
            "contact": t.contact,
            "experience": t.experience_years,
            "rating": t.rating,
            "status": t.status,
            "skill": t.skill_level,
            "zone": t.zone,
            "lat": float(t.lat),
            "lon": float(t.lon),
            "assigned_to": t.assigned_segment
        } for t in TECHNICIANS
    ]
