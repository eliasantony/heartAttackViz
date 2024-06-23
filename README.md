# Heart Health Insights: A Scrollytelling Journey

This project is a web-based application that allows users to calculate their risk of a heart attack based on various health and lifestyle factors. The application uses a logistic regression model trained on a dataset of patient health metrics to provide personalized risk assessments and suggestions for lifestyle changes.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Setup](#setup)
- [Usage](#usage)
- [Model Training](#model-training)
- [Contributing](#contributing)
- [License](#license)

## Overview
Heart attacks are among the leading causes of death worldwide. Understanding the risk factors and making informed lifestyle choices can significantly reduce the risk. This application helps users by calculating their heart attack risk and providing suggestions based on their health metrics.

## Features
- **Global Statistics**: An animated visualization of global heart attack prevalence.
- **Data Visualization**: Interactive charts and graphs to help users understand the impact of different factors on heart health.
- **Heart Attack Risk Calculator**: Users can input their health and lifestyle data to calculate their heart attack risk.
- **Personalized Suggestions**: Based on the calculated risk, users receive suggestions for lifestyle changes to reduce their risk.

## Setup
To set up this project locally, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/heart-attack-risk-prediction.git
   cd heart-attack-risk-prediction
   ```

2. **Run NPM install to get all the Dependencies**:
   ```bash
   npm install
   ```

2. **Set up a Python virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate   # On Windows, use `venv\Scripts\activate`
   ```

3. **Install the required dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Train the model**:
   - Place your dataset (`heart_attack_prediction_dataset.csv`) in the `data` directory.
   - Run the model training script:
     ```bash
     python calculatorPython/logisticRegressionModel.py
     ```
   - This will generate the `heart_attack_risk_model.pkl` and `scaler.pkl` files in the `calculatorPython` directory.

5. **Serve the web application**:
   ```bash
   npm run dev
   ```

## Usage
1. Open the web application in your browser.
2. Enter your health and lifestyle data into the form.
3. Click "Calculate Risk" to see your heart attack risk and personalized suggestions.

## Model Training
The model is trained using a logistic regression algorithm. The training script (`logisticRegressionModel.py`) preprocesses the dataset, scales the features, and fits the model. The calculated coefficients, intercept, means, and standard deviations are used in the web application to normalize the user's input data and calculate the risk score.

### Model Training Scripts
- **logisticRegressionModel.py**: Trains the logistic regression model and saves the model and scaler.
- **calculateCoefficients.py**: Loads the trained model and scaler, then retrieves and prints the model parameters.

## Contributing
Contributions are welcome! If you have any ideas, suggestions, or bug reports, please open an issue or submit a pull request.

### Steps to Contribute
1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Make your changes.
4. Commit your changes with a descriptive message.
5. Push your changes to your fork.
6. Open a pull request to the main repository.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.