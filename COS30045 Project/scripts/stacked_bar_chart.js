var w = 700;
var h = 500;
var barPadding = 0.3; //padding between bars
var chartPadding = 80; //padding for the axis' space
var svgRightPadding = 50;
var outerPadding = 0.5;
var tooltipYOffset = 220;

//colorscheme
var color = d3.scaleOrdinal()
            .range(["#4535aa", "#d6d1f5", "#b05cba"]);

// Define the div for the tooltip box
var divTooltip = d3.select("body").append("div")	
    .attr("class", "tooltip")
    .style("opacity", 0);

//creating the stack visualization, with the .keys() specify which properties (series) in the dataset to use
var stack = d3.stack()
                .keys(["consumption", "netExport"]);

//svg setup
var svg = d3.select("section")
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            .style("background", "white");

function LineChart(dataset){
    //a scale band is used for each stacked bar
    var xScale = d3.scaleBand()
                    .domain(dataset)
                    .range([chartPadding, w - svgRightPadding])
                    .paddingInner(barPadding)
                    .paddingOuter(outerPadding);

    //scale linear for the values (the actual numbers)
    var yScale = d3.scaleLinear()
                    .domain([0, d3.max(dataset, function(d){
                            return (d.consumption + d.netExport);
                        })
                    ])
                    .range([h - chartPadding, chartPadding]);

    //extracting the production data
    let productionData = dataset.map(d => d.production);

    //line generator
    line = d3.line()
            .x(function(d, i){
                return xScale(dataset[i]) + xScale.bandwidth() / 2;
            })
            .y(function(d) { return yScale(d); });

    //drawing the "path" using line
    svg.append("path")
        .datum(productionData)
        .attr("class", "line")
        .attr("d", line);

    //drawing the circle dots
    svg.selectAll("circle")
            .data(dataset)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", function(d, i){
                return xScale(dataset[i]) + xScale.bandwidth() / 2;
            })
            .attr("cy", function(d, i){
                return yScale(dataset[i].production);
            })
            .attr("r", 6)
            .attr("fill", color(3))
            .on("mouseover", function(d) {		
                divTooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                divTooltip.html(d)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
                })					
            .on("mouseout", function(d) {		
                divTooltip.transition()
                    .duration(500)
                    .style("opacity", 0);	
            });
}

function stackedBarChart(dataset){
    //inputting the dataset to the stack, generating the new dictionary of data with stacked values
    var series = stack(dataset);
    var groups = svg.selectAll("g") 
                    .data(series)
                    .enter()
                    .append("g")
                    .style("fill", function(d, i){
                        return color(i);
                    });
    //a scale band is used for each stacked bar
    var xScale = d3.scaleBand()
                    .domain(dataset)
                    .range([chartPadding, w - svgRightPadding])
                    .paddingInner(barPadding)
                    .paddingOuter(outerPadding);

    //scale linear for the values (the actual numbers)
    var yScale = d3.scaleLinear()
                    .domain([0, d3.max(dataset, function(d){
                            return (d.consumption + d.netExport);
                        })
                    ])
                    .range([h - chartPadding, chartPadding]);
    
    //extracting the year labels
    let yearBand = dataset.map(d => d.year);

    //axis declaration
    var xAxis = d3.axisBottom()
                .scale(xScale)
                .tickFormat(function(d,i){ return yearBand[i] });
                
    var yAxis = d3.axisLeft()
                .scale(yScale);

    //drawing the stacked rectangles
    var rects = groups.selectAll("rect")
                    .data(function(d){ return d; })
                    .enter()
                    .append("rect")
                    .attr("class", "stacked_bar")
                    //get the start of the band to use as the X value
                    .attr("x", function(d, i){
                        return xScale(dataset[i]);
                    })
                    //get the Y value based on the linear scale
                    .attr("y", function(d){
                        return yScale(d[1]);
                    })
                    //bar width is the bandwidth of each band, minus padding
                    .attr("width", xScale.bandwidth())
                    //height is the length from the first value to second value of the value pair
                    .attr("height", function(d){
                        return yScale(d[0]) - yScale(d[1]);
                    }).on("mouseover", function(event, d) {

                        //changing fill color
                        // d3.select(this)
                        //     .attr("fill", function(d, i){
                        //         return color(i);
                        //     });

                        divTooltip.transition()
                                    .duration(200)
                                    .style("opacity", 0.9)
                                    .style("width", xScale.bandwidth() + "px");
                        divTooltip.style.position = "absolute";
                        divTooltip.html(d[1] - d[0])
                                    .style("left", d3.select(this).attr("x") + "px")
                                    .style("top", (parseFloat(d3.select(this).attr("y")) + tooltipYOffset ) + "px");
                    })
                    .on("mouseout", function(d) {
                        //removing the existing tooltip
                        divTooltip.transition()		
                            .duration(500)		
                            .style("opacity", 0);	

                        //changing fill color back
                        // d3.select(this)
                        //     .attr("fill", function(d, i){
                        //         return color(i);
                        //     });
                    });
    
    //have to put axis at the end, or the other SVGs will overlap the axis
    svg.append("g")
        .attr("transform", "translate(0, " + (h - chartPadding) + ")")
        .call(xAxis);

    svg.append("g")
        .attr("transform", "translate(" + chartPadding + ", 0)")
        .call(yAxis);
}

//d3.csv(<insert csv file name>) is for reading data from a csv.
d3.csv("data/Net_export_Consumption_Production_in_Aus.csv", function(d) {
    return {
        year: d.year,
        production: parseInt(d.production),
        consumption: parseInt(d.consumption),
        netExport: parseInt(d.netExport),
    };
}).then(function(data){
    dataset = data;
    stackedBarChart(dataset);
    LineChart(dataset);
});