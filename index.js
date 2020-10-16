const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const ObjectId = require('mongodb').ObjectId;
const fileUpload = require('express-fileUpload');

app.use(bodyParser.json())
app.use(cors());
app.use(express.static('orders'));
app.use(fileUpload());

const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()


app.get('/', (req, res) => {
  res.send('Hello World!')
})

const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.oqqwn.mongodb.net:27017,cluster0-shard-00-01.oqqwn.mongodb.net:27017,cluster0-shard-00-02.oqqwn.mongodb.net:27017/${process.env.DB_NAME}?ssl=true&replicaSet=atlas-eg2ygn-shard-0&authSource=admin&retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
  const serviceCollection = client.db("creative-agency").collection("services");
  const orderCollection = client.db("creative-agency").collection('orders')
  const feedback = client.db("creative-agency").collection("ratings");
  const examples = client.db("creative-agency").collection('examples');
  const userRoles = client.db("creative-agency").collection('userRole');


  app.get('/examples', (req, res) => {
    examples.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  app.get('/feedback', (req, res) => {
    feedback.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })


  app.get('/allServiceList', (req, res) => {
    orderCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  app.get('/AllServices', (req, res) => {
    serviceCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  app.get('/alladmin', (req, res) => {
    userRoles.find({ email: req.query.email })
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  app.get('/Services/:id', (req, res) => {
    serviceCollection.find({ _id: ObjectId(req.params.id) })
      .toArray((err, documents) => {
        res.send(documents[0])
      })
  })
  app.get('/spesificOrder', (req, res) => {
    orderCollection.find({ email: req.query.email })
      .toArray((err, documents) => {
        res.send(documents)
      })
  })



  app.post('/addReview', (req, res) => {
    const orderDetails = req.body;
    feedback.insertOne(orderDetails)
      .then(result => {
        console.log(result.insertedCount);
        res.send(result.insertedCount > 0)
      })
  })




  app.post('/placeOrder', (req, res) => {
    // console.log(req.body, req.files);
    const file = req.files.file;
    const image = req.body.image;
    const name = req.body.name;
    const email = req.body.email;
    const price = req.body.price;
    const service = req.body.service;
    const description = req.body.description;
    console.log("place service");

    const newImg = req.files.file.data;
    const encImg = newImg.toString('base64');
    var img = {
      contentType: req.files.file.mimetype,
      size: req.files.file.size,
      img: Buffer.from(encImg, 'base64')
    }

    orderCollection.insertOne({ name, email, price, service, description, file, image, img })
      .then(result => {
        console.log(result);
        res.send(result.insertedCount > 0)
      })
  })


  app.post('/addServices', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const details = req.body.details;
    const newImg = req.files.file.data;
    const encImg = newImg.toString('base64');
    var image = {
      contentType: req.files.file.mimetype,
      size: req.files.file.size,
      img: Buffer.from(encImg, 'base64')
    }
    serviceCollection.insertOne({ name, details, image })
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  // it will show on terminal when database is connected successfully
  console.log('connected');

});

app.listen(process.env.PORT)
