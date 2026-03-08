import pandas as pd
import joblib
from sklearn.metrics import accuracy_score, classification_report, mean_squared_error
import numpy as np

def compute_accuracy():
    try:
        # Load the model and preprocessing objects
        model = joblib.load('model/fiber_model.pkl')
        feature_names = joblib.load('model/feature_names.pkl')
        le_soil = joblib.load('model/soil_encoder.pkl')
            
        # Load the data
        df = pd.read_csv('../synthetic_fiber_data.csv')
        
        # Prepare features
        X = df.copy()
        # Encode soil_type if it's there
        if 'soil_type' in X.columns:
            X['soil_type'] = le_soil.transform(X['soil_type'])
            
        # Select features used by the model
        X = X[feature_names]
        
        # Predicted Risk Score (regression)
        y_pred_score = model.predict(X)
        
        # For "accuracy", we need a classification target.
        # The data generation likely created a 'risk_level' or similar, 
        # but the model itself predicts a score.
        # Let's see if there's a risk_level in the original data to compare against.
        
        if 'failure_next_30_days' in df.columns:
            # Predict labels
            y_pred_labels = model.predict(X)
            accuracy = accuracy_score(df['failure_next_30_days'], y_pred_labels)
            with open('out_accuracy.txt', 'w') as outf:
                outf.write(f"Model Accuracy (RF Binary Classification): {accuracy:.4f}\n")
                outf.write("\nClassification Report:\n")
                outf.write(classification_report(df['failure_next_30_days'], y_pred_labels))
        else:
            with open('out_accuracy.txt', 'w') as outf:
                outf.write("No 'failure_next_30_days' found in dataset.\n")
            
        # Regression metrics
        if 'risk_score' in df.columns:
            mse = mean_squared_error(df['risk_score'], y_pred_score)
            rmse = np.sqrt(mse)
            with open('out_accuracy.txt', 'a') as outf:
                outf.write(f"Model RMSE (Regression): {rmse:.4f}\n")
            
    except Exception as e:
        with open('out_accuracy.txt', 'w') as outf:
            outf.write(f"Error computing accuracy: {e}")

if __name__ == "__main__":
    compute_accuracy()
