import * as d3 from "d3";

export default class RadarChart {
    constructor(data, config) {
        this.data = data;
        this.config = {
            parentElement: config?.parentElement || 'body',
            width: config?.width || 500,
            height: config?.height || 500,
            levels: config?.levels || 5,
            maxValue: config?.maxValue || 1,
            labelFactor: config?.labelFactor || 1.25,
            wrapWidth: config?.wrapWidth || 60,
            opacityArea: config?.opacityArea || 0.35,
            dotRadius: config?.dotRadius || 4,
            opacityCircles: config?.opacityCircles || 0.1,
            strokeWidth: config?.strokeWidth || 2,
            roundStrokes: config?.roundStrokes || false,
            color: config?.color || d3.scaleOrdinal(d3.schemeCategory10)
        };
        this.initViz();
    }

    initViz() {
        const that = this;

        that.boundedWidth = that.config.width;
        that.boundedHeight = that.config.height;

        // Set up SVG and chart area
        that.svg = d3.select(that.config.parentElement).append("svg")
            .attr("width", that.config.width)
            .attr("height", that.config.height)
            .append("g")
            .attr("transform", `translate(${that.config.width / 2}, ${that.config.height / 2})`);

        that.radius = Math.min(that.boundedWidth / 2, that.boundedHeight / 2);

        // Set up scales
        that.angleSlice = Math.PI * 2 / that.data[0].length;

        // Scale for the radius
        that.rScale = d3.scaleLinear()
            .range([0, that.radius])
            .domain([0, that.config.maxValue]);

        // Create the grid background
        that.axisGrid = that.svg.append("g").attr("class", "axisWrapper");

        // Draw the background circles
        that.axisGrid.selectAll(".levels")
            .data(d3.range(1, (that.config.levels + 1)).reverse())
            .join("circle")
            .attr("class", "gridCircle")
            .attr("r", d => that.radius / that.config.levels * d)
            .style("fill", "#CDCDCD")
            .style("stroke", "#CDCDCD")
            .style("fill-opacity", that.config.opacityCircles);

        // Draw the axes
        that.axisGrid.selectAll(".axis")
            .data(that.data[0])
            .join("g")
            .attr("class", "axis")
            .each(function (d, i) {
                const axis = d3.select(this);
                const angle = i * that.angleSlice;

                // Draw the lines
                axis.append("line")
                    .attr("x1", 0)
                    .attr("y1", 0)
                    .attr("x2", that.rScale(that.config.maxValue) * Math.cos(angle - Math.PI / 2))
                    .attr("y2", that.rScale(that.config.maxValue) * Math.sin(angle - Math.PI / 2))
                    .attr("class", "line")
                    .style("stroke", "white")
                    .style("stroke-width", "2px");

                // Draw the labels
                axis.append("text")
                    .attr("class", "legend")
                    .style("font-size", "12px")
                    .attr("text-anchor", "middle")
                    .attr("dy", "0.35em")
                    .attr("x", that.rScale(that.config.maxValue * that.config.labelFactor) * Math.cos(angle - Math.PI / 2))
                    .attr("y", that.rScale(that.config.maxValue * that.config.labelFactor) * Math.sin(angle - Math.PI / 2))
                    .text(d => d.axis)
                    .call(that.wrap, that.config.wrapWidth);
            });

        // Draw the radar chart blobs
        that.blobWrapper = that.svg.selectAll(".radarWrapper")
            .data(that.data)
            .join("g")
            .attr("class", "radarWrapper");

        // Append the backgrounds
        that.blobWrapper.append("path")
            .attr("class", "radarArea")
            .attr("d", d => that.radarLine(d))
            .style("fill", (d, i) => that.config.color(i))
            .style("fill-opacity", that.config.opacityArea)
            .on('mouseover', function (event, d) {
                // Dim all blobs
                that.svg.selectAll(".radarArea")
                    .transition().duration(200)
                    .style("fill-opacity", 0.1);
                // Bring back the hovered over blob
                d3.select(this)
                    .transition().duration(200)
                    .style("fill-opacity", 0.7);
            })
            .on('mouseout', function () {
                // Bring back all blobs
                that.svg.selectAll(".radarArea")
                    .transition().duration(200)
                    .style("fill-opacity", that.config.opacityArea);
            });

        // Create the outlines
        that.blobWrapper.append("path")
            .attr("class", "radarStroke")
            .attr("d", d => that.radarLine(d))
            .style("stroke-width", that.config.strokeWidth + "px")
            .style("stroke", (d, i) => that.config.color(i))
            .style("fill", "none")
            .style("filter", "url(#glow)");

        // Append the circles
        that.blobWrapper.selectAll(".radarCircle")
            .data(d => d)
            .join("circle")
            .attr("class", "radarCircle")
            .attr("r", that.config.dotRadius)
            .attr("cx", (d, i) => that.rScale(d.value) * Math.cos(i * that.angleSlice - Math.PI / 2))
            .attr("cy", (d, i) => that.rScale(d.value) * Math.sin(i * that.angleSlice - Math.PI / 2))
            .style("fill", (d, i, nodes) => that.config.color(nodes[i].parentNode.__data__.index))
            .style("fill-opacity", 0.8);
    }

    wrap(text, width) {
        text.each(function () {
            const text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                lineHeight = 1.4,
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy"));
            let word,
                line = [],
                lineNumber = 0,
                tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");

            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    }

    radarLine(data) {
        const that = this;
        return d3.lineRadial()
            .radius(d => that.rScale(d.value))
            .angle((d, i) => i * that.angleSlice)
            .curve(d3.curveLinearClosed)(data);
    }
}

