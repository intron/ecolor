var cursor = Experiments.find({ scanTime: { $gt: Date.now()}});


cursor.observe({ added: function(document) {
    console.log(document);
    Experiments.update( {_id: document._id}, { $set: { rgb: [ randomInt(255), randomInt(255), randomInt(255)]}});
  }
});

// HELPURS

var randomInt = function (number) {
  return Math.floor(Math.random()*number)
}
