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
        const heartAttackPrevalence = d3.rollup(this.data, v => d3.mean(v, d => d.heartAttackRisk), d => d.country);
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
            .attr('height', this.config.height);

        // Static elements setup only once
        this.svg.append('defs').append('clipPath')
            .attr('id', 'clip')
            .append('circle')
            .attr('cx', this.config.width / 2)
            .attr('cy', this.config.height / 2)
            .attr('r', 250);

        this.svg.append('circle')
            .attr('cx', this.config.width / 2)
            .attr('cy', this.config.height / 2)
            .attr('r', 250)
            .style('fill', '#87CEEB');

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
        this.svg.selectAll('path')
            .data(this.geojsonData.features)
            .join('path')
            .attr('d', this.pathGenerator)
            .attr('clip-path', 'url(#clip)')
            .attr('fill', d => d3.interpolateReds(d.properties.heartAttackPrevalence))
            .attr('stroke', '#5c5c5c')
            .on('mouseover', (event, d) => this.showTooltip(event, d))
            .on('mouseleave', () => this.hideTooltip());
    }

    showTooltip(event, d) {
        this.tooltip.transition()
            .duration(200)
            .style('opacity', .9);
        this.tooltip.html(`Country: ${d.properties.name}<br>Prevalence: ${d.properties.heartAttackPrevalence.toFixed(2)}`)
            .style('left', `${event.pageX}px`)
            .style('top', `${event.pageY - 28}px`);
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
