if (Meteor.isClient) {
  var clientStartTime = Date.now();

  Template.hello.greeting = function () {
    return "Welcome to ecolor.";
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

  // retrieve records in Experiments created after this session started
  Template.experimentDiv.experiments = function () {
    var cursor = Experiments.find({ scanTime: { $gt: clientStartTime} });
    return cursor;
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


/*

scaling bars by area

  Template.visualizations.rendered = function() {
    // use if we only want recently-added records
    // var query = { scanTime: { $gt: clientStartTime}, rgb: { $exists: true} };

    var chart = d3.select("#viz")

    Deps.autorun(function () {
      chart.selectAll("div")
        .data(Colonies.find().fetch())
        .enter()
        .append("div")
        // .style("width", function(d, i) { return d3.rgb(d.rgb[0], d.rgb[1], d.rgb[2])})
        .style("background-color", hslaify)
        .style("height", function() { return "4px" })
        .style("width", function (d) { 
          console.log(d.Area);
          return d.Area + "px";
          })
    });
  };

  */
