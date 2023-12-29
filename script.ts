namespace HtmlUtils {
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

  export namespace Media {
    export const releaseMicrophone = (stream: MediaStream) => {
      if (!stream) return;
      stream.getTracks().forEach(track => track.stop());
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


namespace HelgeUtils {
  export const replaceByRules = (subject: string, ruleText: string) => {
    let count = 0;
    let ruleMatches: any[];
    const ruleParser = /^"(.+?)"([a-z]*?)(?:\r\n|\r|\n)?->(?:\r\n|\r|\n)?"(.*?)"([a-z]*?)(?:\r\n|\r|\n)?$/gmus;
    while (ruleMatches = ruleParser.exec(ruleText)) {
      // console.log("\n" + ruleMatches[1] + "\n↓↓↓↓↓\n"+ ruleMatches[3]);
      let matchRule = ruleMatches[2].length == 0 ?
          new RegExp(ruleMatches[1], 'gm')
          : new RegExp(ruleMatches[1], ruleMatches[2]);
      if (ruleMatches[4] == 'x')
        subject = subject.replace(matchRule, '');
      else
        subject = subject.replace(matchRule, ruleMatches[3]);
      count++;
    }
    return subject;
  }
}

namespace AppSpecific {

  namespace PageLogic {

    const saveAPIKeyButton = document.getElementById('saveAPIKeyButton') as HTMLButtonElement;
    const recordButton = document.getElementById('recordButton') as HTMLButtonElement;
    const pauseButton = document.getElementById('pauseButton') as HTMLButtonElement;
    const clearButton = document.getElementById('clearButton') as HTMLButtonElement;
    const downloadButton = document.getElementById('downloadButton') as HTMLAnchorElement;
    const savePromptButton = document.getElementById('savePromptButton') as HTMLButtonElement;
    const saveRulesButton = document.getElementById('saveRulesButton') as HTMLButtonElement;
    const saveEditorButton = document.getElementById('saveEditorButton') as HTMLButtonElement;
    const copyButton = document.getElementById('copyButton') as HTMLButtonElement;
    const transcribeAgainButton = document.getElementById('transcribeAgainButton') as HTMLButtonElement;

    const apiKeyInput = document.getElementById('apiKey') as HTMLTextAreaElement;
    export const editorTextarea = document.getElementById('editorTextarea') as HTMLTextAreaElement;
    export const whisperPrompt = document.getElementById('whisperPrompt') as HTMLTextAreaElement;
    export const replaceRulesTextArea = document.getElementById('replaceRulesTextArea') as HTMLTextAreaElement;


    // ############## addButtonEventListeners ##############
    export const addButtonEventListeners = () => {

      const spinner = document.querySelector('.spinner') as HTMLDivElement;
      let apiKey = '';
      let mediaRecorder: MediaRecorder;
      let audioChunks = [];
      let audioBlob: Blob;
      let isRecording = false;
      let stream: MediaStream;

      recordButton.addEventListener('click', () => {
        function startRecording() {
          showSpinner();
          recordButton.textContent = '◼ Stop';

          const onfulfilled = (streamParam: MediaStream) => {
            stream = streamParam;
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            mediaRecorder.start();
            isRecording = true;
            mediaRecorder.ondataavailable = event => {
              audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
              audioBlob = new Blob(audioChunks, {type: 'audio/wav'});
              audioChunks = [];
              { // Download button
                downloadButton.href = URL.createObjectURL(audioBlob);
                downloadButton.download = 'recording.wav';
                downloadButton.style.display = 'block';
              }
              sendToWhisper(audioBlob).then(hideSpinner);
            };
          };

          navigator.mediaDevices.getUserMedia({audio: true})
              .then(onfulfilled);
        }

        function stopRecording() {
          mediaRecorder.stop();
          isRecording = false;
          recordButton.textContent = '⬤ Record';
          HtmlUtils.Media.releaseMicrophone(stream);
        }
        if (isRecording) {
          stopRecording();
        } else {
          startRecording();
        }
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

      // saveAPIKeyButton
      HtmlUtils.addButtonClickListener(saveAPIKeyButton, () => {
        apiKey = apiKeyInput.value;
        HtmlUtils.Cookies.set('apiKey', apiKey);
      });

      //transcribeAgainButton
      HtmlUtils.addButtonClickListener(transcribeAgainButton, () => {
        showSpinner();
        sendToWhisper(audioBlob).then(hideSpinner);
      });

      // clearButton
      HtmlUtils.addButtonClickListener(clearButton, () => {
        editorTextarea.value = '';
      });

      // saveEditorButton
      HtmlUtils.addButtonClickListener(saveEditorButton, () => {
        HtmlUtils.Cookies.set("editorText", editorTextarea.value);
      });

      // savePromptButton
      HtmlUtils.addButtonClickListener(savePromptButton, () => {
        HtmlUtils.Cookies.set("prompt", whisperPrompt.value);
      });

      // saveRulesButton
      HtmlUtils.addButtonClickListener(saveRulesButton, () => {
        HtmlUtils.Cookies.set("replaceRules", replaceRulesTextArea.value);
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

      const showSpinner = () => {
        spinner.style.display = 'block';
      };

      const hideSpinner = () => {
        spinner.style.display = 'none';
      };
    }

    const sendToWhisper = async (audioBlob: Blob) => {
      const formData = new FormData();
      formData.append('file', audioBlob);
      formData.append('model', 'whisper-1'); // Using the largest model
      formData.append('prompt', whisperPrompt.value);

      const cookie = HtmlUtils.Cookies.get("apiKey");
      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cookie}`
        },
        body: formData
      });
      const result = await response.json();


      if (result?.text || result?.text === '') {
        HtmlUtils.TextAreas.insertTextAtCursor(editorTextarea,
            HelgeUtils.replaceByRules(result.text, replaceRulesTextArea.value));
      } else {
        editorTextarea.value +=
            'You need an API key. Go to https://platform.openai.com/api-keys"> to get an API key. If you want to try it out beforehand, you can try it in the ChatGPT Android and iOS apps for free without API key.\n\n'
            + JSON.stringify(result, null, 2);
      }
      navigator.clipboard.writeText(editorTextarea.value).then();
    };


    export const loadFormData = () => {
      PageLogic.editorTextarea.value = HtmlUtils.Cookies.get("editorText");
      PageLogic.whisperPrompt.value = HtmlUtils.Cookies.get("prompt");
      PageLogic.replaceRulesTextArea.value = HtmlUtils.Cookies.get("replaceRules");
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