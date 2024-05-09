import * as d3 from "d3";

export default class Histogram {
    constructor(data, config) {
        this.data = data;
        this.config = {
            parentElement: config?.parentElement || 'body',
            colorScale: config?.colorScale,
            width: config?.width || 600,
            height: config?.height || 400,
            margin: config?.margin || { top: 10, right: 30, bottom: 30, left: 40 }
        };
        this.initViz();
    }

    initViz() {
        const that = this;

        that.boundedWidth = that.config.width - that.config.margin.left - that.config.margin.right;
        that.boundedHeight = that.config.height - that.config.margin.top - that.config.margin.bottom;

        // Initialize SVG and drawing area
        that.svg = d3.select(that.config.parentElement)
            .append('svg')
            .attr('width', that.config.width)
            .attr('height', that.config.height);

        that.viz = that.svg.append('g')
            .attr('transform', `translate(${that.config.margin.left}, ${that.config.margin.top})`);

        that.xScale = d3.scaleLinear().range([0, that.boundedWidth]);
        that.yScale = d3.scaleLinear().range([that.boundedHeight, 0]);

        that.xAxisGroup = that.viz.append('g')
            .attr('transform', `translate(0,${that.boundedHeight})`);
        that.yAxisGroup = that.viz.append('g');

        that.updateViz();
    }

    updateViz() {
        const that = this;

        // Set up the bins for the histogram
        const histogram = d3.histogram()
            .value(d => d.value)
            .domain(that.xScale.domain())
            .thresholds(that.xScale.ticks(40));  // Adjust number of bins

        const bins = histogram(that.data);

        that.xScale.domain([0, d3.max(bins, d => d.x1)]);
        that.yScale.domain([0, d3.max(bins, d => d.length)]);

        that.renderViz();
    }

    renderViz() {
        const that = this;

        // Bind the bins data
        that.viz.selectAll('.bar')
            .data(bins)
            .join('rect')
            .attr('class', 'bar')
            .attr('x', d => that.xScale(d.x0) + 1)
            .attr('y', d => that.yScale(d.length))
            .attr('width', d => Math.max(0, that.xScale(d.x1) - that.xScale(d.x0) - 1))
            .attr('height', d => that.boundedHeight - that.yScale(d.length))
            .attr('fill', 'steelblue');
        
        that.xAxisGroup.call(d3.axisBottom(that.xScale));
        that.yAxisGroup.call(d3.axisLeft(that.yScale));
    }
}
