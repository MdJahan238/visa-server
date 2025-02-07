const express = require('express')
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port = 3000
//pass:  user: 


// Add your connection string into your application code

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@mydbcluster.xdx0p.mongodb.net/?retryWrites=true&w=majority&appName=MyDBCluster`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function bootstrap() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    //await client.close(); // eta majhe majhe database off kore dey
  }
}
bootstrap().catch(console.dir);




app.get('/', (req, res) => {
  res.send('Hello Visa Embassy!')
})

app.listen(port, () => {
  console.log(`Visa Embassy app listening on port ${port}`)
})