#local ip address: 10.4.98.52

export MONGO_URL="mongodb://127.0.0.1:3001/meteor"

#run as daemon (using —fork)
/Users/VizServer/.meteor/packages/meteor-tool/.1.0.28.1jp1a03++os.osx.x86_64+web.browser+web.cordova/meteor-tool-os.osx.x86_64/dev_bundle/mongodb/bin/mongod --fork --bind_ip 0.0.0.0 --smallfiles --nohttpinterface --port 3001 --dbpath /code/ecolor/.meteor/local/db --replSet meteor --logpath /code/log/mongodb.log

(meteor)
