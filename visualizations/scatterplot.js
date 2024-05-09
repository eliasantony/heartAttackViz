import * as d3 from "d3";

export default class Scatterplot {
    constructor(data, config) {
        this.data = data;
        this.config = {
            parentElement: config?.parentElement || 'body',
            colorScale: config?.colorScale,
            width: config?.width || 500,
            height: config?.height || 500,
            margin: config?.margin || { top: 25, right: 25, bottom: 30, left: 30 },
            tooltipPadding: config?.tooltipPadding || 15,
            xAxisLabel: config?.xAxisLabel || 'X-axis',
            yAxisLabel: config?.yAxisLabel || 'Y-axis',
            dataAccessor: config.dataAccessor,
        }
        this.initViz();
    }

    initViz() {
        const that = this;

        that.boundedWidth = that.config.width - that.config.margin.left - that.config.margin.right;
        that.boundedHeight = that.config.height - that.config.margin.top - that.config.margin.bottom;

        // Initialize scales
        that.xScale = d3.scaleLinear()
            // .domain() -- This is omitted for now as we set the Domain dynamically based on the filtered data
            .range([0, that.boundedWidth])
            .nice();

        that.yScale = d3.scaleLinear()
            // .domain() -- This is omitted for now as we set the Domain dynamically based on the filtered data
            .range([that.boundedHeight, 0])
            .nice();

        // Initialize the axes generators based on the scales
        that.xAxis = d3.axisBottom(that.xScale)
            .ticks(6)
            .tickSizeOuter(-that.boundedHeight - 10)
            .tickPadding(10);
        that.yAxis = d3.axisLeft(that.yScale)
            .ticks(6)
            .tickSizeOuter(-that.boundedWidth - 10)
            .tickPadding(10);

        // Static elements
        // Initialize SVG
        that.svg = d3.select(that.config.parentElement)
            .append('svg')
            .attr('width', that.config.width)
            .attr('height', that.config.height);

        // Create real drawing area
        that.viz = that.svg.append('g')
            .attr('class', 'scatterplot')
            .attr('transform', `translate(${that.config.margin.left}, ${that.config.margin.top})`);

        // Initialize axes
        that.xAxisGroup = that.viz.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0, ${that.boundedHeight})`);

        that.yAxisGroup = that.viz.append('g')
            .attr('class', 'axis y-axis');

        // Add titles to the axes
        that.xAxisGroup.append('text')
            .attr('class', 'axis-title')
            .attr('x', that.boundedWidth + 10)
            .attr('y', - 10)
            .style('text-anchor', 'end')
            .text(that.config.xAxisLabel);

        that.yAxisGroup.append('text')
            .attr('class', 'axis-title')
            .attr('x', 5)
            .attr('y', -5)
            .text(that.config.yAxisLabel);

        // Update the visualization
        that.updateViz();
    }

    
    updateViz() {
        const that = this;
        
        that.colorAccessor = d => d[that.config.dataAccessor.color];
        that.xAccessor = d => d[that.config.dataAccessor.x];
        that.yAccessor = d => d[that.config.dataAccessor.y];

        that.xScale.domain([0, d3.max(that.data, that.xAccessor)]);
        that.yScale.domain([0, d3.max(that.data, that.yAccessor)]);

        // Trigger the visualization rendering
        that.renderViz();
    }

    renderViz() {
        const that = this;

        // Add circles
        const circles = that.viz.selectAll('circle')
            .data(that.data)
            .join('circle')
            .attr('class', 'point')
            .attr('r', 4)
            .attr('cx', d => that.xScale(that.xAccessor(d)));

        circles.transition()
            .duration(600)
            .ease(d3.easeSinIn)
            .attr('cy', d => that.yScale(that.yAccessor(d)))
            .attr('fill', d => that.config.colorScale(that.colorAccessor(d)));

        // Create the axis
        that.xAxisGroup.transition()
            .duration(600)
            .call(that.xAxis);

        that.yAxisGroup.transition()
            .duration(600)
            .call(that.yAxis);

        // Add tooltips
        circles.on('mouseover', (event, d) => {
            d3.select('#tooltip')
                .style('opacity', 1)
                .style('left', `${event.pageX + that.config.tooltipPadding} + px`)
                .style('top', `${event.pageY + that.config.tooltipPadding} + px`)
                .html('Text...')
        }).on('mouseleave', () => {
            d3.select('#tooltip')
                .style('opacity', 0);
        });
    }
}