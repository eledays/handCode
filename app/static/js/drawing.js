var canvas = document.querySelector('canvas');
var sendBtn = document.querySelector('.sendBtn');
var codePreview = document.querySelector('#codePreview');
var loading = document.querySelector('.loading');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var ctx = canvas.getContext('2d');

var isDrawing = false;
var lastX = 0;
var lastY = 0;

var brushSize = 2;
var color = '#fff'

var waitingForServer = false;
var needToUpdate = false;

var paths = localStorage.getItem('paths');
var undoPaths = localStorage.getItem('undoPaths');

paths = paths ? JSON.parse(paths) : [];
undoPaths = undoPaths ? JSON.parse(undoPaths) : [];

for (let path of paths) {
    let size, cur_color;
    [size, cur_color, path] = path;
    console.log(size, cur_color, path);
    
    ctx.beginPath();
    ctx.lineWidth = size;
    ctx.strokeStyle = cur_color;
    ctx.moveTo(path[0][0], path[0][1]);
    for (let point of path) {
        ctx.lineTo(point[0], point[1]);
    }
    ctx.stroke();
}

var serverAskTimeout = null;

function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
    paths.push([brushSize, color, [[lastX, lastY]]]);

    clearTimeout(serverAskTimeout);
    serverAskTimeout = null;
    needToUpdate = false;
}

function draw(e) {
    if (!isDrawing) return;

    serverAskTimeout = null;

    try {
        e.preventDefault();
    }
    catch (e) {}

    ctx.strokeStyle = color;
    
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();

    [lastX, lastY] = [e.offsetX, e.offsetY];
    paths[paths.length - 1][2].push([lastX, lastY]);
    undoPaths = [];    
}

function stopDrawing(e) {
    if (!isDrawing) return;

    isDrawing = false;
    ctx.closePath();

    clearTimeout(serverAskTimeout);

    if (!waitingForServer) {
        serverAskTimeout = setTimeout(sendImage, 500);
    }
    else {
        needToUpdate = true;
    }
}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startDrawing(convertTouchEvent(e));
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    draw(convertTouchEvent(e));
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    stopDrawing();
});

function convertTouchEvent(e) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    return {
        offsetX: touch.clientX - rect.left,
        offsetY: touch.clientY - rect.top
    }
}

function sendImage() {
    console.log('sendImage');
    
    if (waitingForServer) return;

    waitingForServer = true;
    loading.style.opacity = 1;
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

        codePreview.innerHTML = data.text;
    })
    .catch((error) => {
        console.error(error);
    })
    .finally(() => {
        loading.style.opacity = 0;
        waitingForServer = false;
        if (needToUpdate) {
            needToUpdate = false;
            serverAskTimeout = setTimeout(sendImage, 500);
        }
    });
}

// sendBtn.addEventListener('click', () => {
//     let scanLine = document.createElement('div');
//     scanLine.classList.add('scanLine');
//     document.querySelector('body').appendChild(scanLine);

//     setTimeout(() => {
//         scanLine.remove();
//     }, 1000);

//     sendImage();
// });

window.addEventListener('keydown', (e) => {
    if (paths && (e.ctrlKey && e.key == 'z')) {
        console.log('undo');
        
        
        poppedPath = paths.pop();
        if (poppedPath) undoPaths.push(poppedPath);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let path of paths) {
            let size, cur_color;
            [size, cur_color, path] = path;
            console.log(size, cur_color, path);
            
            ctx.beginPath();
            ctx.lineWidth = size;
            ctx.strokeStyle = cur_color;
            ctx.moveTo(path[0][0], path[0][1]);
            for (let point of path) {
                ctx.lineTo(point[0], point[1]);
            }
            ctx.stroke();
        }

    }
    else if (undoPaths && (
        e.ctrlKey && e.key == 'y' || e.ctrlKey && e.shiftKey && e.key == 'Z')
    ) {

        poppedPath = undoPaths.pop();
        if (poppedPath) paths.push(poppedPath);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let path of paths) {
            let size, cur_color;
            [size, cur_color, path] = path;
            ctx.beginPath();
            ctx.moveTo(path[0][0], path[0][1]);
            for (let point of path) {
                ctx.lineTo(point[0], point[1]);
            }
            ctx.lineWidth = size;
            ctx.strokeStyle = cur_color;
            ctx.stroke();
        }

    }
});

setInterval(() => {
    localStorage.setItem('paths', JSON.stringify(paths));
    localStorage.setItem('undoPaths', JSON.stringify(undoPaths));
}, 100);