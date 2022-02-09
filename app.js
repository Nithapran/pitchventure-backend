const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config()
const bodyParser = require('body-parser');
const app = express();
const auth = require('./middleware/auth')

const Response = require('./models/response')

const accountRoutes = require('./routes/account');
const requestRoutes = require('./routes/request');

app.use(express.json())

app.use('/api/account', accountRoutes);
app.use('/api/request', auth,requestRoutes);

app.use((err, req, res, next) => {
    const code = err.code || 5000;
    const status = err.status || 500
    const message = err.message || "Internal server error";
    res.status(status).json( new Response(code,message,""));
});

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true })
    .then(() => {
        console.log('connected to mongodb');
        return app.listen(process.env.PORT);
    })
    .then(() => console.log(`server running at ${process.env.PORT}`))
    .catch(err => console.log(err.message));