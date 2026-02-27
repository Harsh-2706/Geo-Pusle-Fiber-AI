import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score
import joblib

def train_model():
    # Load data
    df = pd.read_csv('synthetic_fiber_data.csv')

    # Encoding categorical features
    le = LabelEncoder()
    df['soil_type'] = le.fit_transform(df['soil_type'])

    # Features and Target
    X = df.drop(columns=['failure_next_30_days', 'latitude', 'longitude'])
    y = df['failure_next_30_days']

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Train RandomForestClassifier
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    print("Model Training Complete.")
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.2f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))

    # Save model, encoder, and feature names
    joblib.dump(model, 'fiber_model.pkl')
    joblib.dump(le, 'soil_encoder.pkl')
    joblib.dump(X.columns.tolist(), 'feature_names.pkl')
    print("Model and encoders saved.")

if __name__ == "__main__":
    train_model()
