const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port =  process.env.PORT || 5000;

const app = express();

//middleware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next){
  const authHeader = req.headers.authorization;
  if(!authHeader){
    return res.status(401).send({message: 'unauthorized access'});
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,(err, decoded) =>{
    if(err){
      return res.status(403).send({message: 'Forbidden access'});
    }
    req.decoded = decoded;
    next();
  })
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qbosk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
  try{
    await client.connect();
    const productCollection = client.db('furnitureWebsite').collection('product');
    const addCollection = client.db('furnitureWebsite').collection('add');
        // Auth
    app.post('/login', async(req, res) =>{
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn:'1d'
      });
      res.send({accessToken});
    })


    //services API
    app.get('/product', async(req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });

    app.get('/product/:id', async(req, res) =>{
      const id = req.params.id;
      const query={_id: ObjectId(id)};
      const product = await productCollection.findOne(query);
      res.send(product);
    });
    // POST
    app.get('/product', verifyJWT, async(req, res) =>{
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
     if(email === decodedEmail){
      const query = {email: email};
      const cursor = productCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
     }
     else{
       res.status(403).send({message: 'Forbidden access'})
     }
    })
    app.post('/product', async(req, res) =>{
      const newProduct = req.body;
      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    });
    //Update Product
    app.put('/product/:id', async(req, res)=>{
      // const id = req.params.id;
      // const updateQuantity = req.body;
      // const filter = {_id: ObjectId(id)};
      // const options = { upsert: true };
      const updateDoc = {
        $set: {
          quantity: updateQuantity.quantity
        }
      };
      const result = await productCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });
    //DELETE
    app.delete('/product/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });
    //add collection api
    app.post('/order', async(req, res) =>{
      const add = req.body;
      const result = await addCollection.insertOne(add);
      res.send(result);
    });
  }
  finally{

  }
}
run().catch(console.dir);

app.get('/', (req, res) =>{
  res.send('Running Furniture Website Server');
})

app.listen(port, () =>{
  console.log('Listening to port', port)
})