# TANFINET · Fiber Risk Prediction Platform

An ML-powered GIS intelligence platform designed to predict fiber network failures before they occur, specifically localized for the **Thanjavur District**.

---

## 🚀 Tech Stack

### **Backend (API & AI Inference)**
- **FastAPI**: High-performance Python framework for the core REST API.
- **Scikit-Learn**: Powering the Random Forest Classifier trained on fiber failure patterns.
- **Pandas & NumPy**: For real-time synthetic data generation and feature matrix manipulation.
- **Joblib**: Efficient serialization for the pre-trained model and soil type encoders.

### **Frontend (Interactive UI)**
- **Next.js 16**: Utilizing the App Router for a fast, SEO-friendly, and scalable web platform.
- **Tailwind CSS**: Modern, premium dark-themed UI with glassmorphic elements.
- **React Leaflet**: Industry-standard GIS integration for real-time map visualization.
- **Lucide React**: Vector icons for clean data presentation.

---

## 🛠️ Key Features

- **Inland GIS Mapping**: Clustered fiber segments centered on Thanjavur district towns (Kumbakonam, Papanasam, etc.) ensuring markers stay on land.
- **AI Risk Reasoning**: A side panel that provides automated behavioral insights (e.g., rainfall impact, maintenance gap analysis) based on the live dataset.
- **Real-Time Scoring**: Every refresh triggers the ML model to predict failure probabilities for 50 unique fiber segments.
- **3-Tier Risk System**:
  - 🔴 **High Risk**: Immediate maintenance required.
  - 🟠 **Moderate Risk**: Approaching critical thresholds.
  - 🟢 **Low Risk**: Healthy network segment.

---

## 📂 Project Structure

```text
TANFINET/
├── backend/
│   ├── main.py                 # FastAPI Server & CORS configuration
│   ├── services/
│   │   ├── synthetic_service.py # Thanjavur-specific data generator
│   │   └── prediction_service.py # ML Model Inference logic
│   └── model/
│       ├── fiber_model.pkl      # Pre-trained Random Forest model
│       └── soil_encoder.pkl     # LabelEncoder for soil types
├── frontend/
│   ├── app/
│   │   ├── dashboard/           # Main Risk Analytics view
│   │   └── layout.tsx           # Global theme & Hydration fixes
│   └── components/
│       ├── MapComponent.tsx     # GIS Leaflet integration
│       ├── AIAgentPanel.tsx     # Automated reasoning engine
│       └── StatsCards.tsx       # Key performance indicators
```

---

## 🏁 Getting Started

### 1. Start the Backend
```bash
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** to launch the dashboard.
