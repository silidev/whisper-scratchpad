
  let apiKey = '';

  const saveKeyButton = document.getElementById('saveKeyButton');
  const recordButton = document.getElementById('recordButton');
  const pauseButton = document.getElementById('pauseButton');
  const downloadButton = document.getElementById('downloadButton');
  const sendButton = document.getElementById('sendButton');
  const whisperResponse = document.getElementById('whisperResponse');
  const apiKeyInput = document.getElementById('apiKey');

  saveKeyButton.addEventListener('click', () => {
    apiKey = apiKeyInput.value;
    document.cookie = `apiKey=${apiKey};max-age=31536000;path=/`; // Expires in 1 year
  });

  let mediaRecorder;
  let audioChunks = [];
  let isRecording = false;
  let audioBlob;

  navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = event => {
          audioChunks.push(event.data);
        };
        mediaRecorder.onstop = () => {
          audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          audioChunks = [];
          const audioURL = URL.createObjectURL(audioBlob);
          downloadButton.href = audioURL;
          downloadButton.download = 'recording.wav';
          downloadButton.style.display = 'block';
        };
      });

  recordButton.addEventListener('click', () => {
    if (!isRecording) {
      mediaRecorder.start();
      isRecording = true;
      recordButton.textContent = 'Stop';
    } else {
      mediaRecorder.stop();
      isRecording = false;
      recordButton.textContent = 'Record';
    }
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

  sendButton.addEventListener('click', () => {
    if(audioBlob) {
      sendAudioToServer(audioBlob);
    }
  });

  const sendAudioToServer = async (audioBlob) => {
    const formData = new FormData();
    formData.append('file', audioBlob);
    formData.append('model', 'whisper-1'); // Using the largest model

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });
    const result = await response.json();
    whisperResponse.textContent = JSON.stringify(result, null, 2);
  };

function getCookie(name) {
    let cookieArr = document.cookie.split(";");
    for(let i = 0; i < cookieArr.length; i++) {
        let cookiePair = cookieArr[i].split("=");
        if(name == cookiePair[0].trim()) {
            return decodeURIComponent(cookiePair[1]);
        }
    }
    return null;
}

document.getElementById('saveKeyButton').addEventListener('click', function() {
    document.getElementById('apiKey').value = ''; // Clear the input field
});
