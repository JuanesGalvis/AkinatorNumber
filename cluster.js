// Librería para manejo de hilos en node.js
const cluster = require('cluster');
// Librería para Redis
const redis = require('redis');
// Función para iniciar el servidor (socket)
const { start } = require('./index');

let worker;


// Validar el hilo principal/master
if (cluster.isMaster) {

    // Variables compartidas para guardar los números y resultados
    let Result = '';

    // Función para generar un número aleatorio entre 0 - 9
    function Random() {
        let random = Math.floor(Math.random() * (9 - 0 + 1) + 0);
        return random;
    }

    // Función cuando se emite el evento 'message'
    async function messageHandler(msg) {
        // si el evento contiene 'notifyRequest' -> Nueva conexión
        if (msg.cmd && msg.cmd === 'notifyRequest') {

            // Conexión a redis local
            const client = redis.createClient({
                host: '127.0.0.1',
                port: 6379
            })

            // Limpiar los valores en redis
            await client.connect();
            client.set(`vidas-${msg.id}`, 7);

            // Recorrer los workers y hacer que emitan el evento "random" -> Generar un número aleatorio
            for (const id in cluster.workers) {
                let currentWorker = cluster.workers[id];
                // Emitir el evento para generar un número aleatorio, se envia el hilo y su id
                await currentWorker.emit('random', currentWorker, id, msg.id);
            }

            // Seleccionar el worker 1 
            let oneWorker = cluster.workers[1];
            // Emitir el evento "validateRandom" -> Validar que no haya duplicados
            await oneWorker.emit('validateRandom', msg.id);

            // si el evento contiene 'validateNumber' -> Números enviados desde el cliente
        } else if (msg.cmd === 'validateNumber') {
            // Limpiar el resultado
            Result = '';
            // Recorrer todos los hilos
            for (const id in cluster.workers) {
                let currentWorker = cluster.workers[id];

                let values = Object.values(msg.values);

                // Repartir los números para cada hilo
                console.log(`EL WORKER #${id} - VALIDARÁ: ${values[id - 1]}`);
                // Emitir el evento para validar el número y posición
                currentWorker.emit('validate', values[id - 1], id - 1, cluster.workers, msg.id);
            }

        } else if (msg.cmd === 'deleteClient') {

            // Conexión a redis local
            const client = redis.createClient({
                host: '127.0.0.1',
                port: 6379
            })

            // Limpiar los valores en redis
            await client.connect();

            client.del(`Result-${msg.id}`);
            client.del(`vidas-${msg.id}`);
            client.del(`Worker#1-${msg.id}`);
            client.del(`Worker#2-${msg.id}`);
            client.del(`Worker#3-${msg.id}`);
            client.del(`Worker#4-${msg.id}`);
        }
    }

    // Función que se ejecuta en el evento "random"
    function randomGenerate(worker, workerId, clientId) {
        // Generar el número aleatorio
        let RandomNumber = Random();
        // Emitir el evento para guardar el valor generado con los demás
        worker.emit('saveValue', RandomNumber, workerId, clientId);
    }

    // Función que se ejecuta en el evento "validate"
    async function validateValue(value, position, workers, clientId) {

        let ArrayValues = [];
        Result = '';

        const client = redis.createClient({
            host: '127.0.0.1',
            port: 6379
        })

        await client.connect();
        for (let i = 1; i < 5; i++) {

            let valueWorker = await client.get(`Worker#${i}-${clientId}`);
            ArrayValues.push(valueWorker);

        }
        // Validar si el número y posición están correctos
        if (ArrayValues[position] == value) {
            // Result += "🖤"
            Result += "1"

            // Validar si el número pero no la posición
        } else if (ArrayValues.includes(value)) {
            // Result += "🤍"
            Result += "2"

            // El número no se encuentra en los generados
        } else {
            // Result += "❌"
            Result += "3"
        }

        if (Result.length === 4) {
            console.log(`El worker ${position + 1} es el que tiene los 4 resultados`);
            client.set(`Result-${clientId}`, Result);
            let vidasFinal = await client.get(`vidas-${clientId}`);
            
            // ???
            workers[4].send({ result: Result, values: JSON.stringify(ArrayValues), client: clientId, vidas: vidasFinal });

        }
    }

    // Función que se ejecuta en el evento "saveValue"
    async function updateValue(value, workerId, clientId) {

        // Conexión a redis
        const client = redis.createClient({
            host: '127.0.0.1',
            port: 6379
        })

        await client.connect();

        // Guardar los valores de cada hilo en redis con su identificador
        client.set(`Worker#${workerId}-${clientId}`, value + '');
    }

    // Función que se ejecuta en el evento "validateRandom"
    async function validateRandomDuplicated(clientId) {

        let ValuesSaved = [];

        // Conexión a redis
        const client = redis.createClient({
            host: '127.0.0.1',
            port: 6379
        })

        await client.connect();

        for (let i = 1; i < 5; i++) {

            let valueWorker = await client.get(`Worker#${i}-${clientId}`);
            ValuesSaved.push(valueWorker);

        }

        let resultDuplicated = [...new Set(ValuesSaved)];

        while (resultDuplicated.length < 4) {
            let RandomNumber = Random();
            resultDuplicated.push(RandomNumber + '');
            resultDuplicated = [...new Set(resultDuplicated)];
        }

        console.log(resultDuplicated);

        // Guardar los valores de cada hilo en redis con su identificador
        for (let i = 1; i < 5; i++) {
            console.log(`Worker#${i}-${clientId}`, resultDuplicated[i - 1]);
            client.set(`Worker#${i}-${clientId}`, resultDuplicated[i - 1]);
        }
    }

    // Crear 4 hilos/workers
    for (var i = 0; i < 4; i++) {

        worker = cluster.fork();
        console.log(`Worker #${i + 1} created....`);

        // Cada worker debe escuchar los siguientes eventos:
        worker.on('message', messageHandler);
        worker.on('random', randomGenerate);
        worker.on('validateRandom', validateRandomDuplicated);
        worker.on('saveValue', updateValue);
        worker.on('validate', validateValue);
    }

} else if (cluster.isWorker) {
    // Si no es el maestro pero esta trabajando se inicia/comparte el servidor
    start();
}