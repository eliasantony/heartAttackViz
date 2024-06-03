import * as d3 from "d3";

export default class BarChart {
    constructor(data, config) {
        this.data = data;
        this.config = {
            parentElement: config?.parentElement || 'body',
            colorScale: config?.colorScale || d3.scaleOrdinal(d3.schemeCategory10),
            width: config?.width || 500,
            height: config?.height || 500,
            margin: config?.margin || { top: 20, right: 20, bottom: 30, left: 40 },
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
            averageHeartAttackRisk: d3.mean(values, v => v.heartAttackRisk) // Aggregate by average heart attack risk
        }));

        // Sort data by age category
        that.aggregatedData.sort((a, b) => a.ageCategory - b.ageCategory);
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
            .attr('fill', that.config.colorScale);

        // Axes
        that.xAxisGroup.call(d3.axisBottom(that.xScale));
        that.yAxisGroup.call(d3.axisLeft(that.yScale));

        // Add tooltips
        bars.on('mouseover', (event, d) => {
            that.tooltip.transition()
                .duration(200)
                .style('opacity', 0.9);
            that.tooltip.html(`Age Category: ${d.ageCategory}<br>Avg. Heart Attack Risk: ${d.averageHeartAttackRisk.toFixed(2)}%`)
                .style('left', `${event.pageX + that.config.tooltipPadding}px`)
                .style('top', `${event.pageY - that.config.tooltipPadding}px`);
        }).on('mouseleave', () => {
            that.tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });
    }
}
