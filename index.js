const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const e = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://smart-deals:QGxsFYpIbhDCnWt9@cluster0.xhsdu7s.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("smart sever is running");
});

async function run() {
  try {
    await client.connect();

    const db = client.db("smart_db");
    const productcoll = db.collection("products");
    const bidsCollection = db.collection("bids");
    const userscollection=db.collection("users");

    // users related api
    app.post("/users",async(req,res)=>{
      const user=req.body;
      const email=req.body.email;
      const query={email:email};
      const existingUser=await userscollection.findOne(query);
      if(existingUser){
        return res.send({message:"User already exists"});
      }
      const result=await userscollection.insertOne(user);
      res.send(result);
    })

    app.get("/products", async (req, res) => {
      // const projectFields={title:1,price_min:1,price_max:1}
      // const cursor=productcoll.find().sort({price_min:-1}).skip(2).limit(5).project(projectFields);
      console.log(req.query);
      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }

      const cursor = productcoll.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await productcoll.findOne(query);
      res.send(result);
    });

    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      const result = await productcoll.insertOne(newProduct);
      res.send(result);
    });

    app.patch("/products/:id", async (req, res) => {
      const id = req.params.id;
      const updatePoudcts = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          name: updatePoudcts.name,
          price: updatePoudcts.price,
        },
      };
      const options = {};
      const result = await productcoll.updateOne(query, update, options);
      res.send(result);
    });

    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productcoll.deleteOne(query);
      res.send(result);
    });

    // bids related api
    app.get("/bids", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.buyer_email = email;
      }
      const cursor = bidsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/bids", async (req, res) => {
      const newbids = req.body;
      const result = await bidsCollection.insertOne(newbids);
      res.send(result);
    });

    app.delete("/bids/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bidsCollection.deleteOne(query);
      res.send(result);
    });



    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// client.connect().then(()=>{
//     app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })
// })
// .catch(console.dir)
