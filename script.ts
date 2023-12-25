/* This is NOT my coding style, this is mostly AI generated.*/

namespace WebUtils {
  export  namespace TextAreas {
    export const insertTextAtCursor =
        (textarea: HTMLTextAreaElement, addedText: string | any[]) => {
          if (!addedText)
            return;
          const cursorPosition = textarea.selectionStart;
          const textBeforeCursor = textarea.value.substring(0, cursorPosition);
          const textAfterCursor = textarea.value.substring(cursorPosition);

          textarea.value = textBeforeCursor + addedText + textAfterCursor;
          textarea.selectionStart = textarea.selectionEnd = cursorPosition + addedText.length;
        };
  }

  export const setCookie = (cookieName: string, cookieValue: string) => {
    const expirationTime = new Date(Date.now() + 2147483647000).toUTCString();
    document.cookie = `${cookieName}=${encodeURIComponent(cookieValue)};expires=${expirationTime};path=/`;
  };

  export const getCookie = (name: string) => {
    let cookieArr = document.cookie.split(";");
    for(let i = 0; i < cookieArr.length; i++) {
      let cookiePair = cookieArr[i].split("=");
      if(name === cookiePair[0].trim()) {
        return decodeURIComponent(cookiePair[1]);
      }
    }
    return null;
  };
}

let apiKey = '';

const saveKeyButton = document.getElementById('saveKeyButton');
const recordButton = document.getElementById('recordButton');
const pauseButton = document.getElementById('pauseButton');
const clearButton = document.getElementById('clearButton');
const downloadButton = document.getElementById('downloadButton');
const editorTextarea = document.getElementById('editorTextarea')  as HTMLTextAreaElement;
const apiKeyInput = document.getElementById('apiKey') as HTMLTextAreaElement;
const whisperPrompt = document.getElementById('whisperPrompt') as HTMLTextAreaElement;
const savePromptButton = document.getElementById('savePromptButton');
const saveEditorButton = document.getElementById('saveEditorButton');
const copyButton = document.getElementById('copyButton');
const spinner = document.querySelector('.spinner') as HTMLDivElement;


let mediaRecorder : MediaRecorder;
let audioChunks = [];
let isRecording = false;
let audioBlob: Blob;

saveKeyButton.addEventListener('click', () => {
  apiKey = apiKeyInput.value;
  WebUtils.setCookie('apiKey', apiKey);
});

navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
    isRecording = false;

    mediaRecorder.ondataavailable = event => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
      let audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      audioChunks = [];
      const audioURL = URL.createObjectURL(audioBlob);
      { // Download button (hidden, b/c not working)
        const downloadButton = document.querySelector('#downloadButton') as HTMLAnchorElement;
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
    } else {
      mediaRecorder.stop();
      isRecording = false;
      recordButton.textContent = '⬤ Record';
    }
  });
});

pauseButton.addEventListener('click', () => {
  if (mediaRecorder.state === 'recording') {
    mediaRecorder.pause();
    pauseButton.textContent = '‖ Resume';
  } else if (mediaRecorder.state === 'paused') {
    mediaRecorder.resume();
    pauseButton.textContent = '‖ Pause';
  }
});

clearButton.addEventListener('click', () => {
  editorTextarea.value = '';
});

savePromptButton.addEventListener('click', () => {
  WebUtils.setCookie("prompt", whisperPrompt.value);
});

saveEditorButton.addEventListener('click', () => {
  WebUtils.setCookie("editorText", editorTextarea.value);
});

copyButton.addEventListener('click', () => {
  navigator.clipboard.writeText(editorTextarea.value).then();
});

const sendAudioToServer = async (audioBlob: Blob) => {
  const formData = new FormData();
  formData.append('file', audioBlob);
  formData.append('model', 'whisper-1'); // Using the largest model
  formData.append('prompt', whisperPrompt.value);

  const cookie = WebUtils.getCookie("apiKey");
  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${cookie}`
    },
    body: formData
  });
  const result = await response.json();

  if (result?.text) {
    WebUtils.TextAreas.insertTextAtCursor(editorTextarea, result.text);
  } else {
    editorTextarea.value +=
        'You need an API key. Go to https://platform.openai.com/api-keys"> to get an API key. If you want to try it out beforehand, you can try it in the ChatGPT Android and iOS apps for free without API key.\n\n'
    + JSON.stringify(result, null,2);
  }
  navigator.clipboard.writeText(editorTextarea.value).then();
};

document.getElementById('saveKeyButton').addEventListener('click', function() {
  (document.getElementById('apiKey')as HTMLInputElement).value  = ''; // Clear the input field
});

const showSpinner = () => {
  spinner.style.display = 'block';
};

const hideSpinner = () => {
  spinner.style.display = 'none';
};

document.querySelector('.info-icon').addEventListener('click', function() {
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

whisperPrompt.value = WebUtils.getCookie("prompt");

editorTextarea.value = WebUtils.getCookie("editorText");