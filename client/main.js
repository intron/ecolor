/////////////////////////////////////////////////
//
// Collapse dev-console when title is clicked
//
////////////////////////////////////////////////
Template.title.events({
  'click #title-box': function (e) {
    var $dc = $('#dev-console')
    if ($dc.hasClass('collapsed')) {
      $dc.removeClass('collapsed')
      $dc.slideDown() 
    }
    else {
      $dc.addClass('collapsed')
      $dc.slideUp() 
    }
  }
})

/////////////////////////////////////////////////
//
// Buttons to call server methods
//
////////////////////////////////////////////////
Template.test.events({
/*
 * These buttons can be enabled for debugging purposes
 * but really serve no purpose in normal operation
 *
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
*/
  // remove a specific record in Experiments
  'click #removeExperiment': function() {
    var plateBarcode = $('#plateBarcodeToRemove').val()
    Meteor.call('removeExperiment', plateBarcode)
  }
})

// is the visualization collection loaded?
var visualizationCollectionReady = function() {return false;}

Template.test.helpers({

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
      // Color Wheel Visualization
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

      // area of slice identical for all slices
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
    })
  }).ready
})

