import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.impute import SimpleImputer
import joblib

# Load dataset
data = pd.read_csv('data\heart_attack_prediction_dataset.csv')

# Preprocess the data (this is a simplified example, adjust as needed)
# Map categorical variables to numeric
data['Sex'] = data['Sex'].map({'Male': 1, 'Female': 0})
data['Family History'] = data['Family History'].map({'Yes': 1, 'No': 0})
data['Previous Heart Problems'] = data['Previous Heart Problems'].map({'Yes': 1, 'No': 0})
data['Medication Use'] = data['Medication Use'].map({'Yes': 1, 'No': 0})
data['Smoking'] = data['Smoking'].map({'Yes': 1, 'No': 0})
data['Diet'] = data['Diet'].map({'Poor': 0, 'Average': 1, 'Good': 2})
data['Stress Level'] = data['Stress Level'].map({'Low': 0, 'Moderate': 1, 'High': 2})

# Convert BMI Category to numeric
data['BMI Category'] = data['BMI Category'].map({'Underweight': 0, 'Normal': 1, 'Overweight': 2, 'Obese': 3})

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

# Split data into training and test sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train a logistic regression model
model = LogisticRegression(max_iter=1000)  # Increased max_iter to ensure convergence
model.fit(X_train, y_train)

# Evaluate the model
y_pred = model.predict(X_test)
print(f'Accuracy: {accuracy_score(y_test, y_pred)}')

# Save the model
joblib.dump(model, 'heart_attack_risk_model.pkl')
