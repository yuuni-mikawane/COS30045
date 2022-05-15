function init(){
	choropleth();
}

function choropleth(){
	
	var width = 1000;
	var height = 800;

	var projection = d3.geoMercator().center([120, -28.5])
					   .translate([width/2, height/2])
					   .scale(800);

	var path = d3.geoPath().projection(projection);

	var svg = d3.select("p")
				.append("svg")
				.attr("width", width)
				.attr("height", height)
				.attr("fill", "grey");
	
	var tooltip = d3.select("p").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
	d3.csv("./data/Energy_consumption_by_state.csv").then(function(data) {
		
	d3.json("./data/australia_states.json").then(function(json) {
		var color = d3.scaleThreshold().domain([0,200,400,600,800,1200,1400]).range(d3.schemeReds[6]);
		var legend = svg.selectAll("p")
            .data([0,200,400,600,800,1200,1400])
            .enter().append("g")
            .attr("class", "legend");
        var legend_labels = ["<400", "400-800", "800-1200", "1200-1400",">1400"];

        var ls_w = 30, ls_h = 40;
	//color legend
        legend.append("rect")
            .attr("x", width - 800)
            .attr("y", function (d, i) { return 250 - (i * ls_h) - 2 * ls_h; })
            .attr("width", ls_w)
            .attr("height", ls_h)
            .style("fill", function (d, i) { return color(d); });


        legend.append("text")
            .attr("x", width -850)
            .attr("y", 300)
			.attr("fill", "black")
            .text("Energy Consumption (PJ)");

        svg.append("text")
            .attr("x", width -700)
            .attr("y", height - 550)
            .attr("id","undefined")
            .attr("font-weight", "normal")
			.attr("fill", "black")
            .text("Undefined");

        legend.append("rect")
            .attr("x", width -800)
            .attr("y", height -580)
            .attr("width", ls_w)
            .attr("height", ls_h)
            .style("fill", "#ccc");


        legend.append("text")
            .attr("x", width -700)
            .attr("y", function (d, i) { return 250 - (i * ls_h) - ls_h - 4; })
			.attr("fill", "black")
            .text(function (d, i) { return legend_labels[i]; });


		for (var i = 0; i < data.length; i++) {
	
			
			var data_state = data[i].state;
			
			
			var dataValue = parseFloat(data[i].amount);
			
			
			for (var j = 0; j < json.features.length; j++) {
			
				var json_state = json.features[j].properties.STATE_NAME;
				
				if (data_state == json_state) {
			
					
					json.features[j].properties.value = dataValue;
					
			
					break;
					
				}
			}		
		}
		
		svg.selectAll("g.state")
					.data(json.features)
					.enter()
					
			.append("path")
			.attr("stroke", "white")
			.attr("d", path)
			.on("mouseover", function (d, event) {
				console.log(typeof(d));
				console.log(d.properties.value);
				tooltip.transition()
					.duration(250)
					.style("opacity", 1);
				tooltip.html(d.properties.value)
					.style("left", (event.pageX + 15) + "px")
					.style("top", (event.pageY - 28) + "px")
					.style("fill", "black");
			})
			.on("mouseout", function (d) {
				tooltip.transition()
					.duration(250)
					.style("opacity", 0);
			})
			.style("fill", function(d) {
			
				var value = d.properties.value;
							
				if (value) {
					
					return color(value);
				} else {
					
					return "grey";
				}
			})
			;
			
			
		
		
		svg.selectAll("g.state")
			.data(json.features)
			.enter()
		    .append("text")
		    .attr("fill", "white")
		    .style("font-size", "12px")
		    .attr("transform", d => { return "translate(" + path.centroid(d) + ")"; })
		    .attr("text-anchor", "middle")
		    .attr("dy", 15)
		    .text(function(d){return d.properties.STATE_NAME;});
			
		

			
	});
	


	})
	.catch(function(err) { console.log(err); });
}


window.onload = init;
