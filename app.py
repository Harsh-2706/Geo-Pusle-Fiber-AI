import streamlit as st
import pandas as pd
import numpy as np
import random
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import folium
from streamlit_folium import st_folium
import plotly.express as px

# Set page config
st.set_page_config(page_title="Fiber Failure Predictive Dashboard", layout="wide")

st.title("📡 Fiber Failure Predictive Detection System")
st.markdown("Predicting fiber link failures using Machine Learning and GIS visualization.")

# --- Data Generation Engine ---
@st.cache_data
def load_data(samples=600):
    np.random.seed(42)
    random.seed(42)

    # Features
    past_faults = np.random.poisson(lam=1.2, size=samples)
    rainfall_mm = np.random.uniform(0, 600, size=samples)
    construction_distance_m = np.random.uniform(0, 400, size=samples)
    soil_types = ['Clay', 'Sandy', 'Rocky', 'Silt']
    soil_type = [random.choice(soil_types) for _ in range(samples)]
    traffic_density = np.random.uniform(10, 100, size=samples)
    maintenance_gap_days = np.random.randint(5, 400, size=samples)

    # South Chennai / Suburb Areas
    areas = ['Velachery', 'Guduvanchery', 'Kattankulathur', 'Tambaram', 'Perungalathur', 'Vandalur', 'Potheri', 'Pallavaram']
    area = [random.choice(areas) for _ in range(samples)]

    # Chennai Coordinates (Adjusted to land-only, avoiding Bay of Bengal)
    # Chennai longitude is ~80.27. Land is roughly west of 80.26.
    lat_base, lon_base = 13.04, 80.18 
    latitudes = lat_base + np.random.uniform(-0.08, 0.08, size=samples)
    longitudes = lon_base + np.random.uniform(-0.08, 0.08, size=samples)

    # Research-Backed Features
    installation_types = ['Underground', 'Overhead']
    installation_type = [random.choice(installation_types) for _ in range(samples)]
    # Distance to Chennai Coastline (approx lon 80.27)
    dist_to_coastline_km = np.abs(np.array(longitudes) - 80.27) * 111 # Approx deg to km conversion

    # Logic-based target generation (State-wide / Research-backed logic)
    # Factors: Overhead cables + high rain = high risk; Coastal proximity = high corrosion risk
    failure_score = (
        0.4 * (past_faults / 3) +
        0.2 * (maintenance_gap_days / 300) +
        0.15 * (rainfall_mm / 600) +
        -0.1 * (construction_distance_m / 400) +
        0.15 * (10 / (dist_to_coastline_km + 1)) # Coastal proximity risk
    )
    
    # Impact of Installation Type during rain
    for i in range(samples):
        if installation_type[i] == 'Overhead' and rainfall_mm[i] > 300:
            failure_score[i] += 0.25 # Wind/Tree fall risk during monsoon
        if installation_type[i] == 'Underground' and construction_distance_m[i] < 50:
            failure_score[i] += 0.2 # Dig-up risk for underground
    
    # Add strong soil impact
    soil_impact_strong = {'Clay': 0.15, 'Sandy': 0.05, 'Rocky': -0.15, 'Silt': 0.0}
    failure_score += np.array([soil_impact_strong[s] for s in soil_type])
    
    # Threshold for binary target
    failure_next_30_days = (failure_score > 0.65).astype(int)

    df = pd.DataFrame({
        'past_faults': past_faults,
        'rainfall_mm': rainfall_mm,
        'construction_distance_m': construction_distance_m,
        'soil_type': soil_type,
        'installation_type': installation_type,
        'dist_to_coast_km': dist_to_coastline_km,
        'area_name': area,
        'traffic_density': traffic_density,
        'maintenance_gap_days': maintenance_gap_days,
        'latitude': latitudes,
        'longitude': longitudes,
        'failure_next_30_days': failure_next_30_days
    })
    return df

# --- Model Engine ---
def train_and_predict(df):
    le_soil = LabelEncoder()
    le_inst = LabelEncoder()
    
    df_encoded = df.copy()
    df_encoded['soil_type'] = le_soil.fit_transform(df['soil_type'])
    df_encoded['installation_type'] = le_inst.fit_transform(df['installation_type'])
    
    # Drop non-feature columns
    X = df_encoded.drop(columns=['failure_next_30_days', 'latitude', 'longitude', 'area_name'])
    y = df_encoded['failure_next_30_days']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    acc = accuracy_score(y_test, model.predict(X_test))
    
    # Generate probabilities for ALL data
    risk_probs = model.predict_proba(X)[:, 1]
    df['risk_percentage'] = risk_probs * 100
    
    return acc, model, X.columns

# --- Main Application Logic ---
data = load_data()
accuracy, trained_model, feature_cols = train_and_predict(data)

# --- UI Layout ---
col1, col2, col3 = st.columns(3)
col1.metric("Model Accuracy", f"{accuracy:.2%}")
col2.metric("Total Fiber Segments", len(data))
high_risk_count = len(data[data['risk_percentage'] > 70])
col3.metric("High-Risk Segments (>70%)", high_risk_count)

st.divider()

left_pane, right_pane = st.columns([1, 1])

with left_pane:
    st.subheader("📊 Model Insights")
    
    # Risk Category for Visualization
    def get_level(risk):
        if risk < 40: return 'Low'
        elif risk <= 70: return 'Medium'
        else: return 'High'
    
    data['risk_level'] = data['risk_percentage'].apply(get_level)
    
    # Custom Color Map for Consistency
    color_map = {'Low': '#28a745', 'Medium': '#fd7e14', 'High': '#dc3545'}

    # Feature Importance Plot
    importances = trained_model.feature_importances_
    feat_df = pd.DataFrame({'Feature': feature_cols, 'Importance': importances}).sort_values('Importance', ascending=False)
    feat_df['Feature'] = feat_df['Feature'].str.replace('_', ' ').str.title()
    
    fig_imp = px.bar(feat_df, x='Importance', y='Feature', orientation='h', title="Key Risk Drivers (Environmental & Technical)", 
                     color='Importance', color_continuous_scale='Blues',
                     labels={'Importance': 'Relevance Score', 'Feature': 'Network Parameter'})
    fig_imp.update_layout(xaxis_title="Relative Impact on Failure Probability", yaxis_title="Monitored Parameter")
    st.plotly_chart(fig_imp, width='stretch')
    
    # NEW Global Risk Profile: Donut Chart
    st.markdown("---")
    st.subheader("📊 Global Risk Breakdown")
    
    risk_counts = data['risk_level'].value_counts().reset_index()
    risk_counts.columns = ['Level', 'Count']
    # Ensure correct order
    level_order = {'Low': 0, 'Medium': 1, 'High': 2}
    risk_counts['order'] = risk_counts['Level'].map(level_order)
    risk_counts = risk_counts.sort_values('order')

    fig_donut = px.pie(risk_counts, values='Count', names='Level', hole=0.5,
                       title="Network Health Distribution",
                       color='Level', color_discrete_map=color_map)
    fig_donut.update_traces(textposition='inside', textinfo='percent+label')
    st.plotly_chart(fig_donut, width='stretch')

    # NEW Global Risk Profile: Categorical Bar Chart
    fig_bar = px.bar(risk_counts, x='Level', y='Count', title="Segment Count by Risk Severity",
                     color='Level', color_discrete_map=color_map,
                     labels={'Count': 'Number of Fiber Segments', 'Level': 'Risk Severity Level'})
    fig_bar.update_layout(showlegend=False)
    st.plotly_chart(fig_bar, width='stretch')

with right_pane:
    st.subheader("🗺️ Critical Alert Map (Land-Only)")
    st.caption("Displaying High (>70%) and Medium (40-70%) risk segments only. Low risk points are hidden to reduce clutter.")
    
    # Create Folium Map
    m = folium.Map(location=[13.04, 80.18], zoom_start=11)
    
    def get_color(risk):
        if risk < 40: return 'green'
        elif risk <= 70: return 'orange'
        else: return 'red'

    def get_level(risk):
        if risk < 40: return 'Low'
        elif risk <= 70: return 'Medium'
        else: return 'High'

    points_on_map = 0
    for _, row in data.iterrows():
        # FILTER: Only show Medium and High Risk
        if row['risk_percentage'] < 40:
            continue
            
        points_on_map += 1
        color = get_color(row['risk_percentage'])
        level = get_level(row['risk_percentage'])
        
        # Enhanced Popup Text
        popup_text = f"""
        <div style="font-family: Arial; width: 220px;">
            <h4 style="margin-bottom:5px; color:{color};">Risk: {row['risk_percentage']:.2f}% ({level})</h4>
            <hr style="margin:5px 0;">
            <b>Area:</b> {row['area_name']}<br>
            <b>Installation:</b> {row['installation_type']}<br>
            <b>Coordinates:</b> {row['latitude']:.6f}, {row['longitude']:.6f}<br>
            <b>Coastal Dist:</b> {row['dist_to_coast_km']:.1f} km<br>
            <br>
            <b>Past Faults:</b> {row['past_faults']}<br>
            <b>Rainfall:</b> {row['rainfall_mm']:.1f} mm<br>
            <b>Soil Condition:</b> {row['soil_type']}
        </div>
        """
        
        folium.CircleMarker(
            location=[row['latitude'], row['longitude']],
            radius=7,
            color=color,
            fill=True,
            fill_color=color,
            fill_opacity=0.8,
            popup=folium.Popup(popup_text, max_width=300)
        ).add_to(m)
    
    if points_on_map == 0:
        st.info("No High or Medium risk segments identified in the current dataset.")
    else:
        st_folium(m, height=500, width='stretch')


st.sidebar.header("Data Parameters")
st.sidebar.write("Synthetic data generated for Chennai region with logic based on maintenance history, weather, and environmental factors.")
if st.sidebar.button("Re-generate Data"):
    st.cache_data.clear()
    st.rerun()
