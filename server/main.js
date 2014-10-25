var fs = Npm.require("fs")

var numBins = 60,
    maxHue = 360

Meteor.startup(function() {

  clearVisualization()

  /////////////////////////////////////////////////
  //
  // initialization
  //
  ////////////////////////////////////////////////


  // publish Experiments colletion for debugging purposes
  Meteor.publish('experiments', function() {
    return Experiments.find()
  })
  Meteor.publish('visualizations', function() {
    return Visualizations.find()
  })


  /////////////////////////////////////////////////
  //
  // Experiments observer
  //
  ////////////////////////////////////////////////
  
  // watch Experiments collection for added and removed experiment records
  // update Visualizations collection accordingly
  Experiments.find().observe({

    added: function(document) {
      var coloniesAdded = 0,
          newData = Visualizations.findOne({'id': 'bins'}).data,
          colorNamesMap = Visualizations.findOne({'id': 'colorCounts'}) || {} // used in rainbowreader
      newData.forEach(function(d) {d.changed = false})
      document.colonyData.forEach(function(colony) {
        coloniesAdded++
        var changedBin = Math.floor((colony.Hue / maxHue * numBins) % numBins)
        newData[changedBin].count++
        newData[changedBin].changed = true

        if (colorNamesMap[colony.ColorName] === undefined)
          colorNamesMap[colony.ColorName] = 1
        else
          colorNamesMap[colony.ColorName]++
      })
      Visualizations.update({'id': 'stats'}, {$inc: {
        coloniesCount: coloniesAdded,
        experimentsCount: 1}
      })
      Visualizations.update({'id': 'bins'}, {$set: {data: newData}})
      Visualizations.update({'id': 'colorCounts'}, colorNamesMap)
    },

    removed: function(document) {
      var coloniesRemoved = 0,
          newData = Visualizations.findOne({'id': 'bins'}).data,
          colorNamesMap = Visualizations.findOne({'id': 'colorCounts'}) || {}
      document.colonyData.forEach(function(colony) {
        coloniesRemoved++
        newData[Math.floor((colony.Hue / maxHue * numBins) % numBins)].count--
        colorNamesMap[colony.ColorName]--
      })
      Visualizations.update({'id': 'stats'}, {$inc: {
        coloniesCount: -coloniesRemoved,
        experimentsCount: -1}
      })
      Visualizations.update({'id': 'bins'}, {$set: {data: newData}})
      Visualizations.update({'id': 'colorCounts'}, colorNamesMap)
    }
  })


  /////////////////////////////////////////////////
  //
  // Visualizations observer
  //
  ////////////////////////////////////////////////

  // if stats change (i.e. new colonies/experiments added)
  // recalculate rarity and maxBinCount
  Visualizations.find({'id': 'stats'}).observe({
    changed: function() {
      updateMaxBinCount()       
    } 
  })

  updateMaxBinCount()

})


/////////////////////////////////////////////////
//
// Server methods
//
////////////////////////////////////////////////

Meteor.methods({

  // reset Visualizations records' data to 0
  clearVisualization: function() {
    clearVisualization()
  },

  clearExperiments: function() {
    Experiments.remove({})
  },

  // create an experiment record using the colonyData.json as model
  // self-invoking function keeps a counter inside closure
  generateExperiment : function() {
    var filepath = '/Users/intron/Dev/thetech/ecolor/test/colonyData.json',
        userBarcode = 'fubar',
        plateCounter = Experiments.find().count() || 0
    // return inner function to increment counters
    return function() {
      fs.readFile(filepath, Meteor.bindEnvironment(
        function(err, data) {
          var plateBarcode = 'plate' + ++plateCounter,
              dateCreated = Date.now(),
              colonyData = JSON.parse(data),
              count = 0
          colonyData.forEach(function(colony) {
            count++
            // set random values
            colony.Hue = Math.round(Math.random() * maxHue) 
          });
          // add a record for the experiment to the Experiments collection
          Experiments.insert({
            plateBarcode: plateBarcode,
            userBarcode: userBarcode,
            dateCreated: dateCreated,
            colonyData: colonyData
          })
        }
      ))
    }
  }(),
  
  // remove experiment record with specified plateBarcode
  removeExperiment: function(plateBarcode) {
    Experiments.remove({'plateBarcode': plateBarcode}, function(err, res) {
      if (err) {
        console.log("Error removing experiment: " + err)
        return
      }
      if (res === 0) console.log("No experiment with plateBarcode = " + plateBarcode + " was found")
      console.log("removeExperiment removed " + res + " experiments")
    })
  }

});


/////////////////////////////////////////////////
//
// helpers
//
////////////////////////////////////////////////

// clear Visualizations records if they exist
// create new ones if they do not
var clearVisualization = function() {
  var data = []
  while (data.length < numBins) {
    var d = {}
    d.hue = Math.round(data.length / (numBins - 1) * maxHue)
    d.count = 0
    d.changed = false
    data.push(d)
  }
  Visualizations.upsert({'id': 'bins'}, {$set: {
      data: data
    }
  })
  Visualizations.upsert({'id': 'stats'}, {$set: {
      coloniesCount: 0,
      experimentsCount: 0,
      maxBinCount: 0
    }
  })
  Visualizations.upsert({'id': 'colorCounts'}, {$set: {}})
}

// find maximum count across all bins
var updateMaxBinCount = function() {
  var data = Visualizations.findOne({'id': 'bins'}).data,
      maxBinCount = 0
  data.forEach(function(d) {
    if (d.count > maxBinCount) maxBinCount = d.count
  })
  Visualizations.update({'id': 'stats'}, {$set : {maxBinCount: maxBinCount}})
}

// no longer being used in the visualization
//// recalculate rarity for every bin
//var updateRarity = function() {
//  var coloniesCount = Visualizations.findOne({'id': 'stats'}).coloniesCount,
//      newData = Visualizations.findOne({'id': 'bins'}).data,
//      maxRarity = 0
//  newData.forEach(function(d) {
//    d.rarity = coloniesCount / (d.count || 1 )
//    if (d.rarity > maxRarity) maxRarity = d.rarity
//  })
//  // normalize values to 1
//  newData.forEach(function(d) {
//    d.rarity = d.rarity / maxRarity
//  })
//  Visualizations.update({'id': 'bins'}, {$set: {data: newData}})
//}
