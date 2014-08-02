if (Meteor.isClient) {

  // useless greeting string
  Template.hello.greeting = function () {
    return "ecolor (main display)";
  };

  Template.hello.events({
    // test button creates a record in Experiments
    'click input': function () {
      var guid = Experiments.insert({ "dishID": "123abc",
                           "scanTime": Date.now()
      });
      // template data, if any, is available in 'this'
      if (typeof console !== 'undefined')
        console.log("should have created an experiment record");
    }
  });

  // retrieve all records in Experiments
  Template.experimentDiv.experiments = function () {
    return Experiments.find();
  };

  Template.visualizations.rendered = function() {

    var chart = d3.select("#viz")

    Deps.autorun(function () {
      var coloniesData = Colonies.find().fetch();
      var bins = Array.apply(null, new Array(255)).map(Number.prototype.valueOf,0);

      coloniesData.forEach(function(colony) { 
        bins[colony.Hue]++
      });

      console.log(bins);

      chart.selectAll("div")
        .remove();

      chart.selectAll("div")
        .data(bins)
        .enter()
        .append("div")
        .style("background-color", function(d, i) { 
          return hslaify({ Hue: i, Saturation: 100});})
        .style("width", function (d, i) { 
          console.log( d + " " + i); 
          return d + "px";})
        .style("height", function() { return "4px" })
    });
  };

////////////
// HELPERS
////////////

  // creates hsla-style string from colony record
  function hslaify(d) {
    return "hsla(" + d.Hue + "," + d.Saturation + "%,50%,1)";  
  }

}
