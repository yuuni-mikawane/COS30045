// Define the div for the tooltip box
//DEFINE THIS AT THE START OF THE SCRIPT
var divTooltip = d3.select("body").append("div")	
    .attr("class", "tooltip")
    .style("opacity", 0);

//ADD THIS TO CREATE TOOLTIPS ON MOUSEOVER
svg.on("mouseover", function(event, d) {
    //store the event's position
    var pageX=event.pageX;
    var pageY=event.pageY;

    //tooltip creation
    divTooltip.transition()
                .duration(200)
                .style("opacity", 0.9)
                .style("width", "200" + "px");

    //positioning
    divTooltip.html(d)
                .style("left", pageX + "px")
                .style("top", pageY + "px");
    //ON MOUSEOUT
}).on("mouseout", function(d) {
    //removing the existing tooltip
    divTooltip.transition()		
        .duration(500)
        .style("opacity", 0);
});
