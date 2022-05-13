var w = 600;
var h = 500;
var barPadding = 0.3; //padding between bars
var chartPadding = 100; //padding for the axis' space
var svgRightPadding = 50;
var tooltipYOffset = 200;

//colorscheme
var color = d3.scaleQuantize()
            .range(["#4535aa", "#b05cba", "#d6d1f5"]);

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
                    .paddingInner(barPadding);

    //scale linear for the values (the actual numbers)
    var yScale = d3.scaleLinear()
                    .domain([0, d3.max(dataset, function(d){
                            return d.consumption + d.netExport;
                        })
                    ])
                    .range([h - chartPadding, chartPadding]);

    //drawing the stacked rectangles
    var rects = groups.selectAll("rect")
                    .data(function(d){ return d; })
                    .enter()
                    .append("rect")
                    //get the start of the band to use as the X value
                    .attr("x", function(d, i){
                        return xScale(dataset[i]);
                    })
                    //get the Y value based on the linear scale
                    .attr("y", function(d){
                        return yScale(d[1]);
                    })
                    .style("stroke", "black")
                    .style("stroke-width", 1)
                    //bar width is the bandwidth of each band, minus padding (which is 0.1, previously stated)
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



                        var pageX=event.pageX;
                        var pageY=event.pageY;

                        divTooltip.transition()
                                    .duration(200)
                                    .style("opacity", 0.9)
                                    .style("width", xScale.bandwidth() + "px");
                                    console.log(xScale.bandwidth());
                        divTooltip.style.position = "absolute";
                        divTooltip.html(d[1])
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
});