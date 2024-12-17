const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');

const MONGODB_URL = process.env.MONGODB_URL || (process.env.NODE_ENV === 'production' ? 'mongodb://mongo:27017/okpogo' : 'mongodb://localhost:27017/okpogo');
const MONGODB_DBNAME = process.env.MONGODB_DBNAME || 'okpogo';
const PORT = process.env.PORT || 8080;

const danwordlist = ["씨발", "ㅅㅂ", "ㅆㅂ", "새끼", "지랄", "좆", "엿", "병신", "존나", "썅", "쌍", "죽여", "시발", "돼지", "염병", "정신병자", "한남", "한녀", "년", "페미", "동덕", "게이", "인셀", "걸레", "매춘", "자살", "일베", "승만", "정희", "두환", "명박", "근혜", "무현", "재인", "홍준표", "이재명", "안철수", "조국", "석열", "빨갱", "이기야", "위험단어테스트용용용"];

const app = express();
app.use(cors({
  origin: 'https://web-react-m2ppprfddd83a9c3.sel4.cloudtype.app',
  credentials: true,
}));
app.use(bodyParser.json()); // JSON 파싱 미들웨어 추가
app.set('trust proxy', true);

app.post('/api/users/upload', async (req, res, next) => {
  //console.log('postapi');
  let client;
  try {
    client = await MongoClient.connect(MONGODB_URL);
    const collection = client.db(MONGODB_DBNAME).collection('namepw');
    const userinfo = await collection.findOne({ name: req.body[2] });
    console.log(req.body);
    const titlecheck = danwordlist.some(char => req.body[0].includes(char));
    const contentcheck = danwordlist.some(char => req.body[1].includes(char));
    console.log(userinfo.name, userinfo.pw, userinfo.ban);
    console.log('check',!userinfo, userinfo.ban, userinfo.pw !== req.body[3],req.body[0] == null,req.body[1] == null,!titlecheck,!contentcheck);
    if (!userinfo || userinfo.ban || userinfo.pw !== req.body[3] || req.body[0] == null || req.body[1] == null || titlecheck || contentcheck) {
      console.log('upload not allowed');
      
      return res.status(403).send({ error: 'Forbidden' });
    } else {
      const collectionp = client.db(MONGODB_DBNAME).collection('post');
      await collectionp.insertOne({
        name: req.body[2],
        title: req.body[0],
        content: req.body[1]
      });
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
