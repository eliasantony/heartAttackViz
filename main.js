import * as d3 from 'd3';
import './style.css';
import Globe from './visualizations/globe.js';
import LineChart from './visualizations/linechart.js';
import Scatterplot from './visualizations/scatterplot.js';
import RadarChart from './visualizations/radarchart.js';
import BarChart from './visualizations/barchart.js';
import AreaChart from './visualizations/areachart.js';

const geoJsonUrl = './data/world.geo.json';
const heartAttackDataUrl = './data/heart_attack_prediction_dataset.csv';

async function loadData() {
    const heartAttackData = await d3.csv('./data/heart_attack_prediction_dataset.csv', (row) => {
        return {
            patientId: row['Patient ID'],
            age : +row['Age'],
            ageCategory : row['Age Category'],
            sex: row['Sex'],
            country: row['Country'],
            continent: row['Continent'],
            hemisphere: row['Hemisphere'],
            cholesterol: +row['Cholesterol'],
            cholesterolRisk: row['Cholesterol Risk'],
            systolicPressure: +row['Systolic Pressure'],
            diastolicPressure: +row['Diastolic Pressure'],
            bloodPressureRisk: row['Blood Pressure Risk'],
            heartRate: +row['Heart Rate'],
            bmi: +row['BMI'],
            bmiCategory: row['BMI Category'],
            triglycerides: +row['Triglycerides'],
            diabetes: +row['Diabetes'],
            familyHistory: +row['Family History'],
            previousHeartProblems: +row['Previous Heart Problems'],
            medicationUse: +row['Medication Use'],
            smoking: +row['Smoking'],
            obesity: +row['Obesity'],
            alcoholConsumption: +row['Alcohol Consumption'],
            diet: row['Diet'],
            exerciseHoursPerWeek: +row['Exercise Hours Per Week'],
            physicalActivityDaysPerWeek: +row['Physical Activity Days Per Week'],
            sedentaryHoursPerDay: +row['Sedentary Hours Per Day'],
            sleepHoursPerDay: +row['Sleep Hours Per Day'],
            stressLevel: +row['Stress Level'],
            income: +row['Income'],
            heartAttackRisk: +row['Heart Attack Risk']
        }
    });

    let globe = new Globe(heartAttackData, {
        parentElement: '#map',
        width: 800,
        height: 500,
        geoJsonUrl,
        sensitivity: 75
    });

    let lineChart = new LineChart(heartAttackData, {
        parentElement: '#line-chart',
        width: 700,
        height: 400
    });

    let scatterPlot = new Scatterplot(heartAttackData, {
        parentElement: '#scatterplot',
        width: 600,
        height: 400,
        dataAccessor: {
            x: 'bmi',
            y: 'heartAttackRisk'
        }
    });

    // Prepare data for the Radar Chart
    const maxSmoking = d3.max(heartAttackData, d => d.smoking);
    const maxAlcohol = d3.max(heartAttackData, d => d.alcoholConsumption);
    const maxExercise = d3.max(heartAttackData, d => d.exerciseHoursPerWeek);

    const radarData = [
        [
            { axis: 'Smoking', value: d3.mean(heartAttackData, d => d.smoking / maxSmoking) },
            { axis: 'Alcohol Consumption', value: d3.mean(heartAttackData, d => d.alcoholConsumption / maxAlcohol) },
            { axis: 'Exercise Hours Per Week', value: d3.mean(heartAttackData, d => d.exerciseHoursPerWeek / maxExercise) }
        ]
    ];

    let radarChart = new RadarChart(radarData, {
        parentElement: '#radar-chart',
        width: 600,
        height: 600,
        maxValue: 1,
        levels: 5
    });

    let barChart = new BarChart(heartAttackData, {
        parentElement: '#bar-chart',
        width: 600,
        height: 400
    });

    let areaChart = new AreaChart(heartAttackData, {
        parentElement: '#area-chart',
        width: 600,
        height: 400
    });
}

function easeOutQuint(t) {
    return 1 + (--t) * t * t * t * t;
}

// Function to animate counter
function animateCounter(id, start, end, duration) {
    const element = document.getElementById(id);
    const range = end - start;
    let progress = 0;
    const stepTime = 10; // 10ms per step

    const timer = setInterval(() => {
        progress += stepTime / duration;
        if (progress > 1) {
            progress = 1;
        }

        const current = start + range * easeOutQuint(progress);
        element.textContent = Math.round(current).toLocaleString(); // Adds thousand separators

        if (progress === 1) {
            clearInterval(timer);
        }
    }, stepTime);
}

// Trigger counter animation when the page loads
document.addEventListener('DOMContentLoaded', function () {
    animateCounter('heart-attack-count', 0, 18000000, 5000);  // 5-second total duration
});

loadData();

document.getElementById('risk-calculator').addEventListener('submit', function(e) {
    e.preventDefault();

    const age = parseInt(document.getElementById('age').value);
    const sex = document.getElementById('sex').value === 'male' ? 1 : 0;
    const bmiCategory = parseInt(document.getElementById('bmi-category').value);
    const familyHistory = parseInt(document.getElementById('family-history').value);
    const previousHeartProblems = parseInt(document.getElementById('previous-heart-problems').value);
    const medicationUse = parseInt(document.getElementById('medication-use').value);
    const smoking = parseInt(document.getElementById('smoking').value);
    const alcoholConsumption = parseInt(document.getElementById('alcohol-consumption').value);
    const diet = parseInt(document.getElementById('diet').value);
    const exerciseHours = parseFloat(document.getElementById('exercise-hours').value);
    const physicalActivityDays = parseInt(document.getElementById('physical-activity-days').value);
    const sleepHours = parseFloat(document.getElementById('sleep-hours').value);
    const stressLevel = parseInt(document.getElementById('stress-level').value);

    const features = [
        age, sex, bmiCategory, familyHistory, previousHeartProblems, 
        medicationUse, smoking, alcoholConsumption, diet, 
        exerciseHours, physicalActivityDays, sleepHours, stressLevel
    ];

    const risk = calculateRisk(features);
    document.getElementById('risk-result').innerHTML = `Your calculated heart attack risk is: ${risk.toFixed(2)}%`;
});

function calculateRisk(features) {
    const intercept = -0.2934952133448852;
    const coefficients = [0.00087462, 0.01228377, 0.02421722, -0.04128231, -0.29221089, 0.00523712, -0.00373356, -0.01695023];

    let score = intercept;

    for (let i = 0; i < features.length; i++) {
        score += coefficients[i] * features[i];
    }

    const risk = 1 / (1 + Math.exp(-score));
    return risk * 100; // Convert to percentage
}

