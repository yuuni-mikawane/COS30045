var w = 500;
var h = 500;
var barPadding = 0.3;
var chartPadding = 100;

//colors
var color = d3.scaleOrdinal(d3.schemeCategory10);

//creating the stack visualization, with the .keys() specify which properties (series) in the dataset to use
var stack = d3.stack()
                .keys(["consumption", "netExport"]);

//svg setup
var svg = d3.select("section")
            .append("svg")
            .attr("width", w)
            .attr("height", h);


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
                    .range([chartPadding, w])
                    .paddingInner(barPadding);

    //scale linear for the values (the actual numbers)
    var yScale = d3.scaleLinear()
                    .domain([0, d3.max(dataset, function(d){
                            return parseInt(d.production) + parseInt(d.consumption) + parseInt(d.netExport);
                        })
                    ])
                    .range([h - chartPadding, 0]);

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
                    //bar width is the bandwidth of each band, minus padding (which is 0.1, previously stated)
                    .attr("width", xScale.bandwidth())
                    //height is the length from the first value to second value of the value pair
                    .attr("height", function(d){
                        return yScale(d[0]) - yScale(d[1]);
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