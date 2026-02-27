# 📡 Fiber Failure Predictive Detection System

## 🚀 Project Overview
The **Fiber Failure Predictive Detection System** is an intelligent monitoring solution designed to safeguard telecommunications infrastructure. By combining **Machine Learning** with **GIS (Geographic Information System) Visualization**, the system predicts potential fiber optic link failures before they occur, allowing for proactive maintenance and minimizing network downtime.

---

## 🛠️ Technical Stack
- **Frontend Dashboard**: [Streamlit](https://streamlit.io/) – For real-time data visualization and interactive controls.
- **Machine Learning**: [Scikit-learn](https://scikit-learn.org/) – Utilizing **Random Forest** classification for high-accuracy failure prediction.
- **GIS Mapping**: [Folium](https://python-visualization.github.io/folium/) – Dynamic geospatial visualization of network health.
- **Data Processing**: [Pandas](https://pandas.pydata.org/) & [NumPy](https://numpy.org/) – For feature engineering and environmental logic simulation.

---

## 🧠 Intelligence Layer: Predictive Logic
The system doesn't just look at past data; it analyzes a multi-dimensional feature set to assess risk:

### 1. Environmental Factors
- **Rainfall Impact**: Heavy monsoon conditions are mapped against cable types.
- **Soil Condition**: Analyzes how different soil types (Clay, Sandy, Rocky, Silt) affect cable stability and corrosion.
- **Coastal Proximity**: Calculates risk based on distance to the coastline, accounting for salt-air corrosion.

### 2. Technical & Civil Factors
- **Installation Type**: Differentiates between **Overhead** (wind/tree fall risk) and **Underground** (dig-up/civil work risk) cables.
- **Maintenance Gap**: Tracks the time since the last inspection to identify "neglected" segments.
- **Civil Work Proximity**: Monitors nearby construction activities that pose a direct threat to underground links.

### 3. Historical Patterns
- **Past Fault Frequency**: Uses historical failure data to identify chronically weak infrastructure points.

---

## 📊 Key Features & Visualizations
### 📈 Real-Time Dashboard
- **Aggregate Metrics**: Instant visibility into Model Accuracy, Total Segments, and High-Risk Alerts.
- **Risk Drivers**: A bar chart breakdown showing which factors (e.g., Rainfall vs. Construction) are currently driving network instability.
- **Health Distribution**: Donut and Bar charts showing the global breakdown of Low, Medium, and High-risk segments.

### 🗺️ Interactive GIS Risk Map
- **Color-Coded Alerts**: 
  - 🔴 **Red (High Risk)**: Immediate attention required (>70% probability).
  - 🟠 **Orange (Medium Risk)**: Proactive inspection recommended (40-70% probability).
- **Smart Filtering**: Hides low-risk points to focus operator attention on critical zones.
- **Contextual Popups**: Clicking a point reveals specific localized data (Area name, installation type, exact coordinates, and primary risk factors).

---

## 🎯 Value Proposition
- **Proactive vs. Reactive**: Shift from "fixing breaks" to "preventing failures."
- **Localized Insights**: Specific focus on regional challenges like Chennai's coastal environment and monsoon patterns.
- **Operational Efficiency**: Prioritizes maintenance crews based on scientific risk assessments, saving time and resources.
