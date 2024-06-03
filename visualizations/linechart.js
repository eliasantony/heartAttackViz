import * as d3 from "d3";

export default class LineChart {
    constructor(data, config) {
        this.data = data;
        this.config = {
            parentElement: config?.parentElement || 'body',
            width: config?.width || 600,
            height: config?.height || 400,
            margin: config?.margin || { top: 10, right: 30, bottom: 30, left: 60 }
        };
        this.prepareData();
        this.initViz();
    }

    prepareData() {
        const that = this;

        // Convert age and heart attack risk to numbers
        that.data = that.data.map(d => ({
            age: +d.age,
            heartAttackRisk: +d.heartAttackRisk
        }));

        // Group data by age and calculate average heart attack risk per age
        const ageGroups = d3.group(that.data, d => d.age);
        that.data = Array.from(ageGroups, ([age, values]) => ({
            age: age,
            heartAttackRisk: d3.mean(values, v => v.heartAttackRisk)
        }));

        // Sort data by age to ensure proper line generation
        that.data.sort((a, b) => a.age - b.age);
    }

    initViz() {
        const that = this;

        that.boundedWidth = that.config.width - that.config.margin.left - that.config.margin.right;
        that.boundedHeight = that.config.height - that.config.margin.top - that.config.margin.bottom;

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

        that.xScale.domain(d3.extent(that.data, d => d.age));
        that.yScale.domain([0, d3.max(that.data, d => d.heartAttackRisk)]);

        that.renderViz();
    }

    renderViz() {
        const that = this;

        const lineGenerator = d3.line()
            .x(d => that.xScale(d.age))
            .y(d => that.yScale(d.heartAttackRisk))
            .curve(d3.curveMonotoneX);

        that.viz.selectAll('path')
            .data([that.data])
            .join('path')
            .attr('d', lineGenerator)
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', 2);

        // Create axis labels
        that.xAxisGroup.call(d3.axisBottom(that.xScale).tickFormat(d => `${d} years`));
        that.yAxisGroup.call(d3.axisLeft(that.yScale).tickFormat(d => `${d}%`));

        // Optionally add labels to the axes
        that.viz.append("text")             
            .attr("transform",
                  "translate(" + (that.boundedWidth/2) + " ," + 
                                 (that.boundedHeight + that.config.margin.top + 20) + ")")
            .style("text-anchor", "middle")
            .text("Age");

        that.viz.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - that.config.margin.left)
            .attr("x",0 - (that.boundedHeight / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Heart Attack Risk (%)");
    }
}
