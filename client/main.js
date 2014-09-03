if (Meteor.isClient) {

  // generate random data
  // TODO use data from Meteor Collection
  
  // completely arbitrary
  var numBins = 100 

  var data = []
  while (data.length < numBins) {
    var d = {};
    // order of colors matters
    d.color = "hsl(" + ((data.length / numBins) * 360) + ",50%,50%)"
    d.count = Math.floor(Math.random() * 1000)
    d.rarity = Math.floor(Math.random() * 100)
    data.push(d)
  }
  var maxCount = 0,
      totalCount = 0
  data.forEach(function(d) { 
    if (d.count > maxCount) maxCount = d.count
    totalCount += d.count
  })


  /////////////////////////////////////////////////
  //
  // circles
  //
  ////////////////////////////////////////////////
  Template.circles.rendered = function() {
    var width = $(window).width()

    Deps.autorun(function() {

      var pixelsPerCount = width / totalCount

      var circle = d3.select("#circles")
          .selectAll("div")
          .data(data)

      // not actually animated yet...
      circle.exit().remove()
      circle.enter().append("div")

      circle
          .attr("class", "pearl")
          .style("background-color", function(d) { return d.color })
          .style("width", function(d) { return Math.floor(d.count * pixelsPerCount) + "px" })
          .style("height", function(d) { return Math.floor(d.count * pixelsPerCount) + "px" })
    })
  }


  /////////////////////////////////////////////////
  //
  // wheel
  //
  ////////////////////////////////////////////////
  Template.wheel.rendered = function() {

    var height = width = $(window).width(),
        minRadius = 100,
        maxRadius = (width / 2) - minRadius
        numTicks = 20

    var svg = d3.select("#wheel").append("svg")
        .attr("width", width)
        .attr("height", height)
      .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")

      // map maximum count to radial amplitude
      var radialScale = d3.scale.linear()
          .domain([0,maxCount])
          .range([minRadius,maxRadius])

      // draw radial grid
      var radialGrid = svg.selectAll(".grid")
          .data(radialScale.ticks(numTicks))
        .enter().append("svg:g")
          .attr("class", "radial grid")
        .append("svg:circle")
          .attr("r", radialScale)
      
      // area of slice represents rarity
      var pie = d3.layout.pie()
          .sort(null)
          .value(function(d) { return d.rarity })

      // radial amplitude represents count
      var arc = d3.svg.arc()
          .outerRadius(function(d) { return minRadius + (maxRadius - minRadius) * (d.data.count / maxCount) })
          .innerRadius(minRadius)

      // draw slices and fill with corresponding color
      svg.selectAll(".arc")
          .data(pie(data))
        .enter().append("g")
          .attr("class", "arc")
        .append("path")
            .attr("d", arc)
            .style("fill", function(d) { return d.data.color })

      // create radial axis
      var radialAxis = d3.svg.axis()
          .ticks(numTicks)
          .scale(radialScale)
          .orient("left")
          .tickSize(5)
      
      // draw radial axis
      svg.append("g")
          .attr("class", "radial axis")
          .call(radialAxis)
  }

}




// old visualization code

//  Template.hello.events({
//  // test button creates a record in Experiments
//  'click #generateExperiment': function () {
//    Meteor.call('generateExperiment');
//  }
//  });
//
//  // retrieve all records in Experiments
//  Template.experimentDiv.experiments = function () {
//    return Experiments.find();
//  };



//
//  /////////////////////////////////////////////////
//  //
//  // histogram
//  //
//  ////////////////////////////////////////////////
//
//  Template.hist.rendered = function () {
//  var chart = d3.select("#hist")
//
//    Deps.autorun(function () {
//      var coloniesData = Colonies.find().fetch();
//      // create 255-bin arrays to keep count of Hue and Saturation
//      var hueBins = Array.apply(null, new Array(255)).map(Number.prototype.valueOf, 0);
//      var saturationBins = Array.apply(null, new Array(255)).map(Number.prototype.valueOf, 0);
//      // populate arrays with number of colonies at given Hue and Saturation
//      coloniesData.forEach(function(colony) { 
//        hueBins[colony.Hue]++
//        saturationBins[colony.Saturation]++
//      });
//
//      var barWidth = ($(window).width() - 25) / 255;
//      // d3
//      var bar = chart.selectAll("div")
//          .data(hueBins)
//      bar.exit().remove();
//      bar.enter().append("div");
//      bar
//          .style("display", "inline-block")
//          .style("background-color", function(d, i) {return hslaify({ Hue: i, Saturation: 100});})
//          .style("width", function (d, i) {return barWidth + "px";})
//          .style("height", function(d, i) { return d * 4 + "px" });
//    });
//
//  };
//
//


//
//////////////
//// HELPERS
//////////////
//
//  // creates hsla-style string from colony record
//  function hslaify(d) {
//    return "hsla(" + d.Hue + "," + d.Saturation + "%,50%,1)";  
//  }
//
//
//  // HSLA string from H, S, L, A
//  function toHSLA(hue, saturation, lightness, alpha) {
//    var hue = hue || 255;
//    var saturation = saturation || 100;
//    var lightness = lightness || 50;
//    var alpha = alpha || 1;
//    return "hsla(" + hue + "," + saturation + "%," + lightness + "%," + alpha + ")";  
//  }
//
//}
//
