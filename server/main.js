var fs = Npm.require("fs");
var cursor = Experiments.find({ scanTime: { $gt: Date.now()}});

HTTP.methods({
  'uploadColonyData': function(data) {
    console.log('/uploadColonyData contacted');
    //TODO what sort of validation?
    var dishBarcode = this.requestHeaders.barcode;
    var colonyData = JSON.parse(data);
    console.log('colonyData: ' + JSON.stringify(colonyData[0]));
    Experiments.insert({dishBarcode: dishBarcode, colonyData: colonyData});
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
      Experiments.update({dishBarcode: dishBarcode}, {$set: {dishImageFilename: filepath}});
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
