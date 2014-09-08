var fs = Npm.require("fs")

// completely arbitrary value
// makes a good looking visualization though
var numBins = 100 


Meteor.startup(function() {

  var initializing = true

  Visualizations.upsert({'id': 'bins'}, {$set : {'id': 'bins'}})
  Visualizations.upsert({'id': 'stats'}, {$set : {'id': 'stats'}})

  Meteor.publish('visualizations', function() {
    return Visualizations.find()
  })
  
  // TODO add removed method to make reversible
  Experiments.find().observeChanges({

    // TODO add rarity calculation
    added: function(id, fields) {
      
      if (!initializing) {
        console.log("Mongo observer added experiment: " + id)

        var coloniesAdded = 0,
            // oldData = Visualizations.find({'id': 'bins'}).fetch()[0].data,
            hueBins = Array.apply(null, new Array(numBins)).map(Number.prototype.valueOf,0),
            rarityBins = Array.apply(null, new Array(numBins)).map(Number.prototype.valueOf,0)

        fields.colonyData.forEach(function(colony) {
          coloniesAdded++
          hueBins[Math.floor((colony.Hue / 255) * numBins)]++
          // rarity calculation
        })

        //var newData = oldData.map(function(d, i) {
        //  d.count += hueBins[i]
        //  // d.rarity = rarityBins[i]
        //})

        // update visualization stats
        Visualizations.update({'id': 'stats'}, {$inc: {
          coloniesCount: coloniesAdded,
          experimentsCount: 1}
        })
        //Visualizations.update({'id': 'bins'}, {data: newData})
      }
    }
  })
  initializing = false

})



Meteor.methods({

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

          console.log('generateExperiment added ' + count + ' colonies')
          console.log('generateExperiment added experiment: ' + dishBarcode)

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

  // generate random data for visualization
  // TODO watch Experiments for changes and update visualization accordingly
  generateVisualization: function() {
    console.log("generating random visualization record...")                       

    var data = []

    while (data.length < numBins) {
      var d = {}
      // order of colors matters
      // same as order in visualization
      d.color = hueToHsl(Math.floor((data.length / numBins) * 360))
      d.count = Math.floor(Math.random() * 1000)
      d.rarity = Math.random()
      data.push(d)
    }

    var coloniesCount = data.map(function(d) {return d.count}).reduce(function(a, b) {return a + b})
    var experimentsCount = 1337

    Visualizations.upsert({'id': 'bins'}, {$set: {
      data: data}
    })

    Visualizations.upsert({'id': 'stats'}, {$set: {
      coloniesCount: coloniesCount,
      experimentsCount: experimentsCount}
    })
  },

 clearVisualization: function() {
    console.log("clearing visualization record...")                       

    var data = []

    while (data.length < numBins) {
      var d = {}
      // order of colors matters
      // same as order in visualization
      d.color = hueToHsl(Math.floor((data.length / numBins) * 360))
      d.count = 0
      d.rarity = 1
      data.push(d)
    }

    Visualizations.upsert({'id': 'bins'}, {$set: {
      data: data}
    })
    Visualizations.upsert({'id': 'stats'}, {$set: {
      coloniesCount: 0,
      experimentsCount: 0}
    })
  }

});


/////////////////////////////////////////////////
//
// helpers
//
////////////////////////////////////////////////

var hueToHsl = function(hue) {return "hsl(" + hue + ",50%,50%)"}



//
//
//
//
// TODO phase out HTTP methods, as we will be using a single DB
//
//
//
//
//
HTTP.methods({
  'uploadColonyData': function(data) {
    console.log('/uploadColonyData contacted')
    console.log(this.requestHeaders)
    var dishBarcode = this.requestHeaders.dishbarcode
    var userBarcode = this.requestHeaders.userbarcode
    var timestamp = this.requestHeaders.timestamp
    
    // quit if we already have colonies with this dish's barcode in the db
    if(Colonies.findOne({dishBarcode: dishBarcode})) {
     var msg = 'This dish was already scanned into the database.  Quitting.'
     console.log(msg)
     // TODO post response
     return
    }

    // add each colony individually to the Colonies collection
    var colonyData = JSON.parse(data)
    var count = 0
    colonyData.forEach(function(colony) {
      colony.dishBarcode = dishBarcode
      Colonies.insert(colony)
      count++
    });
    console.log('added colonies: ' + count)

    // add a record for the experiment to the Experiments collection
    Experiments.upsert({dishBarcode: dishBarcode}, {$set: {
      dishBarcode: dishBarcode,
      userBarcode: userBarcode,
      timestamp: timestamp,
      colonyData: colonyData}})
  },

  'uploadDishImage': function(data) {
    console.log('/uploadDishImage contacted')
    console.log(this.requestHeaders)
    var dishBarcode = this.requestHeaders.dishbarcode

    if(this.requestHeaders['content-type'].indexOf('image/', 0) !== 0) {
      console.log('wrong content type uploaded')
    }
    else if(this.requestHeaders.filename == undefined) {
      console.log('no filename given in header')
    }
    else {
      // writeFile requires full path; assume the filename we're given in the
      // headers is unique
      // TODO figure out relative path
      var imageStorageLocation = 'images/'
      var filepath = imageStorageLocation + this.requestHeaders.filename
      // fs.writeFileSync(filepath, data);
      // assume the colony data is uploaded before image
      // just store filename for now, not the image's data
      var vals = {dishImageFilename: filepath}
      Experiments.upsert({dishBarcode: dishBarcode}, {$set: vals})
      return 'TODO: reply to post'
    }
  }
});
