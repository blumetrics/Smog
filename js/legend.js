///////////////////////////////////////////////////////////////////////////
//////////////// Create the gradient for the legend ///////////////////////
///////////////////////////////////////////////////////////////////////////

//Extra scale since the color scale is interpolated
var tempScale = d3.scale.linear()
  .domain([0, 160])
  .range([0, width]);

//Calculate the variables for the temp gradient

var numStops = 50;
tempRange = tempScale.domain();
tempRange[2] = tempRange[1] - tempRange[0];
tempPoint = [];
for(var i = 0; i < numStops; i++) {
  tempPoint.push(i * tempRange[2]/(numStops-1) + tempRange[0]);
}//for i

var colorScale = d3.scale.linear()
  .domain(ticks2)
  .range(["#55c67a","#ffe700", "#ff7400","#e31c1c","#660782"]);

//Create the gradient
svg.append("defs")
  .append("linearGradient")
  .attr("id", "legend-weather")
  .attr("x1", "0%").attr("y1", "0%")
  .attr("x2", "100%").attr("y2", "0%")
  .selectAll("stop") 
  .data(d3.range(numStops))                
  .enter().append("stop") 
  .attr("offset", function(d,i) { return tempScale( tempPoint[i] )/width; })   
  .attr("stop-color", function(d,i) { return colorScale( tempPoint[i] ); });

///////////////////////////////////////////////////////////////////////////
////////////////////////// Draw the legend ////////////////////////////////
///////////////////////////////////////////////////////////////////////////

var legendWidth = 300;

//Color Legend container
var legendsvg = svg.append("g")
  .attr("class", "legendWrapper")
  .attr("transform", "translate(" + -150 + "," + 370 + ")");

//Draw the Rectangle
legendsvg.append("rect")
  .attr("class", "legendRect")
  .attr("x", -legendWidth/2)
  .attr("y", 50)
  .attr("rx", 8/2)
  .attr("width", legendWidth)
  .attr("height", 8)
  .style("fill", "url(#legend-weather)");
  
//Append title
legendsvg.append("text")
  .attr("class", "legendTitle")
  .attr("x", 0)
  .attr("y", 40)
  .style("text-anchor", "middle")
  .text("Average Daily PM10 Emission");

//Set scale for x-axis
var xScale = d3.scale.linear()
   .range([-legendWidth/2, legendWidth/2])
   .domain([0,160] );

var xAxis2 = d3.svg.axis()
    .orient("bottom")
    .ticks(5)
    .tickValues([0, 40, 80, 120, 160])
    .tickFormat(function(d) { return d + " ug"; })
    .scale(xScale);

//Set up X axis
legendsvg.append("g")
  .attr("class", "axis")
  .attr("transform", "translate(0," + (60) + ")")
  .call(xAxis2);



///////////////////////////////////////////////////////////////////////////
//////////////////////////// CIRCLE LEGEND ////////////////////////////////
///////////////////////////////////////////////////////////////////////////

// Adapted from https://github.com/mbostock/d3/blob/master/src/svg/axis.js
var circleLegend = function() {
  'use strict';

  var scale,
      orient = 'left',
      tickPadding = 3,
      tickExtend = 5,
      tickArguments_ = [10],
      tickValues = null,
      tickFormat_,
      ε = 1e-6;


  function key(selection) {
    selection.each(function() {
      var g = d3.select(this);

      g.attr('class', 'circle-legend');

      // Stash a snapshot of the new scale, and retrieve the old snapshot.
      var scale0 = this.__chart__ || scale,
          scale1 = this.__chart__ = scale.copy();

      // Ticks, or domain values for ordinal scales.
      var ticks = tickValues == null ? (scale.ticks ? scale.ticks.apply(scale, tickArguments_) : scale.domain()) : tickValues,
          ticks = ticks.slice().filter(function(d) { return d > 0 }).sort(d3.descending),
          tickFormat = tickFormat_ == null ? (scale.tickFormat ? scale.tickFormat.apply(scale, tickArguments_) : String) : tickFormat_,
          tick = g.selectAll('.tick').data(ticks, scale1),
          tickEnter = tick.enter().insert('g', '.tick').attr('class', 'tick').style('opacity', ε),
          tickExit = d3.transition(tick.exit()).style('opacity', ε).remove(),
          tickUpdate = d3.transition(tick.order()).style('opacity', 1),
          tickTransform;

      tickEnter.each(function(tick) {
        var gg = d3.select(this);

        var tickText = tickFormat(tick);

        if (!tickText) return;

        gg.append('circle')
          .attr('cx', 0)
          .attr('cy', 0)
          .attr('r', scale(tick));

        gg.append('line')
          .attr('y1', 0)
          .attr('y2', 0)
          .attr('stroke', '#000')
          .text(tick);

        gg.append('text')
          .attr('dy', '.35em')
          .style('text-anchor', 'left' == orient ? 'end' : 'start')
          .text(tickText);

      });
      tickEnter.call(d3_svg_legend, scale0);
      tickUpdate.call(d3_svg_legend, scale1);
      tickExit.call(d3_svg_legend, scale1);

      function d3_svg_legend(selection, scale) {
        selection.select('circle')
          .attr('r', scale);

        var x2 = scale(ticks[0]) + tickExtend;
        var sign = 'left' == orient ? -1 : 1;

        selection.select('text')
          .attr('transform', 'translate(' + (x2 + tickPadding) * sign + ', 0)');

        selection.select('line')
          .attr('x1', function(d) { return scale(d) * sign })
          .attr('x2', x2 * sign);

        selection.attr('transform', function(d) { return 'translate(0,' + -scale(d) + ')'; });
      }

    });
  }

  key.scale = function(value) {
    if (!arguments.length) return scale;
    scale = value;
    return key;
  };

  key.orient = function(value) {
    if (!arguments.length) return orient;
    orient = value;
    return key;
  };

  key.ticks = function() {
    if (!arguments.length) return tickArguments_;
    tickArguments_ = arguments;
    return key;
  };

  key.tickFormat = function(x) {
    if (!arguments.length) return tickFormat_;
    tickFormat_ = x;
    return key;
  };

  key.tickValues = function(x) {
    if (!arguments.length) return tickValues;
    tickValues = x;
    return key;
  };

  key.tickPadding = function(x) {
    if (!arguments.length) return tickPadding;
    tickPadding = +x;
    return key;
  };

  key.tickExtend = function(x) {
    if (!arguments.length) return tickExtend;
    tickExtend = +x;
    return key;
  };

  key.width = function(value) {
    if (!arguments.length) return width;
    width = value;
    return key;
  };

  key.height = function(value) {
    if (!arguments.length) return height;
    height = value;
    return key;
  };

  return key;
};



var circlescale = d3.scale.sqrt()
            .domain([0, 160])
            .range([0, maxRadius/9]);

var formatEmission = function(d) { return d + " ug" }

var circleKey = circleLegend()
    .scale(circlescale)
    .tickValues([25, 75, 150])
    .tickFormat(formatEmission)
    .tickPadding(10)
    .orient("left") //default

svg.append("text")
  .attr("class", "legendTitle")
  .attr("x", 150)
  .attr("y", 400)
  .style("text-anchor", "middle")
  .text("Average Daily Benzen Emission");

svg.append('g')
  .attr('transform', 'translate(150, 470)')
  .call(circleKey)
