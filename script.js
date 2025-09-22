//the keystrokes count inside the json file refers to the minimum number of keystrokes needed to accomplish the task with 100% score.

const startButton = document.getElementById('startButton');
const instruction = document.getElementById('instruction');
const countHere = document.getElementById('countHere');
const openBtn = document.getElementById("openModal");
const modal = document.getElementById("openModal");
const closeBtn = document.getElementById("closeModal");
const retryBtn = document.getElementById("retryButton");

let textArea;
let targetText;
let counter = 0;
let challenges = [];
let challenge = null;

fetch('challenges.json')
    .then(res => res.json())
    .then(data => {
        challenges = data;
        console.log(challenges);
    })
    .catch(err => console.error('Error loading challenges:', err));

function getRandomChallenge(difficulty) {
    const filtered = challenges.filter(c => c.difficulty === difficulty);
    return filtered[Math.floor(Math.random() * filtered.length)];
}

function placeCursorAtEnd(editor) {
    const model = editor.getModel();
    const lineCount = model.getLineCount();
    const lastLineLength = model.getLineMaxColumn(lineCount);
    editor.setPosition({ lineNumber: lineCount, column: lastLineLength });
    editor.focus();
}

require.config({ paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs" } });

require(["vs/editor/editor.main"], function () {
    textArea = monaco.editor.create(document.getElementById("inputEdit"), {
        value: "/* Text to Edit */",
        language: "javascript",
        theme: "vs-dark",
        automaticLayout: true,
        fontSize: 19,
        padding: { top: 5, bottom: 5 },
        minimap: { enabled: false }

    });

    targetText = monaco.editor.create(document.getElementById('inputTarget'), {
        value: "/* Target Text */",
        language: "javascript",
        theme: "vs-dark",
        automaticLayout: true,
        fontSize: 19,
        padding: { top: 5, bottom: 5 },
        readOnly: true,
        renderLineHighlight: "none",
        renderLineHighlightOnlyWhenFocus: false,
        occurrencesHighlight: false,
        selectionHighlight: false,
        minimap: { enabled: false }
    });

    textArea.onKeyDown(() => {
        if (startButton.textContent !== 'Start Challenge') {
            counter++;
            startButton.textContent = `Keystrokes: ${counter}`;
        }
    });

textArea.onMouseDown(() => {
    if (startButton.textContent !== 'Start Challenge' && challenge) {
        counter = 0;
        startButton.textContent = `Keystrokes: ${counter}`;
        textArea.setValue(challenge.editable);
        targetText.setValue(challenge.target);
        placeCursorAtEnd(textArea);
    }
  });

    textArea.onDidChangeModelContent(compareText);
});

startButton.onclick = function () {
    const selectedDifficulty = document.getElementById('difficultySelect').value;

    if (startButton.textContent === 'Start Challenge') {
        challenge = getRandomChallenge(selectedDifficulty);
        counter = 0;
        startButton.textContent = `Keystrokes: ${counter}`;
        startButton.style.backgroundColor = '#f44336';      
        textArea.setValue(challenge.editable);
        targetText.setValue(challenge.target);
        instruction.innerHTML = `<b>INSTRUCTION:</b> <u>${challenge.instruction}</u><br>Mouse clicks inside the text editor will reset the challenge.`;      
        placeCursorAtEnd(textArea);

    } else {
        challenge = null;
        counter = 0;
        startButton.textContent = 'Start Challenge';
        startButton.style.backgroundColor = '#4CAF50';
        instruction.innerHTML = 'Replicate the target text on the right.<br>Choose a difficulty then press start to begin the challenge.';
        textArea.setValue("/* Text to Edit */");
        targetText.setValue("/* Target Text */");
    }
};

function normalizeCode(str) {
    return str.replace(/\r\n/g, "\n").replace(/\t/g, "    ");
}

function compareText() {
    if (!challenge) return;
    if (normalizeCode(textArea.getValue()) === normalizeCode(targetText.getValue())) {
        let score = counter <= challenge.keystrokes
            ? 100
            : Math.round((challenge.keystrokes / counter) * 100);

        countHere.innerHTML = `Score: ${score}%`;

        modal.style.display = "flex";
  }
}

closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
    challenge = null;
    counter = 0;
    startButton.textContent = 'Start Challenge';
    startButton.style.backgroundColor = '#4CAF50';
    instruction.innerHTML = 'Replicate the target text on the right.<br>Choose a difficulty then press start to begin the challenge.';
    textArea.setValue("/* Text to Edit */");
    targetText.setValue("/* Target Text */");
});

retryBtn.addEventListener("click", () => {
    modal.style.display = "none";
    counter = 0;
    startButton.textContent = `Keystrokes: ${counter}`;
    textArea.setValue(challenge.editable);
    targetText.setValue(challenge.target);
    placeCursorAtEnd(textArea);
});