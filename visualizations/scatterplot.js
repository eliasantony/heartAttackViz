import * as d3 from "d3";

export default class Scatterplot {
    constructor(data, config) {
        this.data = data;
        this.config = {
            parentElement: config?.parentElement || 'body',
            colorScale: config?.colorScale || d3.scaleOrdinal(d3.schemeCategory10),
            width: config?.width || 600,
            height: config?.height || 500,
            margin: config?.margin || { top: 25, right: 25, bottom: 60, left: 60 },
            tooltipPadding: config?.tooltipPadding || 15,
            xAxisLabel: config?.xAxisLabel || 'BMI',
            yAxisLabel: config?.yAxisLabel || 'Heart Attack Risk (%)',
            dataAccessor: config.dataAccessor,
        };
        this.prepareData();
        this.initViz();
    }

    prepareData() {
        const that = this;

        // Group data by BMI (rounded to nearest integer for better grouping)
        const bmiGroups = d3.group(that.data, d => Math.round(d.bmi));
        that.aggregatedData = Array.from(bmiGroups, ([bmi, values]) => ({
            bmi: bmi,
            heartAttackRisk: d3.mean(values, v => v.heartAttackRisk) * 100
        }));

        // Sort data by BMI to ensure proper line generation
        that.aggregatedData.sort((a, b) => a.bmi - b.bmi);
    }

    initViz() {
        const that = this;

        that.boundedWidth = that.config.width - that.config.margin.left - that.config.margin.right;
        that.boundedHeight = that.config.height - that.config.margin.top - that.config.margin.bottom;

        // Initialize scales
        that.xScale = d3.scaleLinear()
            .range([0, that.boundedWidth])
            .nice();

        that.yScale = d3.scaleLinear()
            .range([that.boundedHeight, 0])
            .nice();

        // Initialize the axes generators based on the scales
        that.xAxis = d3.axisBottom(that.xScale)
            .ticks(6)
            .tickSizeOuter(0)
            .tickPadding(10)
            .tickFormat(d => `${d} kg/m²`);
        that.yAxis = d3.axisLeft(that.yScale)
            .ticks(6)
            .tickSizeOuter(0)
            .tickPadding(10)
            .tickFormat(d => `${d}%`);

        // Static elements
        // Initialize SVG
        that.svg = d3.select(that.config.parentElement)
            .append('svg')
            .attr('width', that.config.width)
            .attr('height', that.config.height)
            .style("opacity", 0);

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
            .attr('x', that.boundedWidth / 2)
            .attr('y', 40) // Adjusted position
            .style('text-anchor', 'middle')
            .style('font-size', '14px') // Ensure the font size is set
            .style('fill', 'black') // Ensure the text color is set
            .text(that.config.xAxisLabel);

        that.yAxisGroup.append('text')
            .attr('class', 'axis-title')
            .attr('transform', 'rotate(-90)')
            .attr('x', -that.boundedHeight / 2)
            .attr('y', -50) // Adjusted position
            .style('text-anchor', 'middle')
            .style('font-size', '14px') // Ensure the font size is set
            .style('fill', 'black') // Ensure the text color is set
            .text(that.config.yAxisLabel);

        // Add tooltip container
        that.tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0);

        // Update the visualization
        that.updateViz();
    }

    updateViz() {
        const that = this;

        that.colorAccessor = d => d[that.config.dataAccessor.color];
        that.xAccessor = d => d.bmi;
        that.yAccessor = d => d.heartAttackRisk;

        // Set the domains for the scales based on data
        that.xScale.domain(d3.extent(that.aggregatedData, that.xAccessor));
        that.yScale.domain([0, d3.max(that.aggregatedData, that.yAccessor)]);

        // Trigger the visualization rendering
        that.renderViz();
    }

    renderViz() {
        const that = this;

        // Add circles
        const circles = that.viz.selectAll('circle')
            .data(that.aggregatedData)
            .join('circle')
            .attr('class', 'point')
            .attr('r', 4)
            .attr('cx', d => that.xScale(that.xAccessor(d)))
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
            that.tooltip.transition()
                .duration(200)
                .style('opacity', 0.9);
            that.tooltip.html(`BMI: ${that.xAccessor(d)}<br>Heart Attack Risk: ${that.yAccessor(d).toFixed(2)}%`)
                .style('left', `${event.pageX + that.config.tooltipPadding}px`)
                .style('top', `${event.pageY - that.config.tooltipPadding}px`);
        }).on('mouseleave', () => {
            that.tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });
    }
}
