let apiKey = '';

const saveKeyButton = document.getElementById('saveKeyButton');
const recordButton = document.getElementById('recordButton');
const pauseButton = document.getElementById('pauseButton');
const clearButton = document.getElementById('clearButton');
const downloadButton = document.getElementById('downloadButton');
const whisperResponse = document.getElementById('whisperResponse');
const apiKeyInput = document.getElementById('apiKey');
const prompt = document.getElementById('prompt');

saveKeyButton.addEventListener('click', () => {
  apiKey = apiKeyInput.value;
  document.cookie = `apiKey=${apiKey};expires=${new Date(Date.now() + 2147483647000).toUTCString()};path=/`;
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

  const recordButton = document.querySelector('#recordButton');
  recordButton.addEventListener('click', () => {
    if (!isRecording) {
      showSpinner();
      mediaRecorder.start();
      isRecording = true;
      recordButton.textContent = 'Stop';
    } else {
      mediaRecorder.stop();
      isRecording = false;
      recordButton.textContent = 'Record';
    }
  });
});

pauseButton.addEventListener('click', () => {
  if (mediaRecorder.state === 'recording') {
    mediaRecorder.pause();
    pauseButton.textContent = 'Resume';
  } else if (mediaRecorder.state === 'paused') {
    mediaRecorder.resume();
    pauseButton.textContent = 'Pause';
  }
});

clearButton.addEventListener('click', () => {
  whisperResponse.value = '';
});

const sendAudioToServer = async (audioBlob) => {
  const formData = new FormData();
  formData.append('file', audioBlob);
  formData.append('model', 'whisper-1'); // Using the largest model
  formData.append('prompt', prompt.value);

  const cookie = getCookie("apiKey");
  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${cookie}`
    },
    body: formData
  });
  const result = await response.json();
  whisperResponse.value +=
      result.text ? result.text
          : JSON.stringify(result, null, 2);
  if (result.error?.code === "invalid_api_key") {
    whisperResponse.value = 'You need an API key. Go to <a href="https://platform.openai.com/api-keys">to get an API key</a>. If you want to try it out beforehand, you can try it in the ChatGPT Android and iOS apps for free.';
  }
  navigator.clipboard.writeText(whisperResponse.value).then();
};

function getCookie(name) {
  let cookieArr = document.cookie.split(";");
  for(let i = 0; i < cookieArr.length; i++) {
    let cookiePair = cookieArr[i].split("=");
    if(name === cookiePair[0].trim()) {
      return decodeURIComponent(cookiePair[1]);
    }
  }
  return null;
}

document.getElementById('saveKeyButton').addEventListener('click', function() {
  document.getElementById('apiKey').value = ''; // Clear the input field
});

const showSpinner = () => {
  const spinner = document.querySelector('.spinner');
  spinner.style.display = 'block';
};

const hideSpinner = () => {
  const spinner = document.querySelector('.spinner');
  spinner.style.display = 'none';
};
