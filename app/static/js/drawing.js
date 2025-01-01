var canvas = document.querySelector('canvas');
var sendBtn = document.querySelector('.sendBtn');
var ui = document.querySelector('.ui');
var codePreview = document.querySelector('#codePreview');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var ctx = canvas.getContext('2d');

var isDrawing = false;
var lastX = 0;
var lastY = 0;

var brushSize = 4;

var waitingForServer = false;
var needToUpdate = false;

var paths = [];
var undoPaths = [];

function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
    paths.push([[brushSize, [lastX, lastY]]])
}

function draw(e) {
    if (!isDrawing) return;

    e.preventDefault();

    if (e.buttons === 2) {
        ctx.strokeStyle = '#000';
    }
    else {
        ctx.strokeStyle = '#fff';
    }
    
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();

    [lastX, lastY] = [e.offsetX, e.offsetY];
    paths[paths.length - 1][1].push([lastX, lastY]);
    undoPaths = [];

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

window.addEventListener('keydown', (e) => {
    if (paths && (e.ctrlKey && e.key == 'z')) {
        
        poppedPath = paths.pop();
        if (poppedPath) undoPaths.push(poppedPath);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let size;
        [size, paths] = paths;
        for (let path of paths) {
            ctx.beginPath();
            ctx.moveTo(path[0][0], path[0][1]);
            for (let point of path) {
                ctx.lineTo(point[0], point[1]);
            }
            ctx.lineWidth = size;
            ctx.stroke();
        }

    }
    else if (undoPaths && (
        e.ctrlKey && e.key == 'y' || e.ctrlKey && e.shiftKey && e.key == 'Z')
    ) {

        poppedPath = undoPaths.pop();
        if (poppedPath) paths.push(poppedPath);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let size;
        [size, paths] = paths;
        for (let path of paths) {
            ctx.beginPath();
            ctx.moveTo(path[0][0], path[0][1]);
            for (let point of path) {
                ctx.lineTo(point[0], point[1]);
            }
            ctx.lineWidth = size;
            ctx.stroke();
        }

    }
});