var fs = Npm.require("fs")

// completely arbitrary
var numBins = 80

Meteor.startup(function() {

  clearVisualization()

  // publish Experiments colletion for debugging purposes
  Meteor.publish('experiments', function() {
    return Experiments.find()
  })

  Meteor.publish('visualizations', function() {
    return Visualizations.find()
  })

  // don't act on changes while loading existing collections
  var initializing = true

  // watch Experiments collection for added and removed experiment records
  // update Visualizations collection accordingly
  Experiments.find().observe({

    added: function(document) {
      if (!initializing) {

        var coloniesAdded = 0,
            newData = Visualizations.findOne({'id': 'bins'}).data

        newData.forEach(function(d) {d.changed = false})

        document.colonyData.forEach(function(colony) {
          coloniesAdded++
          var changedBin = Math.floor(colony.Hue * (numBins / 255))
          newData[changedBin].count++
          newData[changedBin].changed = true
        })

        Visualizations.update({'id': 'stats'}, {$inc: {
          coloniesCount: coloniesAdded,
          experimentsCount: 1}
        })

        Visualizations.update({'id': 'bins'}, {$set: {data: newData}})
      }
    },

    removed: function(document) {
      if (!initializing) {
        
        var coloniesRemoved = 0,
            newData = Visualizations.findOne({'id': 'bins'}).data

        document.colonyData.forEach(function(colony) {
          coloniesRemoved++
          newData[Math.floor(colony.Hue * (numBins / 255))].count--
        })

        Visualizations.update({'id': 'stats'}, {$inc: {
          coloniesCount: -coloniesRemoved,
          experimentsCount: -1}
        })

        Visualizations.update({'id': 'bins'}, {$set: {data: newData}})
      }
    }
  })

  Visualizations.find({'id': 'stats'}).observe({
    changed: function(newDocument) {
      if (!initializing) {

        var coloniesCount = Visualizations.findOne({'id': 'stats'}).coloniesCount
        var newData = Visualizations.findOne({'id': 'bins'}).data
        var maxRarity = 0

        newData.forEach(function(d) {
          d.rarity = coloniesCount / (d.count || 1 )
          if (d.rarity > maxRarity) maxRarity = d.rarity
        })

        // normalize values to 1
        newData.forEach(function(d) {
          d.rarity = d.rarity / maxRarity
        })

        Visualizations.update({'id': 'bins'}, {$set: {data: newData}})
      }
    }
  })

  initializing = false
})


Meteor.methods({

  // generate random data for visualization
  // TODO watch Experiments for changes and update visualization accordingly
  generateVisualization: function() {

    var data = []

    while (data.length < numBins) {
      var d = {}
      // order of hues matters
      // same as order in visualization
      d.hue = Math.floor((data.length / numBins) * 360)
      d.count = Math.floor(Math.random() * 1000)
      d.rarity = Math.random()
      data.push(d)
    }

    var coloniesCount = data.map(function(d) {return d.count}).reduce(function(a, b) {return a + b})
    var experimentsCount = 1337

    Visualizations.update({'id': 'bins'}, {$set: {data: data}})

    Visualizations.update({'id': 'stats'}, {$set: {
        coloniesCount: coloniesCount,
        experimentsCount: experimentsCount
      }
    })
  },

 clearVisualization: function() {
    clearVisualization()
  },

  // create an experiment record using the colonyData.json as model
  // self-invoking function keeps a counter inside closure
  generateExperiment : function() {
    var filepath = '/Users/intron/Dev/thetech/ecolor/test/colonyData.json',
        dishCounter = 0,
        userCounter = 0

    // return inner function to increment counters
    return function() {
      fs.readFile(filepath, Meteor.bindEnvironment(
        function(err, data) {

          var dishBarcode = 'dish' + ++dishCounter,
              userBarcode = 'user' + ++userCounter,
              timestamp = Date.now()

          var colonyData = JSON.parse(data),
              count = 0

          colonyData.forEach(function(colony) {
            count++
            // set random values
            colony.Hue = Math.floor(Math.random() * 255) 
          });

          // add a record for the experiment to the Experiments collection
          Experiments.insert({
            dishBarcode: dishBarcode,
            userBarcode: userBarcode,
            timestamp: timestamp,
            colonyData: colonyData
          })
        }
      ))
    }
  }(),
  
  // remove experiment record with specified dishBarcode
  removeExperiment: function(dishBarcode) {

    Experiments.remove({'dishBarcode': dishBarcode}, function(err, res) {
      if (err) {
        console.log("Error removing experiment: " + err)
        return
      }
      if (res === 0) console.log("No experiment with dishBarcode = " + dishBarcode + " was found")
      console.log("removeExperiment removed " + res + " experiments")
    })
  }

});


/////////////////////////////////////////////////
//
// helpers
//
////////////////////////////////////////////////

var clearVisualization = function() {
  var data = []
  while (data.length < numBins) {
    var d = {}
    d.hue = Math.floor((data.length / numBins) * 360)
    d.count = 0
    d.rarity = 0
    d.changed = false
    data.push(d)
  }
  Visualizations.upsert({'id': 'bins'}, {$set: {
      data: data
    }
  })
  Visualizations.upsert({'id': 'stats'}, {$set: {
      coloniesCount: 0,
      experimentsCount: 0
    }
  })
}
