import {HtmlUtils} from "./HtmlUtils.js";
import {HelgeUtils} from "./HelgeUtils.js";

import TextAreas = HtmlUtils.TextAreas;
import buttonWithId = HtmlUtils.buttonWithId;
import blinkFast = HtmlUtils.blinkFast;
import blinkSlow = HtmlUtils.blinkSlow;
import inputElementWithId = HtmlUtils.inputElementWithId;

// ############## Config ##############
const INSERT_EDITOR_INTO_PROMPT = true;

namespace Pures {
  // noinspection SpellCheckingInspection
  export const du2ich = (input: string) => HelgeUtils.replaceByRules(HelgeUtils.replaceByRules(input
          , `
"st\\b"->""
`) as string
      , `
"Du"->"Ich"
"du""->"ich"
"dich"->"mich"
"Dich"->"Mich"
"dir"->"mir"
"Dir"->"Mir"
"dein"->"mein"
"Dein"->"Mein"
"bist"->"bin"
"hast"->"habe"
"I"->"Ist"
"i"->"ist"
`, true) as string;
}

namespace UiFunctions {
  export const replaceRulesTextAreaOnInput = () => {
    /**
     * Do correct regex escaping with the following and modify the rule accordingly:
     *`Das hier ist ein ziemlich langer ganz normaler Text, an dem die "Rules" nichts verändern sollten. Dadurch fail'en auch Rules wie zB "e"->"a" und das ist auch gut so.`
     */
    // noinspection SpellCheckingInspection
    const magicText = (numberToMakeItUnique: number) => {
      return `Das hier ist ein ziemlich langer ganz normaler Text an dem die Rules nichts verändern sollten Dadurch failen auch Rules wie zB und das ist auch gut so`
      + numberToMakeItUnique;
    }
    const createTestRule = (numberToMakeItUnique: number) => `\n\n"${magicText(numberToMakeItUnique)}"gmu->""\n\n`;
    const testRules =
        createTestRule(1)
        + replaceRulesTextArea.value
        + createTestRule(2);
    const replaceResult = HelgeUtils.replaceByRulesAsString(magicText(1)+magicText(2), testRules);
    buttonWithId("testFailIndicatorOfReplaceRules").style.display =
        replaceResult===''
            ? "none" : "block";
  };
}


const downloadLink = document.getElementById('downloadLink') as HTMLAnchorElement;
const spinner1 = document.getElementById('spinner1') as HTMLElement;
const apiSelector = document.getElementById('apiSelector') as HTMLSelectElement;

const apiKeyInput = document.getElementById('apiKeyInputField') as HTMLTextAreaElement;
const editorTextarea = document.getElementById('editorTextarea') as HTMLTextAreaElement;
const transcriptionPrompt = document.getElementById('transcriptionPrompt') as HTMLTextAreaElement;
const replaceRulesTextArea = document.getElementById('replaceRulesTextArea') as HTMLTextAreaElement;

const saveEditor = () => HtmlUtils.Cookies.set("editorText", HtmlUtils.textAreaWithId("editorTextarea").value);

TextAreas.setAutoSave('replaceRules', 'replaceRulesTextArea');
HtmlUtils.textAreaWithId('replaceRulesTextArea').addEventListener('input', UiFunctions.replaceRulesTextAreaOnInput);
TextAreas.setAutoSave('editorText', 'editorTextarea');
TextAreas.setAutoSave('prompt', 'transcriptionPrompt');

const insertAtCursor = (text: string) => {
  TextAreas.insertTextAtCursor(editorTextarea, text);
};

const getApiSelectedInUi = () => (apiSelector.value as HelgeUtils.Transcription.ApiName);

namespace NotInUse {
  export const showSpinner = () => {
    // probably not needed anymore, delete later
    // spinner1.style.display = 'block';
  };

  // probably not needed anymore, delete later
  export const hideSpinner = () => {
    spinner1.style.display = 'none';
  };
}

namespace Log {
  import textAreaWithId = HtmlUtils.textAreaWithId;
  const MAX_LOG_LEN = 1000;

  export const log = (message: string) => {
    const logTextArea = textAreaWithId("logTextArea");
    const oldLog = logTextArea.value;
    logTextArea.value = (oldLog + "\n" + message).slice(- MAX_LOG_LEN);
    logTextArea.scrollTop = logTextArea.scrollHeight;
  }

  export const showLog = () => {
    textAreaWithId("logTextArea").style.display = "block";
  }

  export const addToggleLogButtonClickListener =
      (textAreaWithId: (id: string) => (HTMLTextAreaElement | null)) => {
    HtmlUtils.addButtonClickListener(buttonWithId("toggleLogButton"), () => {
      const log = textAreaWithId("logTextArea");
      if (log.style.display === "none") {
        log.style.display = "block";
      } else {
        log.style.display = "none";
      }
    });
  };
}

const standardReplace = (subject: string) => {
  return HelgeUtils.replaceByRules(subject, replaceRulesTextArea.value,false
      ,inputElementWithId("logReplaceRulesCheckbox").checked);
};

// noinspection SpellCheckingInspection
export namespace Buttons {
  import textAreaWithId = HtmlUtils.textAreaWithId;
  export namespace Media {

    let mediaRecorder: MediaRecorder;
    let audioChunks = [];
    let audioBlob: Blob;
    let isRecording = false;
    let stream: MediaStream;
    let sending = false;

    export namespace StateIndicator {

      /** Updates the recorder state display. That consists of the text
       * and color of the stop button and the pause record button. */
      export const update = () => {
        if (mediaRecorder?.state === 'recording') {
          setRecording(sending);
        } else if (mediaRecorder?.state === 'paused') {
          setPaused(sending);
        } else {
          setStopped();
        }
      }
      const setRecording = (sendingParam: boolean) => {
        setHtmlOfButtonStop(blinkFast('🔴') + (sendingParam ? 'Sending' : '◼ Stop'));
        setHtmlOfButtonPauseRecord(blinkFast('||') + ' Pause');
      };
      export const setPaused = (sendingParam: boolean = sending) => {
        setHtmlOfButtonStop(blinkSlow('◼ ') + (sendingParam ? 'Sending' : 'Stop'));
        setHtmlOfButtonPauseRecord(blinkSlow('⬤') + ' Cont.');
      };
      const setStopped = () => {
        setHtmlOfButtonStop(sending ? blinkFast('◼') + ' Sending' : ' Stopped');
        setHtmlOfButtonPauseRecord('⬤ Record');
      };
      const setHtmlOfButtonStop = (html: string) => {
        buttonWithId("stopButton").innerHTML = html;
      };
      const setHtmlOfButtonPauseRecord = (html: string) => {
        buttonWithId("pauseRecordButton").innerHTML = html;
      };

    }

    const transcribeAndHandleResult = async (audioBlob: Blob) => {
      sending = true;
      StateIndicator.setPaused(true);
      const apiName = getApiSelectedInUi();
      if (!apiName) {
        insertAtCursor("You must select an API below.");
        return;
      }
      const promptForWhisper = () => transcriptionPrompt.value 
          + INSERT_EDITOR_INTO_PROMPT ? editorTextarea.value.substring(0
          , editorTextarea.selectionStart /*The start is relevant b/c the selection will be overwritten by the
                                            new text. */
          ).slice(-(
          750 /* Taking the last 750 chars is for sure less than the max 250 tokens whisper is considering. This is
          important because the last words of the last transcription should always be included to avoid hallucinations
          if it otherwise would be an incomplete sentence. */
          - transcriptionPrompt.value.length)) : "";
      const removeLastDot = (text: string): string => {
        if (text.endsWith('.')) {
          return text.slice(0, -1);
        }
        return text;
      };
      try {
        const result = async () => await HelgeUtils.Transcription.transcribe(
            apiName, audioBlob, getApiKey(), promptForWhisper());
        const removeLastDotIfApplicable = (input: string): string => {
          if (editorTextarea.selectionStart < editorTextarea.value.length) {
            return removeLastDot(input);
          }
          return input;
        }
        if (editorTextarea.selectionStart > 0) insertAtCursor(" ");
        insertAtCursor(removeLastDotIfApplicable(await result()));
        editorTextarea.value = standardReplace(editorTextarea.value) as string;
        saveEditor()
        navigator.clipboard.writeText(editorTextarea.value).then();
      } catch (error) {
        if (error instanceof HelgeUtils.Transcription.TranscriptionError) {
          Log.log(JSON.stringify(error.payload, null, 2));
          Log.showLog();
        } else {
          // Handle other types of errors or rethrow
          throw error;
        }
      }

      sending = false;
      StateIndicator.update();
    };

    const stopCallback = () => {
      audioBlob = new Blob(audioChunks, {type: 'audio/wav'});
      audioChunks = [];
      { // Download button
        downloadLink.href = URL.createObjectURL(audioBlob);
        downloadLink.download = 'recording.wav';
        downloadLink.style.display = 'block';
      }
      transcribeAndHandleResult(audioBlob).then(NotInUse.hideSpinner);
    };

    const getOnStreamReady = (beginPaused: boolean) => {
      return (streamParam: MediaStream) => {
        stream = streamParam;
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        mediaRecorder.start();
        isRecording = true;
        StateIndicator.update();
        mediaRecorder.ondataavailable = event => {
          audioChunks.push(event.data);
        };
        if (beginPaused) mediaRecorder.pause();
      };
    }

    const startRecording = (beginPaused: boolean = false) => {
      navigator.mediaDevices.getUserMedia({audio: true}).then(getOnStreamReady(beginPaused));
    };

    const stopRecording = () => {
      mediaRecorder.onstop = stopCallback;
      mediaRecorder.stop();
      StateIndicator.update();
      isRecording = false;
      HtmlUtils.Media.releaseMicrophone(stream);
    };

    // ############## stopButton ##############
    const stopButton = () => {
      if (isRecording) {
        stopRecording();
      } else {
        NotInUse.showSpinner();
        startRecording();
      }
    }
    buttonWithId("stopButton").addEventListener('click', stopButton);

    const sendButton = () => {
      if (mediaRecorder?.state === 'recording') {
        mediaRecorder.onstop = () => {
          audioBlob = new Blob(audioChunks, {type: 'audio/wav'});
          audioChunks = [];
          transcribeAndHandleResult(audioBlob).then(NotInUse.hideSpinner);
          startRecording(true);
        };
        mediaRecorder.stop();
      } else {
        pauseRecordButton();
      }
    }
    // ############## pauseRecordButton ##############
    const pauseRecordButton = () => {
      if (mediaRecorder?.state === 'recording') {
        mediaRecorder.pause();
        StateIndicator.update();
      } else if (mediaRecorder?.state === 'paused') {
        mediaRecorder.resume();
        StateIndicator.update();
      } else {
        buttonWithId("stopButton").click();
      }
    }

    // ############## sendButton ##############
    buttonWithId("sendButton").addEventListener('click', sendButton);

    buttonWithId("pauseRecordButton").addEventListener('click', pauseRecordButton);

    // ############## transcribeAgainButton ##############
    HtmlUtils.addButtonClickListener(buttonWithId("transcribeAgainButton"), () => {
      NotInUse.showSpinner();
      transcribeAndHandleResult(audioBlob).then(NotInUse.hideSpinner);
    });

    StateIndicator.update();
  } // End of media buttons

  export const addButtonEventListeners = () => {

    // ############## Toggle Log Button ##############
    Log.addToggleLogButtonClickListener(textAreaWithId);

    // ############## Crop Highlights Button ##############
    HtmlUtils.addButtonClickListener(buttonWithId("cropHighlightsMenuItem"), () => {
      editorTextarea.value = HelgeUtils.extractHighlights(editorTextarea.value).join(' ');
      saveEditor();
    });

    // ############## Crop Highlights Button ##############
    HtmlUtils.addButtonClickListener(buttonWithId("du2ichMenuItem"), () => {
      const value = Pures.du2ich(editorTextarea.value);
      console.log(value);
      editorTextarea.value = value;
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
      editorTextarea.value = HelgeUtils.replaceByRules(editorTextarea.value, replaceRulesTextArea.value) as string;
    });

    // saveEditorButton
    HtmlUtils.addButtonClickListener(buttonWithId("saveEditorButton"), () => {
      HtmlUtils.Cookies.set("editorText", editorTextarea.value);
    });

    // savePromptButton
    HtmlUtils.addButtonClickListener(buttonWithId("savePromptButton"), () => {
      HtmlUtils.Cookies.set("prompt", transcriptionPrompt.value);
    });

    // saveRulesButton
    HtmlUtils.addButtonClickListener(buttonWithId("saveRulesButton"), () => {
      HtmlUtils.Cookies.set("replaceRules", replaceRulesTextArea.value);
    });

    function addUndoButtonEventListener(undoButtonId: string, textArea: HTMLTextAreaElement) {
      HtmlUtils.addButtonClickListener(buttonWithId(undoButtonId), () => {
        textArea.focus();
        //@ts-ignore
        document.execCommand('undo'); // Yes, deprecated, but works. I will replace it when it fails. Docs: https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand
      });
    }

    // undoButtonOfEditor
    addUndoButtonEventListener("undoButtonOfEditor", editorTextarea);
    addUndoButtonEventListener("undoButtonOfReplaceRules", replaceRulesTextArea);
    addUndoButtonEventListener("undoButtonOfPrompt", transcriptionPrompt);

    // addReplaceRuleButton
    const addReplaceRule = () => {
      // add TextArea.selectedText() to the start of the replaceRulesTextArea
      TextAreas.setCursor(replaceRulesTextArea, 0);
      const selectedText = TextAreas.selectedText(editorTextarea);
      TextAreas.insertTextAtCursor(replaceRulesTextArea, `"\\b${selectedText}\\b"gmu->"${selectedText}"\n`);
      TextAreas.setCursor(replaceRulesTextArea, 5 + selectedText.length);
      replaceRulesTextArea.focus();
    };
    HtmlUtils.addButtonClickListener(buttonWithId("addReplaceRuleButton"), addReplaceRule);

    // aboutButton
    HtmlUtils.addButtonClickListener(buttonWithId("cancelButton"), () => {
      saveEditor()
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
      HtmlUtils.Cookies.set('apiSelector', apiSelector.value);
    });
  }
}
const getApiKey = () => HtmlUtils.Cookies.get(apiSelector.value + 'ApiKey');

const setApiKeyCookie = (apiKey: string) => {
  HtmlUtils.Cookies.set(apiSelector.value + 'ApiKey', apiKey);
};

export const loadFormData = () => {
  const Cookies = HtmlUtils.Cookies;
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

const init = () => {
  Buttons.addButtonEventListeners();
  registerServiceWorker();
  loadFormData();
}

init();
