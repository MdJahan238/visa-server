const express = require('express')
require('dotenv').config();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express()
const port = 3000


//middleware
app.use(cors())
app.use(express.json())

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
   const database = client.db("onlie-embassy");
   const usersCollections = database.collection("Users");
   const bookingCollection = database.collection("Bookings");
   const appointmentOptionCollections = database.collection("AppointmentOptions");
   

   // Service Option
app.get('/appointmentOptions',async (req,res)=>{
  const date = req.query.date;
  const query = {};
  const options = await appointmentOptionCollections.find(query).toArray();

  //get all booking of the frontend provided date
  const bookingQuery = {appointmentDate:date }
  const alreadyBooked = await bookingCollection.find(bookingQuery).toArray();
  //console.log(alreadyBooked);

  options.forEach((option) =>{
    const optionBooked = alreadyBooked.filter((booked) => booked.serviceName === option.name);
    const bookedSlots = optionBooked.map(book =>book.slot)
    const remainingSlot = option.slots.filter(slot=> !bookedSlots.includes(slot))
    option.slots = remainingSlot;
    //console.log(bookedSlots);
  })
  
  
  res.send(options)
})

  

app.get('/bookings',async (req, res)=>{
  const email =req.query.email;
  const query = {email:email}
  const bookings = await bookingCollection.find(query).toArray();
  res.send(bookings)
  
})



//booking service
app.post('/bookings',async(req,res)=>{
  const bookings=req.body;
  //console.log(bookings);

  // checked user hav already booking
  const query ={
    appointmentDate: bookings.appointmentDate,
    email: bookings.email,
    serviceName: bookings.serviceName
  }

  const alreadyBooked = await bookingCollection.find(query).toArray();
  if (alreadyBooked.length) {
    const message =`You already a booking on ${bookings.appointmentDate}`
    return res.send({acknowledged:false,message})
  }

  const result =await bookingCollection.insertOne(bookings);
  res.send(result);
  
})


//users get from database
app.get('/users',async(res,req)=>{
  const query={};
  const users=await usersCollections.find(query).toArray();
 req.send(users)
})



//is admin check
app.get('/users/admin/:email',async(req,res)=>{
  const email =req.params.email;        //front-end email call
  //console.log(email);
  const query = {email:email}         //database:front-end email call
  const user =await usersCollections.findOne(query)
  //console.log(user);
  res.send({isAdmin:user?.role === 'admin' })
  
})



//make admin / update with set role
app.put('/users/admin/:id',async(req,res)=>{
  //console.log("route matched");
  const id = req.params.id;
  //console.log(id);
  const filter = {_id: new ObjectId(id)}
  const option ={upsert: true}
  const updatedDoc ={
    $set:{
      role:'Admin'
    }
  }
  const result =await usersCollections.updateOne(filter,updatedDoc,option);
  res.send(result);
})



//user post from frontend to database
    app.post('/users',async(req,res)=>{
      const user =req.body;
      //console.log(user);
      
      const result =await usersCollections.insertOne(user);
      //console.log(result);
      res.send(result); 
    })



    //delete user
    app.delete('/users/:id',async(req,res)=>{
      const id = req.params.id;
         //console.log(id);
      const query = {_id: new ObjectId(id)}
      const result =await usersCollections.deleteOne(query);
      res.send(result);

      
    })





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