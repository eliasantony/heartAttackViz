import * as d3 from 'd3';

export default class Globe {
    constructor(data, config) {
        this.data = data;
        this.config = {
            parentElement: config.parentElement || '#map',
            width: config.width || 800,
            height: config.height || 500,
            geoJsonUrl: config.geoJsonUrl || './data/world.geo.json',
            sensitivity: config.sensitivity || 75
        };
        this.initViz();
    }

    async initViz() {
        const geoJson = await d3.json(this.config.geoJsonUrl);
        this.geojsonData = geoJson;
        this.prepareData();
        this.setupSVG();
        this.renderMap();
    }

    prepareData() {
        const heartAttackPrevalence = d3.rollup(this.data, (v) => {const percentage = (v.filter(d => d.heartAttackRisk === 1).length / v.length) * 100; return percentage;}, 
        d => d.country);
        this.geojsonData.features.forEach(feature => {
            const country = feature.properties.name;
            const prevalence = heartAttackPrevalence.get(country);
            feature.properties.heartAttackPrevalence = prevalence || 0;
        });
    }

    setupSVG() {
        this.projection = d3.geoOrthographic()
            .scale(250)
            .translate([this.config.width / 2, this.config.height / 2])
            .clipAngle(90);
        this.pathGenerator = d3.geoPath().projection(this.projection);

        this.svg = d3.select(this.config.parentElement).append('svg')
            .attr('width', this.config.width)
            .attr('height', this.config.height)
            .style('pointer-events', 'none'); // Prevent pointer events on the SVG

        this.g = this.svg.append('g')
            .style('pointer-events', 'auto'); // Enable pointer events on the group

        // Static elements setup only once
        this.svg.append('defs').append('clipPath')
            .attr('id', 'clip')
            .append('circle')
            .attr('cx', this.config.width / 2)
            .attr('cy', this.config.height / 2)
            .attr('r', 250);

        this.g.append('circle')
            .attr('cx', this.config.width / 2)
            .attr('cy', this.config.height / 2)
            .attr('r', 250)
            .style('fill', '#87CEEB')
            .style('pointer-events', 'none'); // Prevent pointer events on the background

        this.tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0);

        this.svg.call(d3.drag()
            .on("start", (event) => {
                d3.select(event.sourceEvent.target).raise().attr('stroke', 'black');
            })
            .on("drag", (event) => this.dragged(event)));
    }

    renderMap() {
        // Dynamic elements that need updates
        this.updateViz();
    }

    updateViz() {
        this.g.selectAll('path')
            .data(this.geojsonData.features)
            .join('path')
            .attr('d', this.pathGenerator)
            .attr('clip-path', 'url(#clip)')
            .attr('fill', d => customColorScale(d.properties.heartAttackPrevalence))
            .attr('stroke', '#5c5c5c')
            .on('mouseover', (event, d) => this.showTooltip(event, d))
            .on('mouseleave', () => this.hideTooltip());
    }

    showTooltip(event, d) {
        this.tooltip.transition()
            .duration(200)
            .style('opacity', 0.9);
        this.tooltip.html(`Country: ${d.properties.name}<br>Prevalence: ${d.properties.heartAttackPrevalence.toFixed(2)}% <br> Cases: ${this.data.filter(e => e.country === d.properties.name).length}`)
            .style('left', (event.pageX + 5) + 'px')
            .style('top', (event.pageY - 28) + 'px');
    }

    hideTooltip() {
        this.tooltip.transition()
            .duration(500)
            .style('opacity', 0);
    }

    dragged(event) {
        const rotate = this.projection.rotate();
        const k = this.config.sensitivity / this.projection.scale();
        this.projection.rotate([
            rotate[0] + event.dx * k,
            rotate[1] - event.dy * k
        ]);
        this.updateViz();
    }
}

function customColorScale(value) {
    if (value === null || value === undefined || value === 0) {
        // Very transparent for no values
        return "rgba(255, 247, 247, 1)"; // Adjust transparency as needed
    } else if (value < 30) {
        // Slightly more transparent for values less than 30%
        return "rgba(219, 145, 145, 0.3)"; // Adjust transparency as needed
    } else if (value >= 30 && value < 40) {
        // Define five steps between 30% and 40%
        const step = (value - 30) / 2; // Calculate which step
        if (step < 1) return d3.interpolateReds(0.2);
        else if (step < 2) return d3.interpolateReds(0.4);
        else if (step < 3) return d3.interpolateReds(0.6);
        else if (step < 4) return d3.interpolateReds(0.8);
        else return d3.interpolateReds(1.0);
    } else {
        // For values 40% and above, use the darkest shade
        return d3.interpolateReds(1.0);
    }
}