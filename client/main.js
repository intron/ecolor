/////////////////////////////////////////////////
//
// Buttons to call server methods
//
////////////////////////////////////////////////
Template.test.events({
  // clear Visualizations records
  'click #clearVisualization': function() {
    Meteor.call('clearVisualization')
  },
  // clear Experiments records
  'click #clearExperiments': function() {
    Meteor.call('clearExperiments')
  },
  // create a record in Experiments
  'click #generateExperiment': function() {
    Meteor.call('generateExperiment')
  },
  // create a record in Experiments
  'click #removeExperiment': function() {
    var plateBarcode = $('#plateBarcodeToRemove').val()
    Meteor.call('removeExperiment', plateBarcode)
  }
})


/////////////////////////////////////////////////
//
// Reactive values for Visualizations stats
//
////////////////////////////////////////////////

// is the visualization collection loaded?
// TODO use findOne instead?
var visualizationCollectionReady = function() {return false;}

Template.visualization.helpers({

  experimentsCount: function() {
    return function(stats) {
      if (visualizationCollectionReady())
        return stats[0].experimentsCount
    }(Visualizations.find({'id': 'stats'}).fetch())
  },

  coloniesCount: function() {
    return function(stats) {
      if (visualizationCollectionReady())
        return stats[0].coloniesCount
    }(Visualizations.find({'id': 'stats'}).fetch())
  }
})


Meteor.startup(function() {

  // replicate Experiments collection for debugging purposes
  Meteor.subscribe('experiments')

  // keep track of when collection is ready
  visualizationCollectionReady = Meteor.subscribe('visualizations', function() {

    // generate hsl string from hue
    var hueToHsl = function(hue) {return "hsl(" + hue + ",50%,50%)"}

    // don't recreate the SVG element
    var svg = d3.select('#wheel').append('svg'),
        plot = svg.append('g')

    // once collection is ready, generate visuals
    Tracker.autorun(function() {

      // reactive with respect to window width and visualization data
      var width = rwindow.get('$width') - 25,
          height = rwindow.get('$height') - 25,
          data = Visualizations.findOne({'id': 'bins'}).data,
          numBins = data.length,
          maxBinCount = Visualizations.findOne({'id': 'stats'}).maxBinCount

      /////////////////////////////////////////////////
      //
      // wheel
      //
      ////////////////////////////////////////////////

      // update size and position in case of resize
      svg
        .attr('width', width)
        .attr('height', height)
      plot
        .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')

      var minRadius = 80,
          maxRadius = Math.floor((Math.min(width, height) / 2) - minRadius),
          numTicks = 8

      var radialScale = d3.scale.linear().domain([0, 1]).range([minRadius, maxRadius])

      // draw radial grid
      var radialGrid = plot.selectAll('circle')
          .data(radialScale.ticks(numTicks))
      radialGrid.exit().remove()
      radialGrid.enter()
        .append('svg:circle')
          .attr('class', 'radial-grid')
      radialGrid
          .transition()
          .attr('r', radialScale)

      // radial amplitude proportional to rarity
      var arc = d3.svg.arc()
          .outerRadius(function(d) {
            // set minimum radial amplitude for slices
            var startRadius = minRadius + 10
            var range = (maxRadius - startRadius)
            return (startRadius + (range * d.data.count / maxBinCount))
          })
          .innerRadius(minRadius)

      // area of slice proportional to count
      var pie = d3.layout.pie()
          .sort(null)
          .value(function(d) { return 1 })

      // draw slices
      var slice = plot.selectAll('path')
          .data(pie(data))
      slice.exit().remove()
      slice.enter()
        .append('path')
          .style('fill', function(d) {return hueToHsl(d.data.hue)})
      slice
          .classed('pulse', false)
          .attr('d', arc)
      slice
        .transition()
          .ease('elastic', 2, 0.001)
          .style('opacity', function(d) {return d.data.changed ? 1 : 0})
          .attr('transform', function(d) {return 'scale(' + (d.data.changed ? d.data.changed * 1.5 : 1) + ')'})
        .transition()
          .duration(1000)
          .delay(5000)
          .style('opacity', 1)
          .attr('transform', 'scale(1)')
      setTimeout(function() {
        slice
            .classed('pulse', function(d) {return d.data.changed})
      }, 100)
      



//      /////////////////////////////////////////////////
//      //
//      // helpers
//      //
//      ////////////////////////////////////////////////
//
//      var hueToHsl = function(hue) {return "hsl(" + hue + ",50%,50%)"}
//
//
//      /////////////////////////////////////////////////
//      //
//      // circles
//      //
//      ////////////////////////////////////////////////
//
//      // radius of circles proportional to (count)^(0.5)
//      // determine total width of the visualization vs page width
//      var scalingFactor = width / data.map(function(x) {return Math.sqrt(x.count)}).reduce(function(a, b) {return a + b})
//
//      // draw circles
//      var circle = d3.select('#circles').selectAll('div')
//          .data(data)
//      plot.selectAll('div')
//          .classed('pulse', false)
//      circle.exit().remove()
//      circle.enter().append('div')
//          .style('background-color', function(d) {return hueToHsl(d.hue)})
//      // updated circles should attract attention
//      circle
//          .transition().ease('elastic', 8, 0.1)
//          .style('width', function(d) { return Math.floor(Math.sqrt(d.count) * scalingFactor) + 'px' })
//          .style('height', function(d) { return Math.floor(Math.sqrt(d.count) * scalingFactor) + 'px' })
//          .transition().ease('linear').delay(3000)

    })
  }).ready
})

