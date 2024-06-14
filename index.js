const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config()
const jwt = require("jsonwebtoken")
const port = process.env.PORT || 5000;
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');
app.use(bodyParser.json());
app.use(cors());

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;

    try {
        const response = await axios.post('https://your-flask-api.herokuapp.com/chat', {
            message: userMessage
        });

        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error communicating with AI model API');
    }
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});

// middleware
app.use(cors());
app.use(express.json());

// verify token
const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
    if(!authorization){
        return res.status(401).send({message: 'Invalid authorization'})
    }

    const token = authorization?.split('')[1];
    jwt.verify(token, process.env.ASSESS_SECRET, (err, decoded) => {
        if(err) {
            return res.status(403).send ({message: 'Forbidden access'})
        }
        req.decoded = decoded;
        next();
    })

    // middleware for admin and instructor
    const verifyAdmin = async (req, res, next) => {
        const email = req.decoded.email;
        const query = {email: email};
        const user = await usersCollection.findOne(query);
        if (user.role === 'admin'){
            next ();
        } else {
            return res.status(401).send({message: 'Unauthorized access'})
        }
    };
}


// mongodb connection

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://emarienahanthony:6bnzJQ1HcfDOucPl@finhero.3yqwata.mongodb.net/?retryWrites=true&w=majority&appName=finhero`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
}
});

async function run() {
    try {
    //Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    //create a database and collections
    const database = client.db("Finhero");
    const userCollection = database.collection("users");

    // routes for users
    
    app.post("/api/set-token", async (req, res) => {
        const user = req.body;
        const token = jwt.sign(user, process.env.ASSESS_SECRET, {
            expiresIn: '24'
        });
        ResizeObserver.SEND({token})
    })
    
    app.post('/new-user', async (req, res) => {
        const newUser = req.body;
        const result = await usersCollection.insertOne(newUser);
        res.send(result);
    })

    app.get('/users', async (req, res) => {
        const result = await userCollection.find({}).toArray();
        res.send(result);
    });

    app.get('/users/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id)};
        const result = await userCollection.findOne(query);
        res.send(result);
    });

    app.get('/user/:email',verifyJWT, async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const result = await usersCollection.findOne(query);
        res.send(result);
    });

    app.delete('/delete-user/:id',verifyJWT, verifyAdmin, async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await userCollection.deleteOne(query);
        res.send(result);
    });

    app.put('/update-user/:id',verifyJWT, verifyAdmin, async (req, res) => {
        const id = req.params.id;
        const updatedUser = req.body;
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true};
        const updateDoc = {
            $set: {
                name: updatedUser.name,
                email: updatedUser.email,
            }
        }
        const result = await usersCollection.updateOne(filter, updateDoc, options);
        res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
} finally {
    // Ensures that the client will close when you finish/error
    await client.close();
}
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Hello world!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})