// import dotenv from "dotenv"
    // "dev": "nodemon -r dotenv/config --experimental-json-modules src/index.js"

require(`dotenv`).config({path: './env'})
import connectDB from "./db/connectDB.js";

dotenv.config({
    path:'./env'
})

connectDB();