const socket = io('', {
    path: '/socket.io',
    transports: ['websocket'],
});

const containerResult = document.getElementById('result');

const BtnSend = document.querySelector('button#send');

BtnSend.addEventListener('click', function () {
    socket.emit('client:value', {
        value1: document.getElementById('option1').value,
        value2: document.getElementById('option2').value,
        value3: document.getElementById('option3').value,
        value4: document.getElementById('option4').value
    })

    socket.on('server:result', (result, vidas) => {
        if (result === "🥳 GANASTE 🥳" || result.includes("😭 PERDISTE 😭")) {
            containerResult.innerHTML = `<h2>${result}</h2>`;
        } else {
            
            let emojis = result.split('').sort().map((number) => {
                switch (number) {
                    case '1': return "🖤";
                    case '2': return "🤍";
                    case '3': return "❌";
                }
            });

            containerResult.innerHTML = `<p>${emojis} - VIDAS: ${vidas} </p><br>`;
        }
    })
})
