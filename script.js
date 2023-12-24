/* This is NOT my coding style, this is mostly AI generated.*/
class Utils {
}
Utils.insertTextAtCursor = (textarea, addedText) => {
    if (!addedText)
        return;
    const cursorPosition = textarea.selectionStart;
    const textBeforeCursor = textarea.value.substring(0, cursorPosition);
    const textAfterCursor = textarea.value.substring(cursorPosition);
    textarea.value = textBeforeCursor + addedText + textAfterCursor;
    textarea.selectionStart = textarea.selectionEnd = cursorPosition + addedText.length;
};
let apiKey = '';
const saveKeyButton = document.getElementById('saveKeyButton');
const recordButton = document.getElementById('recordButton');
const pauseButton = document.getElementById('pauseButton');
const clearButton = document.getElementById('clearButton');
const downloadButton = document.getElementById('downloadButton');
const editorTextarea = document.getElementById('editorTextarea');
const apiKeyInput = document.getElementById('apiKey');
const whisperPrompt = document.getElementById('prompt');
const savePromptButton = document.getElementById('savePromptButton');
const saveEditorButton = document.getElementById('saveEditorButton');
const copyButton = document.getElementById('copyButton');
const spinner = document.querySelector('.spinner');
const setCookie = (cookieName, cookieValue) => {
    const expirationTime = new Date(Date.now() + 2147483647000).toUTCString();
    document.cookie = `${cookieName}=${cookieValue};expires=${expirationTime};path=/`;
};
saveKeyButton.addEventListener('click', () => {
    apiKey = apiKeyInput.value;
    setCookie('apiKey', apiKey);
});
let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let audioBlob;
navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
    let mediaRecorder = new MediaRecorder(stream);
    let audioChunks = [];
    let isRecording = false;
    mediaRecorder.ondataavailable = event => {
        audioChunks.push(event.data);
    };
    mediaRecorder.onstop = () => {
        let audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        audioChunks = [];
        const audioURL = URL.createObjectURL(audioBlob);
        { // Download button (hidden, b/c not working)
            const downloadButton = document.querySelector('#downloadButton');
            downloadButton.href = audioURL;
            downloadButton.download = 'recording.wav';
            // downloadButton.style.display = 'block';
        }
        sendAudioToServer(audioBlob).then(hideSpinner);
    };
    recordButton.addEventListener('click', () => {
        if (!isRecording) {
            showSpinner();
            mediaRecorder.start();
            isRecording = true;
            recordButton.textContent = '◼ Stop';
        }
        else {
            mediaRecorder.stop();
            isRecording = false;
            recordButton.textContent = '⬤ Record';
        }
    });
});
pauseButton.addEventListener('click', () => {
    if (mediaRecorder.state === 'recording') {
        mediaRecorder.pause();
        pauseButton.textContent = 'Resume';
    }
    else if (mediaRecorder.state === 'paused') {
        mediaRecorder.resume();
        pauseButton.textContent = 'Pause';
    }
});
clearButton.addEventListener('click', () => {
    editorTextarea.value = '';
});
savePromptButton.addEventListener('click', () => {
    setCookie("prompt", whisperPrompt.value);
});
whisperPrompt.value = getCookie("prompt");
saveEditorButton.addEventListener('click', () => {
    setCookie("editorText", editorTextarea.value);
});
editorTextarea.value = getCookie("editorText");
copyButton.addEventListener('click', () => {
    navigator.clipboard.writeText(editorTextarea.value).then();
});
const sendAudioToServer = async (audioBlob) => {
    const formData = new FormData();
    formData.append('file', audioBlob);
    formData.append('model', 'whisper-1'); // Using the largest model
    formData.append('prompt', whisperPrompt.value);
    const cookie = getCookie("apiKey");
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${cookie}`
        },
        body: formData
    });
    const result = await response.json();
    if (result?.text) {
        Utils.insertTextAtCursor(editorTextarea, result.text);
    }
    else {
        editorTextarea.value +=
            'You need an API key. Go to https://platform.openai.com/api-keys"> to get an API key. If you want to try it out beforehand, you can try it in the ChatGPT Android and iOS apps for free without API key.\n\n'
                + JSON.stringify(result, null, 2);
    }
    navigator.clipboard.writeText(editorTextarea.value).then();
};
function getCookie(name) {
    let cookieArr = document.cookie.split(";");
    for (let i = 0; i < cookieArr.length; i++) {
        let cookiePair = cookieArr[i].split("=");
        if (name === cookiePair[0].trim()) {
            return decodeURIComponent(cookiePair[1]);
        }
    }
    return null;
}
document.getElementById('saveKeyButton').addEventListener('click', function () {
    document.getElementById('apiKey').value = ''; // Clear the input field
});
const showSpinner = () => {
    spinner.style.display = 'block';
};
const hideSpinner = () => {
    spinner.style.display = 'none';
};
document.querySelector('.info-icon').addEventListener('click', function () {
    document.getElementById('info-text').style.display = 'block';
});
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, err => {
        console.log('ServiceWorker registration failed: ', err);
    });
}
//# sourceMappingURL=script.js.map