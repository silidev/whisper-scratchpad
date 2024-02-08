/*
 * Copyright (c) 2024 by Helge Tobias Kosuch
 */

// noinspection JSUnusedGlobalSymbols

import textAreaWithId = HtmlUtils.NeverNull.textAreaWithId;
import TextAreas = HtmlUtils.TextAreas;
import blinkFast = HtmlUtils.blinkFast;
import blinkSlow = HtmlUtils.blinkSlow;
import escapeRegExp = HelgeUtils.Strings.escapeRegExp;
import elementWithId = HtmlUtils.NeverNull.elementWithId;
import TextAreaWrapper = HtmlUtils.TextAreas.TextAreaWrapper;
import {sendCtrlZ} from "./DontInspect.js";
import {HtmlUtils} from "./HtmlUtils.js";
import {HelgeUtils} from "./HelgeUtils.js";
import {INSERT_EDITOR_INTO_PROMPT, NEW_NOTE_DELIMITER, VERSION, WHERE_TO_INSERT_AT} from "./config.js";
import {createCutButtonClickListener} from "./CutButton.js";

/** Inlined from HelgeUtils.Test.runTestsOnlyToday */
const RUN_TESTS = HtmlUtils.isMsWindows() && new Date().toISOString().slice(0, 10) === "2024-01-27";
if (RUN_TESTS) console.log("RUN_TESTS is true. This is only for " +
    "testing. Set it to false in production.");

namespace Functions {
  export const applyReplaceRulesToMainEditor = () => {
    const selectionStart = mainEditorTextarea.selectionStart;
    const selectionEnd = mainEditorTextarea.selectionEnd;

    mainEditorTextarea.value = ReplaceByRules.withUiLog(replaceRulesTextArea.value, mainEditorTextarea.value);

    mainEditorTextarea.selectionStart = selectionStart;
    mainEditorTextarea.selectionEnd = selectionEnd;
  };
}

const trimMainEditor = () => mainEditor.trim().append(" ");

export namespace UiFunctions {
  // noinspection SpellCheckingInspection
  import elementWithId = HtmlUtils.NeverNull.elementWithId;
  import buttonWithId = HtmlUtils.NeverNull.buttonWithId;
  export namespace Buttons {
    import insertTextAtCursor = HtmlUtils.TextAreas.insertTextAndPutCursorAfter;
    import copyToClipboard = HtmlUtils.copyToClipboard;
    import textAreaWithId = HtmlUtils.NeverNull.textAreaWithId;
    import buttonWithId = HtmlUtils.NeverNull.buttonWithId;
    import inputElementWithId = HtmlUtils.NeverNull.inputElementWithId;

    export namespace Media {
      import buttonWithId = HtmlUtils.NeverNull.buttonWithId;
      import DelimiterSearch = HelgeUtils.Strings.DelimiterSearch;
      import applyReplaceRulesToMainEditor = Functions.applyReplaceRulesToMainEditor;
      let mediaRecorder: MediaRecorder;
      let audioChunks: Blob[] = [];
      let audioBlob: Blob;
      let isRecording = false;
      let stream: MediaStream;
      let sending = false;

      export namespace StateIndicator {

        import buttonWithId = HtmlUtils.NeverNull.buttonWithId;
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
        };
        const setRecording = () => {
          setHtmlOfButtonStop('◼<br>Stop');
          setHtmlOfButtonPauseRecord(blinkFast('🔴 Recording') + '<br>|| Pause');
        };
        export const setPaused = () => {
          setHtmlOfButtonStop('◼<br>Stop');
          setHtmlOfButtonPauseRecord(blinkSlow('|| Paused') +'<br>⬤▶ Cont. Rec');
        };
        export const setStopped = () => {
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

      export type WhereToPutTranscription = "appendAtEnd" | "insertAtCursor";

      const transcribeAndHandleResult = async (audioBlob: Blob,
          whereToPutTranscription: WhereToPutTranscription ) => {
        try {
          const calcMaxEditorPrompt = (textArea: HTMLTextAreaElement) => {
            const text = textArea.value;
            /* maxLeftIndex.
             * Searching for the Delimiter. It is ")))---(((" at this time.
             * "max" because this might be shortened later on. */
            const maxLeftIndex = (() => {
              return WHERE_TO_INSERT_AT === "appendAtEnd"
                  ? text.length
                  : textArea.selectionStart/* Only the start is relevant
                  b/c the selection will be overwritten by the new text. */
            })();
            const indexAfterPreviousDelimiter = (() => {
              return new DelimiterSearch(NEW_NOTE_DELIMITER).leftIndex(text, maxLeftIndex);
            })();
            return text.substring(indexAfterPreviousDelimiter, maxLeftIndex);
          };

          const removeLastDot = (text: string): string => {
            if (text.endsWith('.')) {
              return text.slice(0, -1)+" ";
            }
            return text;
          };
          const aSpaceIfNeeded = () => {
            return mainEditorTextarea.selectionStart > 0
            && !mainEditorTextarea.value.charAt(
                mainEditorTextarea.selectionStart - 1).match(/\s/)
                ? " " : "";
          };
          const promptForWhisper = () => {
            const MAX_TOTAL_CHARS = 500; /* Taking the last 500
             CHARS is for sure less than the max 250 TOKENS whisper is
             considering. This is important because the last words of
             the last transcription should always be included to avoid
             hallucinations if it otherwise would be an incomplete
             sentence. */
            const maxCharsFromEditor = MAX_TOTAL_CHARS
                - transcriptionPromptEditor.value.length;
            const maxEditorPrompt = calcMaxEditorPrompt(mainEditorTextarea);
            return transcriptionPromptEditor.value +
                (INSERT_EDITOR_INTO_PROMPT
                ? maxEditorPrompt.slice(- maxCharsFromEditor)
                : "");
          };

          const getTranscriptionText = async () => await HelgeUtils.Transcription.transcribe(
              apiName, audioBlob, getApiKey() as string, promptForWhisper());
          const removeLastDotIfNotAtEnd = (input: string): string => {
            if (mainEditorTextarea.selectionStart < mainEditorTextarea.value.length) {
              return removeLastDot(input);
            }
            return input;
          };

          sending = true;
          StateIndicator.update();
          const apiName = getApiSelectedInUi();
          if (!apiName) {
            insertTextAndPutCursorAfter("You must select an API below.");
            return;
          }
          const transcriptionText = await getTranscriptionText();

          if (whereToPutTranscription=="insertAtCursor") {
            insertTextAndPutCursorAfter(aSpaceIfNeeded()
                + removeLastDotIfNotAtEnd(transcriptionText));
          } else {
            trimMainEditor().appendTextAndPutCursorAfter(transcriptionText);
          }
          applyReplaceRulesToMainEditor();
          trimMainEditor().focus();
          saveEditor();
          navigator.clipboard.writeText(mainEditorTextarea.value).then();
          sending = false;
          StateIndicator.update();
        } catch (error) {
          if (error instanceof HelgeUtils.Transcription.TranscriptionError) {
            Log.error(JSON.stringify(error.payload, null, 2));
          } else throw error;
        }
      };

      export namespace StopCallbackCreator {
        export const createCancelingCallback = () => createInternal(true);
        export const transcribingCallback = () => createInternal(false);
        const createInternal = (cancel: boolean) => {
          return () => {
            HtmlUtils.Media.releaseMicrophone(stream);
            isRecording = false;
            StateIndicator.update();
            audioBlob = new Blob(audioChunks, {type: 'audio/wav'});
            if (cancel) {
              StateIndicator.setStopped();
              return;
            }
            audioChunks = [];
            { // Download button
              downloadLink.href = URL.createObjectURL(audioBlob);
              downloadLink.download = 'recording.wav';
              downloadLink.style.display = 'block';
            }
            transcribeAndHandleResult(audioBlob, WHERE_TO_INSERT_AT)
                .then(NotVisibleAtThisTime.hideSpinner);
          };
        };
      }

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
      };

      const startRecording = (beginPaused: boolean = false) => {
        navigator.mediaDevices.getUserMedia({audio: true}).then(getOnStreamReady(beginPaused));
      };

// ############## stopButton ##############
      const stopRecording = () => {
        mediaRecorder.onstop = StopCallbackCreator.transcribingCallback();
        mediaRecorder.stop();
      };

      const stopButton = () => {
        stopRecording();
        /** delete, previous behavior
        if (isRecording) {
          stopRecording();
        } else {
          NotVisibleAtThisTime.showSpinner();
          startRecording();
        }
        */
      };
      buttonWithId("stopButton").addEventListener('click', stopButton);

// ############## cancelRecording ##############
      export const cancelRecording = () => {
        mediaRecorder.onstop = StopCallbackCreator.createCancelingCallback();
        mediaRecorder.stop();
      };

// ############## stop_transcribe_startNewRecording_and_pause ##############
      const stop_transcribe_startNewRecording_and_pause = () => {
        mediaRecorder.onstop = () => {
          audioBlob = new Blob(audioChunks, {type: 'audio/wav'});
          audioChunks = [];
          sending = true;
          transcribeAndHandleResult(audioBlob, WHERE_TO_INSERT_AT).then(NotVisibleAtThisTime.hideSpinner);
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
      };

      const transcribeButton = () => {
        if (mediaRecorder?.state === 'recording'
            || (mediaRecorder?.state === 'paused'
                && audioChunks.length > 0)) {
          stop_transcribe_startNewRecording_and_pause();
          return;
        }
        pauseRecordButton();
      };

// ############## transcribeButton ##############
      buttonWithId("transcribeButton").addEventListener('click', transcribeButton);
      buttonWithId("pauseRecordButton").addEventListener('click', pauseRecordButton);

// ############## transcribeAgainButton ##############
      const transcribeAgainButton = () => {
        UiFunctions.closeEditorMenu();
        NotVisibleAtThisTime.showSpinner();
        transcribeAndHandleResult(audioBlob, WHERE_TO_INSERT_AT).then(NotVisibleAtThisTime.hideSpinner);
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
          mainEditorTextarea.value = HelgeUtils.Misc.du2ich(
              mainEditorTextarea.value, ReplaceByRules.onlyWholeWordsPreserveCaseWithUiLog);
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
      HtmlUtils.addClickListener(buttonWithId("addWordReplaceRuleButton"), addWordReplaceRule);

// updateButton
      const updateButton = () => {
        saveEditor();
        window.location.reload();
      }
      
      HtmlUtils.addClickListener(buttonWithId("updateButton"), () => {
        updateButton();
      });
      
// cancelRecording
      HtmlUtils.addClickListener(buttonWithId("cancelRecording"), () => {
        Buttons.Media.cancelRecording();
      });

// cutAllButton
      {
        const cutAllButton = buttonWithId("cutAllButton");
        HtmlUtils.addClickListener(cutAllButton, () => {
          navigator.clipboard.writeText(mainEditorTextarea.value).then(() => {
            mainEditorTextarea.value = '';
            saveEditor();
          });
        });
      }

// aboutButton
      HtmlUtils.addClickListener(buttonWithId("pasteButton"), () => {
        navigator.clipboard.readText().then(text => {
          insertTextAndPutCursorAfter(text);
        });
      });

// cutButton
      buttonWithId("cutButton").addEventListener('click', createCutButtonClickListener(mainEditorTextarea));

// copyButtons
      /** Adds an event listener to a button that copies the text of an input element to the clipboard. */
      const addEventListenerForCopyButton = (buttonId: string, inputElementId: string) => {
        buttonWithId(buttonId).addEventListener('click', () => {
          navigator.clipboard.writeText(inputElementWithId(inputElementId).value).then(() => {
            buttonWithId(buttonId).innerHTML = '⎘<br>Copied!';
            setTimeout(() => {
              buttonWithId(buttonId).innerHTML = '⎘<br>Copy';
            }, 500);
          });
        });
      };

      // copyButtons
      addEventListenerForCopyButton("copyReplaceRulesButton", "replaceRulesTextArea");
      addEventListenerForCopyButton("copyPromptButton", "transcriptionPromptEditor");

      buttonWithId("saveAPIKeyButton").addEventListener('click', function () {
        inputElementWithId('apiKeyInputField').value = ''; // Clear the input field
      });

      apiSelector.addEventListener('change', () => {
        HtmlUtils.Cookies.set('apiSelector', apiSelector.value);
      });
    };


    // addReplaceRuleButton
    const addReplaceRule = (wordsOnly: boolean = false) => {
      // add TextArea.selectedText() to the start of the replaceRulesTextArea
      TextAreas.setCursor(replaceRulesTextArea, 0);
      const selectedText = TextAreas.selectedText(mainEditorTextarea);
      const maybeWordBoundary = wordsOnly ? "\\b" : "";
      const insertedString = `"${maybeWordBoundary+escapeRegExp(selectedText)
          + maybeWordBoundary}"gm->"${selectedText}"\n`;
      TextAreas.insertTextAndPutCursorAfter(replaceRulesTextArea, insertedString);
      replaceRulesTextArea.selectionStart = 0;
      replaceRulesTextArea.selectionEnd = insertedString.length; // was, delete on day: setCursor(12 + selectedText.length);
      // replaceRulesTextArea.focus(); // Taken out b/c this jumps way too much down on mobile.
      saveReplaceRules();
    };
    export const addWordReplaceRule = () => {
      addReplaceRule(true);
    };
  } // End of Buttons namespace

  export const closeEditorMenu = () => {
    elementWithId("editorMenuHeading").dispatchEvent(new CustomEvent('rootMenuClose'));
  };

  const replaceRulesTest = () => {
    // noinspection SpellCheckingInspection
    const magicText = (numberToMakeItUnique: number) => {
      return `Das hier ist ein ziemlich langer ganz normaler Text, an dem die Rules nichts verändern sollten! Dadurch fail'en auch Rules. und das ist auch gut so.`
          + numberToMakeItUnique;
    };

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
const mainEditor = new TextAreaWrapper(mainEditorTextarea);
const transcriptionPromptEditor = document.getElementById('transcriptionPromptEditor') as HTMLTextAreaElement;
const replaceRulesTextArea = document.getElementById('replaceRulesTextArea') as HTMLTextAreaElement;

export const saveEditor = () => HtmlUtils.Cookies.set("editorText", textAreaWithId("mainEditorTextarea").value);

const saveReplaceRules = () => HtmlUtils.Cookies.set("replaceRules",
    textAreaWithId("replaceRulesTextArea").value);
textAreaWithId('replaceRulesTextArea').addEventListener('input', UiFunctions.replaceRulesTextAreaOnInput);

{ // Autosaves
  const handleAutoSaveError = (msg: string) => {
    Log.error(msg);
  }
  TextAreas.setAutoSave('replaceRules', 'replaceRulesTextArea', handleAutoSaveError);
  TextAreas.setAutoSave('editorText', 'mainEditorTextarea', handleAutoSaveError);
  TextAreas.setAutoSave('prompt', 'transcriptionPromptEditor', handleAutoSaveError);
}
const insertTextAndPutCursorAfter = (text: string) => {
  TextAreas.insertTextAndPutCursorAfter(mainEditorTextarea, text);
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
  import inputElementWithId = HtmlUtils.NeverNull.inputElementWithId;
  import buttonWithId = HtmlUtils.NeverNull.buttonWithId;
  const MAX_LOG_LEN = 1000;

  export const turnOnLogging = () => {
    inputElementWithId("logReplaceRulesCheckbox").checked = true;
  }

  function logEvenIfNotEnabled(message: string) {
    const logTextArea = textAreaWithId("logTextArea");
    const oldLog = logTextArea.value;
    logTextArea.value = (oldLog + "\n" + message).slice(-MAX_LOG_LEN).trim();
    TextAreas.scrollToEnd(logTextArea);
  }

  export const writeIfLoggingEnabled = (message: string) => {
    if (!inputElementWithId("logReplaceRulesCheckbox").checked) return;
    logEvenIfNotEnabled(message);
  };

  export const error = (message: string) => {
    logEvenIfNotEnabled(message);
    showLog();
  }

  /** This only shows the log. It does NOT turn logging on! */
  export const showLog = () => {
    textAreaWithId("logTextArea").style.display = "block";
  };

  export const addToggleLogButtonClickListener =
      (textAreaWithId: (id: string) => (HTMLTextAreaElement)) => {
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
  import inputElementWithId = HtmlUtils.NeverNull.inputElementWithId;

  export function withUiLog(rules: string, subject: string): string;
  export function withUiLog(rules: string, subject: string, wholeWords: boolean): string;
  export function withUiLog(rules: string, subject: string, wholeWords: boolean, preserveCase: boolean): string;

  export function withUiLog(rules: string, subject: string, wholeWords = false, preserveCase = false): string {
    const logFlag = inputElementWithId("logReplaceRulesCheckbox").checked;
    const retVal = HelgeUtils.ReplaceByRules.replaceByRules(subject, rules, wholeWords, logFlag, preserveCase);
    Log.writeIfLoggingEnabled(retVal.log);
    return retVal.resultingText;
  }

  // noinspection JSUnusedGlobalSymbols
  export function onlyWholeWordsWithUiLog(rules: string, subject: string) {
    return withUiLog(rules, subject, true);
  }
  export function onlyWholeWordsPreserveCaseWithUiLog(rules: string, subject: string) {
    return withUiLog(rules, subject, true, true);
  }
}


const getApiKey = () => HtmlUtils.Cookies.get(apiSelector.value + 'ApiKey');

const setApiKeyCookie = (apiKey: string) => {
  HtmlUtils.Cookies.set(apiSelector.value + 'ApiKey', apiKey);
};

export const loadFormData = () => {
  const Cookies = HtmlUtils.Cookies;
  mainEditorTextarea.value = Cookies.get("editorText")??"";
  transcriptionPromptEditor.value = Cookies.get("prompt")??"";
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

const runTests = () => {
  if (!RUN_TESTS) return;
  HelgeUtils.runTests();
};

const init = () => {
  runTests();
  UiFunctions.Buttons.addButtonEventListeners();
  registerServiceWorker();
  loadFormData();
  elementWithId("versionSpan").innerHTML = VERSION;
  mainEditor.setCursorAtEnd().focus();
};

init();

