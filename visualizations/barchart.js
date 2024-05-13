import * as d3 from "d3";

export default class BarChart {
    constructor(data, config) {
        this.data = data;
        this.config = {
            parentElement: config?.parentElement || 'body',
            colorScale: config?.colorScale,
            width: config?.width || 500,
            height: config?.height || 500,
            margin: config?.margin || { top: 20, right: 20, bottom: 30, left: 40 },
            tooltipPadding: config?.tooltipPadding || 15
        };
        this.initViz();
    }

    initViz() {
        const that = this;

        that.boundedWidth = that.config.width - that.config.margin.left - that.config.margin.right;
        that.boundedHeight = that.config.height - that.config.margin.top - that.config.margin.bottom;

        // Initialize scales
        that.xScale = d3.scaleBand()
            .range([0, that.boundedWidth])
            .padding(0.1);

        that.yScale = d3.scaleLinear()
            .range([that.boundedHeight, 0]);

        // Initialize SVG and drawing area
        that.svg = d3.select(that.config.parentElement)
            .append('svg')
            .attr('width', that.config.width)
            .attr('height', that.config.height);

        that.viz = that.svg.append('g')
            .attr('transform', `translate(${that.config.margin.left}, ${that.config.margin.top})`);

        // Axes
        that.xAxisGroup = that.viz.append('g')
            .attr('transform', `translate(0, ${that.boundedHeight})`);
        
        that.yAxisGroup = that.viz.append('g');

        that.updateViz();
    }

    updateViz() {
        const that = this;
        
        // Update scales
        that.xScale.domain(this.data.map(d => d.category));
        that.yScale.domain([0, d3.max(this.data, d => d.value)]);

        // Render the visualization
        that.renderViz();
    }

    renderViz() {
        const that = this;

        // Bars
        that.viz.selectAll('.bar')
            .data(that.data)
            .join('rect')
            .attr('class', 'bar')
            .attr('x', d => that.xScale(d.category))
            .attr('y', d => that.yScale(d.value))
            .attr('width', that.xScale.bandwidth())
            .attr('length', d => that.boundedHeight - that.yScale(d.value))
            .attr('fill', that.config.colorScale);

        // Axes
        that.xAxisGroup.call(d3.axisBottom(that.xScale));
        that.yAxisGroup.call(d3.axisLeft(that.yScale));
    }
}
