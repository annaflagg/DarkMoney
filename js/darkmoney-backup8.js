var margin = {top: 30, right: 100, bottom: 0, left: 20},
    width = 1000 - margin.left - margin.right,
    height = 650 - margin.top - margin.bottom;

var formatNumber = d3.format(",.0f"),
    format = function(d) { return formatNumber(d) + " TWh"; },
    color = d3.scale.category20();

var svg = d3.select("#svg").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .on("mousemove", findClosest)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    
//var backgroud = d3.select("#svg").on("click", function() {console.log("CLICK")});

var sankey = d3.sankey()
    .nodeWidth(10)
    .nodePadding(22)
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
var timelinespace = 40;
var timeliney = .7*height;
var timeliner = 7;
var timelinex = .95*width;
var highlightednodes = new Array();
var highlightedlinks = new Array();
var clickednodes = new Array();
var clickedlinks = new Array();
var closetonode = false;
var selectedlink;
var selectednode;

defs = svg.append("svg:defs");
		
		var gradient = defs.append("svg:radialGradient")
			.attr("id", "gradient")
			.attr("x1", "0")
			.attr("x2", "0")
			.attr("y1", "50%")
			.attr("y2", "10%")
			.attr("gradientUnits", "userSpaceOnUse")
			.attr("spreadMethod", "pad");

		gradient.append("svg:stop")
			.attr("offset", "0%")
			.attr("stop-color", "red")
			.attr("stop-opacity", 1);
		
		gradient.append("svg:stop")
			.attr("offset", "50%")
			.attr("stop-color", "orange")
			.attr("stop-opacity", 1);
		
		gradient.append("svg:stop")
			.attr("offset", "75%")
			.attr("stop-color", "yellow")
			.attr("stop-opacity", 1);

		gradient.append("svg:stop")
			.attr("offset", "100%")
			.attr("stop-color", "green")
			.attr("stop-opacity", 1);


/**
function dragmove(d) {
    d3.select(this).attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
    sankey.relayout();
    link.attr("d", path);
}**/



function timeline() {

	
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
			.attr("class", "timelinetext")
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
  
	update();
}
function findAllDonors(d) {
	//console.log(d)
	if (highlightednodes.indexOf(d) == -1) {
		highlightednodes.push(d);
	}
	d.targetLinks.forEach(function (l) {
		if (highlightedlinks.indexOf(l) == -1) {
			highlightedlinks.push(l);
		}
		findAllDonors(l.source);
	});
}

function findAllRecipients(d) {
	if (highlightednodes.indexOf(d) == -1) {
		highlightednodes.push(d);
	}
	d.sourceLinks.forEach(function (l) {
		if (highlightedlinks.indexOf(l) == -1) {
			highlightedlinks.push(l);
		}
		findAllRecipients(l.target);
	});
}

function mouseoverlink(d, i) {
	highlightedlinks = [];
	highlightednodes = [];
	updateHighlights();
	highlightedlinks.push(d);
	findAllDonors(d.source);
	findAllRecipients(d.target);
	updateHighlights();
	nodeg.selectAll("text").classed("boldtext", function(thisd) {
			return (permanentname(thisd) || thisd.name==d.source.name ||thisd.name==d.target.name);})
			
	
	nodeg.selectAll("rect").classed("selectednode",function(thisd) {
			return ((thisd==d.source||thisd==d.target)&&(!permanentname(thisd)));})
	linkg.selectAll(".visiblelink").classed("selectedlink", function(thisd) {return thisd==d;});
	/**
	linkg.select("text")
		.attr("x", function(d) {
			var mouseCoords = d3.mouse(this);
			return mouseCoords[0]})
		.attr("y", function(d) {
			var mouseCoords = d3.mouse(this);
			return mouseCoords[1]})
		.text("hello");**/
	selectedlink = d;
	selectednode = undefined;
}

  d3.selection.prototype.moveToFront = function() {
  	return this.each(function(){
    this.parentNode.appendChild(this);
  	});
  };

function mouseovernode(d, i) {
	//console.log(d);
	//function(d) {d3.select(this).select("text").classed("highlightedtext", true)}
	highlightedlinks = [];//clickedlinks;
	highlightednodes = [];//clickednodes;
	//console.log(highlightedlinks)
	updateHighlights();
	
	findAllDonors(d);
	findAllRecipients(d);
	updateHighlights();
	
	if (permanentname(d)) {
		nodeg.selectAll("text").classed("highlightedtext", false);
	}
	
	nodeg.selectAll(".node").each(function(thisd, i) {
		if (thisd.name==d.name) {
			d3.select(this).moveToFront();
		}
	});
	nodeg.selectAll("text").classed("boldtext", function(thisd) {
			//d3.select(d3.select(this).parentNode).moveToFront();
			return (permanentname(thisd) || thisd==d);})
	nodeg.selectAll("rect").classed("selectednode",function(thisd) {
			return thisd==d;})
	selectednode = d;
	selectedlink = undefined;
	
	//this.moveToFront();
}

function updateHighlights() {
	linkg.selectAll(".visiblelink").classed("highlightedlink", function(d) {return highlightedlinks.indexOf(d) != -1;});
	linkg.selectAll(".visiblelink").classed("highlightedunknownlink", function(d) {return (highlightedlinks.indexOf(d) != -1) && (d.source.name=="Anonymous donators");});
	linkg.selectAll(".visiblelink").classed("highlightedpoliticallink", function(d) {return (highlightedlinks.indexOf(d) != -1) && (d.target.name=="Political contributions");});
	linkg.selectAll(".visiblelink").classed("selectedlink", function(d) {return false});
	
	//linkg.selectAll(".visiblelink").filter(function(d, i) {return highlightedlinks.indexOf(d)!=-1}).attr("stroke-width", 0)
		//.transition()
		//.style("stroke-width", function(d) { return Math.max(minWidth, d.dy); });
	
	nodeg.selectAll("rect").classed("selectednode", function(d) {return false;});
	//linkg.selectAll(".visiblelink").classed("selectedlink", function(d) {return false;});
	nodeg.selectAll("text").classed("highlightedtext", function(d) {return highlightednodes.indexOf(d) != -1;});
	nodeg.selectAll("text").classed("boldtext", function(d) {return permanentname(d);});
}

function findClosest() {
	var closest;
	closetonode = false;
	var mouseCoords = d3.mouse(this);
	var xnodethresh = 25.0;
	var max, min;
	nodeg.selectAll("rect").each(function(d, i) {
		if (!permanentname(d)) {
		min=parseInt(this.getAttribute("x"))-xnodethresh;
		max=parseInt(this.getAttribute("x"))+parseInt(this.getAttribute("width"))+xnodethresh;
		if ((min<=(mouseCoords[0]-margin.left))&&((mouseCoords[0]-margin.left)<=max)) {
			min=parseInt(this.getAttribute("y"))-(sankey.nodePadding()/2.0);
			max=parseInt(this.getAttribute("y"))+parseInt(this.getAttribute("height"))+(sankey.nodePadding()/2.0);
			if ((min<=(mouseCoords[1]-margin.top))&&((mouseCoords[1]-margin.top)<=max)) {
				closetonode = true;
				return mouseovernode(d);
			}
		}
		}

	})
}

function update() {
	var nodemovetime = 500;
	var existing, enter;
	 sankey
      .nodes(nodedata)
      .links(linkdata)
      .layout(32);
      
    var buffer = 20;
  	// LINKS
	// Data Join - join new data with old elements, if any.
	existing = link = linkg.selectAll(".link")
		.data(linkdata, function(d, i) {return d.source.ein+ "-" + d.target.ein});
	
	// Update - update old elements as needed.	
	existing.select(".visiblelink")//.attr("d", path)
		//.style("stroke-width", function(d) { return Math.max(minWidth, d.dy); })
		.transition()
    		.duration(nodemovetime)
    		//.delay(nodemovetime)
    		.attr("d", path)
  			.style("stroke-width", function(d) { return Math.max(minWidth, d.dy); });
  	
  	existing.select(".invisiblelink")//.attr("d", path)
		//.style("stroke-width", function(d) { return Math.max(minWidth, d.dy); })
		.transition()
    		.duration(nodemovetime)
    		//.delay(nodemovetime)
    		.attr("d", path)
  			.style("stroke-width", function(d) { return Math.max(minWidth, d.dy); });
  			
  			
     // Enter - create new elements as needed. 
    enter = link.enter().append("g")
    	.attr("class", "link");
    	
    	
    var color = d3.interpolateLab("#008000", "#c83a22");	
    	
    enter.append("path").attr("d", path)
    	.attr("class", "visiblelink")
    	.style("stroke", function(d) { if (d.target.name=="Political contributions") {
    		return color(d.t);
    		}
    		 })
    	.transition()
    		.duration(nodemovetime)
  			.style("stroke-width", function(d) { return Math.max(minWidth, d.dy); });
  			
    
    enter.append("path").attr("d", path)
    	.attr("class", "invisiblelink")
  		.style("stroke-width", function(d) { return (Math.max(minWidth, d.dy)+buffer); })
  		.on("mouseover", function(d, i) {
  			if (!closetonode) {
  				linkg.selectAll(".visiblelink").each(function(thisd, thisi) {
  						if (thisd == d) {
  							mouseoverlink(thisd, thisi);
  							selectedlink = thisd;
  							selectednode = undefined;
  						}
  					});
  			}
  		});
    	
  
  	
  	link.sort(function(a, b) { return b.dy - a.dy; });
  		
  	// EXIT - remove old elements as needed.
  	link.exit().remove();
  	
	
	
	// NODES
	// Data Join - join new data with old elements, if any.
	existing = node = nodeg.selectAll(".node")
		.data(nodedata, function(d, i) { return d.ein;});
		

  	// Update - update old elements as needed.
	existing.select("rect")
      	.transition()
      		.duration(nodemovetime)
      		.attr("height", function(d) { return Math.max(minWidth, d.dy); })
      	//.transition()
      	//	.duration(nodemovetime)
      		.attr("x", function(d) {return d.x})
       		.attr("y", function(d) {return d.y});
    existing.select("text").classed("boldtext", function(d) {return permanentname(d);})
    	.transition()
    		.duration(nodemovetime)
      		.attr("y", function(d) { return d.y + d.dy / 2; })
      		.attr("x", function(d) {return d.x + 6 + sankey.nodeWidth();})
      		.attr("text-anchor", "start")
      
    existing.select(".tspan2")
    	.transition()
    		.duration(nodemovetime)
    		//.attr("x", function(d) {return d.x-6;})
      		.attr("y", function(d) { return d.y + d.dy / 2; })
     		 .attr("x", function(d) {return d.x + 6 + sankey.nodeWidth();})
      		.attr("text-anchor", "start")
    		
       		
     // Enter - create new elements as needed.
    enter = node.enter().append("g")
		.attr("class", "node")
		 // .on("mouseover", mouseovernode)
		  //.on("mouseout", function(d) {d3.select(this).select("text").classed("highlightedtext", false)});
        
        
    enter.append("rect").attr("height", function(d) { return Math.max(minWidth, d.dy); })
    	.attr("class", "regularnode")
      	.attr("width", sankey.nodeWidth())
      	.attr("x", function(d) {return d.x})
        .attr("y", function(d) {return d.y})
        .classed("politicalnode", function(d) {return d.name=="Political contributions";})
        .classed("unknownnode", function(d) {return d.name=="Anonymous donators";})
        
   
   var text_box = enter.append("text")
      .attr("class", "defaulttext")
      .attr("opacity", 0)
  	 .attr("x", function(d) {return d.x + 6 + sankey.nodeWidth();})
      .attr("y", function(d) { return d.y + d.dy / 2; })
      .attr("text-anchor", "start")
       .classed("boldtext", function(d) {return permanentname(d);});
      
      
      text_box.append('tspan')
    	.text(function (d, i) {
    	var words = d.name.split(" ");
    	var numwords = words.length;
    	var str = "";
    	
    	words.forEach(function(word, index) {
    		if (index<(numwords/2)) {
    		str= str+" "+word;
    		}
    	});
    	return str;
});

	text_box.append('tspan')
		.attr("class", "tspan2")
    	.attr('dy', '1em')
    	.text(function (d, i) {
    	var words = d.name.split(" ");
    	var numwords = words.length;
    	var str = "";
    	words.forEach(function(word, index) {
    		if (index>=(numwords/2)) {
    			if (str=="") {
    				str=word;
    			} else {
    				str= str+" "+word;
    			}
    		}
    	});
    	return str;
	})//.attr("x", function(d) {return d.x-6;})
      .attr("y", function(d) { return d.y + d.dy / 2; })
       .attr("x", function(d) {return d.x + 6 + sankey.nodeWidth();})
      .attr("text-anchor", "start");

	// EXIT - remove old elements as needed.
	node.exit().remove();
	
	// Maintain the previous selections
	if (selectednode) {
	nodeg.selectAll("rect").each(function(d, i) {
		if (d.ein==selectednode.ein) {
			mouseovernode(d);
		}
	});
	}
	if (selectedlink) {
	linkg.selectAll(".visiblelink").each(function(d, i) {
		if (d.source.ein==selectedlink.source.ein&&d.target.ein==selectedlink.target.ein) {
			mouseoverlink(d);
		}
	});
	}
	linkg.selectAll(".visiblelink").filter(function(d, i) {return highlightedlinks.indexOf(d)!=-1}).attr("stroke-width", 0)
		.transition()
		.attr("d", path)
		.style("stroke-width", function(d) { return Math.max(minWidth, d.dy); });
	

}
function permanentname(d) {
	return ((d.name=="Political contributions") || (d.name == "Anonymous donators"));
}

function getSankeyScale(graph) {
    return d3.min(years, function(d, i){
    	sankey
      	.nodes(eval("graph.nodes"+i))
      	.links(eval("graph.links"+i))
      	.layout(32);
      	return sankey.annasKY();
    })
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
	linkg.append("text").attr("class", "linktext");
	
	timeline()
	
	update();
	
	// Initial selection
	nodeg.selectAll("rect").each(function(d, i) {
		if (d.name=="American Future Fund") {
			selectednode = d;
			selectedlink = undefined;
			mouseovernode(d);
		}
	});

});