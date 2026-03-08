# GeoPulse Fiber AI Platform

Here is a complete breakdown of the technology stack and architecture powering the GeoPulse Fiber AI platform:

### 1. Frontend Operations (Client-Side)
*   **Core Framework**: Built on **Next.js 14** (App Router) and **React 18**, offering server-side rendering benefits and a robust routing system.
*   **Language**: **TypeScript**, ensuring strict type safety across complex data structures like segments, technicians, and telemetry features.
*   **Mapping Engine**: **React-Leaflet** (`leaflet`) powers the interactive GIS map. It dynamically plots heatmaps, fiber lines, construction zones, and NASA disaster events over OpenStreetMap tiles.
*   **Styling & UI**: **Tailwind CSS** forms the styling foundation, providing a dark-mode, high-contrast, "Apple-style" aesthetic. It's paired with **Framer Motion** for liquid-smooth transitions, slide-overs, and drawing paths (like the circular risk percentage loaders).
*   **Iconography & Assets**: **Lucide React** is used for modern, consistent vector iconography.

### 2. Backend & ML Operations (Server-Side)
*   **Web Framework**: **FastAPI** (Python 3.12+), chosen for its asynchronous nature (`asyncio`), speed, and automatic Swagger documentation. It manages endpoints flawlessly and handles the continuous background simulation loops.
*   **Machine Learning Engine**: **Scikit-Learn**. An offline-trained Random Forest Classifier (`fiber_model.pkl`) evaluates multiple failure modes (weather, crowds, terrain). `joblib` is used to load the pre-trained models and label encoders (`soil_encoder.pkl`) into memory for ~10ms inference times.
*   **Data Processing Pipeline**: **Pandas** and **NumPy** handle the heavy lifting of joining, transforming, and augmenting the JSON payloads into vectorized numeric matrices before they are fed to the ML model.

### 3. Real-Time Intelligence & External Integrations
*   **Live Weather Dynamics**: Integrates with the **Open-Meteo API** to pull live parameters (precipitation, 10m wind speeds, temperatures) down to specific latitude/longitude points.
*   **Disaster & Seismic Telemetry**:
    *   **NASA EONET API**: Actively polls for severe storms, floods, and natural events worldwide.
    *   **USGS Earthquakes API**: Tracks seismic events globally to calculate disruption probability via Haversine distance formulas.

### 4. System Architecture
*   **Stateful Simulation**: A persistent background runner in `state_service.py` artificially "drifts" metrics like signal degradation over time, creating a breathing, living system where risks rise organically and trigger the ML model.
*   **Smart Dispatching Engine**: Automatically searches out the closest technician with the correct skill matching the failure cause, handling ETA calculations, mapping, and mission deployment tracking.
*   **Browser Audio API**: Uses the native **Web Speech Synthesis API** combined with audio contexts to play alert chimes and read out "Critical Alert" warnings out loud to the operator.
