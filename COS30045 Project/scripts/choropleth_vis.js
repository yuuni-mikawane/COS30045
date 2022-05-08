function init(){
	choropleth();
}

function choropleth(){
	var width = 1000;
	var height = 800;

	var projection = d3.geoMercator().center([120, -28.5])
					   .translate([width/2, height/2])
					   .scale(800);

	var color = d3.scaleThreshold().domain([100,1000]).range(['#fee6ce','#fdae6b','#e6550d']);


	var path = d3.geoPath().projection(projection);

	var svg = d3.select("p")
				.append("svg")
				.attr("width", width)
				.attr("height", height)
				.attr("fill", "grey");

	d3.csv("./data/Energy_consumption_by_state.csv").then(function(data) {

		
		
	d3.json("./data/australia_states.json").then(function(json) {

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
		
		states = svg.selectAll("g.state")
					.data(json.features)
					.enter();
					
		states.append("path")
			.attr("stroke", "white")
			.attr("d", path)
			.style("fill", function(json) {
			
				var value = json.properties.value;
							
				if (value) {
					
					return color(value);
				} else {
					
					return "grey";
				}
			});
		states.append("text")
            .attr("fill", "black")
            .style("font-size", "12px")
            .attr("transform", d => { return "translate(" + path.centroid(d) + ")"; })
            .attr("text-anchor", "middle")
            .attr("dy", 15)
            .text(d => d.properties.STATE_NAME);
	
		states.h
			
	});
			
	});
}


window.onload = init;