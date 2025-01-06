var slicer = document.getElementById('brushSize');
var hoverRangeZone = document.querySelector('.hoverRangeZone');
var brushPreview = document.querySelector('.brushPreview');
var body = document.querySelector('body');
var cursor = document.querySelector('.cursor');
var hideBtn = document.querySelector('.codePreviewOuter #hideBtn');
var hidden = false;

var brushBtn = document.getElementById('brushBtn');
var eraserBtn = document.getElementById('eraserBtn');

hoverRangeZone.addEventListener('mouseover', () => {
    document.documentElement.style.setProperty('--thumb-size', `25px`);
    cursor.style.opacity = 0;
});

hoverRangeZone.addEventListener('mouseout', () => {
    document.documentElement.style.setProperty('--thumb-size', `15px`);
});

slicer.addEventListener('mouseover', () => {
    document.documentElement.style.setProperty('--thumb-size', `25px`);
    document.documentElement.style.setProperty('--brush-size', `${brushSize}px`);
    brushPreview.style.opacity = 1;
    cursor.style.opacity = 0;
});

slicer.addEventListener('mouseout', () => {
    document.documentElement.style.setProperty('--thumb-size', `${slicer.value}px`);
    brushPreview.style.opacity = 0;
});

slicer.addEventListener('input', () => {
    brushSize = slicer.value;
    document.documentElement.style.setProperty('--brush-size', `${brushSize}px`);
});

brushBtn.addEventListener('click', () => {
    color = '#fff';
    document.documentElement.style.setProperty('--cursor-color', '#fff');
    brushBtn.classList.add('active');
    eraserBtn.classList.remove('active');
});

eraserBtn.addEventListener('click', () => {
    color = '#000';
    document.documentElement.style.setProperty('--cursor-color', '#101010');
    brushBtn.classList.remove('active');
    eraserBtn.classList.add('active');
});

body.addEventListener('mouseover', (event) => {
    cursor.style.opacity = 1;
});

body.addEventListener('mousemove', (event) => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
});

body.addEventListener('mouseout', () => {
    cursor.style.opacity = 0;
});

hideBtn.addEventListener('click', () => {
    if (hidden) {
        document.querySelector('.codePreviewOuter').style.transform = 'translateX(0)';
        hideBtn.style.transform = 'rotate(180deg)';
    }
    else {
        document.querySelector('.codePreviewOuter').style.transform = 'translateX(92%)';
        hideBtn.style.transform = 'rotate(0)';
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
        brushBtn.classList.add('active');
        eraserBtn.classList.remove('active');
    }
    if (e.key == 'e' || e.key == 'у') {
        color = '#000';
        document.documentElement.style.setProperty('--cursor-color', '#101010');
        brushBtn.classList.remove('active');
        eraserBtn.classList.add('active');
    }
});