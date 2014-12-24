#local ip address: 10.4.98.52

export MONGO_URL="mongodb://127.0.0.1:3001/meteor"

#run as daemon (using —fork)
#--dbpath /code/ecolor/.meteor/local/db
~/.meteor/packages/meteor-tool/.1.0.30.gpevpe++os.linux.x86_64+web.browser+web.cordova/meteor-tool-os.linux.x86_64/dev_bundle/mongodb/bin/mongod --fork --bind_ip 0.0.0.0 --smallfiles --nohttpinterface --port 3001 --logpath /code/db/log/mongodb.log --dbpath /code/db

meteor --port 3000 --release 0.9.2.1 &

cd ../rainbowreader
meteor --port 3002 --release 0.9.2.1



