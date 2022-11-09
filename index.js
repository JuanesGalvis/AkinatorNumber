// Librería para la creación de un servidor express
const express = require('express');
// Módulo para crear un servidor http base de node.js
const HTTP = require('http');
// Librería para Redis
const redis = require('redis');
// Módulo para crear un servidor web socket
const { Server } = require('socket.io')
// Crear el servidor de express
const app = express();
// Puerto
const PORT = 3000;

// Crear servidor http de node basado en el de express
const httpServer = HTTP.createServer(app);
// Conexión desde el servidor
const io = new Server(httpServer);
// Retornar el HTML
app.use(express.static(__dirname + '/front'))

// Función para escuchar/iniciar el servidor
exports.start = function start() {

    // WebSocket - evento al conectarse desde un cliente
    io.on('connection', (socket) => {

        socket.on('disconnect', () => {
            process.send({ cmd: 'deleteClient', id: socket.id });
            console.log(`CLIENTE ${socket.id} DESCONECTADO`);
        })

        console.log(`NUEVA CONEXIÓN (SOCKET.IO - ${socket.id})`);
        // Notificar al hilo principal para generar los números aleatorios
        process.send({ cmd: 'notifyRequest', id: socket.id });

        // // WebSocket - evento al escuchar el envío de valores desde el cliente
        socket.on('client:value', data => {
            // Emitir el evento validateNumber a master para validar los números enviados
            process.send({ cmd: 'validateNumber', values: data, id: socket.id });
        })

        // Escuchar el evento cuando el hilo principal devuelva un resultado
        process.on('message', async function (msg) {

            
            let { result, values, client, vidas } = msg;
            
            if (result) {
                // console.log(`Dentro`);

                if (result === "1111" && vidas > 0) {

                    io.to(client).emit('server:result', "🥳 GANASTE 🥳", vidas);

                } else if (vidas - 1 > 0) {

                    // Conexión a redis local
                    const clientRedis = redis.createClient({
                        host: '127.0.0.1',
                        port: 6379
                    })

                    // Limpiar los valores en redis
                    await clientRedis.connect();
                    clientRedis.set(`vidas-${client}`, vidas - 1 );

                    io.to(client).emit('server:result', result, vidas - 1 );

                } else {

                    io.to(client).emit('server:result', `😭 PERDISTE 😭 - ERA: ${values}`, vidas);
                }

            }
        })
    })

    // Escuchar el servidor en el PORT
    httpServer.listen(PORT, () => {
        console.log(`Escuchando en el puerto (Socket) ${PORT}`);
    })
}

exports.app = app;