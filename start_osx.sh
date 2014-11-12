#local ip address: 10.4.98.52

export MONGO_URL="mongodb://127.0.0.1:3001/meteor"

#run as daemon (using —fork)
#--dbpath /code/ecolor/.meteor/local/db
$HOME/.meteor/packages/meteor-tool/1.0.33/meteor-tool-os.osx.x86_64/dev_bundle/mongodb/bin/mongod --fork --bind_ip 0.0.0.0 --smallfiles --nohttpinterface --port 3001 --logpath $PWD/db/log/mongodb.log --dbpath $PWD/db

meteor&

cd ../rainbowreader

meteor run --port 3002&
