if (Meteor.isClient) {
  var clientStartTime = Date.now();

  Template.hello.greeting = function () {
    return "Welcome to ecolor.";
  };

  Template.hello.events({
    'click input': function () {
      var guid = Experiments.insert({ "dishID": "123abc",
                           "scanTime": Date.now()
      });
      /*Experiments.find(guid).observe({ changed: function(updated, old) {

      }});*/
      // template data, if any, is available in 'this'
      if (typeof console !== 'undefined')
        console.log("should have created an experiment record");
    }
  });

  Template.experimentDiv.experiments = function () {
    var cursor = Experiments.find({ scanTime: { $gt: clientStartTime} });
    return cursor;
  };
  
  var histWidth = 1000;

/*
  Template.visualizations.rendered = function() {
    var query = { scanTime: { $gt: clientStartTime}, rgb: { $exists: true} };
    var svg = d3.select("#viz").append("svg")
      .attr("width", histWidth)
      .attr("height", 400);

    Deps.autorun(function () {
      svg.selectAll("circle")
        .data(Experiments.find(query).fetch())
        .enter()
        .append("rect")
        .style("fill", function(d, i) { return d3.rgb(d.rgb[0], d.rgb[1], d.rgb[2])})
        .attr("r", 50)
        .attr("cx", function (d, i) { return d.rgb[0]})
        .attr("cy", function (d, i) { return d.rgb[1]})
    });
  };
*/



  Template.visualizations.rendered = function() {
    // var query = { scanTime: { $gt: clientStartTime}, rgb: { $exists: true} };
    var chart = d3.select("#viz")

    Deps.autorun(function () {
      chart.selectAll("div")
        .data(Experiments.findOne().fetch().colonyData)
        .enter()
        .append("div")
        // .style("width", function(d, i) { return d3.rgb(d.rgb[0], d.rgb[1], d.rgb[2])})
        .style("background-color", function(d, i) { return hueToColor(d.Hue)})
        .style("width", function (d, i) { return calculateWidth(d) })
        .style("height", 20)
        .text(function(d, i) { return i });
    });
  };

// HELPERS

  function hueToColor(hue) {
    return "hsla(" + hue + ",100%,50%,1)";  
  }

  function calculateWidth(d) {
    console.log(d);
    return (d.Saturation / 10) + "px";  
  }

}
