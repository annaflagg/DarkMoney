var margin = {top: 40, right: 60, bottom: 60, left: 60},
    width = 900 - margin.left - margin.right,
    height = 650 - margin.top - margin.bottom;

var formatNumber = d3.format(",.0f"),
    format = function(d) { return formatNumber(d) + " TWh"; },
    color = d3.scale.category20();

var svg = d3.select("#svg").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var sankey = d3.sankey()
    .nodeWidth(10)
    .nodePadding(15)
    //.scale(0.0000028346233342260588)
    .size([width, height]);
    
//console.log(sankey.maxLinkValue())

var path = sankey.link();

var timeline;// = svg.append("circle").attr("cx", 400).attr("cy", 0).attr("r", 10).on("click", updatedate)
var timelineg;
var linkdata, nodedata;
//var link;
var graph;
var graphgroup;
var node; //= svg.selectAll(".node"),
var link;// = svg.selectAll(".link");
var minWidth = 2;
var linkg, nodeg;
var prevheights = {};
var second = false;
var years;
var yeari = 0;

/**
function dragmove(d) {
    d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
    sankey.relayout();
    link.attr("d", path);
}**/

function timeline() {
	var timelinex = 400;
	var timelinespace = 40;
	var timeliney = 0;
	var timeliner = 10;
	
	timeline = timelineg.selectAll("timeline")
				.data(years)
				.enter().append("g");
				
	timeline.append("circle")
			.attr("class", "timelinecircle")
			.classed("timelinecirclehighlight", function(d, i) {return i==yeari;})
			.attr("cx", function(d, i) { return timelinex+timelinespace*i;}).attr("cy", timeliney).attr("r", timeliner)
			.on("click", updatedate)
			.on("mouseover", function(d, i) {
					if (i != yeari) {
					d3.select(this).classed("timelinecirclehover", true)}})
			.on("mouseout", function(d, i) {d3.select(this).classed("timelinecirclehover", false)})
	timelineg.append("text")
			.attr("x", timelinex+(timelinespace*years.length/4))
			.attr("y", timeliney-(timelinespace/2))
			.attr("text-anchor", "middle")
			.text(years[yeari])
						
						
}

function updatedate(d, i) {
	if (yeari == i) {
		return;
	}
	yeari = i;
	timeline = svg.selectAll("circle").classed("timelinecirclehighlight", function(d, i) {return i==yeari;});
	timelineg.select("text").text(years[yeari])
	linkdata = eval("graph.links"+yeari);
	nodedata = eval("graph.nodes"+yeari);
	second = true;
	//console.log(nodedata)
	//sankey = d3.sankey()
   // .nodeWidth(15)
   // .nodePadding(10)
   // .size([width, height]);
  
	update();
}

function update() {
	var nodemovetime = 500;
	var existing, enter;
	 sankey
      .nodes(nodedata)
      .links(linkdata)
      .scale(0.0000028346233342260588)
      .layout(32);
      
  
	existing = link = linkg.selectAll(".link")
		.data(linkdata, function(d, i) {return d.source.ein+ "-" + d.target.ein});
		
	existing.select("path")//.attr("d", path)
		//.style("stroke-width", function(d) { return Math.max(minWidth, d.dy); })
		.transition()
    		.duration(nodemovetime)
    		//.delay(nodemovetime)
    		.attr("d", path)
  			.style("stroke-width", function(d) { return Math.max(minWidth, d.dy); })
      
    enter = link.enter().append("g")
    	.attr("class", "link");
    	
    enter.append("path").attr("d", path)
    	//.transition()
    	//	.duration(nodemovetime)
    		//.delay(nodemovetime)
  			.style("stroke-width", function(d) { return Math.max(minWidth, d.dy); });
  			//.classed("highlightedlink", function(d, i) {return d.source.name=="UNKNOWN SOURCES";});
  	
  	link.sort(function(a, b) { return b.dy - a.dy; });
  		
  	link.exit().remove();
	
	
	// NODES
	// Data Join - join new data with old elements, if any.
	existing = node = nodeg.selectAll(".node")
		.data(nodedata, function(d, i) { return d.ein;});
		

  	// Update - update old elements as needed.
	existing.select("rect")
      	.transition()
      		.duration(nodemovetime)
      		.attr("height", function(d) { return d.dy; })
      	//.transition()
      	//	.duration(nodemovetime)
      		.attr("x", function(d) {return d.x})
       		.attr("y", function(d) {return d.y});
    existing.select("text")
    	.transition()
    		.duration(nodemovetime)
    		.attr("x", function(d) {return d.x-6;})
    		.attr("y", function(d) { return d.y + d.dy / 2; })
    		.filter(function(d) { return d.x < width / 2; })
      		.attr("x", function(d) {return d.x + 6 + sankey.nodeWidth();})
       		
     // Enter - create new elements as needed.
    enter = node.enter().append("g")
		.attr("class", "node")
		  .on("mouseover", function(d) {d3.select(this).select("text").classed("highlightedtext", true)})
		  .on("mouseout", function(d) {d3.select(this).select("text").classed("highlightedtext", false)});
        
        
    enter.append("rect").attr("height", function(d) { return d.dy; })
      	.attr("width", sankey.nodeWidth())
      	.attr("x", function(d) {return d.x})
        .attr("y", function(d) {return d.y});
        
    enter.append("text")
      .attr("class", "defaulttext")
  	  .attr("x", function(d) {return d.x-6;})
      .attr("y", function(d) { return d.y + d.dy / 2; })
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .attr("transform", null)
      .text(function(d) { return d.name; })
       .filter(function(d) { return d.x < width / 2; })
      .attr("x", function(d) {return d.x + 6 + sankey.nodeWidth();})
      .attr("text-anchor", "start");

	// EXIT - remove old elements as needed.
	node.exit().remove();
	
	

}

function getSankeyScale(graph) {
	var minscale = 10000000000000;
//	d3.min(nodesByBreadth, function(nodes) {
  //      return (size[1] - (nodes.length - 1) * nodePadding) / d3.sum(nodes, value);
    //  }));
    d3.min(years, function(d, i){
    	sankey
      	.nodes(eval("graph.nodes"+i))
      	.links(eval("graph.links"+i))
      	.layout(32);
      	console.log(sankey.annasKY())
      	return sankey.annasKY();
    })
	//years.forEach(function(d, i) {
	//	sankey
      //	.nodes(eval("graph.nodes"+i))
      	//.links(eval("graph.links"+i))
      	//.layout(32);
		//if (sankey.annasKY()<minscale) {
		//	minscale = sankey.annasKY();
		//}
		//console.log(sankey.annasKY())
	//});
	//console.log(minscale);
	return minscale;
}

d3.json("data/sankey-dadandme.json", function(graphdata) {
	graph = graphdata;
	years = graph.years;
	linkdata = eval("graph.links"+yeari);
	nodedata = eval("graph.nodes"+yeari);
	
	sankey.scale(getSankeyScale(graph))
	

	linkg = svg.append("g");
	nodeg = svg.append("g");
	timelineg = svg.append("g");
	
	timeline()
	
	update();
//console.log(sankey.annasKY())
});