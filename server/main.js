var fs = Npm.require("fs");
var cursor = Experiments.find({ scanTime: { $gt: Date.now()}});

HTTP.methods({
  'uploadColonyData': function(data) {
    console.log('/uploadColonyData contacted');
    //TODO what sort of validation?
    var dishBarcode = this.requestHeaders.barcode;
    var colonyData = JSON.parse(data);
    var count = 0;
    colonyData.forEach(function(colony) {
      count = count+1;
      colony.dishBarcode = dishBarcode;
      Colonies.insert(colony);
    });
    console.log('added colonies: ' + count);
    Experiments.upsert({dishBarcode: dishBarcode}, {$set: {dishBarcode: dishBarcode, colonyData: colonyData}});
  },
  'uploadDishImage': function(data) {
    console.log('/uploadDishImage contacted');
    console.log(this.requestHeaders);
    //var dishBarcode = this.requestHeaders.barcode;
    if(this.requestHeaders['content-type'].indexOf('image/', 0) !== 0) {
      console.log('wrong content type uploaded');
    }
    else if(this.requestHeaders.filename == undefined) {
      console.log('no filename given in header');
    }
    else {
      //writeFile requires full path
      var imageStorageLocation = '/home/administrator/dev/ecolor/images/';
      var filepath = imageStorageLocation + this.requestHeaders.filename;
      console.log('filename: ' + filepath);
      fs.writeFileSync(filepath, data);
      //assume the colony data is uploaded before image
      //just store filename for now
      Experiments.upsert({dishBarcode: dishBarcode}, {$set: {dishBarcode: dishBarcode, dishImageFilename: filepath}});
      return 'Yo Dawg!';
    }
  }
});


cursor.observe({ added: function(document) {
    console.log(document);
    Experiments.update(document._id, { $set: { rgb: [ randomInt(255), randomInt(255), randomInt(255)]}});
  }
});

// HELPURS

var randomInt = function (number) {
  return Math.floor(Math.random()*number)
}
