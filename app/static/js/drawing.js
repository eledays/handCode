let canvas = document.querySelector('canvas');
let sendBtn = document.querySelector('.sendBtn');
let ui = document.querySelector('.ui');
let codePreview = document.querySelector('#codePreview');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let ctx = canvas.getContext('2d');

let isDrawing = false;
let lastX = 0;
let lastY = 0;

let waitingForServer = false;
let needToUpdate = false;

function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
}

function draw(e) {
    if (!isDrawing) return;

    e.preventDefault();

    if (e.buttons === 2) {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 10;
    }
    else {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
    }
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();

    [lastX, lastY] = [e.offsetX, e.offsetY];

    if (!waitingForServer) sendImage();
    else needToUpdate = true;
}

function stopDrawing(e) {
    isDrawing = false;
    ctx.closePath();
}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

canvas.addEventListener('touchstart', (e) => startDrawing(convertTouchEvent(e)));
canvas.addEventListener('touchmove', (e) => draw(convertTouchEvent(e)));
canvas.addEventListener('touchend', stopDrawing);

function convertTouchEvent(e) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    return {
        offsetX: touch.clientX - rect.left,
        offsetY: touch.clientY - rect.top
    }
}

function sendImage() {
    if (waitingForServer) return;

    waitingForServer = true;
    const dataURL = canvas.toDataURL('image/png');

    fetch('/image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: dataURL })
    })
    .then((response) => response.json())
    .then((data) => {
        console.log(data.text);

        codePreview.innerText = data.text;
        
        // ui.innerHTML = '';

        // for (let box of data.boxes) {
        //     let block = document.createElement('div');
        //     block.className = 'highlight';
        //     block.style.left = box[1] + 'px';
        //     block.style.top = box[2] + 'px';
        //     block.style.width = box[3] - box[1] + 'px';
        //     block.style.height = box[4] - box[2] + 'px';
        //     ui.appendChild(block);
        // }
    })
    .catch((error) => {
        console.error(error);
    })
    .finally(() => {
        waitingForServer = false;
        if (needToUpdate) {
            needToUpdate = false;
            sendImage();
        }
    });
}

sendBtn.addEventListener('click', () => {
    let scanLine = document.createElement('div');
    scanLine.classList.add('scanLine');
    document.querySelector('body').appendChild(scanLine);

    setTimeout(() => {
        scanLine.remove();
    }, 1000);

    sendImage();
});