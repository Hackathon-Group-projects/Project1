const express = require("express");
const cors = require("cors");
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());



app.use('/api/scan', require('./routes/scan'));


app.listen(8080, (req, res)=>{
    console.log("Server is listening to port 8080");
})