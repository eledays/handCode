var slicer = document.getElementById('brushSize');

slicer.addEventListener('input', () => {
    console.log('moved');
    
    document.documentElement.style.setProperty('--thumb-size', `${slicer.value}px`);
    brushSize = slicer.value;
});