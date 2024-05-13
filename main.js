import * as d3 from 'd3';
import './style.css';
import Globe from './visualizations/globe.js';
import LineChart from './visualizations/linechart.js';
import Scatterplot from './visualizations/scatterplot.js';
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
            x: 'BMI',
            y: 'Heart Attack Risk',
        }
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