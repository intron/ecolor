if (Meteor.isClient) {
  var clientStartTime = Date.now();
  var experiment = [];
  var sampleData = [];


  Meteor.startup( function() {
    Deps.autorun( function() {
      var cursor = Experiments.find({ scanTime: { $gt: clientStartTime},
                                      rgb : { $exists: true} });
      Session.set("experiment", cursor.fetch());
    });
  });


  Template.hello.greeting = function () {
    return "Welcome to ecolor.";
  };

  Template.hello.events({
    'click input': function () {
      var guid = Experiments.insert({ "dishID": "123abc",
                           "scanTime": Date.now()
      });
      Experiments.find(guid).observe({ changed: function(updated, old) {

      }});
      // template data, if any, is available in 'this'
      if (typeof console !== 'undefined')
        console.log("should have created an experiment record");
    }
  });

  Template.experimentDiv.experiments = function () {
    var cursor = Experiments.find({ scanTime: { $gt: clientStartTime} });
    return cursor;
  };

  Template.visualizations.rendered = function() {
    var svg = d3.select("#viz").append("svg")
      .attr("width", 400)
      .attr("height", 400)

  Deps.autorun(function () {
    svg.selectAll("circle")
      .data(Session.get("experiment"))
      .enter()
      .append("circle")
      .style("fill", function(d, i) { return d3.rgb(d.rgb[0], d.rgb[1], d.rgb[2])})
      .attr("r", 50)
      .attr("cx", function (d, i) { return d.rgb[0]})
      .attr("cy", function (d, i) { return d.rgb[1]})
  });

  };
}
