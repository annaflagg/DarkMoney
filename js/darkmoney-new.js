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
    .size([width, height]);

var path = sankey.link();

var button = svg.append("circle").attr("cx", 400).attr("cy", 0).attr("r", 10).on("click", updatedate)
var linkdata, nodedata;
var link;
var graph;
var graphgroup;
var node; //= svg.selectAll(".node"),
var link;// = svg.selectAll(".link");
var minWidth = 2;
var linkg, nodeg;
var prevheights = {};

/**
function dragmove(d) {
    d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
    sankey.relayout();
    link.attr("d", path);
}**/

function updatedate(d, i) {
	linkdata = graph.links1;
	nodedata = graph.nodes1;
	//console.log(nodedata)
	//sankey = d3.sankey()
   // .nodeWidth(15)
   // .nodePadding(10)
   // .size([width, height]);
	update();
}

function update() {
	 sankey
      .nodes(nodedata)
      .links(linkdata)
      .layout(32);
      
      
	link = linkg.selectAll(".link")
      	.data(linkdata, function(d, i) {
      			return d.source.ein + "-" + d.target.ein;
      			});
      			
    link.enter().append("g")
  		.attr("class", "link");
  	link.append("path").attr("d", path)
  		.style("stroke-width", function(d) { 
  			//console.log(d.__data__)
  			return Math.max(minWidth, d.dy); })
  		.sort(function(a, b) { return b.dy - a.dy; });
	link.exit().remove();
	
	
		// Nodes
	node = nodeg.selectAll(".node")
		.data(nodedata, function(d, i) {
      			return d.ein;
      			});
		
	node.enter().append("g");
	node.attr("class", "node")
		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })

	
	node.exit().property("heightprop", 0);
	node.exit().remove();

	node.append("rect")
      	.attr("width", sankey.nodeWidth())/**
      	.attr("height", function(d) { 
      		//console.log(d3.select(this).property("heightprop", 10))
      		console.log(d3.select(this.parentNode).property("heightprop"))
      		return d3.select(this.parentNode).property("heightprop"); })
      		
      	.transition()
      		.transition()
        	.duration(2000)
        	.delay(0)
       	 	.ease("linear")
        	.attr("height", function(d) { 
        			//prevheights
        			return d.dy; })**/
	      	.attr("height", function(d) { return d.dy; });
	
	node.property("heightprop", function(d, i) {return d.dy});
	
	
	

}

d3.json("data/sankey-dadandme.json", function(graphdata) {
	graph = graphdata;
	linkdata = graph.links0;
	nodedata = graph.nodes0;
	
	
	
	//node = svg.selectAll(".node"),
    //link = svg.selectAll(".link");
	linkg = svg.append("g");
	nodeg = svg.append("g");
	
	//node = nodeg.selectAll(".node"),
   // link = linkg.selectAll(".link");
	
	update();
	//update();
	
	//updatedate();
	
	//graphgroup = svg.append("g");
	
	//update();
	




});