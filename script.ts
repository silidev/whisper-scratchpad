import {sendCtrlZ} from "./DontInspect.js";
import {HtmlUtils} from "./HtmlUtils.js";
import {HelgeUtils} from "./HelgeUtils.js";

import TextAreas = HtmlUtils.TextAreas;
import buttonWithId = HtmlUtils.buttonWithId;
import blinkFast = HtmlUtils.blinkFast;
import blinkSlow = HtmlUtils.blinkSlow;
import inputElementWithId = HtmlUtils.inputElementWithId;
import escapeRegExp = HelgeUtils.Strings.escapeRegExp;
import elementWithId = HtmlUtils.elementWithId;

// ############## Config ##############
const INSERT_EDITOR_INTO_PROMPT = true;
const VERSION = "Florida";

namespace Pures {
  // noinspection SpellCheckingInspection
  export const du2ich = (input: string) => {
/**
 * Only WHOLE words are replaced.
 */
const rules1 = `
"Du"->"Ich"
"du"->"ich"
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
"machst"->"mache"
"Machst"->"Mache"
"liest"->"lese"
"Liest"->"Lese"
"willst"->"will"
"Willst"->"Will"
`;
/**
 * Here also partial words are replaced.*/
// const rules2 = `
// "\\berst\\b"->"x(ersxt)x"
// :: Bug: The following does not work for all occurrences: //TODOh
// "st\\b"->""
// `;
// noinspection SpellCheckingInspection
    /**
 * Here also partial words are replaced.*/
// const rules3 = `
// "\\bx\\(ersxt\\)x\\b"->"erst"
// `;
const applyRules1 = (input: string) => ReplaceByRules.onlyWholeWordsWithUiLog(rules1, input);
// const applyRules2 = (input: string) => ReplaceByRules.withUiLog(rules2, input);
// const applyRules3 = (input: string) => ReplaceByRules.withUiLog(rules3, input);
return (
// applyRules3
(
// applyRules2
(
applyRules1(input))));
} //end of namespace du2ich

} //end of namespace Pures

namespace Functions {
  export const applyReplaceRulesToMainEditor = () => {
    const selectionStart = mainEditorTextarea.selectionStart;
    const selectionEnd = mainEditorTextarea.selectionEnd;

    mainEditorTextarea.value = ReplaceByRules.withUiLog(replaceRulesTextArea.value, mainEditorTextarea.value);

    mainEditorTextarea.selectionStart = selectionStart;
    mainEditorTextarea.selectionEnd = selectionEnd;
  };
}

namespace UiFunctions {
  // noinspection SpellCheckingInspection
  export namespace Buttons {
    import textAreaWithId = HtmlUtils.textAreaWithId;
    import insertTextAtCursor = HtmlUtils.TextAreas.insertTextAtCursor;
    import copyToClipboard = HtmlUtils.copyToClipboard;
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
            setRecording();
          } else if (mediaRecorder?.state === 'paused') {
            setPaused();
          } else {
            setStopped();
          }
        }
        const setRecording = () => {
          setHtmlOfButtonStop('◼<br>Stop');
          setHtmlOfButtonPauseRecord(blinkFast('🔴 Recording') + '<br>|| Pause');
        };
        export const setPaused = () => {
          setHtmlOfButtonStop('◼<br>Stop');
          setHtmlOfButtonPauseRecord(blinkSlow('|| Paused') +'<br>⬤▶ Cont. Rec');
        };
        const setStopped = () => {
          setHtmlOfButtonStop('◼<br>Stop');
          setHtmlOfButtonPauseRecord(sending
              ? blinkFast('✎ Scribing') + '<br>⬤ Record'
              : '<br>⬤ Record');
        };
        const setHtmlOfButtonStop = (html: string) => {
          buttonWithId("stopButton").innerHTML = html;
        };
        const setHtmlOfButtonPauseRecord = (html: string) => {
          buttonWithId("pauseRecordButton").innerHTML = html;
        };

      }
      /**
       * @param audioBlob
       * @param insertAtCursorFlag
       * - If true, the transcription is inserted at the cursor position
       * in the main editor, but often it is inserted at the beginning of the text instead.
       * - If false, it will be appended.
       */

      const transcribeAndHandleResult = async (audioBlob: Blob, insertAtCursorFlag: boolean ) => {
        sending = true;
        StateIndicator.update();
        const apiName = getApiSelectedInUi();
        if (!apiName) {
          insertAtCursor("You must select an API below.");
          return;
        }
        const promptForWhisper = () => transcriptionPromptEditor.value
        + INSERT_EDITOR_INTO_PROMPT ? mainEditorTextarea.value.substring(0
            , mainEditorTextarea.selectionStart /*The start is relevant b/c the selection will be overwritten by the
                                            new text. */
        ).slice(-(
            750 /* Taking the last 750 CHARS is for sure less than the max 250 TOKENS whisper is considering. This is
          important because the last words of the last transcription should always be included to avoid hallucinations
          if it otherwise would be an incomplete sentence. */
            - transcriptionPromptEditor.value.length)) : "";
        const removeLastDot = (text: string): string => {
          if (text.endsWith('.')) {
            return text.slice(0, -1)+" ";
          }
          return text;
        };

        function aSpaceIfNeeded() {
          return mainEditorTextarea.selectionStart > 0
              && !mainEditorTextarea.value.charAt(mainEditorTextarea.selectionStart - 1).match(/\s/)
              ? " " : "";
        }

        try {
          const removeLastDotIfNotAtEnd = (input: string): string => {
            if (mainEditorTextarea.selectionStart < mainEditorTextarea.value.length) {
              return removeLastDot(input);
            }
            return input;
          }
          const transcriptionText = await HelgeUtils.Transcription.transcribe(
              apiName, audioBlob, getApiKey(), promptForWhisper());
          if (insertAtCursorFlag)
            insertAtCursor(aSpaceIfNeeded() + removeLastDotIfNotAtEnd(transcriptionText));
          else
            TextAreas.appendText(mainEditorTextarea, transcriptionText);
          Functions.applyReplaceRulesToMainEditor();
          saveEditor();
          navigator.clipboard.writeText(mainEditorTextarea.value).then();
        } catch (error) {
          if (error instanceof HelgeUtils.Transcription.TranscriptionError) {
            Log.write(JSON.stringify(error.payload, null, 2));
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
        HtmlUtils.Media.releaseMicrophone(stream);
        isRecording = false;
        StateIndicator.update();
        audioBlob = new Blob(audioChunks, {type: 'audio/wav'});
        audioChunks = [];
        { // Download button
          downloadLink.href = URL.createObjectURL(audioBlob);
          downloadLink.download = 'recording.wav';
          downloadLink.style.display = 'block';
        }
        transcribeAndHandleResult(audioBlob, true).then(NotVisibleAtThisTime.hideSpinner);
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
          StateIndicator.update();
        };
      }

      const startRecording = (beginPaused: boolean = false) => {
        navigator.mediaDevices.getUserMedia({audio: true}).then(getOnStreamReady(beginPaused));
      };

      const stopRecording = () => {
        mediaRecorder.onstop = stopCallback;
        mediaRecorder.stop();
      };

      // ############## stopButton ##############
      const stopButton = () => {
        if (isRecording) {
          stopRecording();
        } else {
          NotVisibleAtThisTime.showSpinner();
          startRecording();
        }
      }
      buttonWithId("stopButton").addEventListener('click', stopButton);

      const stop_transcribe_startNewRecording_and_pause = () => {
        mediaRecorder.onstop = () => {
          audioBlob = new Blob(audioChunks, {type: 'audio/wav'});
          audioChunks = [];
          sending = true;
          transcribeAndHandleResult(audioBlob, false).then(NotVisibleAtThisTime.hideSpinner);
          startRecording(true);
        };
        mediaRecorder.stop();
      };

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

      const transcribeButton = () => {
        if (mediaRecorder?.state === 'recording'
            || (mediaRecorder?.state === 'paused'
                && audioChunks.length > 0)) {
          stop_transcribe_startNewRecording_and_pause();
          return;
        }
        pauseRecordButton();
      }

// ############## transcribeButton ##############
      buttonWithId("transcribeButton").addEventListener('click', transcribeButton);
      buttonWithId("pauseRecordButton").addEventListener('click', pauseRecordButton);

// ############## transcribeAgainButton ##############
      const transcribeAgainButton = () => {
        UiFunctions.closeEditorMenu();
        NotVisibleAtThisTime.showSpinner();
        transcribeAndHandleResult(audioBlob, true).then(NotVisibleAtThisTime.hideSpinner);
      };
      HtmlUtils.addClickListener(buttonWithId("transcribeAgainButton"), transcribeAgainButton);

      StateIndicator.update();
    } // End of media buttons

    export const addButtonEventListeners = () => {

// ############## Toggle Log Button ##############
      Log.addToggleLogButtonClickListener(textAreaWithId);

// ############## Crop Highlights Menu Item ##############
      const cropHighlights = () => {
        mainEditorTextarea.value = HelgeUtils.extractHighlights(mainEditorTextarea.value).join(' ');
        saveEditor();
      };
      HtmlUtils.addClickListener(buttonWithId("cropHighlightsMenuItem"), () => {
        cropHighlights();
        UiFunctions.closeEditorMenu();
      });

// ############## Copy Backup to clipboard Menu Item ##############
      const copyBackupToClipboard = () => {
        navigator.clipboard.writeText(
            "## Replace Rules\n" + replaceRulesTextArea.value + "\n"
            + "## Prompt\n" + transcriptionPromptEditor.value
        ).then();
      };
      HtmlUtils.addClickListener(buttonWithId("copyBackupMenuItem"), () => { //TODOhStu: If I enjoy it, I could make a method "addMenuItem".
        copyBackupToClipboard();
        UiFunctions.closeEditorMenu();
      });

// ############## Focus the main editor textarea Menu Item ##############
      HtmlUtils.addClickListener(inputElementWithId("focusMainEditorMenuItem"), () => {
        UiFunctions.closeEditorMenu();
        mainEditorTextarea.focus();
      });

// ############## Du2Ich Menu Item ##############
      const du2ichMenuItem = () => {
        UiFunctions.closeEditorMenu();
        copyToClipboard(mainEditorTextarea.value).then(() => {
          mainEditorTextarea.value = Pures.du2ich(mainEditorTextarea.value);
          saveEditor();
        });
      };
      HtmlUtils.addClickListener(inputElementWithId("du2ichMenuItem"), () => {
        du2ichMenuItem();
      });

// ############## saveAPIKeyButton ##############
      function saveAPIKeyButton() {
        setApiKeyCookie(apiKeyInput.value);
        apiKeyInput.value = '';
      }
      HtmlUtils.addClickListener(buttonWithId("saveAPIKeyButton"), () => {
        saveAPIKeyButton();
      });

      function clearButton() {
        mainEditorTextarea.value = '';
        saveEditor();
      }

// clearButton
      HtmlUtils.addClickListener(buttonWithId("clearButton"), () => {
        clearButton();
      });

      const replaceAgainButton = () => {
        Functions.applyReplaceRulesToMainEditor();
        mainEditorTextarea.focus();
        // window.scrollBy(0,-100000);
      };

// replaceAgainButton
      HtmlUtils.addClickListener(buttonWithId("replaceAgainButton"), () => {
        replaceAgainButton();
      });

// ############## backslashButton ##############
      HtmlUtils.addClickListener(buttonWithId("backslashButton"), () => {
        insertTextAtCursor(replaceRulesTextArea,"\\");
      });

// ############## ctrlZButtons ##############
      const addCtrlZButtonEventListener = (ctrlZButtonId: string, textArea: HTMLTextAreaElement) => {
        HtmlUtils.addClickListener(buttonWithId(ctrlZButtonId), () => {
          textArea.focus();
          sendCtrlZ();
        });
      };

      addCtrlZButtonEventListener("ctrlZButtonOfReplaceRules", replaceRulesTextArea);
      addCtrlZButtonEventListener("ctrlZButtonOfPrompt", transcriptionPromptEditor);

      HtmlUtils.addClickListener(buttonWithId("addReplaceRuleButton"), addReplaceRule);

      function cancelButton() {
        saveEditor()
        window.location.reload();
      }

// aboutButton
      HtmlUtils.addClickListener(buttonWithId("cancelButton"), () => {
        cancelButton();
      });

// aboutButton
      HtmlUtils.addClickListener(buttonWithId("pasteButton"), () => {
        navigator.clipboard.readText().then(text => {
          insertAtCursor(text);
        });
      });

// cutButton
      /** Adds an event listener to a button that copies the text of an input element to the clipboard. */
      const addEventListenerForCutButton = (buttonId: string, inputElementId: string) => {
        buttonWithId(buttonId).addEventListener('click', () => {
          copyToClipboard(inputElementWithId(inputElementId).value).then(() => {
            buttonWithId(buttonId).innerHTML = '✂<br>Done';
            setTimeout(() => {
              buttonWithId(buttonId).innerHTML = '✂<br>Cut';
            }, 2000);
            mainEditorTextarea.value = '';
            saveEditor();
            mainEditorTextarea.focus();
          });
        });
      };
      addEventListenerForCutButton("cutButton", "mainEditorTextarea");

// copyButtons
      /** Adds an event listener to a button that copies the text of an input element to the clipboard. */
      const addEventListenerForCopyButton = (buttonId: string, inputElementId: string) => {
        buttonWithId(buttonId).addEventListener('click', () => {
          navigator.clipboard.writeText(inputElementWithId(inputElementId).value).then(() => {
            buttonWithId(buttonId).innerHTML = '⎘<br>Copied!';
            setTimeout(() => {
              buttonWithId(buttonId).innerHTML = '⎘<br>Copy';
            }, 2000);
          });
        });
      };

      // copyButtons
      addEventListenerForCopyButton("copyReplaceRulesButton", "replaceRulesTextArea");
      addEventListenerForCopyButton("copyPromptButton", "transcriptionPromptEditor");

      buttonWithId("saveAPIKeyButton").addEventListener('click', function () {
        inputElementWithId('apiKey').value = ''; // Clear the input field
      });

      apiSelector.addEventListener('change', () => {
        HtmlUtils.Cookies.set('apiSelector', apiSelector.value);
      });
    }
    // addReplaceRuleButton
    export const addReplaceRule = () => {
      // add TextArea.selectedText() to the start of the replaceRulesTextArea
      TextAreas.setCursor(replaceRulesTextArea, 0);
      const selectedText = TextAreas.selectedText(mainEditorTextarea);
      const insertedString = `"\\b${escapeRegExp(selectedText)}\\b"gm->"${selectedText}"\n`;
      TextAreas.insertTextAtCursor(replaceRulesTextArea, insertedString);
      replaceRulesTextArea.selectionStart = 0;
      replaceRulesTextArea.selectionEnd = insertedString.length; // was, delete on day: setCursor(12 + selectedText.length);
      // replaceRulesTextArea.focus(); // Taken out b/c this jumps way too much down on mobile.
    };
  }


  import elementWithId = HtmlUtils.elementWithId;

  export const closeEditorMenu = () => {
    elementWithId("editorMenuHeading").dispatchEvent(new CustomEvent('rootMenuClose'));
  };

  const replaceRulesTest = () => {
    // noinspection SpellCheckingInspection
    const magicText = (numberToMakeItUnique: number) => {
      return `Das hier ist ein ziemlich langer ganz normaler Text, an dem die Rules nichts verändern sollten! Dadurch fail'en auch Rules. und das ist auch gut so.`
          + numberToMakeItUnique;
    }

    const createTestRule = (numberToMakeItUnique: number) => `\n\n"${escapeRegExp(magicText(numberToMakeItUnique))}"gm->""\n\n`;
    const testRules =
        createTestRule(1)
        + replaceRulesTextArea.value
        + createTestRule(2);
    const replaceResult = ReplaceByRules.withUiLog(testRules, magicText(1) + magicText(2));
    buttonWithId("testFailIndicatorOfReplaceRules").style.display =
        replaceResult===''
            ? "none" : "block";
  };

  export const replaceRulesTextAreaOnInput = () => replaceRulesTest;
}


const downloadLink = document.getElementById('downloadLink') as HTMLAnchorElement;
const spinner1 = document.getElementById('spinner1') as HTMLElement;
const apiSelector = document.getElementById('apiSelector') as HTMLSelectElement;

const apiKeyInput = document.getElementById('apiKeyInputField') as HTMLTextAreaElement;
const mainEditorTextarea = document.getElementById('mainEditorTextarea') as HTMLTextAreaElement;
const transcriptionPromptEditor = document.getElementById('transcriptionPromptEditor') as HTMLTextAreaElement;
const replaceRulesTextArea = document.getElementById('replaceRulesTextArea') as HTMLTextAreaElement;

const saveEditor = () => HtmlUtils.Cookies.set("editorText", HtmlUtils.textAreaWithId("mainEditorTextarea").value);

TextAreas.setAutoSave('replaceRules', 'replaceRulesTextArea');
HtmlUtils.textAreaWithId('replaceRulesTextArea').addEventListener('input', UiFunctions.replaceRulesTextAreaOnInput);
TextAreas.setAutoSave('editorText', 'mainEditorTextarea');
TextAreas.setAutoSave('prompt', 'transcriptionPromptEditor');

const insertAtCursor = (text: string) => {
  TextAreas.insertTextAtCursor(mainEditorTextarea, text);
};

const getApiSelectedInUi = () => (apiSelector.value as HelgeUtils.Transcription.ApiName);

namespace NotVisibleAtThisTime {
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

  export const write = (message: string) => {
    if (!inputElementWithId("logReplaceRulesCheckbox").checked) return;
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
    HtmlUtils.addClickListener(buttonWithId("toggleLogButton"), () => {
      UiFunctions.closeEditorMenu();
      const log = textAreaWithId("logTextArea");
      if (log.style.display === "none") {
        log.style.display = "block";
        inputElementWithId("logReplaceRulesCheckbox").checked = true;
      } else {
        log.style.display = "none";
        inputElementWithId("logReplaceRulesCheckbox").checked = false;
      }
    });
  };
}

namespace ReplaceByRules {
  // Overload signatures
  export function withUiLog(rules: string, subject: string): string;
  export function withUiLog(rules: string, subject: string, wholeWords: boolean): string;

  export function withUiLog(rules: string, subject: string, wholeWords: boolean = false): string {
    const logFlag = inputElementWithId("logReplaceRulesCheckbox").checked;
    const retVal = HelgeUtils.ReplaceByRules.replaceByRules(subject, rules, wholeWords, logFlag);
    Log.write(retVal.log);
    return retVal.resultingText;
  }

  export function onlyWholeWordsWithUiLog(rules: string, subject: string) {
    return withUiLog(rules, subject, true);
  }
}


const getApiKey = () => HtmlUtils.Cookies.get(apiSelector.value + 'ApiKey');

const setApiKeyCookie = (apiKey: string) => {
  HtmlUtils.Cookies.set(apiSelector.value + 'ApiKey', apiKey);
};

export const loadFormData = () => {
  const Cookies = HtmlUtils.Cookies;
  mainEditorTextarea.value = Cookies.get("editorText");
  transcriptionPromptEditor.value = Cookies.get("prompt");
  replaceRulesTextArea.value = Cookies.get("replaceRules")??`""->""\n`;
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
  UiFunctions.Buttons.addButtonEventListeners();
  registerServiceWorker();
  loadFormData();
  elementWithId("versionSpan").innerHTML = VERSION;
}

init();
