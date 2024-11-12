const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');

const MONGODB_URL = process.env.MONGODB_URL || (process.env.NODE_ENV === 'production' ? 'mongodb://mongo:27017/okpogo' : 'mongodb://localhost:27017/okpogo');
const MONGODB_DBNAME = process.env.MONGODB_DBNAME || 'okpogo';
const PORT = process.env.PORT || 8080;

const app = express();
app.use(cors({
  origin: 'https://web-react-m2ppprfddd83a9c3.sel4.cloudtype.app',
  credentials: true,
}));
app.use(bodyParser.json()); // JSON 파싱 미들웨어 추가
app.set('trust proxy', true);

app.post('/api/users/upload', async (req, res, next) => {
  console.log('postapi');
  let client;
  try {
    client = await MongoClient.connect(MONGODB_URL);
    const collection = client.db(MONGODB_DBNAME).collection('namepw');
    //console.log(req);
    console.log(req.body);
    console.log(req.body[2]);
    
    const userinfo = await collection.findOne({ name: req.body[2] });
    if (!userinfo || userinfo.ban || userinfo.pw !== req.body[3] || req.body[0] == null || req.body[1] == null) {
      console.log(userinfo);
      console.log(userinfo.ban);
      console.log(userinfo.pw);
      
      return res.status(403).send({ error: 'Forbidden' });
    } else {
      const collectionp = client.db(MONGODB_DBNAME).collection('post');
      await collectionp.insertOne({
        name: req.body[2],
        title: req.body[0],
        content: req.body[1]
      });
      console.log('add success');
    }
  } catch (err) {
    next(err);
  } finally {
    if (client) {
      client.close();
    }
  }
});

app.get('/api/users/read', async (req, res, next) => {
  let client;
  try {
    client = await MongoClient.connect(MONGODB_URL);
    const collection = client.db(MONGODB_DBNAME).collection('post');
    
    const postinfo = await collection.find({}).toArray();
    res.send(postinfo);
  } catch (err) {
    next(err);
  } finally {
    if (client) {
      client.close();
    }
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
