// require('dotenv').config();
// import express from 'express';
// import httpProxy from 'http-proxy';
// import morgan from 'morgan';

// const app = express();
// const proxy = httpProxy.createProxyServer({})
// app.use(morgan('combined'))

// const servers = [
//     { url: `http://localhost:${process.env.MOCK_API_PORT_1}`, type: 'REST' },
//     { url: `http://localhost:${process.env.MOCK_API_PORT_2}`, type: 'GraphQL' },
//     { url: `http://localhost:${process.env.MOCK_API_PORT_3}`, type: 'gRPC' }
// ];

// //------ for normal load balancing without any quiuing methods starts------

// // const requestLog = [];

// // function randomServer() {
// //     return servers[Math.floor(Math.random() * servers.length)];
// // }

// // function customCriteria(req){
// //     const path= req.path;
// //     if(path.includes('/rest')) return servers.find(server => server.type === 'REST');
// //     if(path.includes('/graphql')) return servers.find(server => server.type === 'GraphQL');
// //     if(path.includes('/grpc')) return servers.find(server => server.type === 'gRPC');
// //     return randomServer();
// // }

// //------ for normal load balancing without any quiuing methods ends------


// let currentServerIndex = 0;

// function getNextServer() {
//     const server = servers[currentServerIndex];
//     currentServerIndex = (currentServerIndex + 1) % servers.length;
//     return server;
// }

// app.use((req , res , next)=>{
//     const startTime = Date.now();

//     res.on('finish',()=>{
//         const endTime = Date.now();
//         const duration = endTime - startTime;
//         // requestLog.push({
//         //     method: req.method,
//         //     url: req.originalUrl,
//         //     target: res.getHeader('X-Proxy-Target'),
//         //     duration,
//         //     timestamp: new Date().toISOString()
//         // })
//         console.log(`Request to ${req.originalUrl} took ${duration}ms`);
//     })
//     next();
// })

// proxy.on('proxyRes', (proxyRes, req, res) => {
//     res.setHeader('X-Proxy-Target', proxyRes.headers['host']);
// })

// app.use((req, res) => {
//     const targetServer = getNextServer();
//     // const targetServer = customCriteria(req);
//     console.log(`Routing request to ${targetServer.url}`);
//     proxy.web(req, res, { target: targetServer.url } , (err)=>{
//         if(err)
//             {
//                 console.error(`Error proxying to ${targetServer.url}:`, err);
//                 res.status(500).send('Error proxying request');
//             }
//     });
// });

// const port = process.env.LOAD_BALANCER_PORT || 3000;
// app.listen(port, () => {
//     console.log(`Load balancer running on port ${port}`);
// });

require('dotenv').config();
const express = require('express');
const httpProxy = require('http-proxy');
const morgan = require('morgan');

const app = express();
const proxy = httpProxy.createProxyServer({});
app.use(morgan('combined'));

const servers = [
    { url: `http://localhost:${process.env.MOCK_API_PORT_1}`, type: 'REST' },
    { url: `http://localhost:${process.env.MOCK_API_PORT_2}`, type: 'GraphQL' },
    { url: `http://localhost:${process.env.MOCK_API_PORT_3}`, type: 'gRPC' }
];

let currentServerIndex = 0;

function getNextServer() {
    const server = servers[currentServerIndex];
    currentServerIndex = (currentServerIndex + 1) % servers.length;
    return server;
}

app.use((req, res, next) => {
    const startTime = Date.now();

    res.on('finish', () => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        console.log(`Request to ${req.originalUrl} took ${duration}ms`);
    });

    next();
});

proxy.on('proxyRes', (proxyRes, req, res) => {
    res.setHeader('X-Proxy-Target', req.headers['host']);
});

app.use((req, res) => {
    const targetServer = getNextServer();
    console.log(`Routing request to ${targetServer.url}`);
    proxy.web(req, res, { target: targetServer.url }, (err) => {
        if (err) {
            console.error(`Error proxying to ${targetServer.url}:`, err);
            res.status(500).send('Error proxying request');
        }
    });
});

const port = process.env.LOAD_BALANCER_PORT || 3000;
app.listen(port, () => {
    console.log(`Load balancer running on port ${port}`);
});
