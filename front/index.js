const socket = io('', {
    path: '/socket.io',
    transports: ['websocket'],
});

/** BUTTONS */
const BtnSend = document.getElementById('send');
const Btn0 = document.getElementById('button0');
const Btn1 = document.getElementById('button1');
const Btn2 = document.getElementById('button2');
const Btn3 = document.getElementById('button3');
const Btn4 = document.getElementById('button4');
const Btn5 = document.getElementById('button5');
const Btn6 = document.getElementById('button6');
const Btn7 = document.getElementById('button7');
const Btn8 = document.getElementById('button8');
const Btn9 = document.getElementById('button9');

/** OPTIONS */
const option1 = document.getElementById('option1');
const option2 = document.getElementById('option2');
const option3 = document.getElementById('option3');
const option4 = document.getElementById('option4');

/** CONTAINER RESULT */
const containerResult = document.getElementById('result');

function numberSelected(event) {
    let inputSelected;

    for (let i = 0; i < 4; i++) {
        if (document.getElementById(`option${i + 1}`).classList.contains('selected')) {
            inputSelected = document.getElementById('option' + (i + 1));
        }
    }

    inputSelected.innerHTML = event.target.id.split('n')[1];

    if (inputSelected.nextElementSibling !== null) {
        inputSelected.classList.toggle('selected');
        inputSelected.nextElementSibling.classList.toggle('selected');
    }
}

function inputSelected(event) {
    for (let i = 0; i < 4; i++) {
        if (document.getElementById(`option${i + 1}`).classList.contains('selected')) {
            document.getElementById(`option${i + 1}`).classList.toggle('selected');
        }
    }

    event.target.classList.toggle('selected');
}

function socketResult() {
    socket.emit('client:value', {
        value1: option1.textContent,
        value2: option2.textContent,
        value3: option3.textContent,
        value4: option4.textContent
    })

    socket.on('server:result', (result, vidas) => {
        if (result === "🥳 GANASTE 🥳" || result.includes("😭 PERDISTE 😭")) {
            containerResult.innerHTML = `${result}`;
        } else {
            let emojis = result.split('').sort().map((number) => {
                switch (number) {
                    case '1': return "🖤";
                    case '2': return "🤍";
                    case '3': return "❌";
                }
            });

            containerResult.innerHTML = `${emojis} - VIDAS: ${vidas}`;
        }
    })
}

BtnSend.addEventListener('click', function () {
    let enteredNumbers = [option1.textContent, option2.textContent, option3.textContent, option4.textContent];

    if (option1.textContent === '' || option2.textContent === '' || option3.textContent === '' || option4.textContent === '') {
        document.querySelectorAll('.error')[0].innerHTML = `<p>Debes llenar todas las casillas 😳</p>`;
    } else if ([...new Set(enteredNumbers)].length != 4) {
        document.querySelectorAll('.error')[0].innerHTML = `<p>No se pueden ingresar al juego números repetidos 🙄</p>`;
    } else {
        document.querySelectorAll('.error')[0].innerHTML = ``;
        socketResult();
    }

})

Btn0.addEventListener('click', function (event) {
    numberSelected(event);
})
Btn1.addEventListener('click', function (event) {
    numberSelected(event);
})
Btn2.addEventListener('click', function (event) {
    numberSelected(event);
})
Btn3.addEventListener('click', function (event) {
    numberSelected(event);
})
Btn4.addEventListener('click', function (event) {
    numberSelected(event);
})
Btn5.addEventListener('click', function (event) {
    numberSelected(event);
})
Btn6.addEventListener('click', function (event) {
    numberSelected(event);
})
Btn7.addEventListener('click', function (event) {
    numberSelected(event);
})
Btn8.addEventListener('click', function (event) {
    numberSelected(event);
})
Btn9.addEventListener('click', function (event) {
    numberSelected(event);
})
option1.addEventListener('click', function (event) {
    inputSelected(event);
})
option2.addEventListener('click', function (event) {
    inputSelected(event);
})
option3.addEventListener('click', function (event) {
    inputSelected(event);
})
option4.addEventListener('click', function (event) {
    inputSelected(event);
})