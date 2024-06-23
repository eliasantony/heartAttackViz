import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.impute import SimpleImputer
import joblib
from sklearn.preprocessing import StandardScaler

# Load dataset
data = pd.read_csv('./data/heart_attack_prediction_dataset.csv')

# Map categorical variables to numeric
data['Sex'] = data['Sex'].map({'Male': 1, 'Female': 0})
data['Cholesterol Risk'] = data['Cholesterol Risk'].map({'Desirable': 0, 'Borderline': 1, 'High': 2})
data['Blood Pressure Risk'] = data['Blood Pressure Risk'].map({'Normal': 0, 'Elevated': 1, 'Hypertension': 2})
data['BMI Category'] = data['BMI Category'].map({'Underweight': 0, 'Normal': 1, 'Overweight': 2, 'Obese': 3})
data['Diet'] = data['Diet'].map({'Unhealthy': 0, 'Average': 1, 'Healthy': 2})
def categorize_stress_level(value):
    if value <= 3:
        return 'Low'
    elif 4 <= value <= 7:
        return 'Moderate'
    else:
        return 'High'

data['Stress Level Category'] = data['Stress Level'].apply(categorize_stress_level)

# Define features and target
features = [
    'Age', 'Sex', 'BMI Category', 'Family History', 'Previous Heart Problems', 
    'Medication Use', 'Smoking', 'Alcohol Consumption', 'Diet', 
    'Exercise Hours Per Week', 'Physical Activity Days Per Week', 'Sleep Hours Per Day', 'Stress Level'
]
X = data[features]
y = data['Heart Attack Risk']

# Handle missing values
imputer = SimpleImputer(strategy='mean')
X = imputer.fit_transform(X)

# Scale features
scaler = StandardScaler()
X = scaler.fit_transform(X)

# Split data into training and test sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train a logistic regression model
model = LogisticRegression(max_iter=1000)  # Increased max_iter to ensure convergence
model.fit(X_train, y_train)

# Evaluate the model
y_pred = model.predict(X_test)
print(f'Accuracy: {accuracy_score(y_test, y_pred)}')

# Save the model and scaler
joblib.dump(model, 'calculatorPython/heart_attack_risk_model.pkl')
joblib.dump(scaler, 'calculatorPython/scaler.pkl')