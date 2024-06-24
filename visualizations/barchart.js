import * as d3 from "d3";

export default class BarChart {
    constructor(data, config) {
        this.data = data;
        this.config = {
            parentElement: config?.parentElement || 'body',
            colorScale: config?.colorScale || d3.scaleSequential(d3.interpolateReds),
            width: config?.width || 600,
            height: config?.height || 500,
            margin: config?.margin || { top: 20, right: 20, bottom: 50, left: 50 },
            tooltipPadding: config?.tooltipPadding || 15
        };
        this.prepareData();
        this.initViz();
    }

    prepareData() {
        const that = this;

        // Aggregate data by a category (for example, age categories)
        const ageGroups = d3.group(that.data, d => d.ageCategory);
        that.aggregatedData = Array.from(ageGroups, ([ageCategory, values]) => ({
            ageCategory: ageCategory,
            count: values.length,
            averageHeartAttackRisk: d3.mean(values, v => v.heartAttackRisk) * 100 // Aggregate by average heart attack risk
        }));

        // Sort data by age category
        const ageOrder = ["18-30", "31-45", "46-60", "61+"]; // Define the order of age categories
        that.aggregatedData.sort((a, b) => ageOrder.indexOf(a.ageCategory) - ageOrder.indexOf(b.ageCategory));
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
            .attr('height', that.config.height)
            .style("opacity", 0);

        that.viz = that.svg.append('g')
            .attr('transform', `translate(${that.config.margin.left}, ${that.config.margin.top})`);

        // Axes
        that.xAxisGroup = that.viz.append('g')
            .attr('transform', `translate(0, ${that.boundedHeight})`);

        that.yAxisGroup = that.viz.append('g');

        // Add tooltip container
        that.tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0);

        that.updateViz();
    }

    updateViz() {
        const that = this;

        // Update scales
        that.xScale.domain(that.aggregatedData.map(d => d.ageCategory));
        that.yScale.domain([0, d3.max(that.aggregatedData, d => d.averageHeartAttackRisk)]);

        // Set the color scale domain
        that.config.colorScale.domain([0, d3.max(that.aggregatedData, d => d.averageHeartAttackRisk)]);

        // Render the visualization
        that.renderViz();
    }

    renderViz() {
        const that = this;

        // Bars
        const bars = that.viz.selectAll('.bar')
            .data(that.aggregatedData)
            .join('rect')
            .attr('class', 'bar')
            .attr('x', d => that.xScale(d.ageCategory))
            .attr('y', d => that.yScale(d.averageHeartAttackRisk))
            .attr('width', that.xScale.bandwidth())
            .attr('height', d => that.boundedHeight - that.yScale(d.averageHeartAttackRisk))
            .attr('fill', d => that.config.colorScale(d.averageHeartAttackRisk));

        // Axes
        that.xAxisGroup.call(d3.axisBottom(that.xScale));
        that.yAxisGroup.call(d3.axisLeft(that.yScale).tickFormat(d => `${d}%`));

        // X-axis Label
        that.svg.append('text')
            .attr('class', 'axis-label')
            .attr('x', that.config.width / 2)
            .attr('y', that.config.height - 10) // Adjust based on your layout
            .style('text-anchor', 'middle')
            .text('Age Category');

        // Y-axis Label
        that.svg.append('text')
            .attr('class', 'axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('y', 30) // Adjust based on your layout
            .attr('x', -that.config.height / 2 )
            .attr('dy', '-1em')
            .style('text-anchor', 'middle')
            .text('Average Heart Attack Risk (%)');

        // Add tooltips
        bars.on('mouseover', (event, d) => {
            that.tooltip.transition()
                .duration(200)
                .style('opacity', 0.9);
            that.tooltip.html(`Age Category: ${d.ageCategory}<br>Avg. Heart Attack Risk: ${d.averageHeartAttackRisk.toFixed(2)}%<br>Count: ${d.count}`)
                .style('left', `${event.pageX + that.config.tooltipPadding}px`)
                .style('top', `${event.pageY - that.config.tooltipPadding}px`);
        }).on('mouseleave', () => {
            that.tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });
    }
}
