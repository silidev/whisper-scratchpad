import {HtmlUtils} from "./HtmlUtils.js";
import {HelgeUtils} from "./HelgeUtils.js";
import elementWithId = HtmlUtils.elementWithId;
import TextAreas = HtmlUtils.TextAreas;
import buttonWithId = HtmlUtils.buttonWithId;
import Cookies = HtmlUtils.Cookies;
import Audio = HelgeUtils.Audio;

// ############## Config ##############
const APPEND_EDITOR_TO_PROMPT = true;

// ############## AfterInit ##############
namespace AfterInit {

  import inputElementWithId = HtmlUtils.inputElementWithId;
  const downloadLink = document.getElementById('downloadLink') as HTMLAnchorElement;
  const spinner1 = document.getElementById('spinner1') as HTMLElement;
  const apiSelector = document.getElementById('apiSelector') as HTMLSelectElement;

  const apiKeyInput = document.getElementById('apiKeyInputField') as HTMLTextAreaElement;
  const editorTextarea = document.getElementById('editorTextarea') as HTMLTextAreaElement;
  const transcriptionPrompt = document.getElementById('transcriptionPrompt') as HTMLTextAreaElement;
  const replaceRulesTextArea = document.getElementById('replaceRulesTextArea') as HTMLTextAreaElement;

  const saveEditor = () => Cookies.set("editorText", HtmlUtils.textAreaWithId("editorTextarea").value);

  TextAreas.setAutoSave('replaceRules', 'replaceRulesTextArea');
  TextAreas.setAutoSave('editorText', 'editorTextarea');
  TextAreas.setAutoSave('prompt', 'transcriptionPrompt');

  const insertAtCursor = (text: string) => {
    TextAreas.insertTextAtCursor(editorTextarea, text);
  };

  function getApiSelectedInUi() {
    return apiSelector.value as HelgeUtils.Audio.ApiName;
  }

// ############## addButtonEventListeners ##############
  export const addButtonEventListeners = () => {
    {// Media buttons

      let mediaRecorder: MediaRecorder;
      let audioChunks = [];
      let audioBlob: Blob;
      let isRecording = false;
      let stream: MediaStream;
      let sending = false;

      const updateStateIndicator = () => {
        const setRecordingIndicator = () => {
          const message = sending ? '🔴Sending': '🔴Stop';
          elementWithId("recordButton").innerHTML = `<span class="blinking">${message}</span>`;
          buttonWithId("pauseButton").textContent = '‖ Pause';
        };
        const setPausedIndicator = () => {
          elementWithId("recordButton").
              innerHTML = '‖ Paused';
          buttonWithId("pauseButton").textContent = '⬤ Record';
        };
        const setStoppedIndicator = () => {
          elementWithId("recordButton").innerHTML = sending ? '◼ Sending': '◼ Stopped';
          buttonWithId("pauseButton").textContent = '⬤ Record';
        };

        if (mediaRecorder?.state === 'recording') {
          setRecordingIndicator();
        } else if (mediaRecorder?.state === 'paused') {
          setPausedIndicator();
        } else {
          setStoppedIndicator();
        }
      }

      const transcribeAndHandleResultAsync = async (audioBlob: Blob) => {
        sending = true;
        updateStateIndicator();
        const apiName = getApiSelectedInUi();
        if (!apiName) {
          insertAtCursor("You must select an API below.");
          return;
        }
        const promptForWhisper = () => transcriptionPrompt.value + APPEND_EDITOR_TO_PROMPT ? editorTextarea.value : "";
        const result =  async () => await Audio.transcribe(apiName, audioBlob, getApiKey(), promptForWhisper());
        const replacedOutput = HelgeUtils.replaceByRules(await result(), replaceRulesTextArea.value);
        if (editorTextarea.value.length > 0)
          insertAtCursor(" ");
        insertAtCursor(replacedOutput);
        navigator.clipboard.writeText(editorTextarea.value).then();
        sending = false;
        updateStateIndicator();
      };

      const stopCallback = () => {
        audioBlob = new Blob(audioChunks, {type: 'audio/wav'});
        audioChunks = [];
        { // Download button
          downloadLink.href = URL.createObjectURL(audioBlob);
          downloadLink.download = 'recording.wav';
          downloadLink.style.display = 'block';
        }
        transcribeAndHandleResultAsync(audioBlob).then(hideSpinner);
      };

      const onStreamReady = (streamParam: MediaStream) => {
        stream = streamParam;
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        mediaRecorder.start();
        isRecording = true;
        updateStateIndicator();
        mediaRecorder.ondataavailable = event => {
          audioChunks.push(event.data);
        };
      };

      const startRecording = () => {
        navigator.mediaDevices.getUserMedia({audio: true}).then(onStreamReady);
      };

      const stopRecording = () => {
        mediaRecorder.onstop = stopCallback;
        mediaRecorder.stop();
        updateStateIndicator();
        isRecording = false;
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

      // ############## sendButton ##############
      buttonWithId("sendButton").addEventListener('click', () => {
        if (mediaRecorder?.state === 'recording') {
          mediaRecorder.onstop = () => {
            audioBlob = new Blob(audioChunks, {type: 'audio/wav'});
            audioChunks = [];
            transcribeAndHandleResultAsync(audioBlob).then(hideSpinner);
            startRecording();
          };
          mediaRecorder.stop();
        } else {
          buttonWithId("recordButton").click();
        }
      });

      // ############## pauseButton ##############
      buttonWithId("pauseButton").addEventListener('click', () => {
        if (mediaRecorder?.state === 'recording') {
          mediaRecorder.pause();
          updateStateIndicator();
        } else if (mediaRecorder?.state === 'paused') {
          mediaRecorder.resume();
          updateStateIndicator();
        } else {
          buttonWithId("recordButton").click();
        }
      });

      // ############## transcribeAgainButton ##############
      HtmlUtils.addButtonClickListener(buttonWithId("transcribeAgainButton"), () => {
        showSpinner();
        transcribeAndHandleResultAsync(audioBlob).then(hideSpinner);
      });

      updateStateIndicator();
    } // End of media buttons

    // ############## Crop Highlights Button ##############
    HtmlUtils.addButtonClickListener(buttonWithId("cropHighlightsButton"), () => {
      editorTextarea.value = HelgeUtils.extractHighlights(editorTextarea.value).join(' ');
      saveEditor();
    });

    // ############## saveAPIKeyButton ##############
    HtmlUtils.addButtonClickListener(buttonWithId("saveAPIKeyButton"), () => {
      setApiKeyCookie(apiKeyInput.value);
      apiKeyInput.value = '';
    });

    // clearButton
    HtmlUtils.addButtonClickListener(buttonWithId("clearButton"), () => {
      editorTextarea.value = '';
      saveEditor();
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

    function addUndoButtonEventListener(undoButtonId: string, textArea: HTMLTextAreaElement) {
      HtmlUtils.addButtonClickListener(buttonWithId(undoButtonId), () => {
        textArea.focus();
        document.execCommand('undo'); // Yes, deprecated, but works. I will replace it when it fails. Docs: https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand
      });
    }

    // undoButtonOfEditor
    addUndoButtonEventListener("undoButtonOfEditor", editorTextarea);
    addUndoButtonEventListener("undoButtonOfReplaceRules", replaceRulesTextArea);
    addUndoButtonEventListener("undoButtonOfPrompt", transcriptionPrompt);

    // addReplaceRuleButton
    HtmlUtils.addButtonClickListener(buttonWithId("addReplaceRuleButton"), () => {
      // add TextArea.selectedText() to the start of the replaceRulesTextArea
      TextAreas.setCursor(replaceRulesTextArea, 0);
      const selectedText = TextAreas.selectedText(editorTextarea);
      TextAreas.insertTextAtCursor(replaceRulesTextArea, `"${selectedText}"->""\n`);
      TextAreas.setCursor(replaceRulesTextArea, 5 + selectedText.length);
      replaceRulesTextArea.focus();
    });

    // aboutButton
    HtmlUtils.addButtonClickListener(buttonWithId("abortButton"), () => {
      window.location.reload();
    });

    // copyButton
    /** Adds an event listener to a button that copies the text of an input element to the clipboard. */
    function addEventListenerForCopyButton(buttonId: string, inputElementId: string) {
      buttonWithId(buttonId).addEventListener('click', () => {
        navigator.clipboard.writeText(inputElementWithId(inputElementId).value).then(() => {
          buttonWithId(buttonId).textContent = '⎘ Copied!';
          setTimeout(() => {
            buttonWithId(buttonId).textContent = '⎘ Copy';
          }, 2000);
        });
      });
    }

    // copyButtons
    addEventListenerForCopyButton("copyButton", "editorTextarea");
    addEventListenerForCopyButton("copyReplaceRulesButton", "replaceRulesTextArea");
    addEventListenerForCopyButton("copyPromptButton", "transcriptionPrompt");

    buttonWithId("saveAPIKeyButton").addEventListener('click', function () {
      inputElementWithId('apiKey').value = ''; // Clear the input field
    });

    apiSelector.addEventListener('change', () => {
      Cookies.set('apiSelector', apiSelector.value);
    });

    const showSpinner = () => {
      // probably not needed anymore, delete later
      // spinner1.style.display = 'block';
    };

    // probably not needed anymore, delete later
    const hideSpinner = () => {
      spinner1.style.display = 'none';
    };
  }

  const getApiKey = () => Cookies.get(apiSelector.value + 'ApiKey');

  const setApiKeyCookie = (apiKey: string) => {
    Cookies.set(apiSelector.value + 'ApiKey', apiKey);
  };

  export const loadFormData = () => {
    editorTextarea.value = Cookies.get("editorText");
    transcriptionPrompt.value = Cookies.get("prompt");
    replaceRulesTextArea.value = Cookies.get("replaceRules");
    apiSelector.value = Cookies.get("apiSelector")??'OpenAI';
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
