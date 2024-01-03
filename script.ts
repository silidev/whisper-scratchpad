import {HtmlUtils} from "./HtmlUtils.js";
import {HelgeUtils} from "./HelgeUtils.js";
import elementWithId = HtmlUtils.elementWithId;
import TextAreas = HtmlUtils.TextAreas;

const Audio = HelgeUtils.Audio;

namespace AfterInit {

  import buttonWithId = HtmlUtils.buttonWithId;
  const Cookies = HtmlUtils.Cookies;
  const downloadLink = document.getElementById('downloadLink') as HTMLAnchorElement;
  const recordSpinner = document.getElementById('recordSpinner') as HTMLElement;
  const apiSelector = document.getElementById('apiSelector') as HTMLSelectElement;

  const apiKeyInput = document.getElementById('apiKeyInputField') as HTMLTextAreaElement;
  const editorTextarea = document.getElementById('editorTextarea') as HTMLTextAreaElement;
  const transcriptionPrompt = document.getElementById('transcriptionPrompt') as HTMLTextAreaElement;
  const replaceRulesTextArea = document.getElementById('replaceRulesTextArea') as HTMLTextAreaElement;

  TextAreas.setAutoSave('replaceRulesTextArea', 'replaceRules');
  TextAreas.setAutoSave('editorTextarea', 'editorText');
  TextAreas.setAutoSave('transcriptionPrompt', 'prompt');

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
          downloadLink.href = URL.createObjectURL(audioBlob);
          downloadLink.download = 'recording.wav';
          downloadLink.style.display = 'block';
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

      const setRecordingIndicator = () => {
        elementWithId("recordingIndicator").innerHTML = '<span class="blinking">🔴Recording</span>';

        buttonWithId("recordButton").textContent = '◼ Stop';
        buttonWithId("recordButton").style.backgroundColor = 'red';

        buttonWithId("pauseButton").style.backgroundColor = 'red';
      };

      const setPausedIndicator = () => {
        elementWithId("recordingIndicator").innerHTML = '‖ Paused';

        buttonWithId("recordButton").textContent = '⬤ Record';
        buttonWithId("recordButton").style.backgroundColor = 'black';

        buttonWithId("pauseButton").style.backgroundColor = 'black';
      };

      const startRecording = () => {
        navigator.mediaDevices.getUserMedia({audio: true}).then(onStreamReady);
      };

      const stopRecording = () => {
        mediaRecorder.onstop = mediaRecorderStoppedCallback;
        mediaRecorder.stop();
        setPausedIndicator();
        isRecording = false;
        buttonWithId("recordButton").textContent = '⬤ Record';
        HtmlUtils.Media.releaseMicrophone(stream);
      };

      // ############## recordButton ##############
      buttonWithId("recordButton").addEventListener('click', () => {
        if (isRecording) {
          stopRecording();
        } else {
          showSpinner();
          startRecording();
        }
      });

      // ############## interimTranscribeButton ##############
      buttonWithId("interimTranscribeButton").addEventListener('click', () => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.onstop = () => {
            audioBlob = new Blob(audioChunks, {type: 'audio/wav'});
            audioChunks = [];
            transcribeAndHandleResult(audioBlob).then(hideSpinner);
            startRecording();
          };
          mediaRecorder.stop();
        } else {
          buttonWithId("recordButton").click();
        }
      });

      buttonWithId("pauseButton").addEventListener('click', () => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.pause();
          setPausedIndicator();
        } else if (mediaRecorder.state === 'paused') {
          mediaRecorder.resume();
          setRecordingIndicator();
        }
      });

      //transcribeAgainButton
      HtmlUtils.addButtonClickListener(buttonWithId("transcribeAgainButton"), () => {
        showSpinner();
        transcribeAndHandleResult(audioBlob).then(hideSpinner);
      });
    }

    // saveAPIKeyButton
    HtmlUtils.addButtonClickListener(buttonWithId("saveAPIKeyButton"), () => {
      setApiKeyCookie(apiKeyInput.value);
      apiKeyInput.value = '';
    });

    // clearButton
    HtmlUtils.addButtonClickListener(buttonWithId("clearButton"), () => {
      editorTextarea.value = '';
    });

    // replaceAgainButton
    HtmlUtils.addButtonClickListener(buttonWithId("replaceAgainButton"), () => {
      editorTextarea.value = HelgeUtils.replaceByRules(editorTextarea.value, replaceRulesTextArea.value);
    });

    // saveEditorButton
    HtmlUtils.addButtonClickListener(buttonWithId("saveEditorButton"), () => {
      Cookies.set("editorText", editorTextarea.value);
    });

    // savePromptButton
    HtmlUtils.addButtonClickListener(buttonWithId("savePromptButton"), () => {
      Cookies.set("prompt", transcriptionPrompt.value);
    });

    // saveRulesButton
    HtmlUtils.addButtonClickListener(buttonWithId("saveRulesButton"), () => {
      Cookies.set("replaceRules", replaceRulesTextArea.value);
    });

    // copyButton
    buttonWithId("copyButton").addEventListener('click', () => {
      navigator.clipboard.writeText(editorTextarea.value).then(() => {
        buttonWithId("copyButton").textContent = '⎘ Copied!';
        setTimeout(() => {
          buttonWithId("copyButton").textContent = '⎘ Copy';
        }, 2000);
      });
    });

    buttonWithId("saveAPIKeyButton").addEventListener('click', function () {
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

  const getApiKey = () => Cookies.get(apiSelector.value + 'ApiKey');

  const setApiKeyCookie = (apiKey: string) => {
    Cookies.set(apiSelector.value + 'ApiKey', apiKey);
  };

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
