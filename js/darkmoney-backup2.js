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
var second = false;

/**
function dragmove(d) {
    d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
    sankey.relayout();
    link.attr("d", path);
}**/

function updatedate(d, i) {
	linkdata = graph.links1;
	nodedata = graph.nodes1;
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
      .layout(32);
      
      
      existing = link = linkg.selectAll(".link")
      	.data(linkdata, function(d, i) {
      			return d.source.ein + "-" + d.target.ein;
      			});
      	
      	existing.attr("d", path)
  		.style("stroke-width", function(d) { 
  			//console.log(d.__data__)
  			console.log(d)
  			return 20;
  			//return Math.max(minWidth, d.dy); 
  			})
  		//.attr("stroke-width", 20)
  		.attr("fill", "red")
  		.attr("stroke", "red")
  		.sort(function(a, b) { return b.dy - a.dy; });
      		
      //if (!second) {	
    enter = link.enter().append("g")
  		.attr("class", "link");
  	enter.append("path").attr("d", path)
  		.style("stroke-width", function(d) { 
  			//console.log(d.__data__)
  			return Math.max(minWidth, d.dy); })
  			//.sort(function(a, b) { return b.dy - a.dy; });
  	//e.append("circle").attr("cx", function(d) {return d.dx;}).attr("cy", function(d) {return d.dy;}).attr("r", 10)
  		/**
  	e.append("path").attr("d", path)
  		.style("stroke-width", function(d) { 
  			//console.log(d.__data__)
  			return Math.max(minWidth, d.dy); })
  		.sort(function(a, b) { return b.dy - a.dy; });
  		//}**/
	link.exit().remove();
      
      /**
    // LINKS
	// Data Join - join new data with old elements, if any. 
	existing = link = linkg.selectAll(".link")
    		.data(linkdata, function(d, i) {
    			return i;
      			//console.log(d.source.ein + "-" + d.target.ein)
      			return d.source.ein + "-" + d.target.ein;
      			});
      			
  
      			
     // Update - update old elements as needed.
  	 existing.select("path")
  		.attr("stroke", "red")
  		.attr("fill", "red")
  		.sort(function(a, b) { return b.dy - a.dy; })
  		.transition()
  			.duration(nodemovetime)
  			.attr("stroke-width", function(d) { 
  	 		//console.log(d3.select(this))
  	 		//console.log(d)
  				return Math.max(minWidth, d.dy); });
  			
      			
	// Enter - create new elements as needed.
    enter = link.enter().append("g")
  		.attr("class", function(d, i) {
  				//console.log(d)
  				return "link"});
  	//console.log(enter)

  	enter.append("path").attr("d", path)
  		.attr("fill", "green")
  		.attr("stroke-width", function(d) { 
  			return Math.max(minWidth, d.dy); })
  		.sort(function(a, b) { return b.dy - a.dy; });
  		
  		
  		
  	// EXIT - remove old elements as needed.
	link.exit().remove();
	**/
	
	
	
/**	
	// DATA JOIN
  // Join new data with old elements, if any.
  var text = svg.selectAll("text")
      .data(data);

  // UPDATE
  // Update old elements as needed.
  text.attr("class", "update");

  // ENTER
  // Create new elements as needed.
  text.enter().append("text")
      .attr("class", "enter")
      .attr("x", function(d, i) { return i * 32; })
      .attr("dy", ".35em");

  // ENTER + UPDATE
  // Appending to the enter selection expands the update selection to include
  // entering elements; so, operations on the update selection after appending to
  // the enter selection will apply to both entering and updating nodes.
  text.text(function(d) { return d; });

  // EXIT
  // Remove old elements as needed.
  text.exit().remove();**/
	
	
	
	// NODES
	// Data Join - join new data with old elements, if any.
	existing = node = nodeg.selectAll(".node")
		.data(nodedata, function(d, i) { return d.ein;});
		

  	// Update - update old elements as needed.
	existing.select("rect")
      	.transition()
      		.duration(nodemovetime)
      		.attr("height", function(d) { return d.dy; })
      	.transition()
      		.duration(nodemovetime)
      		.attr("x", function(d) {return d.x})
       		.attr("y", function(d) {return d.y});
       		
     // Enter - create new elements as needed.
    enter = node.enter().append("g")
		.attr("class", "node");
        
    enter.append("rect").attr("height", function(d) { return d.dy; })
      	.attr("width", sankey.nodeWidth())
      	.attr("x", function(d) {return d.x})
        .attr("y", function(d) {return d.y});

	// EXIT - remove old elements as needed.
	node.exit().remove();
	


//	console.log(link)
	//console.log(node)
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