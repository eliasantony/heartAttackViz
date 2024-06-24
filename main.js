import * as d3 from 'd3';
import scrollama from 'scrollama';
import Globe from './visualizations/globe.js';
import LineChart from './visualizations/linechart.js';
import Scatterplot from './visualizations/scatterplot.js';
import RadarChart from './visualizations/radarchart.js';
import BarChart from './visualizations/barchart.js';

const heartAttackDataUrl = './data/heart_attack_prediction_dataset.csv';

async function loadData() {
    const heartAttackData = await d3.csv(heartAttackDataUrl, (row) => {
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

    new Globe(heartAttackData, {
        parentElement: '#map',
        width: 800,
        height: 500,
        geoJsonUrl: './data/world.geo.json',
        sensitivity: 75
    });

    new LineChart(heartAttackData, {
        parentElement: '#line-chart',
        width: 800,
        height: 500
    });

    new Scatterplot(heartAttackData, {
        parentElement: '#scatterplot',
        width: 800,
        height: 500,
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

    console.log(radarData);

    new RadarChart(radarData, {
        parentElement: '#radar-chart',
        width: 600,
        height: 600,
        maxValue: 1,
        levels: 5
    });

    new BarChart(heartAttackData, {
        parentElement: '#bar-chart',
        width: 800,
        height: 500
    });
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

// Ease out quint function for smooth animation
function easeOutQuint(t) {
    return 1 + (--t) * t * t * t * t;
}

// Trigger counter animation when the page loads
document.addEventListener('DOMContentLoaded', function () {
    animateCounter('heart-attack-count', 0, 18000000, 5000);  // 5-second total duration
    loadData();
});

// Initialize Scrollama
const scroller = scrollama();

function handleStepEnter(response) {
    const { index } = response;

    // Add color to the current step only
    document.querySelectorAll('.step').forEach((step, i) => {
        step.classList.toggle('is-active', i === index);
    });
    switch (index) {
        case 0:
            break;
        case 1:
            updateGlobe();
            break;
        case 2:
            updateBarChart();
            break;
        case 3:
            updateLineChart();
            break;
        case 4:
            updateScatterPlot();
            break;
        case 5:
            updateRadarChart();
            break;
        default:
            break;
    }
}

// Handle window resize events
function handleResize() {
    scroller.resize();
}

// Initialize Scrollama and set up event handlers
function init() {
    // Force a resize on load to ensure proper dimensions are sent to Scrollama
    handleResize();

    // Setup the scroller with options
    scroller
        .setup({
            step: '.step',
            offset: 0.5,
            debug: false,
        })
        .onStepEnter(handleStepEnter);

    // Setup resize event listener
    window.addEventListener('resize', handleResize);
}

// Kick things off
init();

// Functions to update visualizations
function updateGlobe() {
    d3.select("#map svg")
        .transition()
        .duration(1000)
        .style("opacity", 1);
}

function updateLineChart() {
    d3.select("#line-chart svg")
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .attr("transform", "translate(0,0)");

    d3.select("#scatterplot svg").transition().duration(500).style("opacity", 0);
    d3.select("#radar-chart svg").transition().duration(500).style("opacity", 0);
    d3.select("#bar-chart svg").transition().duration(500).style("opacity", 0);
    d3.select("#area-chart svg").transition().duration(500).style("opacity", 0);
}

function updateScatterPlot() {
    d3.select("#scatterplot svg")
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .attr("transform", "translate(0,0)");

    d3.select("#line-chart svg").transition().duration(500).style("opacity", 0);
    d3.select("#radar-chart svg").transition().duration(500).style("opacity", 0);
    d3.select("#bar-chart svg").transition().duration(500).style("opacity", 0);
    d3.select("#area-chart svg").transition().duration(500).style("opacity", 0);
}

function updateRadarChart() {
    d3.select("#radar-chart svg")
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .attr("transform", "translate(0,0)");

    d3.select("#line-chart svg").transition().duration(500).style("opacity", 0);
    d3.select("#scatterplot svg").transition().duration(500).style("opacity", 0);
    d3.select("#bar-chart svg").transition().duration(500).style("opacity", 0);
    d3.select("#area-chart svg").transition().duration(500).style("opacity", 0);
}

function updateBarChart() {
    d3.select("#bar-chart svg")
        .transition()
        .duration(1000)
        .style("opacity", 1)
        .attr("transform", "translate(0,0)");

    d3.select("#line-chart svg").transition().duration(500).style("opacity", 0);
    d3.select("#scatterplot svg").transition().duration(500).style("opacity", 0);
    d3.select("#radar-chart svg").transition().duration(500).style("opacity", 0);
    d3.select("#area-chart svg").transition().duration(500).style("opacity", 0);
}

function displayRiskResult(risk) {
    const riskResultSection = document.getElementById('risk-result-section');
    const riskResult = document.getElementById('risk-result');
    const riskTips = document.getElementById('risk-tips');

    riskResult.innerHTML = `Your calculated heart attack risk is: ${risk.toFixed(2)}%`;
    riskTips.innerHTML = getRiskTips(risk);

    riskResultSection.classList.add('active');

    // Add a small delay to ensure the section is fully visible before scrolling
    setTimeout(() => {
        riskResultSection.scrollIntoView({ behavior: 'smooth' });
    }, 100); // Adjust the delay as needed
}

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

    console.log("Features: ", features);

    const risk = calculateRisk(features);
    displayRiskResult(risk);
});

function calculateRisk(features) {
    const intercept = -0.583946095042942;
    const coefficients = [0.03367072, 0.02501753, 0.02284409, -0.01530351, -0.01030686, 0.00458841, -0.03707373, -0.02011293, -0.01381499, 0.03007136, -0.00820121, -0.03451076, -0.02688026];

    // Normalization values
    const means = [53.70797672, 0.69736392, 2.10578569, 0.49298186, 0.49583476, 0.49834532, 0.89683898, 0.59808285, 1.00787402, 10.01428392, 3.48967249, 7.02350793, 5.46970216];
    const stds = [21.24829631, 0.45939905, 0.90738136, 0.49995074, 0.49998265, 0.49999726, 0.30416907, 0.49028538, 0.81708733, 5.78341767, 2.28255707, 1.98835929, 2.85945872];

    // Normalize features
    let normalizedFeatures = features.map((value, index) => (value - means[index]) / stds[index]);

    console.log("Normalized Features: ", normalizedFeatures);

    // Calculate score
    let score = intercept;
    for (let i = 0; i < normalizedFeatures.length; i++) {
        score += coefficients[i] * normalizedFeatures[i];
    }

    console.log("Score: " + score);
    console.log("Math.exp(-score): " + Math.exp(-score));
    console.log("Risk: " + (1 / (1 + Math.exp(-score))) * 100);

    // Calculate risk using sigmoid function
    const risk = 1 / (1 + Math.exp(-score));
    console.log("Final Risk: ", risk);
    return risk * 100; // Convert to percentage
}

function getRiskTips(risk) {
    if (risk < 20) {
        return "Your heart attack risk is low. Keep up with your healthy lifestyle!";
    } else if (risk < 50) {
        return "Your heart attack risk is moderate. Consider making lifestyle changes like improving your diet and increasing physical activity.";
    } else {
        return "Your heart attack risk is high. Please consult with a healthcare provider for personalized advice.";
    }
}