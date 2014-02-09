var margin = {top: 100, right: 100, bottom: 0, left: 0},
    width = 940 - margin.left - margin.right,
    height = 850 - margin.top - margin.bottom;

var formatNumber = d3.format(",.0f"),
    format = function(d) { return formatNumber(d) + " TWh"; },
    color = d3.scale.category20();

var svg = d3.select("#svg").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    
    .on("mousemove", hoverClosest)
    .on("click", clickClosest)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    
    

    
//var backgroud = d3.select("#svg").on("click", function() {console.log("CLICK")});

var sankey = d3.sankey()
    .nodeWidth(10)
    .nodePadding(20)
    .size([width, height]);


var path = sankey.link();

var timeline;
var timelineg;
var linkdata, nodedata;
var graph;
var graphgroup;
var node; 
var link;
var minWidth = 2;
var linkg, nodeg;
var prevheights = {};
var second = false;
var years;
var yeari = 0;
var timelinespace = 35;
var timeliney = -1*(margin.top/2.0);
var timeliner = 10;
var timelinex;// = .7*width;
var hoverednodes = new Array();
var hoveredlinks = new Array();
var clickednodes = new Array();
var clickedlinks = new Array();
var closetonode = false;
var selectedlink;
var selectednode;
var hoverclosetonode = false;
var initialgroupname = "Americans for Job Security"
var politicalspendingname =  "Federal political spending"
var anonymousname = "Anonymous contributors"


function timeline() {

	timelineg.append("line")
		.attr("x1", timelinex)
		.attr("x2", timelinex+(timelinespace*(years.length-1)))
		.attr("y1",timeliney)
		.attr("y2", timeliney)
		.attr("class", "timelineline");		

	
	timeline = timelineg.selectAll("timeline")
				.data(years)
				.enter().append("g");
		
	timeline.append("circle")
			.attr("class", "timelinecircle")
			.classed("timelinecirclehighlight", function(d, i) {return i==yeari;})
			.attr("cx", function(d, i) { 
				return timelinex+timelinespace*i;}).attr("cy", timeliney).attr("r", timeliner)
			.on("mouseover", updatedate)
	
	timelineg.append("text")
			.attr("class", "timelinetext")
			.attr("x", function(d) {
					console.log(years.length)
					return 0;})
			.attr("y", timeliney+(timeliner/2.0))
			.attr("text-anchor", "start")
			.text(years[yeari])					
						
}




function updatedate(d, i) {
	if (yeari == i) {
		return;
	}
	yeari = i;
	timeline = timelineg.selectAll("circle").classed("timelinecirclehighlight", function(d, i) {return i==yeari;});
	timelineg.select("text").text(years[yeari])
	linkdata = eval("graph.links"+yeari);
	nodedata = eval("graph.nodes"+yeari);
	second = true;
  
	update();
}

function findAllDonors(d, nodearray, linkarray) {
	if (nodearray.indexOf(d) == -1) {
		nodearray.push(d);
	}
	d.targetLinks.forEach(function (l) {
		if (linkarray.indexOf(l) == -1) {
			linkarray.push(l);
		}
		findAllDonors(l.source, nodearray, linkarray);
	});
}

function findAllRecipients(d, nodearray, linkarray) {
	if (nodearray.indexOf(d) == -1) {
		nodearray.push(d);
	}
	d.sourceLinks.forEach(function (l) {
		if (linkarray.indexOf(l) == -1) {
			linkarray.push(l);
		}
		findAllRecipients(l.target, nodearray, linkarray);
	});
}

function clicklink(d, i) {
	clickedlinks = [];
	clickednodes = [];
	updateClick();
	clickedlinks.push(d);
	findAllDonors(d.source, clickednodes, clickedlinks);
	findAllRecipients(d.target, clickednodes, clickedlinks);
	updateClick();
	nodeg.selectAll("text").classed("boldtext", function(thisd) {
			return (permanentname(thisd) || thisd.name==d.source.name ||thisd.name==d.target.name);})
			
	
	nodeg.selectAll("rect").classed("selectednode",function(thisd) {
			return ((thisd==d.source||thisd==d.target)&&(!permanentname(thisd)));})
	linkg.selectAll(".visiblelink").classed("selectedlink", function(thisd) {return thisd==d;});
	
	selectedlink = d;
	selectednode = undefined;
}

  d3.selection.prototype.moveToFront = function() {
  	return this.each(function(){
    this.parentNode.appendChild(this);
  	});
  };

function clicknode(d, i) {
	clickedlinks = [];
	clickednodes = [];
	updateClick();
	
	findAllDonors(d, clickednodes, clickedlinks);
	findAllRecipients(d, clickednodes, clickedlinks);
	updateClick();
	
	if (permanentname(d)) {
		nodeg.selectAll("text").classed("highlightedtext", false);
	}
	
	nodeg.selectAll(".node").each(function(thisd, i) {
		if (thisd.name==d.name) {
			d3.select(this).moveToFront();
		}
	});
	nodeg.selectAll("text").classed("hoveredtext", false);
	nodeg.selectAll("text").classed("boldtext", function(thisd) {
			return (permanentname(thisd) || thisd==d);})
	nodeg.selectAll("rect").classed("selectednode",function(thisd) {
			return thisd==d;})
	selectednode = d;
	selectedlink = undefined;

}

function updateClick() {
	linkg.selectAll(".visiblelink").classed("highlightedlink", function(d) {return ((clickedlinks.indexOf(d) != -1)&&(!permanentname(d)));});
	linkg.selectAll(".visiblelink").classed("highlightedunknownlink", function(d) {return (clickedlinks.indexOf(d) != -1) && (d.source.name==anonymousname);});
	linkg.selectAll(".visiblelink").classed("highlightedpoliticallink", function(d) {return (clickedlinks.indexOf(d) != -1) && (d.target.name==politicalspendingname);});
	
	linkg.selectAll(".visiblelink").classed("hoveredlink", function(d) {return false;});
	linkg.selectAll(".visiblelink").classed("hoveredunknownlink", function(d) {return  false;});
	linkg.selectAll(".visiblelink").classed("hoveredpoliticallink", function(d) {return false;});

	linkg.selectAll(".visiblelink").classed("selectedlink", function(d) {return false;});
	nodeg.selectAll("text").classed("highlightedtext", function(d) {return clickednodes.indexOf(d) != -1;});
	nodeg.selectAll("text").classed("boldtext", function(d) {return permanentname(d);});
}

function updatehovers() {
	linkg.selectAll(".visiblelink").classed("hoveredlink", function(d) {return (clickedlinks.indexOf(d) == -1) && (hoveredlinks.indexOf(d) != -1)&&(!permanentname(d));});
	linkg.selectAll(".visiblelink").classed("hoveredunknownlink", function(d) {return  (clickedlinks.indexOf(d) == -1) && (hoveredlinks.indexOf(d) != -1) && (d.source.name==anonymousname);});
	linkg.selectAll(".visiblelink").classed("hoveredpoliticallink", function(d) {return (clickedlinks.indexOf(d) == -1) && (hoveredlinks.indexOf(d) != -1) && (d.target.name==politicalspendingname);});

}

function hovernode(d, i) {
	hoveredlinks = [];
	hoverednodes = [];
	if (d) {
	findAllDonors(d,hoverednodes, hoveredlinks);
	findAllRecipients(d,hoverednodes, hoveredlinks);
	
	nodeg.selectAll("text").classed("hoveredtext", function(thisd) {
			return (clickednodes.indexOf(thisd)==-1)&&(thisd==d);})
	} else {
	nodeg.selectAll("text").classed("hoveredtext", false);
	}
	updatehovers();
}

function hoverClosest() {

	var mouseCoords = d3.mouse(this);
	var closestnode = findClosest(mouseCoords);
	if (closestnode) {
		hoverclosetonode = true;
		hovernode(closestnode);
	} else {
		hoverclosetonode = false;
		hovernode(closestnode);
	}
}

function clickClosest() {
	var mouseCoords = d3.mouse(this);
	var closestnode = findClosest(mouseCoords);
	if (closestnode&&(!permanentname(closestnode))) {
		closetonode = true;
		clicknode(closestnode);
	}
}

function findClosest(mouseCoords) {
	var closestnode;
	closetonode = false;
	
	var xnodethresh = 25.0;
	var max, min;
	nodeg.selectAll("rect").each(function(d, i) {
		//if (!permanentname(d)) {
		min=parseInt(this.getAttribute("x"))-xnodethresh;
		max=parseInt(this.getAttribute("x"))+parseInt(this.getAttribute("width"))+xnodethresh;
		if ((min<=(mouseCoords[0]-margin.left))&&((mouseCoords[0]-margin.left)<=max)) {
			min=parseInt(this.getAttribute("y"))-(sankey.nodePadding()/2.0);
			max=parseInt(this.getAttribute("y"))+parseInt(this.getAttribute("height"))+(sankey.nodePadding()/2.0);
			if ((min<=(mouseCoords[1]-margin.top))&&((mouseCoords[1]-margin.top)<=max)) {
				closestnode = d;
			}
		}
	})
	return closestnode;
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
		.transition()
    		.duration(nodemovetime)
    		.attr("d", path)
  			.style("stroke-width", function(d) { return Math.max(minWidth, d.dy); });
  	
  	existing.select(".invisiblelink")
		.transition()
    		.duration(nodemovetime)
    		.attr("d", path)
  			.style("stroke-width", function(d) { return Math.max(minWidth, d.dy); });	
  			
     // Enter - create new elements as needed. 
    enter = link.enter().append("g")
    	.attr("class", "link");
    	
    	
    var color = d3.interpolateLab("#008000", "#c83a22");	
    	
    enter.append("path").attr("d", path)
    	.attr("class", "visiblelink")
    	.style("stroke", function(d) { if (d.target.name==politicalspendingname) {
    		return color(d.t);
    		}
    		 })
    	.transition()
    		.duration(nodemovetime)
  			.style("stroke-width", function(d) { return Math.max(minWidth, d.dy); });
  			
    
    enter.append("path").attr("d", path)
    	.attr("class", "invisiblelink")
  		.style("stroke-width", function(d) { return (Math.max(minWidth, d.dy)+buffer); })
  		.on("click", function(d, i) {
  			if (!closetonode) {
  				linkg.selectAll(".visiblelink").each(function(thisd, thisi) {
  						if (thisd == d) {
  							clicklink(thisd, thisi);
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
      		.attr("y", function(d) { return d.y + d.dy / 2; })
     		 .attr("x", function(d) {return d.x + 6 + sankey.nodeWidth();})
      		.attr("text-anchor", "start")
    		
       		
     // Enter - create new elements as needed.
    enter = node.enter().append("g")
		.attr("class", "node")
		 
        
    enter.append("rect").attr("height", function(d) { return Math.max(minWidth, d.dy); })
    	.attr("class", "regularnode")
      	.attr("width", sankey.nodeWidth())
      	.attr("x", function(d) {return d.x})
        .attr("y", function(d) {return d.y})
        .classed("politicalnode", function(d) {return d.name==politicalspendingname;})
        .classed("unknownnode", function(d) {return d.name==anonymousname;})
        
   
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
	})
      .attr("y", function(d) { return d.y + d.dy / 2; })
       .attr("x", function(d) {return d.x + 6 + sankey.nodeWidth();})
      .attr("text-anchor", "start");

	// EXIT - remove old elements as needed.
	node.exit().remove();
	
	// Maintain the previous selections
	if (selectednode) {
	nodeg.selectAll("rect").each(function(d, i) {
		if (d.ein==selectednode.ein) {
			clicknode(d);
		}
	});
	}
	if (selectedlink) {
	linkg.selectAll(".visiblelink").each(function(d, i) {
		if (d.source.ein==selectedlink.source.ein&&d.target.ein==selectedlink.target.ein) {
			clicklink(d);
		}
	});
	}
	linkg.selectAll(".visiblelink").filter(function(d, i) {return clickedlinks.indexOf(d)!=-1}).attr("stroke-width", 0)
		.transition()
		.attr("d", path)
		.style("stroke-width", function(d) { return Math.max(minWidth, d.dy); });
	

}
function permanentname(d) {
	return ((d.name==politicalspendingname) || (d.name == anonymousname));
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

d3.json("/data/sankey-darkmoney.json", function(graphdata) {

	graph = graphdata;
	years = graph.years;
	linkdata = eval("graph.links"+yeari);
	nodedata = eval("graph.nodes"+yeari);

	sankey.scale(getSankeyScale(graph))
	

	linkg = svg.append("g");
	nodeg = svg.append("g");
	timelineg = svg.append("g");
	linkg.append("text").attr("class", "linktext");
	
	timelinex = width-(timelinespace*(years.length-1))-(timeliner/2.0);
	timeline()
	
	update();
	
	// Initial selection
	nodeg.selectAll("rect").each(function(d, i) {
		if (d.name==initialgroupname) {
			selectednode = d;
			selectedlink = undefined;
			clicknode(d);
		}
	});

});