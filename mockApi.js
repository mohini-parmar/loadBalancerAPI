require('dotenv').config();
const express = require('express')
const app = express()

app.get('/',(req,res)=>{
    res.send('Hello from mock API')
})

app.get('/rest',(req,res)=>{
    setTimeout(() => res.send('REST API Response'), 1000);
})

app.get('/graphql',(req,res)=>{
    setTimeout(() => res.send('GraphQL API Response'), 500);
})

app.get('/grpc',(req,res)=>{
    setTimeout(() => res.send('gRPC API Response'), 1500);
})

const port = process.env.PORT || 3001;
app.listen(port , ()=>{
    console.log(`Mock API running on port ${port}`);
})