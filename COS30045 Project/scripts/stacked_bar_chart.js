//data imported from CSV
var importedData;
//extracting the year labels
var yearBand;

var w = 750;
var h = 600;
var barPadding = 0.3; //padding between bars
var chartPaddingAxis = 125; //padding for the axis' space
var chartPaddingTop = 100; //padding top for the chart
var chartPaddingRight = 200;
var outerPadding = 0.5;
var tooltipOffset = 75;
var dotRadius = 6;

//button variables
var productionDisplay = true;

var productionToggleBtn = document.getElementById("productionToggleBtn");
var productionBtn = document.getElementById("productionBtn");
var netExportBtn = document.getElementById("netExportBtn");
var consumptionBtn = document.getElementById("consumptionBtn");
var allBtn = document.getElementById("allBtn");

//button reset
function ButtonStyleReset() {
    productionBtn.style.backgroundColor = "white";
    productionBtn.style.color = "black";
    netExportBtn.style.backgroundColor = "white";
    netExportBtn.style.color = "black";
    consumptionBtn.style.backgroundColor = "white";
    consumptionBtn.style.color = "black";
    allBtn.style.backgroundColor = "white";
    allBtn.style.color = "black";
    if (productionDisplay === true)
    {
        productionToggleBtn.style.backgroundColor = "#a7ff7f";
        productionToggleBtn.style.color = "black";
    }
}

//doing this for a reset at the start, and set current highlighted button to AllChart
ButtonStyleReset();
allBtn.style.backgroundColor = "black";
allBtn.style.color = "white";

//chart enums
const ChartAll = 0;
const ChartProduction = 1;
const ChartNetExport = 2;
const ChartConsumption = 3;
var currentChart = ChartAll;

//colorscheme
var color = d3.scaleOrdinal()
            .range(["#4535aa", "#d6d1f5", "#b05cba"]);

// Define the div for the tooltip box
var divTooltip = d3.select("section").append("div")	
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
            .style("background", "#f5f5f5");

//XY scale variable
var xScale;
var yScale;

function SetUpXYScale(dataset){
    //a scale band is used for each stacked bar
    xScale = d3.scaleBand()
                    .domain(dataset)
                    .range([chartPaddingAxis, w - chartPaddingRight])
                    .paddingInner(barPadding)
                    .paddingOuter(outerPadding);

    //scale linear for the values (the actual numbers)
    yScale = d3.scaleLinear()
                    .domain([0, d3.max(dataset, function(d){
                            return d;
                        })
                    ])
                    .range([h - chartPaddingAxis, chartPaddingTop]);
}

function SetUpIntegratedXYScale(dataset){
    //a scale band is used for each stacked bar
    xScale = d3.scaleBand()
                    .domain(dataset)
                    .range([chartPaddingAxis, w - chartPaddingRight])
                    .paddingInner(barPadding)
                    .paddingOuter(outerPadding);

    //scale linear for the values (the actual numbers)
    yScale = d3.scaleLinear()
                    .domain([0, d3.max(dataset, function(d){
                            return (d.consumption + d.netExport);
                        })
                    ])
                    .range([h - chartPaddingAxis, chartPaddingTop]);
}

//chart labels XY
function ChartLabel() {
    //chart label X
    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", w/2)
        .attr("y", h - chartPaddingAxis/2)
        .text("Year")
        .style("font-weight", "bold");

    //chart label Y
    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("x", -200)
        .attr("y", chartPaddingAxis*0.25)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("Amount of energy in Petajoules")
        .style("font-weight", "bold");
}

function BarChart(dataset, chartTitle, colorID){
    //axis declaration
    var xAxis = d3.axisBottom()
                .scale(xScale)
                .tickFormat(function(d,i){ return yearBand[i] });
                
    var yAxis = d3.axisLeft()
                .scale(yScale);

    svg.selectAll("rect")
            .data(dataset)
            .enter()
            .append("rect")
            .attr("class", "bar")
            //get the start of the band to use as the X value
            .attr("x", function(d, i){
                return xScale(dataset[i]);
            })
            //get the Y value based on the linear scale
            .attr("y", function(d){
                return yScale(d);
            })
            //bar width is the bandwidth of each band, minus padding
            .attr("width", xScale.bandwidth())
            //height is the length from the first value to second value of the value pair
            .attr("height", function(d){
                return h - yScale(d) - chartPaddingAxis;
            })
            .style("fill", color(colorID));

        svg.selectAll("text")
            .data(dataset)
            .enter()
            .append("text")
            .text(function(d){
                return d;
            })
            .attr("text-anchor", "middle")
            .attr("x", function(d, i){
                return xScale(dataset[i]) + (xScale.bandwidth() / 2);
            })
            .attr("y", function(d, i){
                return yScale(d) - 10;
            });

    //have to put axis at the end, or the other SVGs will overlap the axis
    svg.append("g")
        .attr("transform", "translate(0, " + (h - chartPaddingAxis) + ")")
        .call(xAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 10)
        .attr("dy", "-5.1em")
        .attr("text-anchor", "end")
        .attr("stroke", "black")
        .text("Amount of energy (Petajoules - PJ)");

    svg.append("g")
        .attr("transform", "translate(" + chartPaddingAxis + ", 0)")
        .call(yAxis);
    
    //all chart title
    svg.append('text')
        .attr("x", (w / 2))
        .attr("y", (chartPaddingAxis / 2 - 20))
        .attr("text-anchor", "middle")
        .style('font-size', "medium")
        .style("font-weight", "bold")
        .text(chartTitle);

    ChartLabel();
}

function ProductionLineChart(dataset){
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
            .on("mouseover", function(event, d) {
                if (productionDisplay)
                {
                    divTooltip.transition()
                            .duration(200)
                            .style("opacity", .9);
                    divTooltip.html(d.production)
                            .style("left", (d3.select(this).attr("cx")) + "px")
                            .style("top", (parseFloat(d3.select(this).attr("cy")) + tooltipOffset) + "px");
                }
                })					
            .on("mouseout", function(d) {		
                divTooltip.transition()
                    .duration(500)
                    .style("opacity", 0);	
            });
}

function ProductionLineChartIntegrated(dataset){
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
            .attr("r", dotRadius)
            .attr("fill", color(3))
            .on("mouseover", function(event, d) {
                if (productionDisplay)
                {
                    divTooltip.transition()
                            .duration(200)
                            .style("opacity", .9);
                    divTooltip.html(d.production)
                            .style("left", (d3.select(this).attr("cx") - 25) + "px")
                            .style("top", (parseFloat(d3.select(this).attr("cy")) - tooltipOffset/2) + "px");
                }
                })
            .on("mouseout", function(d) {		
                divTooltip.transition()
                    .duration(500)
                    .style("opacity", 0);	
            });
        
    //set this variable to true to make sure the line and dots are drawn
    productionDisplay = true;
}

function DisableProductionLineChart(){
    svg.selectAll(".line")
        .transition()
        .style("opacity", 0);
    svg.selectAll(".dot")
        .transition()
        .style("opacity", 0);
}

function EnableProductionLineChart(){
    svg.selectAll(".line")
        .transition()
        .style("opacity", 1);
    svg.selectAll(".dot")
        .transition()
        .style("opacity", 1);
}

function StackedBarChart(dataset){
    //inputting the dataset to the stack, generating the new dictionary of data with stacked values
    var series = stack(dataset);
    var groups = svg.selectAll("g") 
                    .data(series)
                    .enter()
                    .append("g")
                    .style("fill", function(d, i){
                        return color(i);
                    });
    
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
                    })
                    .on("mouseover", function(event, d) {
                        //transition tooltip appear 
                        divTooltip.transition()
                                    .duration(200)
                                    .style("opacity", 0.9)
                                    .style("width", xScale.bandwidth() + "px");
                        //putting in the values and reposition tooltip
                        divTooltip.html(d[1] - d[0])
                                    .style("left", d3.select(this).attr("x") + "px")
                                    .style("top", (parseFloat(d3.select(this).attr("y")) + tooltipOffset ) + "px");
                    })
                    .on("mouseout", function(d) {
                        //removing the existing tooltip
                        divTooltip.transition()
                            .duration(500)
                            .style("opacity", 0);
                    });
    
    //have to put axis at the end, or the other SVGs will overlap the axis
    svg.append("g")
        .attr("transform", "translate(0, " + (h - chartPaddingAxis) + ")")
        .call(xAxis);

    svg.append("g")
        .attr("transform", "translate(" + chartPaddingAxis + ", 0)")
        .call(yAxis);
        
    //all chart title
    svg.append('text')
        .attr("x", (w / 2))
        .attr("y", (chartPaddingAxis / 2 - 20))
        .attr("text-anchor", "middle")
        .style('font-size', "medium")
        .style("font-weight", "bold")
        .text("Australia energy net export, consumption and production (in Petajoules)");

    ChartLabel();
}

function Legend(dataset) {
    // Handmade legend
    svg.append("rect")
        .attr("x", w - chartPaddingAxis * 1.2 - 10)
        .attr("y", h/2 - 50)
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", color(3))
        .style("stroke", "black");

    svg.append("rect")
        .attr("x", w - chartPaddingAxis * 1.2 - 10)
        .attr("y", h/2 - 10)
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", color(1))
        .style("stroke", "black");

    svg.append("rect")
        .attr("x", w - chartPaddingAxis * 1.2 - 10)
        .attr("y", h/2 + 30)
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", color(2))
        .style("stroke", "black");

    svg.append("text")
        .attr("x", w - chartPaddingAxis * 1.2 + 20)
        .attr("y", h/2 - 40)
        .text("Production")
        .style("font-size", "15px")
        .attr("alignment-baseline","middle");

    svg.append("text")
        .attr("x", w - chartPaddingAxis * 1.2 + 20)
        .attr("y", h/2)
        .text("Net Export")
        .style("font-size", "15px")
        .attr("alignment-baseline","middle");

    svg.append("text")
        .attr("x", w - chartPaddingAxis * 1.2 + 20)
        .attr("y", h/2 + 40)
        .text("Consumption")
        .style("font-size", "15px")
        .attr("alignment-baseline","middle");
}

function DrawSVGAll(){
    SetUpIntegratedXYScale(importedData);
    StackedBarChart(importedData);
    ProductionLineChartIntegrated(importedData);
    Legend(importedData);
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
    importedData = data;
    yearBand = importedData.map(d => d.year);
    DrawSVGAll();
});

//onclicks for buttons
d3.select("#productionToggleBtn")
.on("click", function() {
    if (currentChart === ChartAll)
    {
        if(productionDisplay !== true)
        {
            EnableProductionLineChart();
            productionToggleBtn.style.backgroundColor = "#a7ff7f";
            productionDisplay = true;
        }
        else
        {
            DisableProductionLineChart();
            productionToggleBtn.style.backgroundColor = "white";
            productionDisplay = false;
        }
    }
});

d3.select("#productionBtn")
.on("click", function() {
    if (currentChart !== ChartProduction)
    {
        d3.selectAll("svg > *")
            .remove();
        currentChart = ChartProduction;
        productionToggleBtn.style.display = "none";
        ButtonStyleReset();
        productionBtn.style.backgroundColor = "black";
        productionBtn.style.color = "white";
        //extracting the production data
        let productionData = importedData.map(d => d.production);
        SetUpXYScale(productionData);
        BarChart(productionData, "Australia energy production (in Petajoules)", 3);
    }
});

d3.select("#netExportBtn")
.on("click", function() {
    if (currentChart !== ChartNetExport)
    {
        d3.selectAll("svg > *")
            .remove();
        currentChart = ChartNetExport;
        productionToggleBtn.style.display = "none";
        ButtonStyleReset();
        netExportBtn.style.backgroundColor = "black";
        netExportBtn.style.color = "white";
        //extracting the net export data
        let netExportData = importedData.map(d => d.netExport);
        SetUpXYScale(netExportData);
        BarChart(netExportData, "Australia energy net export (in Petajoules)", 1);
    }
});

d3.select("#consumptionBtn")
.on("click", function() {
    if (currentChart !== ChartConsumption)
    {
        d3.selectAll("svg > *")
            .remove();
        currentChart = ChartConsumption;
        productionToggleBtn.style.display = "none";
        ButtonStyleReset();
        consumptionBtn.style.backgroundColor = "black";
        consumptionBtn.style.color = "white";
        //extracting the consumption data
        let consumptionData = importedData.map(d => d.consumption);
        SetUpXYScale(consumptionData);
        BarChart(consumptionData, "Australia energy consumption (in Petajoules)", 2);
    }
});

d3.select("#allBtn")
.on("click", function() {
    if (currentChart !== ChartAll)
    {
        currentChart = ChartAll;
        d3.selectAll("svg > *")
            .remove();
        productionDisplay = true;

        productionToggleBtn.style.display = "block";
        ButtonStyleReset();
        allBtn.style.backgroundColor = "black";
        allBtn.style.color = "white";

        SetUpIntegratedXYScale(importedData);
        StackedBarChart(importedData);
        ProductionLineChartIntegrated(importedData);
        Legend(importedData);
    }
});