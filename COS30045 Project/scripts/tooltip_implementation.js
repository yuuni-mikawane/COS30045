//Define the div for the tooltip box
//DEFINE THIS AT THE START OF THE SCRIPT TO CREATE THE DOM ELEMENT
var divTooltip = d3.select("body").append("div")	
    .attr("class", "tooltip")
    .style("opacity", 0);

//ADD THIS TO CREATE TOOLTIPS ON MOUSEOVER/MOUSECLICK/MOUSEOUT
svg.on("mouseover", function(event, d) {
    //store the event's position
    var pageX=event.pageX;
    var pageY=event.pageY;

    //tooltip creation
    divTooltip.transition()
                .duration(200)
                .style("opacity", 0.9)
                .style("width", "200" + "px");

    //positioning existing tooltip and inserting text inside the tooltip
    divTooltip.html("value" + d) //put text in here, probably the value as well
                .style("left", pageX + "px") //position X
                .style("top", pageY + "px"); //position Y
    //ON MOUSEOUT
}).on("mouseout", function(d) {
    //removing the existing tooltip
    divTooltip.transition()		
        .duration(500)
        .style("opacity", 0);
});
