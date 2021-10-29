const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// uri and client
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2w1ht.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// operations
async function run() {
    try {
        await client.connect();

        const database = client.db("travelDestinations");
        const destCollection = database.collection("destinations");
        const orderCollection = database.collection("orders");

        // Get
        app.get('/destinations', async (req, res) => {
            // select all
            const cursor = destCollection.find({});
            const destinations = await cursor.toArray();
            res.send(destinations);
        });

        // Get by _id
        app.get('/destinations/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };

            const currentDestination = await destCollection.findOne(query);
            res.json(currentDestination);
        })
        
        // post new order
        app.post('/orders', async (req, res) => {
            const order = req.body;
            console.log("hit post", order);
            
            const result = await orderCollection.insertOne(order);
            console.log(result);
            res.json(result)
        })

        // get all orders - admin
        app.get('/orders', async (req, res) => {
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        })
        
        // get single users order
        app.get('/orders/:uid', async (req, res) => {
            const uid = req.params.uid;
            console.log(uid);

            const query = { uid: uid };
    
            const orders = await orderCollection.find(query).toArray();
            res.json(orders);
        })

        // add/post new destination
        app.post('/destinations', async (req, res) => {
            const destination = req.body;
            console.log("hit post", destination);
            
            const result = await destCollection.insertOne(destination);
            console.log(result);
            res.json(result)
        })

        // delete order api
        app.delete('/orders/:deleteId',async(req, res) => {
            const deleteId = req.params.deleteId;
            
            const query = { _id: ObjectId(deleteId) };

            const result = await orderCollection.deleteOne(query);

            res.json(result);
        })

        // update orderStatus
        app.put('/orders/:updateId', async (req, res) => {
            const updateId = req.params.updateId;
            // console.log(updateId)
            const filter = { _id: ObjectId(updateId) };
            
            const options = { upsert: true };

            const updateDoc = {
                $set: {
                    orderStatus: "confirmed",
                },
            };
            const result = await orderCollection.updateOne(filter, updateDoc, options)
            console.log('updating', updateId)
            res.json(result);
        })


    }finally{}
}

run().catch(console.dir)

app.get('/', (req, res) => {
    console.log("Server started");
    res.send("Server running");
});

app.listen(port, () => {
    console.log("listening to port", port);
})
