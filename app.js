const express = require('express');
const os = require('os');
const MongoClient = require('mongodb').MongoClient;
const MONGODB_URL = process.env.MONGODB_URL || (process.env.NODE_ENV === 'production' ? 'mongodb://mongo:27017/okpogo' : 'mongodb://localhost:27017/okpogo');
const MONGODB_DBNAME = process.env.MONGODB_DBNAME || 'okpogo';
const PORT = process.env.PORT || 8080;

console.log('MONGODB_URL', MONGODB_URL);
console.log('MONGODB_DBNAME', MONGODB_DBNAME);
console.log('PORT', PORT);
console.log('env', JSON.stringify(process.env, null, 2));

const app = express()
  .set('trust proxy', true)
  .get('/upload', (req, res, next) => {
    MongoClient.connect(MONGODB_URL, (err, client) => {
      if (err) return next(err);

      const collection = client.db(MONGODB_DBNAME).collection('post');
      const userinfo = collection.find({name: req.body.name}).exec();
      if (userinfo.ban == false && userinfo.pw == req.body.pw){
        collection.insert([
          { name: req.body.name },
          { title: req.body.title },
          { content: req.body.content }
        ], { w: 1 }, (err, result) => {
          if (err) return next(err);

          collection.find({}).toArray((err, data) => {
            if (err) return next(err);

            /*res.send('<pre>' + JSON.stringify({
              url: client.s.url,
              options: client.s.options,
              poolSize: client.topology.s.poolSize,
              platform: client.topology.clientInfo,
              data
            }, null, 2) + '</pre>');*/

            client.close();
          });
        });
      }
    });
  })
  .get('/read', (req, res) => {
    MongoClient.connect(MONGODB_URL, (err, client) => {
      if (err) return next(err);

      const collection = client.db(MONGODB_DBNAME).collection('post');
      const postinfo = collection.find({});

    res.send(JSON.stringify({postinfo
    }, null, 2));
  });
  });

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});