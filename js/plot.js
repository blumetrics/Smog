var width = 700,
    height = 900,
    margin = 40,
    maxRadius = 350 - margin;

var formatDate = d3.time.format("%m/%d/%Y"),
	monthNameFormat = d3.time.format("%b");
  dateTooltip = d3.time.format("%B %d, %Y");

var ticks = [0, 50, 100, 150, 200];

var x = d3.scale.linear()
  .domain([-10, 250])
  .range([120, maxRadius]);

var xAxis1 = d3.svg.axis()
  .ticks(5)
  .scale(x).orient("left")
  .tickValues([0,50, 100, 150, 200])
  .tickFormat(function(d) { return d + "ug"; });

var r = d3.scale.linear()
  .domain([0,160])
  .range([0, maxRadius/9]);

var ticks2 = [0, 40, 80, 120, 160];

var color = d3.scale.linear()
  .domain(ticks2)
  .range(["#55c67a","#ffe700", "#ff7400","#e31c1c","#660782"]);

var svg = d3.select('#viz').append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width/2 + "," + height/2.5 + ")");

d3.csv("data/wwa.csv", function(error, data) {

  data.forEach(function(d) {
    d["data"] = formatDate.parse(d["data"]);
  });

  var arc = d3.svg.arc()
    .startAngle(function(d) { return 0; })
	  .endAngle(function(d) { return ((2 * Math.PI) / (data.length)); })
	  .innerRadius(function(d) { return x(d["ug_min"]); })
	  .outerRadius(function(d) { return x(d["ug_max"]); });

  var months = d3.map(data, function(d) {
    return monthNameFormat(d["data"]);
  }).keys();

  var monthTicks = svg.append("g")
  	.attr("class","monthTicks");

  monthTicks.selectAll(".monthTick")
	  .data(months)
    .enter().append("g")
	  .attr("class","monthTick")
	  .attr("transform", function(d, i) { return "rotate(" + (i * 360 / months.length) + ")"; });
 
  monthTicks.selectAll(".monthTick")
    .append("line")
    .attr("y1", -maxRadius - 5)
    .attr("y2", -maxRadius - 30)
    .style("stroke", "#e74747")
    .style("stroke-width",2);

  monthTicks.selectAll(".monthTick").append("text")
    .attr("x", 8)
    .attr("y", -maxRadius - 15)
    .style("font-size",15)
    .style("fill","#e74747")
    .style("font-family","monospace")
    .style("color", "#e74747")
    .style("text-anchor", "begin")
    .text(function(d) { return d; });

  var tickCircles = svg.append("g")
    .attr("class","ticksCircle");
  	
  tickCircles.selectAll("circle")
    .data(ticks)
    .enter().append("circle")
	  .attr("r", function(d) {return x(d);})
    .style("fill", "none")
	  .style("stroke", "#d6d6d6")
    .style("stroke-width", function(d,i) { return ((i & 1) === 0) ? 1 : 0.25; });

  var temperatures = svg.selectAll(".temperature")
    .data(data)
    .enter().append("g")
    //.attr("class","temperature")
    .attr("transform", function(d, i) { return "rotate(" + (i * 360 / data.length) + ")"; })
    .on("mouseover", function (d) {
      return toolOver(d, this);

    })
    .on("mousemove", function (d) {
      svg.select("text.text-tooltip1")
        .text(d3.time.format("%B %d, %Y")(d["data"]));

      svg.select("text.text-tooltip2")
        .text("PM10: " + d3.round(d["ug_mean"], 2) + " ug");

      svg.select("text.text-tooltip3")
        .text("Benzen: " + d3.round(d["Precipitationmm"], 2) + " ug");

      svg.select("circle.ccc")
        .attr("fill", color(d["ug_mean"]));
    })
    .on("mouseout", function (d) {
      svg.select("text.text-tooltip1").text("");
      svg.select("text.text-tooltip2").text("");
      svg.select("text.text-tooltip3").text("");
      svg.select("circle.ccc").attr("fill", "#f2f2ef");
      return toolOut(d, this);
    });


  temperatures.append("path")
    .style("stroke", "#eae4e4")
    .style("stroke-width",0.7)
    .style("fill", function(d) { return color(d["ug_mean"]); })
    .attr("d", arc);
    
  var precipitations = svg.selectAll(".precipitation")
    .append('g')
    .data(data)
    .enter().append("g")
    .attr("class","precipitation")
	  .attr("transform", function(d, i) { return "rotate(" + (i * 360 / data.length) + ")"; });

  precipitations.append("circle")
    .attr("cx",0)
    .attr("cy",function(d) { return -x(d["ug_mean"]); })
	  .attr("r", function(d) { return r(d["Precipitationmm"]); })
	  .style("opacity", .3)
    .style("pointer-events", "none")
  	.style("fill", "#918d8a");

  svg.append("g")
    .attr("class", "x axis")
    .call(xAxis1)
    .selectAll("text")
    .style("pointer-events", "none")
    .style("fill","#454545")
    .style("text-anchor","middle");

});

function toolOver(v, thepath) {
  d3.select(thepath).style({
    "fill-opacity": "0.3",
    "cursor":"pointer"
  });
};

function toolOut(m, thepath) {
  d3.select(thepath).style({
    "fill-opacity": "1",
    "cursor":""
  });
};


svg.append("circle")
      .attr("class", "ccc")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 100)
      .attr("fill", "#f2f2ef")
      .attr("opacity", "0.8");

svg.append("text")
            .attr("class", "text-tooltip1")
            .attr("dy", "-1em")
            .style("text-anchor", "middle")
            .style("color", "red");

svg.append("text")
            .attr("class", "text-tooltip2")
            .attr("dy", "1.2em")
            .style("text-anchor", "middle");

svg.append("text")
            .attr("z-index", 100)
            .attr("class", "text-tooltip3")
            .attr("dy", "2.5em")
            .style("text-anchor", "middle");