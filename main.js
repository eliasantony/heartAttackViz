import * as d3 from 'd3';
import './style.css';
import ScrollMagic from 'scrollmagic';

document.addEventListener('DOMContentLoaded', function () {
  let controller = new ScrollMagic.Controller();

  document.querySelectorAll('.step').forEach(function (step, index) {
    new ScrollMagic.Scene({
      triggerElement: step,
      duration: '50%',  // Adjust based on your content
      triggerHook: 0.5
    })
    .setClassToggle(step, 'active') // CSS class toggle for active state
    .addIndicators() // This is for debugging purposes; remove in production
    .addTo(controller);
  });
});

const geoJsonUrl = './data/world.geo.json';
const heartAttackDataUrl = './data/heart_attack_prediction_dataset.csv';

// Initialize these variables outside to ensure they are accessible in both loadData and dragged function
let svg;
let projection = d3.geoOrthographic()
    .scale(250) // Adjust scale to fit your SVG dimensions
    .translate([400, 250]) // Center the map in your SVG
    .clipAngle(90);
let pathGenerator = d3.geoPath().projection(projection);
const sensitivity = 75; // Adjust sensitivity for dragging

async function loadData() {
    const [geoJson, heartAttackData] = await Promise.all([
        d3.json(geoJsonUrl),
        d3.csv(heartAttackDataUrl, d => ({
            ...d,
            heartAttackRisk: +d['Heart Attack Risk'],
            country: d['Country']
        }))
    ]);

    const heartAttackPrevalence = d3.rollup(heartAttackData, v => d3.mean(v, d => d.heartAttackRisk), d => d.country);

    geoJson.features.forEach(feature => {
        const country = feature.properties.name;
        const prevalence = heartAttackPrevalence.get(country);
        feature.properties.heartAttackPrevalence = prevalence || 0;
    });

    renderMap(geoJson);
}

function dragged(event) {
    const rotate = projection.rotate();
    const k = sensitivity / projection.scale();
    projection.rotate([
        rotate[0] + event.dx * k,
        rotate[1] - event.dy * k
    ]);
    svg.selectAll('path')
        .attr('d', pathGenerator);
}

function renderMap(geojsonData) {
    svg = d3.select('#map').append('svg')
        .attr('width', 800)
        .attr('height', 500);

    // Define a circle that will act as a clipping path
    svg.append('defs').append('clipPath')
        .attr('id', 'clip')
        .append('circle')
        .attr('cx', 400)
        .attr('cy', 250)
        .attr('r', 250);  // Adjust the radius to match the scale of your projection

    // Background circle for water
    svg.append('circle')
        .attr('cx', 400)
        .attr('cy', 250)
        .attr('r', 250)
        .style('fill', '#87CEEB');

    const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

    // Apply the clipping path to the paths you draw for the countries
    svg.selectAll('path')
        .data(geojsonData.features)
        .enter().append('path')
            .attr('d', pathGenerator)
            .attr('clip-path', 'url(#clip)')  // Apply clipping to make it round
            .attr('fill', d => d3.interpolateReds(d.properties.heartAttackPrevalence))
            .attr('stroke', '#5c5c5c')
            .on('mouseover', (event, d) => {
                tooltip.transition()
                    .duration(200)
                    .style('opacity', .9)
                    .style('background', 'white')
                    .style('color', 'black');
                tooltip.html(`Country: ${d.properties.name}<br>Prevalence: ${d.properties.heartAttackPrevalence.toFixed(2)}`)
                    .style('left', (event.pageX) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', () => {
                tooltip.transition()
                    .duration(500)
                    .style('opacity', 0);
            });

    svg.call(d3.drag()
        .on("start", dragStarted)
        .on("drag", dragged));

    function dragStarted(event) {
        d3.select(this).raise().attr('stroke', 'black');
    }
}

console.log()

loadData();
