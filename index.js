// import express from "express";
// import routers from "./routers/index.js";
// import mongoose from "mongoose";
// import cors from "cors";

// const app = express();
// app.use(cors())
// app.use(express.json());
// app.use("/api", routers);



// mongoose.set('debug', true);


// mongoose.set('debug', (collectionName, method, query, doc) => {
//   console.log(`<span class="math-inline">\{collectionName\}\.</span>{method}`, JSON.stringify(query), doc);
// });

// mongoose
//   .connect("mongodb://localhost:27017/dataloader", {})
//   .then(() => {
//     app.listen(3000, () => {
//       console.log("Server is running on port 3000");
//     });
//     console.log("Connected to the database!");
//   })
//   .catch((error) => {
//     console.log("Cannot connect to the database!", error);
//   });


import express from "express";
import routers from "./routers/index.js";
import mongoose from "mongoose";
import cors from "cors";
import cluster from "cluster";
import os from "os";

const app = express();
const numCPUs = Math.min(os.cpus().length, 4);

app.use(cors());
app.use(express.json());
app.use("/api", routers);

mongoose.set('debug', true);

mongoose.set('debug', (collectionName, method, query, doc) => {
  console.log(`${collectionName}.${method}`, JSON.stringify(query), doc);
});

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
} else {
  mongoose
    .connect("mongodb://localhost:27017/dataloader", {})
    .then(() => {
      app.listen(3000, () => {
        console.log(`Server running on port 3000, Worker ${process.pid}`);
      });
      console.log("Connected to the database!");
    })
    .catch((error) => {
      console.log("Cannot connect to the database!", error);
    });
}

