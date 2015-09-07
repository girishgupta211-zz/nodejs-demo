## demo-server
Server based on iojs, koa(web framework), mongoose(ORM for mongo) supporting REST

### node
Follow this [tutorial]( https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-an-ubuntu-14-04-server )
```bash
sudo apt-get install make g++ curl git
git clone https://github.com/visionmedia/n
cd n
sudo make install
sudo n io latest
#sudo n io 2.5.0 is the latest version which is working
sudo apt-get install -y build-essential openssl libssl-dev pkg-config
sudo npm install -g node-gyp
#Upgrade
sudo n io latest
sudo npm upgrade -g npm
```

### mongo

Follow this [tutorial](http://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/ )
and [this](https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-ubuntu-14-04 )

* comment out bind_ip in /etc/mongod.conf to bind mongo to all interfaces

```bash
sudo update-rc.d mongod defaults
```

### mongo
```bash
sudo service mongod start
```

## Debugging

* Install node-inspector :
```bash
sudo npm install -g node-inspector
```
* Debug the server by launch it as follows:
```bash
node-debug --nodejs --harmony-arrow-functions --harmony-arrays app.js
or
node-inspector &
node --debug-brk --harmony-arrow-functions --harmony-arrays app.js
```
open 127.0.0.1:8080/?ws=127.0.0.1:8080&port=5858 in browser.

For debugging, asynchronous code, put breakpoints at co library gen.next, fn.call etc. you should see the complete flow of the code.

## Misc
### Create ssh keys

* update .bash_profile such that it starts ssh-agent for the session. Get .bashrc from ops/prod.
* generate the keys

```bash
ssh-keygen -t rsa -b 4096 -C "dev@geminisolutions.com"
<provide file-name and passphrase>

move the keys to ~/.ssh
ssh-add ~/.ssh/<private-key-file>
```

* add the pub key to the server.
* add the private key locally to ssh-agent via ssh-add
* done.
