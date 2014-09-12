/////////////////////////////////////////////////
//
// test
//
////////////////////////////////////////////////
Template.test.events({
  // create a record in Visualizations
  'click #generateVisualization': function() {
    Meteor.call('generateVisualization')
  },
  // clear Visualizations records
  'click #clearVisualization': function() {
    Meteor.call('clearVisualization')
  },
  // create a record in Experiments
  'click #generateExperiment': function() {
    Meteor.call('generateExperiment')
  },
  // create a record in Experiments
  'click #removeExperiment': function() {
    var dishBarcode = $('#dishBarcodeToRemove').val()
    Meteor.call('removeExperiment', dishBarcode)
  }
})


/////////////////////////////////////////////////
//
// hello
//
////////////////////////////////////////////////

// is the visualization collection loaded?
var visualizationCollectionReady = false

Template.visualization.helpers({

  experimentsCount: function() {
    return function(stats) {
      if (visualizationCollectionReady)
        return stats[0].experimentsCount
    }(Visualizations.find({'id': 'stats'}).fetch())
  },

  coloniesCount: function() {
    return function(stats) {
      if (visualizationCollectionReady)
        return stats[0].coloniesCount
    }(Visualizations.find({'id': 'stats'}).fetch())
  }

})


Meteor.startup(function() {

  // replicate Experiments collection for debugging purposes
  Meteor.subscribe('experiments')

  // don't recreate the SVG element
  var svg = d3.select('#wheel').append('svg'),
      plot = svg.append('g')

  // keep track of when collection is ready
  visualizationCollectionReady = Meteor.subscribe('visualizations', function() {

    // once collection is ready, generate visuals
    Tracker.autorun(function() {

      // reactive with respect to window width and visualization data
      var width = rwindow.get('$width'),
          height = rwindow.get('$height'),
          data = Visualizations.find({'id': 'bins'}).fetch()[0].data

    
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

      var minRadius = 100,
          maxRadius = Math.floor((Math.min(width, height) / 2) - minRadius),
          numTicks = 10

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
                  .outerRadius(function(d) {return Math.floor(minRadius + (maxRadius - minRadius) * d.data.rarity)})
                  .innerRadius(minRadius)

      // area of slice proportional to count
      var pie = d3.layout.pie()
          .sort(null)
          .value(function(d) { return d.count })

      // draw slices
      var slice = plot.selectAll('path')
          .data(pie(data))
      plot.selectAll('path')
          // only updated slices pulse
          .classed('pulse', function(d) {return d.data.changed})
      slice.exit().remove()
      slice.enter()
        .append('path')
          .style('fill', function(d) { return d.data.color })
      slice
          .transition().ease('elastic', 8, 0.1)
          .attr('d', arc)

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
//          .style('background-color', function(d) { return d.color })
//      // updated circles should attract attention
//      circle
//          .transition().ease('elastic', 8, 0.1)
//          .style('width', function(d) { return Math.floor(Math.sqrt(d.count) * scalingFactor) + 'px' })
//          .style('height', function(d) { return Math.floor(Math.sqrt(d.count) * scalingFactor) + 'px' })
//          .transition().ease('linear').delay(3000)

    })
  })
})

