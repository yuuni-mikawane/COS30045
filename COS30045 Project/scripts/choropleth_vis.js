function init(){
	choropleth();
}

function choropleth(){
	//initialise variables needed for the elements in the vis
	var width = 1000;
	var height = 800;

	var projection = d3.geoMercator().center([120, -28.5])
					   .translate([width/2, height/2])
					   .scale(800);

	var path = d3.geoPath().projection(projection);

	var svg = d3.select("p").append("svg")
				.attr("width", width)
				.attr("height", height)
				.attr("fill", "grey");

	var tooltip = d3.select("body").append("div")
					.attr("class","tooltip")
					.style("opacity", 0);

	//import data 
	d3.csv("./data/Energy_consumption_by_state.csv").then(function(data){

		d3.csv("./data/Energy_mix_by_states.csv").then(function(data_mix){

			d3.json("./data/australia_states.json").then(function(json){
				//initialise color scheme for the choropleth map 
				var color = d3.scaleThreshold().domain([0,200,400,600,800,1200,1400]).range(d3.schemeReds[6]);
				
				//create a color legend for the choropleth map
				var legend = svg.selectAll("p")
								.data([0,200,400,600,800,1200,1400])
            					.enter().append("g");
				
				var legend_labels = [">1400", "1200 - 1400", "800 - 1200", "400 - 800", "<400"];
				var legend_width = 30;
				var legend_height = 40;

				legend.append("rect")
					  .attr("height", legend_height)
					  .attr("width", legend_width)
					  .attr("x", width/5-20)
					  .attr("y", function(d,i){
						  return 250 - legend_height * (i+2);
					  })
					  .attr("fill", d => color(d));
				
				legend.append("rect")
					  .attr("height", legend_height)
					  .attr("width", legend_width)
					  .attr("x", width/5 - 20)
					  .attr("y", 250 - legend_height +7 )
					  .style("fill", "#ccc");
				
				legend.append("text")
					  .attr("x", width * 0.15)
					  .attr("y", height/2 - 100)
					  .attr("fill", "black")
					  .text("Total Energy Consumption (PJ)");
					 
				legend.append("text")
					  .attr("x", width/3 - 100)
					  .attr("y", height/4 + 50)
					  .attr("font-weight", "normal")
					  .attr("fill", "black")
					  .text("Undefined");

				legend.append("text")
					  .attr("x", width/3 - 100)
					  .attr("y", function(d,i){
						  return legend_height * (i+1) - 4;
					  })
					  .attr("fill", "black")
					  .text((d,i) => legend_labels[i]);

				//bind data from the 'total energy consumption'csv file to the corresponding region
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


				//bind date from the 'energy mix' csv file to the corresponding region
				for (var i = 0; i < data_mix.length; i++) {
					var data_state = data_mix[i].state;
					var data_coal = parseFloat(data_mix[i].coal);
					var data_oil = parseFloat(data_mix[i].oil);
					var data_gas = parseFloat(data_mix[i].gas);
					var data_renewables = parseFloat(data_mix[i].renewables);
					
					
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
				
				svg.selectAll("g.state").data(json.features).enter()
					.append("path")
					.attr("stroke", "white")
					.attr("d", path)
					.on("mouseover", function(event, d){
						tooltip.transition()
								.duration(200)
								.style("opacity", 1);
						tooltip.html(d.properties.value)
								.style("left", event.pageX + "px")
								.style("top", event.pageY + "px")
								.style("fill", "black");
					})
					.on("mouseout", function(d){
						tooltip.transition()
								.duration(200)
								.style("opacity",0);
					})
					.on("click", function(event,d){
						var exist = false;
						if(exist){
							pieChart(d);
							exist = true;
						}else{
							for(i=0; i<4;i++){
							d3.select(".pie_chart").remove();
							}
						}
						pieChart(d);
					})
					.style("fill", function(d){
						var value = d.properties.value;
						if(value){
							return color(value);
						}else{
							return "grey";
						}
					});
			
				svg.selectAll("g.state").data(json.features).enter()
					.append("text")
					.attr("fill", "white")
					.style("font-size", "12px")
					.attr("transform", d => "translate(" + path.centroid(d) + ")")
					.attr("text-anchor", "middle")
					.attr("dy", 15)
					.text(function(d){return d.properties.STATE_NAME;});
				
				//create a pie chart displaying the energy mix for the selected region
				function pieChart(d){
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
								.attr("height", height)
								.attr("x", width)-100
								.attr("y", height);

					//create a group of arcs
					var arcs = svg.selectAll("g.arc")
							.data(pie([d.properties.coal, d.properties.oil, d.properties.gas,d.properties.renewables])) 
							.enter()
							.append("g")
							.attr("class", "pie_chart")
							.attr("transform", "translate(" + outerRadius + "," + outerRadius + ")")
							;
					
					//create arc paths
					arcs.append("path")
						.attr("fill", function(d, i) {
							return colour(i);
						})
						.attr("d", arc);

					//create labels for each wedge
					arcs.append("text")
						.attr("transform", function(d) {
						return "translate(" + arc.centroid(d) + ")";
						})
						.attr("text-anchor", "middle")
						.text(function(d) {
						return d.value;
						});
							
				  } 
				})
			})
		})
	}





window.onload = init;