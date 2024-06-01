import joblib

# Load the model
model = joblib.load('heart_attack_risk_model.pkl')

# Retrieve coefficients and intercept
coefficients = model.coef_[0]
intercept = model.intercept_[0]

print("Intercept:", intercept)
print("Coefficients:", coefficients)
