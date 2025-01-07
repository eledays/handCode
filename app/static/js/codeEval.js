var outputBlock = document.querySelector('#codeOutput');
var runBtn = document.querySelector('#runBtn');

async function load() {
    let pyodide = await loadPyodide();
    pyodide.setStdout({batched: (str) => {
        if (outputBlock.innerHTML != '') outputBlock.innerHTML += '\n' + str;
        else outputBlock.innerHTML = str;
    }});

    console.log('pyodide ready');
    document.querySelector('.loading_block').remove();

    return pyodide;
};

let pyodideReadyPromise = load();

async function evaluatePython(code) {
    if (code == '' || code == 'код') {
        outputBlock.innerHTML = 'Ну хоть что-нибудь напиши';
        return;
    }
    outputBlock.innerHTML = '';
    let pyodide = await pyodideReadyPromise;
    try {
        outputBlock.style.color = 'white';
        let output = await pyodide.runPythonAsync(code);
        console.log(output);
    } catch (err) {
        console.log(err);
        outputBlock.innerHTML = err;
        outputBlock.style.color = 'red';
    }
}

runBtn.addEventListener('click', () => {
    evaluatePython(codePreview.innerHTML);
});