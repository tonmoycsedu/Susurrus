function sum(total, num) {
  return total + num;
}

function plot_scatter_plot(data,title="Scatter Plot"){
  $("#chart_title").html(title)
  // set the dimensions and margins of the graph
  var margin = {top: 10, right: 30, bottom: 30, left: 60},
      width = 450 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

  // append the svg object to the body of the page
  var svg = d3.select("#chart_div")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

  // Add X axis
  var x = d3.scaleLinear()
    .domain([-1, 1])
    .range([ 0, width ]);
  svg.append("g")
    .attr("transform", "translate(0," + height/2 + ")")
    .call(d3.axisBottom(x));

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([-1, 1])
    .range([ height, 0]);
  svg.append("g")
    .attr("transform", "translate("+width/2+",0)")
    .call(d3.axisLeft(y));

  // Add dots
  svg.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
      .attr("cx", function (d) { return x(d.x); } )
      .attr("cy", function (d) { return y(d.y); } )
      .attr("r", 3.5)
      .style("fill", "#69b3a2")

}
function scatter_plot(csv_file, plot=true){

  $.get("/get_csv/", {
      fileName : csv_file,
    },
    function(res) {
      console.log(res)
      scatter_data = res.data;
      if(plot) plot_scatter_plot(res.data)
  });
}

///// Function to draw grouped bar chart
function plot_bar_chart(data,plotLines=false,title="Bar Chart (5 Students)",key="x"){
  $("#chart_title").html(title)

  var subgroups = data.map(function(d) { return d[key]; });

  // set the dimensions and margins of the graph
  var margin = {top: 20, right: 20, bottom: 60, left: 50},
      width = 3*$("#chart_div").width()/4 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

  var svg=d3.select("#chart_div").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");;

  // x axis
  var x0 = d3.scaleBand()
            .domain(d3.range(data[0].values.length))
            .range([0, width])
            .padding([0.2]);

  // Another scale for subgroup position
  var x1 = d3.scaleBand()
    .domain(subgroups)
    .range([0, x0.bandwidth()])
    .padding([0.05])

  // y axis
  var y = d3.scaleLinear()
            .range([height, 0]);

  // line axis
  var line = d3.line()
        .curve(d3.curveLinear)
        .x(function(d,i) { return x0(i)+x1.bandwidth()/2})
        .y(function(d) { return y(d) })

  // color map
  var color = d3.scaleOrdinal(d3.schemeCategory10);

  y.domain([0, d3.max(data, function(d) { return d3.max(d.values) })]);
  color.domain(subgroups)

  var slice = svg.selectAll(".slice")
      .data(data)
      .enter().append("g")
      .attr("class", "slice")
      .style("fill", function(d,i) { return color(d[key]) })
      .style("opacity","1")
      .attr("transform",function(d,i) { return "translate(" + x1(d[key]) + ",0)"; });


  if(plotLines){
    svg.selectAll(".lines")
      .data(data)
    .enter().append("path")
        .attr("class","lines")
        .attr("fill", "none")
        .style("stroke", function(d,i) { return color(d[key]) })
        .attr("stroke-width", 1.5)
        .attr("stroke","grey")
        .attr("d", d=> line(d.values))
        .attr("transform",function(d,i) { return "translate(" + x1(d[key]) + ",0)"; });

  }

  slice.selectAll("rect")
      .data(function(d) { return d.values; })
  .enter().append("rect")
      .attr("width", x1.bandwidth())
      .attr("x", function(d,i) { return x0(i); })
      .attr("y", function(d) { return y(d); })
      .attr("height", function(d) { return height - y(d); })

  //Legend
  // var legend = svg.selectAll(".legend")
  //     .data(data[0].values.map(function(d) { return d[subgroupKey]; }).reverse())
  // .enter().append("g")
  //     .attr("class", "legend")
  //     .attr("transform", function(d,i) { return "translate(0," + i * 20 + ")"; })
  //     // .style("opacity","0");

  // legend.append("rect")
  //     .attr("x", width - 18)
  //     .attr("width", 18)
  //     .attr("height", 18)
  //     .style("fill", function(d) { return color(d); });

  // legend.append("text")
  //     .attr("x", width - 24)
  //     .attr("y", 9)
  //     .attr("dy", ".35em")
  //     .style("text-anchor", "end")
  //     .text(function(d) {return d; });

  // legend.transition().duration(500).delay(function(d,i){ return 1300 + 100 * i; }).style("opacity","1");

  // add the x Axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x0).tickFormat(function(d,i){return "Student"+(i+1)}));
  // add the y Axis
  svg.append("g")
      .call(d3.axisLeft(y).ticks(5));

}

////// Function to draw n lines or timeseries
function plot_line_chart(data,title="Line Chart",key="date",timeseries=true){

  $("#chart_title").html(title) /// provide chart title

  /// get the attributes
  var attrs = d3.keys(data[0])
  attrs.splice(attrs.indexOf(key), 1);

  /// create svg
  var margin = {top: 20, right: 20, bottom: 60, left: 50},
    width = $("#chart_div").width() - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  var svg = d3.select("#chart_div").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  // color map
  var color = d3.scaleOrdinal(d3.schemeCategory10);

  // Add X axis
  if(timeseries){ // if the data is a timeseries//need to format the data
    data.forEach(function(d){
         d[key] = d3.timeParse("%Y-%m-%d")(d[key])
    })
    var x = d3.scaleTime()
      .domain(d3.extent(data, function(d) { return d[key]; }))
      .range([ 0, width ]);
  }
  else{
    var x = d3.scaleLinear()
      .domain([0, d3.max(data, function(d) { return +d[key]; })])
      .range([ 0, width ]);
  }

  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) {
                  return d3.max(d3.values(d).slice(1))
                })])
    .range([ height, 0 ]);

  svg.append("g")
    .call(d3.axisLeft(y));

  attrs.forEach(function(attr,i){ // Add lines for each attributes
    path = svg.append("path")
      .datum(data)
      .attr("id","path_"+i)
      .attr("fill", "none")
      .attr("stroke-width", 1.5)
      .attr("stroke",color(i))
      .attr("d", d3.line()
        .x(function(d) { return x(d[key]) })
        .y(function(d) { return y(d[attr]) })
        )

    var marker= svg.append("circle").attr("id",'marker_'+i);

    marker.attr("r", 7)
      .attr("transform", "translate(" + pathStartPoint() + ")");

  })

  function pathStartPoint() { //Get path start point for placing marker
    var d = path.attr("d"),
    dsplitted = d.split("L");
    return dsplitted[0].split("M")[1].split(",");
  }

}
function transition(ids,paths,segment=0,divisions=10,length=3000) {
  for(i=0;i<ids.length;i++){
    id = ids[i]
    path = paths[i]
    d3.select(id).transition()
      .ease(d3.easeLinear)
      .duration(length)
      .attrTween("transform", translateAlong(d3.select(path).node(),segment,divisions))
  }

      // .on("end", transition);
}
// Returns an attrTween for translating along the specified path element.
// Notice how the transition is slow for the first quarter of the aniimation
// is fast for the second and third quarters and is slow again in the final quarter
// This is normal behavior for d3.transition()
function translateAlong(path,segment,divisions) {
  var l = path.getTotalLength()/divisions;
  return function(i) {
    return function(t) {
      // console.log((l*segment) + (t * l))
      var p = path.getPointAtLength((l*segment) + (t * l));
      return "translate(" + p.x + "," + p.y + ")";//Move marker
    }
  }
}
