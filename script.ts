import {HtmlUtils} from "./HtmlUtils.js";
import {HelgeUtils} from "./HelgeUtils.js";

const Audio = HelgeUtils.Audio;

namespace AfterInit {

  import elementWithId = HtmlUtils.elementWithId;
  const Cookies = HtmlUtils.Cookies;

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
  const replaceAgainButton = document.getElementById('replaceAgainButton') as HTMLButtonElement;

  const recordSpinner = document.getElementById('recordSpinner') as HTMLElement;
  const apiSelector = document.getElementById('apiSelector') as HTMLSelectElement;

  const apiKeyInput = document.getElementById('apiKeyInputField') as HTMLTextAreaElement;
  const editorTextarea = document.getElementById('editorTextarea') as HTMLTextAreaElement;
  const transcriptionPrompt = document.getElementById('transcriptionPrompt') as HTMLTextAreaElement;
  const replaceRulesTextArea = document.getElementById('replaceRulesTextArea') as HTMLTextAreaElement;

  // ############## addButtonEventListeners ##############
  export const addButtonEventListeners = () => {
    { // Media buttons
      let mediaRecorder: MediaRecorder;
      let audioChunks = [];
      let audioBlob: Blob;
      let isRecording = false;
      let stream: MediaStream;

      const mediaRecorderStoppedCallback = () => {
        audioBlob = new Blob(audioChunks, {type: 'audio/wav'});
        audioChunks = [];
        { // Download button
          downloadButton.href = URL.createObjectURL(audioBlob);
          downloadButton.download = 'recording.wav';
          downloadButton.style.display = 'block';
        }
        transcribeAndHandleResult(audioBlob).then(hideSpinner);
      };

      const onStreamReady = (streamParam: MediaStream) => {
        stream = streamParam;
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        mediaRecorder.start();
        isRecording = true;
        setRecordingIndicator();
        mediaRecorder.ondataavailable = event => {
          audioChunks.push(event.data);
        };
      };

      function setRecordingIndicator() {
        elementWithId("recordingIndicator").innerHTML = '🔴Recording';

        recordButton.textContent = '◼ Stop';
        recordButton.style.backgroundColor = 'red';

        pauseButton.textContent = '‖ Pause';
        pauseButton.style.backgroundColor = 'red';
      }

      function setPausedIndicator() {
        elementWithId("recordingIndicator").innerHTML = '‖ Paused';

        recordButton.textContent = '⬤ Record';
        recordButton.style.backgroundColor = 'black';

        pauseButton.style.backgroundColor = 'black';
        pauseButton.textContent = '‖ Resume';
      }

      const startRecording = () => {
        showSpinner();
        navigator.mediaDevices.getUserMedia({audio: true}).then(onStreamReady);
      };

      const stopRecording = () => {
        mediaRecorder.onstop = mediaRecorderStoppedCallback;
        mediaRecorder.stop();
        setPausedIndicator();
        isRecording = false;
        recordButton.textContent = '⬤ Record';
        HtmlUtils.Media.releaseMicrophone(stream);
      };

      recordButton.addEventListener('click', () => {
        if (isRecording) {
          stopRecording();
        } else {
          startRecording();
        }
      });

      pauseButton.addEventListener('click', () => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.pause();
          setPausedIndicator();
        } else if (mediaRecorder.state === 'paused') {
          mediaRecorder.resume();
          setRecordingIndicator();
        }
      });

      //transcribeAgainButton
      HtmlUtils.addButtonClickListener(transcribeAgainButton, () => {
        showSpinner();
        transcribeAndHandleResult(audioBlob).then(hideSpinner);
      });
    }

    // saveAPIKeyButton
    HtmlUtils.addButtonClickListener(saveAPIKeyButton, () => {
      setApiKeyCookie(apiKeyInput.value);
      apiKeyInput.value = '';
    });

    // clearButton
    HtmlUtils.addButtonClickListener(clearButton, () => {
      editorTextarea.value = '';
    });

    // replaceAgainButton
    HtmlUtils.addButtonClickListener(replaceAgainButton, () => {
      editorTextarea.value = HelgeUtils.replaceByRules(editorTextarea.value, replaceRulesTextArea.value);
    });

    // saveEditorButton
    HtmlUtils.addButtonClickListener(saveEditorButton, () => {
      Cookies.set("editorText", editorTextarea.value);
    });

    // savePromptButton
    HtmlUtils.addButtonClickListener(savePromptButton, () => {
      Cookies.set("prompt", transcriptionPrompt.value);
    });

    // saveRulesButton
    HtmlUtils.addButtonClickListener(saveRulesButton, () => {
      Cookies.set("replaceRules", replaceRulesTextArea.value);
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

    apiSelector.addEventListener('change', () => {
      Cookies.set('apiSelector', apiSelector.value);
    });

    const showSpinner = () => {
      recordSpinner.style.display = 'block';
    };

    const hideSpinner = () => {
      recordSpinner.style.display = 'none';
    };
  }

  function getApiKey() {
    return Cookies.get(apiSelector.value + 'ApiKey');
  }

  function setApiKeyCookie(apiKey: string) {
    Cookies.set(apiSelector.value + 'ApiKey', apiKey);
  }

  const transcribeAndHandleResult = async (audioBlob: Blob) => {
    const api = apiSelector.value as HelgeUtils.Audio.Api;
    const result = await Audio.transcribe(api,audioBlob, getApiKey(), transcriptionPrompt.value);
    const replacedOutput = HelgeUtils.replaceByRules(result, replaceRulesTextArea.value);
    HtmlUtils.TextAreas.insertTextAtCursor(editorTextarea, replacedOutput);
    navigator.clipboard.writeText(editorTextarea.value).then();
  };

  export const loadFormData = () => {
    editorTextarea.value = Cookies.get("editorText");
    transcriptionPrompt.value = Cookies.get("prompt");
    replaceRulesTextArea.value = Cookies.get("replaceRules");
    apiSelector.value = Cookies.get("apiSelector");
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
  AfterInit.addButtonEventListeners();
  AfterInit.registerServiceWorker();
  AfterInit.loadFormData();
}

init();
