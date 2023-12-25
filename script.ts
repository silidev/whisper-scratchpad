namespace WebUtils {
  export  namespace TextAreas {
    export const insertTextAtCursor = (
        textarea: HTMLTextAreaElement,
        addedText: string) => {

      if (!addedText)
        return;
      const cursorPosition = textarea.selectionStart;
      const textBeforeCursor = textarea.value.substring(0, cursorPosition);
      const textAfterCursor = textarea.value.substring(cursorPosition);

      textarea.value = textBeforeCursor + addedText + textAfterCursor;
      const newCursorPosition = cursorPosition + addedText.length;
      textarea.selectionStart = newCursorPosition;
      textarea.selectionEnd = newCursorPosition;
    };
  }

  export namespace Cookies {
    export const set = (cookieName: string, cookieValue: string) => {
      const expirationTime = new Date(Date.now() + 2147483647000).toUTCString();
      document.cookie = `${cookieName}=${encodeURIComponent(cookieValue)};expires=${expirationTime};path=/`;
    };

    export const get = (name: string) => {
      let cookieArr = document.cookie.split(";");
      for (let i = 0; i < cookieArr.length; i++) {
        let cookiePair = cookieArr[i].split("=");
        if (name === cookiePair[0].trim()) {
          return decodeURIComponent(cookiePair[1]);
        }
      }
      return null;
    };
  }

  /**
   * Adds a click listener to a button that appends a checkmark to the button
   * text when clicked. */
  export const addButtonClickListener = (button: HTMLButtonElement, callback: () => void) => {
    const initialHTML = button.innerHTML; // Read initial HTML from the button
    const checkmark = ' ✔️'; // Unicode checkmark

    button.addEventListener('click', () => {
      callback();
      button.innerHTML += checkmark; // Append checkmark to the button HTML
      setTimeout(() => {
        button.innerHTML = initialHTML; // Reset the button HTML after 2 seconds
      }, 2000);
    });
  };
}

namespace AppSpecific {

  namespace PageLogic {

    const saveAPIKeyButton = document.getElementById('saveAPIKeyButton') as HTMLButtonElement;
    const recordButton = document.getElementById('recordButton') as HTMLButtonElement;
    const pauseButton = document.getElementById('pauseButton') as HTMLButtonElement;
    const clearButton = document.getElementById('clearButton') as HTMLButtonElement;
    const downloadButton = document.getElementById('downloadButton') as HTMLAnchorElement;
    const savePromptButton = document.getElementById('savePromptButton') as HTMLButtonElement;
    const saveEditorButton = document.getElementById('saveEditorButton') as HTMLButtonElement;
    const copyButton = document.getElementById('copyButton') as HTMLButtonElement;

    const apiKeyInput = document.getElementById('apiKey') as HTMLTextAreaElement;
    export const editorTextarea = document.getElementById('editorTextarea') as HTMLTextAreaElement;
    export const whisperPrompt = document.getElementById('whisperPrompt') as HTMLTextAreaElement;

    const spinner = document.querySelector('.spinner') as HTMLDivElement;

    let apiKey = '';
    let mediaRecorder: MediaRecorder;
    let audioChunks = [];
    let isRecording = false;

    export const addButtonEventListeners = () => {
      navigator.mediaDevices.getUserMedia({audio: true})
          .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            isRecording = false;

            mediaRecorder.ondataavailable = event => {
              audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
              let audioBlob = new Blob(audioChunks, {type: 'audio/wav'});
              audioChunks = [];
              const audioURL = URL.createObjectURL(audioBlob);
              { // Download button (hidden, b/c not working)
                downloadButton.href = audioURL;
                downloadButton.download = 'recording.wav';
                // downloadButton.style.display = 'block';
              }
              sendToWhisper(audioBlob).then(hideSpinner);
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

      // pauseButton
      pauseButton.addEventListener('click', () => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.pause();
          pauseButton.textContent = '‖ Resume';
        } else if (mediaRecorder.state === 'paused') {
          mediaRecorder.resume();
          pauseButton.textContent = '‖ Pause';
        }
      });

      // saveAPIKeyButton
      WebUtils.addButtonClickListener(saveAPIKeyButton, () => {
        apiKey = apiKeyInput.value;
        WebUtils.Cookies.set('apiKey', apiKey);
      });

      // clearButton
      WebUtils.addButtonClickListener(clearButton, () => {
        editorTextarea.value = '';
      });

      // savePromptButton
      WebUtils.addButtonClickListener(savePromptButton, () => {
        WebUtils.Cookies.set("prompt", whisperPrompt.value);
      });

      // saveEditorButton
      WebUtils.addButtonClickListener(saveEditorButton, () => {
        WebUtils.Cookies.set("editorText", editorTextarea.value);
      });

      // copyButton
      copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(editorTextarea.value).then(() => {
          copyButton.textContent = '⎘ Copied!';
          setTimeout(() => {
            copyButton.textContent = '⎘ Copy';
          }, 2000);
        });
      });

      document.getElementById('saveAPIKeyButton').addEventListener('click', function () {
        (document.getElementById('apiKey') as HTMLInputElement).value = ''; // Clear the input field
      });

      document.querySelector('.info-icon').addEventListener('click', function () {
        document.getElementById('info-text').style.display = 'block';
      });
    }

    const sendToWhisper = async (audioBlob: Blob) => {
      const formData = new FormData();
      formData.append('file', audioBlob);
      formData.append('model', 'whisper-1'); // Using the largest model
      formData.append('prompt', whisperPrompt.value);

      const cookie = WebUtils.Cookies.get("apiKey");
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
            + JSON.stringify(result, null, 2);
      }
      navigator.clipboard.writeText(editorTextarea.value).then();
    };

    const showSpinner = () => {
      spinner.style.display = 'block';
    };

    const hideSpinner = () => {
      spinner.style.display = 'none';
    };

    export const loadFormData = () => {
      PageLogic.whisperPrompt.value = WebUtils.Cookies.get("prompt");

      PageLogic.editorTextarea.value = WebUtils.Cookies.get("editorText");
    };

    export const registerServiceWorker = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
              console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }, err => {
              console.log('ServiceWorker registration failed: ', err);
            });
      }
    };
  }

  const init = () => {
    PageLogic.addButtonEventListeners();
    PageLogic.registerServiceWorker();
    PageLogic.loadFormData();
  }

  init();
}