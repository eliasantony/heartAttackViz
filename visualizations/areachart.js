import * as d3 from "d3";

export default class AreaChart {
    constructor(data, config) {
        this.data = data;
        this.config = {
            parentElement: config?.parentElement || 'body',
            colorScale: config?.colorScale,
            width: config?.width || 600,
            height: config?.height || 400,
            margin: config?.margin || { top: 10, right: 30, bottom: 30, left: 60 }
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

        that.xScale = d3.scaleTime().range([0, that.boundedWidth]);
        that.yScale = d3.scaleLinear().range([that.boundedHeight, 0]);

        that.xAxisGroup = that.viz.append('g')
            .attr('transform', `translate(0,${that.boundedHeight})`);
        that.yAxisGroup = that.viz.append('g');

        that.updateViz();
    }

    updateViz() {
        const that = this;
        that.xScale.domain(d3.extent(that.data, d => d.date));
        that.yScale.domain([0, d3.max(that.data, d => d.value)]);

        that.renderViz();
    }

    renderViz() {
        const that = this;

        const areaGenerator = d3.area()
            .x(d => that.xScale(d.date))
            .y0(that.boundedHeight)
            .y1(d => that.yScale(d.value))
            .curve(d3.curveMonotoneX);  // This makes the area smooth

        that.viz.append('path')
            .data([that.data])
            .join('path')
            .attr('d', areaGenerator)
            .attr('fill', 'steelblue')
            .attr('opacity', 0.5);

        that.xAxisGroup.call(d3.axisBottom(that.xScale));
        that.yAxisGroup.call(d3.axisLeft(that.yScale));
    }
}
