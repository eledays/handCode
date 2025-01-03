var slicer = document.getElementById('brushSize');
var hoverRangeZone = document.querySelector('.hoverRangeZone');
var brushPreview = document.querySelector('.brushPreview');

hoverRangeZone.addEventListener('mouseover', () => {
    document.documentElement.style.setProperty('--thumb-size', `25px`);
});

hoverRangeZone.addEventListener('mouseout', () => {
    document.documentElement.style.setProperty('--thumb-size', `15px`);
});

slicer.addEventListener('mouseover', () => {
    document.documentElement.style.setProperty('--thumb-size', `25px`);
    document.documentElement.style.setProperty('--brush-size', `${brushSize}px`);
    brushPreview.style.opacity = 1;
});

slicer.addEventListener('mouseout', () => {
    document.documentElement.style.setProperty('--thumb-size', `${slicer.value}px`);
    brushPreview.style.opacity = 0;
});

slicer.addEventListener('input', () => {
    brushSize = slicer.value;
    document.documentElement.style.setProperty('--brush-size', `${brushSize}px`);
});