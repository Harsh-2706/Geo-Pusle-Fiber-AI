import pandas as pd
import folium
import joblib

def generate_map():
    # Load data
    df = pd.read_csv('synthetic_fiber_data.csv')
    
    # Load model and encoders
    model = joblib.load('fiber_model.pkl')
    le = joblib.load('soil_encoder.pkl')
    feature_names = joblib.load('feature_names.pkl')

    # Preprocess
    df_for_pred = df.copy()
    df_for_pred['soil_type'] = le.transform(df_for_pred['soil_type'])
    
    # Get probabilities
    X = df_for_pred[feature_names]
    probabilities = model.predict_proba(X)[:, 1]
    df['risk_percentage'] = probabilities * 100

    # Initialize map (Centered at Tamil Nadu area)
    m = folium.Map(location=[13.0827, 80.2707], zoom_start=11)

    def get_color(risk):
        if risk < 30:
            return 'green'
        elif risk < 70:
            return 'orange'
        else:
            return 'red'

    # Add points to map
    for idx, row in df.iterrows():
        color = get_color(row['risk_percentage'])
        folium.CircleMarker(
            location=[row['latitude'], row['longitude']],
            radius=5,
            popup=(
                f"Risk: {row['risk_percentage']:.2f}%<br>"
                f"Past Faults: {row['past_faults']}<br>"
                f"Rainfall: {row['rainfall_mm']:.1f}mm<br>"
                f"Soil: {row['soil_type']}"
            ),
            color=color,
            fill=True,
            fill_color=color,
            fill_opacity=0.7
        ).add_to(m)

    m.save('fiber_risk_map.html')
    print("GIS Map generated: fiber_risk_map.html")

if __name__ == "__main__":
    generate_map()
