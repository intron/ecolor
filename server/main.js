var fs = Npm.require("fs");
//var cursor = Experiments.find({ scanTime: { $gt: Date.now()}});

Meteor.methods({
  // create an experiment using the data in test/colonyData.json
  // self-invoking function keeps a counter inside closure
  generateExperiment : (function () {
    console.log('generating experiment...');
    var dishCounter = 0;
    var userCounter = 0;
    return function() {
      var filepath = '/Users/intron/Dev/thetech/ecolor/test/colonyData.json';
      var dishBarcode = 'dish' + dishCounter++;
      var userBarcode = 'user' + userCounter++;
      var timestamp = Date.now();
      fs.readFile(filepath, Meteor.bindEnvironment(
        function(err, data) {

          if (err) { console.log("Error in fs.readFile: " + err); }

          // add each colony individually to the Colonies collection
          var colonyData = JSON.parse(data);
          var count = 0;
          colonyData.forEach(function(colony) {
            colony.dishBarcode = dishBarcode;

             // set random values
              colony.Hue = random(0, 255) 
              colony.Saturation = random(200, 255)

            Colonies.insert(colony);
            count++;
          });

          console.log('generateExperiment added ' + count + ' colonies');

          // add a record for the experiment to the Experiments collection
          Experiments.upsert({dishBarcode: dishBarcode}, {$set: {
            dishBarcode: dishBarcode,
            userBarcode: userBarcode,
            timestamp: timestamp,
            colonyData: colonyData}
          });
        },
        function (err) { console.log("Meteor.bindEnvironment Error: " + err); }
      ));
    }
  })()
});


HTTP.methods({
  'uploadColonyData': function(data) {
    console.log('/uploadColonyData contacted');
    console.log(this.requestHeaders);
    var dishBarcode = this.requestHeaders.dishbarcode;
    var userBarcode = this.requestHeaders.userbarcode;
    var timestamp = this.requestHeaders.timestamp;
    
    // quit if we already have colonies with this dish's barcode in the db
    if(Colonies.findOne({dishBarcode: dishBarcode})) {
     var msg = 'This dish was already scanned into the database.  Quitting.';
     console.log(msg);
     // TODO post response
     return;
    }

    // add each colony individually to the Colonies collection
    var colonyData = JSON.parse(data);
    var count = 0;
    colonyData.forEach(function(colony) {
      colony.dishBarcode = dishBarcode;
      Colonies.insert(colony);
      count++;
    });
    console.log('added colonies: ' + count);

    // add a record for the experiment to the Experiments collection
    Experiments.upsert({dishBarcode: dishBarcode}, {$set: {
      dishBarcode: dishBarcode,
      userBarcode: userBarcode,
      timestamp: timestamp,
      colonyData: colonyData}});
  },

  'uploadDishImage': function(data) {
    console.log('/uploadDishImage contacted');
    console.log(this.requestHeaders);
    var dishBarcode = this.requestHeaders.dishbarcode;

    if(this.requestHeaders['content-type'].indexOf('image/', 0) !== 0) {
      console.log('wrong content type uploaded');
    }
    else if(this.requestHeaders.filename == undefined) {
      console.log('no filename given in header');
    }
    else {
      // writeFile requires full path; assume the filename we're given in the
      // headers is unique
      // TODO figure out relative path
      var imageStorageLocation = 'images/'; 
      var filepath = imageStorageLocation + this.requestHeaders.filename;
      // fs.writeFileSync(filepath, data);
      // assume the colony data is uploaded before image
      // just store filename for now, not the image's data
      var vals = {dishImageFilename: filepath};
      Experiments.upsert({dishBarcode: dishBarcode}, {$set: vals});
      return 'TODO: reply to post';
    }
  }
});

function random(low, high) { return Math.floor(Math.random() * (high - low) + low)}
