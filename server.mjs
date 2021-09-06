import express from 'express';
const port = 8099;

const Server = express();
Server.use(express.static( './public'));
Server.listen(port);
console.log(`Запуск приложения - http://localhost:${port}`);