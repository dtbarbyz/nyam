const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let users = {}; // Список пользователей и их подключений

app.use(express.static('public')); // Статические файлы

// WebSocket соединение
wss.on('connection', (ws) => {
    let currentUser = null;

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        
        if (data.type === 'register') {
            currentUser = data.username;
            users[data.username] = ws; // Регистрация пользователя
            console.log(`${data.username} подключился`);
        }
        
        // Отправка сообщений
        if (data.type === 'message') {
            const recipient = users[data.to];
            if (recipient) {
                recipient.send(JSON.stringify({ from: data.from, message: data.message }));
            }
        }
    });

    ws.on('close', () => {
        if (currentUser) {
            delete users[currentUser]; // Удаление пользователя при отключении
            console.log(`${currentUser} отключился`);
        }
    });
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
