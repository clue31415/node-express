const express = require('express');
const cors = require('cors');
const os = require('os');
const MongoClient = require('mongodb').MongoClient;
const MONGODB_URL = process.env.MONGODB_URL || (process.env.NODE_ENV === 'production' ? 'mongodb://mongo:27017/okpogo' : 'mongodb://localhost:27017/okpogo');
const MONGODB_DBNAME = process.env.MONGODB_DBNAME || 'okpogo';
const PORT = process.env.PORT || 8080;

console.log('MONGODB_URL', MONGODB_URL);
console.log('MONGODB_DBNAME', MONGODB_DBNAME);
console.log('PORT', PORT);
console.log('env', JSON.stringify(process.env, null, 2));

var corsOptions = {
  origin: 'https://web-react-m2ppprfddd83a9c3.sel4.cloudtype.app',
  // 이 설정은 https://sub.example.app 인 origin을 허용합니다.
  // 어플리케이션 구성에 맞게 origin 규칙을 적용해주세요.
  optionsSuccessStatus: 200 
}

const app = express()
  .set('trust proxy', true)
  .get('/api/users/upload', cors(corsOptions), (req, res, next) => {
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

            client.close();
          });
        });
      }
    });
  })
  .get('/api/users/read', cors(corsOptions), (req, res) => {
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