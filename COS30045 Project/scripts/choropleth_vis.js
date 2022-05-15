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
	
	var tooltip = d3.select("body").append("div")
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
			.on("mouseover", function (event,d) {
				
				tooltip.transition()
					.duration(200)
					.style("opacity", 1);
				tooltip.html(d.properties.value)
					.style("left", event.pageX + "px")
					.style("top", event.pageY + "px")
					.style("fill", "black");
			})
			.on("mouseout", function (d) {
				tooltip.transition()
					.duration(200)
					.style("opacity", 0);
			})
			.on("click", function(d){
				d3.csv("./data/Energy_mix_by_states.csv").then(function(data){
					pieChart(data);
				})
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
			
		function pieChart(data){
				
				var width = 350;
				var	height = 350;
				var outerRadius = width /2;
				var	innerRadius = 0;
				var arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);
				var pie = d3.pie();
				var colour = d3.scaleOrdinal(d3.schemeCategory10);
				var svg = d3.select("body")
							.append("svg")
							.attr("width", width)
							.attr("height", height);
				
				for (var i = 0; i < data.length; i++) {


					var data_state = data[i].state;
					
					
					var data_coal = parseFloat(data[i].coal);
					var data_oil = parseFloat(data[i].oil);
					var data_gas = parseFloat(data[i].gas);
					var data_renewables = parseFloat(data[i].data_renewables);
					
					
					for (var j = 0; j < json.features.length; j++) {
					
						var json_state = json.features[j].properties.STATE_NAME;
						
						if (data_state == json_state) {
					
							
							json.features[j].properties.coal = data_coal;
							json.features[j].properties.oil = data_oil;
							json.features[j].properties.gas = data_gas;
							json.features[j].properties.renewables = data_renewables;
							
					
							break;
							
						}
						
					}		
				}	
				var dataset = data.map(function(d,i){
					return [d.coal, d.oil, d.gas, d.renewables];
				})
				
				//Set up groups
				
				var arcs = svg.selectAll("g.arc")
							.data(pie(function(dataset,i){
								return dataset[i];
							}))
							.enter()
							.append("g")
							.attr("class", "arc")
							.attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");

				//Draw arc paths
				arcs.append("path")
					.attr("fill", function(d, i) {
					return colour(i);
					})
					.attr("d", arc);

				//Labels
				arcs.append("text")
					.attr("transform", function(d) {
					return "translate(" + arc.centroid(d) + ")";
					})
					.attr("text-anchor", "middle")
					.text(function(d) {
					return d.value;
					});
							
				}

							
					});
					


	})
	.catch(function(err) { console.log(err); });
}


window.onload = init;
