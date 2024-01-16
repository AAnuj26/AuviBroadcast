// import dotenv from "dotenv"
// "dev": "nodemon -r dotenv/config --experimental-json-modules src/index.js"

require(`dotenv`).config({ path: "./env" });
import { application } from "express";
import connectDB from "./db/connectDB.js";

// dotenv.config({
//     path:'./env'
// })

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port: ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MONGO db Connection failed !!! ", err);
  });
