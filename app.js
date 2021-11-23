const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config()
const bodyParser = require('body-parser');
const app = express();

const accountRoutes = require('./routes/account');

app.use(express.json())

app.use('/api/account', accountRoutes);


app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || "Internal server error";
    res.status(status).json( new Response(status,message,""));
});

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true })
    .then(() => {
        console.log('connected to mongodb');
        return app.listen(process.env.PORT);
    })
    .then(() => console.log(`server running at ${process.env.PORT}`))
    .catch(err => console.log(err.message));