import joblib

# Load the model and scaler
model = joblib.load('calculatorPython/heart_attack_risk_model.pkl')
scaler = joblib.load('calculatorPython/scaler.pkl')

# Retrieve coefficients and intercept
coefficients = model.coef_[0]
intercept = model.intercept_[0]

# Retrieve scaler parameters
means = scaler.mean_
stds = scaler.scale_

print("Intercept:", intercept)
print("Coefficients:", coefficients)
print("Means:", means)
print("Stds:", stds)

# Save coefficients, intercept, means, and stds to a file
with open('calculatorPython/model_parameters.txt', 'w') as f:
    f.write(f"Intercept: {intercept}\n")
    f.write(f"Coefficients: {coefficients}\n")
    f.write(f"Means: {means}\n")
    f.write(f"Stds: {stds}\n")