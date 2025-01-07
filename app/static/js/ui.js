var slicer = document.getElementById('brushSize');
var hoverRangeZone = document.querySelector('.hoverRangeZone');
var brushPreview = document.querySelector('.brushPreview');
var cursor = document.querySelector('.cursor');
var hideBtn = document.querySelector('.codePreviewOuter #hideBtn');
var hidden = false;

var brushBtn = document.getElementById('brushBtn');
var eraserBtn = document.getElementById('eraserBtn');

var clearScreenBtn = document.querySelector('#clearScreenBtn');

var noCursor = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent));

slicer.addEventListener('mouseover', () => {
    document.documentElement.style.setProperty('--thumb-size', `25px`);
    document.documentElement.style.setProperty('--brush-size', `${brushSize}px`);
    brushPreview.style.opacity = 1;
    cursor.style.opacity = 0;
});

slicer.addEventListener('mouseout', () => {
    document.documentElement.style.setProperty('--thumb-size', `15px`);
    brushPreview.style.opacity = 0;
});

slicer.addEventListener('input', () => {
    brushSize = slicer.value;
    document.documentElement.style.setProperty('--brush-size', `${brushSize}px`);
});

brushBtn.addEventListener('click', () => {
    color = '#fff';
    document.documentElement.style.setProperty('--cursor-color', '#fff');
    brushSize = 2;
    document.documentElement.style.setProperty('--brush-size', `2px`);
    slicer.value = 2;
    brushBtn.classList.add('active');
    eraserBtn.classList.remove('active');
});

eraserBtn.addEventListener('click', () => {
    color = '#000';
    brushSize = 32;
    document.documentElement.style.setProperty('--brush-size', `32px`);
    document.documentElement.style.setProperty('--cursor-color', '#101010');
    slicer.value = 32;
    brushBtn.classList.remove('active');
    eraserBtn.classList.add('active');
});

canvas.addEventListener('mouseenter', (event) => {
    if (noCursor) return;
    cursor.style.opacity = 1;
});

canvas.addEventListener('mouseover', (event) => {
    if (noCursor) return;
    cursor.style.opacity = 1;
});

document.body.addEventListener('mousemove', (event) => {
    if (noCursor) return;
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
});

canvas.addEventListener('mouseout', () => {
    if (noCursor) return;       
    cursor.style.opacity = 0;
});

hideBtn.addEventListener('click', (e) => {
    e.preventDefault();

    let outer = document.querySelector('.codePreviewOuter');

    if (window.innerWidth > 800) {
        // pc
        if (hidden) {
            outer.style.transform = 'translateX(0)';
            hideBtn.style.transform = 'rotate(180deg)';
        }
        else {
            outer.style.transform = 'translateX(92%)';
            hideBtn.style.transform = 'rotate(0)';
        }
    }
    else {
        // mobile
        if (hidden) {
            outer.style.transform = 'translateY(0)';
            hideBtn.style.transform = 'rotate(270deg)';
        }
        else {
            outer.style.transform = 'translateY(45%)';
            hideBtn.style.transform = 'rotate(90deg)';
        }
    }

    hidden = !hidden;
});

window.addEventListener('keydown', (e) => {
    if (e.key == ']' || e.key == '}' || e.key == 'ъ' || e.key == 'Ъ') {
        let step = 1;
        if (e.shiftKey) step = 10;
        brushSize = Math.min(Number(slicer.max), brushSize + step);
        slicer.value = brushSize;
        document.documentElement.style.setProperty('--brush-size', `${brushSize}px`);
    }
    if (e.key == '[' || e.key == '{' || e.key == 'х' || e.key == 'Х') {
        let step = 1;
        if (e.shiftKey) step = 10;
        brushSize = Math.max(Number(slicer.min), brushSize - step);
        slicer.value = brushSize;
        document.documentElement.style.setProperty('--brush-size', `${brushSize}px`);
    }
    if (e.key == 'p' || e.key == 'з') {
        color = '#fff';
        document.documentElement.style.setProperty('--cursor-color', '#fff');
        brushSize = 2;
        document.documentElement.style.setProperty('--brush-size', `2px`);
        slicer.value = 2;
        brushBtn.classList.add('active');
        eraserBtn.classList.remove('active');
    }
    if (e.key == 'e' || e.key == 'у') {
        color = '#000';
        document.documentElement.style.setProperty('--cursor-color', '#101010');
        brushSize = 32;
        document.documentElement.style.setProperty('--brush-size', `32px`);
        slicer.value = 32;
        brushBtn.classList.remove('active');
        eraserBtn.classList.add('active');
    }
});

clearScreenBtn.addEventListener('click', () => {
    if (confirm('Уверен, что хочешь очистить экран? Отменить это действие нельзя')) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        paths = [];
        undoPaths = [];
    }
});