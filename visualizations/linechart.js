import * as d3 from "d3";

export default class LineChart {
    constructor(data, config) {
        this.data = data;
        this.config = {
            parentElement: config?.parentElement || 'body',
            colorScale: config?.colorScale,
            width: config?.width || 600,
            height: config?.height || 400,
            margin: config?.margin || { top: 10, right: 30, bottom: 30, left: 60 }
        };
        this.prepareData();
        this.initViz();
    }

    prepareData() {
        this.data = this.data.map(d => ({
            age: +d.age, // Ensure age is a number, it will act as our 'date'
            heartRate: +d.heartRate // Ensure heart rate is a number, it will act as our 'value'
        }));
    
        // Optionally, sort data by age if necessary
        this.data.sort((a, b) => a.age - b.age);
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
    
        that.xScale = d3.scaleLinear().range([0, that.boundedWidth]); // Changed from scaleTime to scaleLinear
        that.yScale = d3.scaleLinear().range([that.boundedHeight, 0]);
    
        that.xAxisGroup = that.viz.append('g')
            .attr('transform', `translate(0,${that.boundedHeight})`);
        that.yAxisGroup = that.viz.append('g');
    
        that.updateViz();
    }
    

    updateViz() {
        const that = this;
        that.xScale.domain(d3.extent(that.data, d => d.age)); // Use 'age' here
        that.yScale.domain([0, d3.max(that.data, d => d.heartRate)]); // Use 'heartRate' here
    
        that.renderViz();
    }    

    renderViz() {
        const that = this;

        const lineGenerator = d3.line()
            .x(d => that.xScale(d.age))
            .y(d => that.yScale(d.heartRate))
            .curve(d3.curveMonotoneX);  // This makes the line smooth

        that.viz.selectAll('path')
            .data([that.data])  // Make sure to wrap data in an array
            .join('path')
            .attr('d', lineGenerator)
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', 2);

        that.xAxisGroup.call(d3.axisBottom(that.xScale));
        that.yAxisGroup.call(d3.axisLeft(that.yScale));
    }
}