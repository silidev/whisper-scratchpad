/*
 * Copyright (c) 2024 by Helge Tobias Kosuch
 */

import textAreaWithId = HtmlUtils.NeverNull.textAreaWithId;
import TextAreas = HtmlUtils.TextAreas;
import blinkFast = HtmlUtils.blinkFast;
import blinkSlow = HtmlUtils.blinkSlow;
import escapeForRegExp = HelgeUtils.Strings.escapeRegExp;
import elementWithId = HtmlUtils.NeverNull.elementWithId;
import TextAreaWrapper = HtmlUtils.TextAreas.TextAreaWrapper;
import LocalStorage = HtmlUtils.BrowserStorage.LocalStorage;
import Cookies = HtmlUtils.BrowserStorage.Cookies;
import BrowserStorage = HtmlUtils.BrowserStorage;
import {redoLastEdit, undoLastEdit} from "./DontInspect.js"
import {HelgeUtils} from "./HelgeUtils.js"
import {INSERT_EDITOR_INTO_PROMPT, NEW_NOTE_DELIMITER, VERSION, WHERE_TO_INSERT_AT} from "./Config.js"
import {createCutFunction} from "./CutButton.js"
import {HtmlUtils} from "./HtmlUtils.js"

/** Inlined from HelgeUtils.Test.runTestsOnlyToday */
const RUN_TESTS = HtmlUtils.isMsWindows() && new Date().toISOString().slice(0, 10) === "2024-01-27"
if (RUN_TESTS) console.log("RUN_TESTS is true. This is only for " +
    "testing. Set it to false in production.")

HtmlUtils.ErrorHandling.ExceptionHandlers.installGlobalDefault()

namespace Misc {
  export const applyReplaceRulesToMainEditor = () => {
    const selectionStart = mainEditorTextarea.selectionStart
    const selectionEnd = mainEditorTextarea.selectionEnd

    mainEditorTextarea.value = ReplaceByRules.withUiLog(replaceRulesTextArea.value, mainEditorTextarea.value)

    mainEditorTextarea.selectionStart = selectionStart
    mainEditorTextarea.selectionEnd = selectionEnd
  }

  export const addMenuItem = HtmlUtils.Menus.WcMenu.addMenuItem("editorMenuHeading")

  export const addKeyboardShortcuts = () => {
    const cutFromMainEditor = createCutFunction(mainEditorTextarea, "{{c1::", "}}")

    document.addEventListener('keyup', (event) => {
      // console.log(event.key,event.shiftKey,event.ctrlKey,event.altKey)
      if (event.key === 'X' && event.shiftKey && event.ctrlKey) {
        // Prevent default action to avoid any browser shortcut conflicts
        event.preventDefault()
        cutFromMainEditor()
      }
    })
  }
}

const trimMainEditor = () => mainEditor.trim().append(" ")

export namespace UiFunctions {
  import buttonWithId = HtmlUtils.NeverNull.buttonWithId;

  export namespace Buttons {
    import insertTextAtCursor = HtmlUtils.TextAreas.insertTextAndPutCursorAfter;
    import textAreaWithId = HtmlUtils.NeverNull.textAreaWithId;
    import buttonWithId = HtmlUtils.NeverNull.buttonWithId;
    import inputElementWithId = HtmlUtils.NeverNull.inputElementWithId;
    import addMenuItem = Misc.addMenuItem;
    import Cookies = HtmlUtils.BrowserStorage.Cookies;
    import addKeyboardShortcuts = Misc.addKeyboardShortcuts;
    import suppressUnusedWarning = HelgeUtils.suppressUnusedWarning;

    export namespace Media {
      import buttonWithId = HtmlUtils.NeverNull.buttonWithId;
      import DelimiterSearch = HelgeUtils.Strings.DelimiterSearch;
      import applyReplaceRulesToMainEditor = Misc.applyReplaceRulesToMainEditor;
      import addMenuItem = Misc.addMenuItem;
      import suppressUnusedWarning = HelgeUtils.suppressUnusedWarning;
      let mediaRecorder: MediaRecorder
      let audioChunks: Blob[] = []
      let audioBlob: Blob
      let isRecording = false; suppressUnusedWarning(isRecording)
      let stream: MediaStream
      let sending = false

      export namespace StateIndicator {

        import buttonWithId = HtmlUtils.NeverNull.buttonWithId;
        /** Updates the recorder state display. That consists of the text
         * and color of the stop button and the pause record button. */
        export const update = () => {
          if (mediaRecorder?.state === 'recording') {
            setRecording()
          } else if (mediaRecorder?.state === 'paused') {
            setPaused()
          } else {
            setStopped()
          }
        }
        const setRecording = () => {
          setHtmlOfButtonStop('◼<br>Stop')
          setHtmlOfButtonPauseRecord(blinkFast('🔴 Recording') + '<br>|| Pause')
        }
        export const setPaused = () => {
          setHtmlOfButtonStop('◼<br>Stop')
          setHtmlOfButtonPauseRecord(blinkSlow('|| Paused') +'<br>⬤▶ Cont. Rec')
        }
        export const setStopped = () => {
          setHtmlOfButtonStop('◼<br>Stop')
          setHtmlOfButtonPauseRecord(sending
              ? blinkFast('✎ Scribing') + '<br>⬤ Record'
              : '<br>⬤ Record')
        }
        const setHtmlOfButtonStop = (html: string) => {
          buttonWithId("stopButton").innerHTML = html
        }
        const setHtmlOfButtonPauseRecord = (html: string) => {
          buttonWithId("pauseRecordButton").innerHTML = html
        }
      }

      export type WhereToPutTranscription = "appendAtEnd" | "insertAtCursor"

      const transcribeAndHandleResult = async (audioBlob: Blob,
          whereToPutTranscription: WhereToPutTranscription ) => {
        try {
          const calcMaxEditorPrompt = (textArea: HTMLTextAreaElement) => {
            const text = textArea.value
            /* maxLeftIndex.
             * Searching for the Delimiter. It is ")))---(((" at this time.
             * "max" because this might be shortened later on. */
            const maxLeftIndex = (() => {
              return WHERE_TO_INSERT_AT === "appendAtEnd"
                  ? text.length
                  : textArea.selectionStart/* Only the start is relevant
                  b/c the selection will be overwritten by the new text. */
            })()
            const indexAfterPreviousDelimiter = (() => {
              return new DelimiterSearch(NEW_NOTE_DELIMITER).leftIndex(text, maxLeftIndex)
            })()
            return text.substring(indexAfterPreviousDelimiter, maxLeftIndex)
          }
          const removeLastDot = (text: string): string => {
            if (text.endsWith('.')) {
              return text.slice(0, -1)+" "
            }
            return text
          }
          const aSpaceIfNeeded = () => {
            return mainEditorTextarea.selectionStart > 0
            && !mainEditorTextarea.value.charAt(
                mainEditorTextarea.selectionStart - 1).match(/\s/)
                ? " " : ""
          }
          const promptForWhisper = () => {
            const MAX_TOTAL_CHARS = 500; /* Taking the last 500
             CHARS is for sure less than the max 250 TOKENS whisper is
             considering. This is important because the last words of
             the last transcription should always be included to avoid
             hallucinations if it otherwise would be an incomplete
             sentence. */
            const maxCharsFromEditor = MAX_TOTAL_CHARS
                - transcriptionPromptEditor.value.length
            const maxEditorPrompt = calcMaxEditorPrompt(mainEditorTextarea)
            return transcriptionPromptEditor.value +
                (INSERT_EDITOR_INTO_PROMPT
                ? maxEditorPrompt.slice(- maxCharsFromEditor)
                : "")
          }
          const getTranscriptionText = async () => await
              HelgeUtils.Transcription.transcribe(
                  apiName, audioBlob, getApiKey() as string, promptForWhisper(),
                  getLanguageSelectedInUi())
          const removeLastDotIfNotAtEnd = (input: string): string => {
            if (mainEditorTextarea.selectionStart < mainEditorTextarea.value.length) {
              return removeLastDot(input)
            }
            return input
          }

          sending = true
          StateIndicator.update()
          const apiName = getApiSelectedInUi()
          if (!apiName) {
            insertTextAndPutCursorAfter("You must select an API below.")
            return
          }
          const transcriptionText = await getTranscriptionText()

          if (whereToPutTranscription=="insertAtCursor") {
            insertTextAndPutCursorAfter(aSpaceIfNeeded()
                + removeLastDotIfNotAtEnd(transcriptionText))
          } else {
            trimMainEditor().appendTextAndPutCursorAfter(transcriptionText)
          }
          applyReplaceRulesToMainEditor()
          trimMainEditor().focus()
          saveMainEditor()
          sending = false
          StateIndicator.update()
        } catch (error) {
          if (error instanceof HelgeUtils.Transcription.TranscriptionError) {
            Log.error(JSON.stringify(error.payload, null, 2))
          } else throw error
        }
      }

      export namespace StopCallbackCreator {
        export const createCancelingCallback = () => createInternal(true)
        export const transcribingCallback = () => createInternal(false)
        const createInternal = (cancel: boolean) => {
          return () => {
            HtmlUtils.Media.releaseMicrophone(stream)
            isRecording = false
            StateIndicator.update()
            audioBlob = new Blob(audioChunks, {type: 'audio/wav'})
            if (cancel) {
              StateIndicator.setStopped()
              return
            }
            audioChunks = []
            { // Download button
              downloadLink.href = URL.createObjectURL(audioBlob)
              downloadLink.download = 'recording.wav'
              downloadLink.style.display = 'block'
            }
            transcribeAndHandleResult(audioBlob, WHERE_TO_INSERT_AT)
                .then()
          }
        }
      }

      const getOnStreamReady = (beginPaused: boolean) => {
        return (streamParam: MediaStream) => {
          stream = streamParam
          mediaRecorder = new MediaRecorder(stream)
          audioChunks = []
          mediaRecorder.start()
          isRecording = true
          StateIndicator.update()
          mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data)
          }
          if (beginPaused) mediaRecorder.pause()
          StateIndicator.update()
        }
      }

      const startRecording = (beginPaused: boolean = false) => {
        navigator.mediaDevices.getUserMedia({audio: true}).then(getOnStreamReady(beginPaused))
      }

// ############## stopButton ##############
      const stopRecording = () => {
        mediaRecorder.onstop = StopCallbackCreator.transcribingCallback()
        mediaRecorder.stop()
      }

      const stopButton = () => {
        stopRecording()
        /** delete, previous behavior
        if (isRecording) {
          stopRecording()
        } else {
          NotVisibleAtThisTime.showSpinner()
          startRecording()
        }
        */
      }
      buttonWithId("stopButton").addEventListener('click', stopButton)

// ############## cancelRecording ##############
      export const cancelRecording = () => {
        if (!mediaRecorder) return
        mediaRecorder.onstop = StopCallbackCreator.createCancelingCallback()
        mediaRecorder.stop()
      }

// ############## stop_transcribe_startNewRecording_and_pause ##############
      const stop_transcribe_startNewRecording_and_pause = () => {
        mediaRecorder.onstop = () => {
          audioBlob = new Blob(audioChunks, {type: 'audio/wav'})
          audioChunks = []
          sending = true
          transcribeAndHandleResult(audioBlob, WHERE_TO_INSERT_AT).then()
          startRecording(true)
        }
        mediaRecorder.stop()
      }

      // ############## pauseRecordButton ##############
      const pauseRecordButton = () => {
        if (mediaRecorder?.state === 'recording') {
          mediaRecorder.pause()
          StateIndicator.update()
        } else if (mediaRecorder?.state === 'paused') {
          mediaRecorder.resume()
          StateIndicator.update()
        } else {
          startRecording()
        }
      }

      const transcribeButton = () => {
        if (mediaRecorder?.state === 'recording'
            || (mediaRecorder?.state === 'paused'
                && audioChunks.length > 0)) {
          stop_transcribe_startNewRecording_and_pause()
          return
        }
        pauseRecordButton()
      }

// ############## transcribeButton ##############
      buttonWithId("transcribeButton").addEventListener('click', transcribeButton)
      buttonWithId("pauseRecordButton").addEventListener('click', pauseRecordButton)

// ############## transcribeAgainButton ##############
      const transcribeAgainButton = () => {
        transcribeAndHandleResult(audioBlob, WHERE_TO_INSERT_AT).then()
      }
      addMenuItem("transcribeAgainButton", transcribeAgainButton)

      StateIndicator.update()
    } // End of media buttons

    export const addEventListeners = () => {

      addKeyboardShortcuts()

// ############## Toggle Log Button ##############
      addMenuItem("toggleLogButton", Log.toggleLog(textAreaWithId))

// ############## Crop Highlights Menu Item ##############
      const cropHighlights = () => {
        mainEditorTextarea.value = HelgeUtils.extractHighlights(mainEditorTextarea.value).join(' ')
        saveMainEditor()
      }
      addMenuItem("cropHighlightsMenuItem", cropHighlights)

// ############## Copy Backup to clipboard Menu Item ##############
      const copyBackupToClipboard = () => {
        navigator.clipboard.writeText(
            "## Replace Rules\n" + replaceRulesTextArea.value + "\n"
            + "## Prompt\n" + transcriptionPromptEditor.value
        ).then()
      }

      addMenuItem("copyBackupMenuItem", copyBackupToClipboard)

// ############## Focus the main editor textarea Menu Item ##############
      addMenuItem("focusMainEditorMenuItem", mainEditorTextarea.focus)

// ############## Du2Ich Menu Item ##############
      const du2ichMenuItem = () => {
        navigator.clipboard.writeText(mainEditorTextarea.value).then(() => {
          mainEditorTextarea.value = HelgeUtils.Misc.du2ich(
              mainEditorTextarea.value, ReplaceByRules.onlyWholeWordsPreserveCaseWithUiLog)
          saveMainEditor()
        })
      }
      addMenuItem("du2ichMenuItem", du2ichMenuItem)

// ############## saveAPIKeyButton ##############
      const saveAPIKeyButton = () => {
        setApiKeyCookie(apiKeyInput.value)
        apiKeyInput.value = ''
      };
      HtmlUtils.addClickListener(("saveAPIKeyButton"), () => {
        saveAPIKeyButton()
      })

      const replaceButton = () => {
        Misc.applyReplaceRulesToMainEditor()
        mainEditorTextarea.focus()
        // window.scrollBy(0,-100000)
      }

// replaceButtons
      HtmlUtils.addClickListener(("replaceButton1"), () => {
        replaceButton()
      })
      HtmlUtils.addClickListener(("replaceButton2"), () => {
        replaceButton()
      })

// ############## backslashButton ##############
      HtmlUtils.addClickListener(("backslashButton"), () => {
        insertTextAtCursor(replaceRulesTextArea,"\\b")
      })

// ############## Undo #############
      const addUndoClickListener = (undoButtonId: string, textArea: HTMLTextAreaElement) => {
        HtmlUtils.addClickListener((undoButtonId), () => {
          textArea.focus()
          undoLastEdit()
        })
      }
      addUndoClickListener("ctrlZButtonOfReplaceRules", replaceRulesTextArea)
      addUndoClickListener("ctrlZButtonOfPrompt", transcriptionPromptEditor)

      HtmlUtils.addClickListener("redoButton", redoLastEdit)
      HtmlUtils.addClickListener("addReplaceRuleButton", addReplaceRule)
      HtmlUtils.addClickListener("addWordReplaceRuleButton", addWordReplaceRule)
      HtmlUtils.addClickListener("insertNewNoteDelimiterButton", () => {
        appendToMainEditor('\n' + NEW_NOTE_DELIMITER)
      })

// cancelRecording
      addMenuItem("cancelRecording", Buttons.Media.cancelRecording)

// cutAllButton
      {
        HtmlUtils.addClickListener(("cutAllButton"), () => {
          navigator.clipboard.writeText(mainEditorTextarea.value).then(() => {
            mainEditorTextarea.value = ''
            saveMainEditor()
          })
        })
      }

// aboutButton
      HtmlUtils.addClickListener(("pasteButton"), () => {
        navigator.clipboard.readText().then(text => {
          insertTextAndPutCursorAfter(text)
        })
      })

// cutButton
      buttonWithId("cutButton").addEventListener('click',
          createCutFunction(mainEditorTextarea))
// cutAnkiButton
      buttonWithId("cutAnkiButton").addEventListener('click',
          createCutFunction(mainEditorTextarea, "{{c1::", "}}"))



// copyButtons
      /** Adds an event listener to a button that copies the text of an input element to the clipboard. */
      const addEventListenerForCopyButton = (buttonId: string, inputElementId: string) => {
        buttonWithId(buttonId).addEventListener('click', () => {
          navigator.clipboard.writeText(inputElementWithId(inputElementId).value).then(() => {
            buttonWithId(buttonId).innerHTML = '⎘<br>Copied!'
            setTimeout(() => {
              buttonWithId(buttonId).innerHTML = '⎘<br>Copy'
            }, 500)
          })
        })
      }

      // copyButtons
      addEventListenerForCopyButton("copyReplaceRulesButton", "replaceRulesTextArea")
      addEventListenerForCopyButton("copyPromptButton", "transcriptionPromptEditor")

      buttonWithId("saveAPIKeyButton").addEventListener('click', function () {
        inputElementWithId('apiKeyInputField').value = ''; // Clear the input field
      })

      apiSelector.addEventListener('change', () => {
        Cookies.set('apiSelector', apiSelector.value)
      })

      languageSelector.addEventListener('change', () => {
        Cookies.set('languageSelector', languageSelector.value)
      })
    }

    const insertTextIntoMainEditor = (insertedString: string) => {
      TextAreas.insertTextAndPutCursorAfter(mainEditorTextarea, insertedString)
      saveMainEditor()
    }
    suppressUnusedWarning(insertTextIntoMainEditor)

    const appendToMainEditor = (insertedString: string) => {
      TextAreas.appendTextAndPutCursorAfter(mainEditorTextarea, insertedString)
      saveMainEditor()
      TextAreas.scrollToEnd(mainEditorTextarea);
    }

    // addReplaceRuleButton
    const addReplaceRule = (requireWordBoundaryAtStart = false) => {
      const inputStr = TextAreas.selectedText(mainEditorTextarea)
      /* The following builds a rule like this:
       * "REGEX"gm->"REPLACEMENT" */
      const quote = `"`;
      const maybeWordBoundary = requireWordBoundaryAtStart ? "\\b" : "";
      const regEx = escapeForRegExp(inputStr);
      const optionsAndArrow = 'gm->';
      /** This is the part before the text selection in the UI */
      const ruleStrPart1 =
            quote
          + maybeWordBoundary
          + regEx
          + quote
          + optionsAndArrow
          + quote;
      const ruleStrPart2 = inputStr + quote;
      const ruleString = ruleStrPart1 + ruleStrPart2
      const lengthBefore = replaceRulesTextArea.value.length
      const APPEND = true
      if (APPEND) {
        const ruleBeforeSelection = "\n" + ruleStrPart1;
        TextAreas.appendTextAndPutCursorAfter(replaceRulesTextArea,
            ruleBeforeSelection + ruleStrPart2)
        const SELECT_REPLACEMENT = true;
        if (SELECT_REPLACEMENT) {
          replaceRulesTextArea.selectionStart = lengthBefore + ruleBeforeSelection.length
          replaceRulesTextArea.selectionEnd = replaceRulesTextArea.value.length - 1;
        } else { // delete this if branch later
          replaceRulesTextArea.selectionStart = lengthBefore
          replaceRulesTextArea.selectionEnd = replaceRulesTextArea.value.length
        }
        TextAreas.scrollToEnd(replaceRulesTextArea)
      } else {
        TextAreas.insertTextAndPutCursorAfter(replaceRulesTextArea, ruleString+"\n")
        replaceRulesTextArea.selectionStart = 0
        replaceRulesTextArea.selectionEnd = ruleString.length
      }
      replaceRulesTextArea.focus();
      saveReplaceRules()
    }
    export const addWordReplaceRule = () => addReplaceRule(true)
  } // End of Buttons namespace

  const replaceRulesTest = () => {
    // noinspection SpellCheckingInspection
    const magicText = (numberToMakeItUnique: number) => {
      return `Das hier ist ein ziemlich langer ganz normaler Text, an dem die Rules nichts verändern sollten! Dadurch fail'en auch Rules. und das ist auch gut so.`
          + numberToMakeItUnique
    }

    const createTestRule = (numberToMakeItUnique: number) => `\n\n"${escapeForRegExp(magicText(numberToMakeItUnique))}"gm->""\n\n`
    const testRules =
        createTestRule(1)
        + replaceRulesTextArea.value
        + createTestRule(2)
    const replaceResult = ReplaceByRules.withUiLog(testRules, magicText(1) + magicText(2))
    buttonWithId("testFailIndicatorOfReplaceRules").style.display =
        replaceResult===''
            ? "none" : "block"
  }

  export const replaceRulesTextAreaOnInput = () => replaceRulesTest
}


const downloadLink = document.getElementById('downloadLink') as HTMLAnchorElement
const apiSelector = document.getElementById('apiSelector') as HTMLSelectElement
const languageSelector = document.getElementById('languageSelector') as HTMLSelectElement

const apiKeyInput = document.getElementById('apiKeyInputField') as HTMLTextAreaElement
const mainEditorTextarea = document.getElementById('mainEditorTextarea') as HTMLTextAreaElement
const mainEditor = new TextAreaWrapper(mainEditorTextarea)
const transcriptionPromptEditor = document.getElementById('transcriptionPromptEditor') as HTMLTextAreaElement
const replaceRulesTextArea = document.getElementById('replaceRulesTextArea') as HTMLTextAreaElement

export const saveMainEditor = () => {
  LocalStorage.set("editorText", textAreaWithId("mainEditorTextarea").value);
  Cookies.set("editorText", ""); // This used to be stored in a cookie.
  // Delete old cookie
}

const saveReplaceRules = () => {
  LocalStorage.set("replaceRules",
      textAreaWithId("replaceRulesTextArea").value)
  Cookies.set("replaceRules", ""); // This used to be stored in a cookie.
  // Delete old cookie
}

textAreaWithId('replaceRulesTextArea').addEventListener('input', UiFunctions
    .replaceRulesTextAreaOnInput)

{ // Autosaves
  const handleAutoSaveError = (msg: string) => {
    Log.error(msg)
  }
  TextAreas.setAutoSave('replaceRules', 'replaceRulesTextArea', handleAutoSaveError, BrowserStorage.LocalStorage)
  TextAreas.setAutoSave('editorText', 'mainEditorTextarea', handleAutoSaveError, BrowserStorage.LocalStorage)
  TextAreas.setAutoSave('prompt', 'transcriptionPromptEditor', handleAutoSaveError, BrowserStorage.LocalStorage)
}

const insertTextAndPutCursorAfter = (text: string) => {
  TextAreas.insertTextAndPutCursorAfter(mainEditorTextarea, text)
}

const getApiSelectedInUi = () => (apiSelector.value as HelgeUtils.Transcription.ApiName)
const getLanguageSelectedInUi = () => (languageSelector.value)

namespace Log {
  import inputElementWithId = HtmlUtils.NeverNull.inputElementWithId;
  const MAX_LOG_LEN = 1000

  // noinspection JSUnusedGlobalSymbols
  export const turnOnLogging = () => {
    inputElementWithId("logReplaceRulesCheckbox").checked = true
  }

  function logEvenIfNotEnabled(message: string) {
    const logTextArea = textAreaWithId("logTextArea")
    const oldLog = logTextArea.value
    logTextArea.value = (oldLog + "\n" + message).slice(-MAX_LOG_LEN).trim()
    TextAreas.scrollToEnd(logTextArea)
  }

  export const writeIfLoggingEnabled = (message: string) => {
    if (!inputElementWithId("logReplaceRulesCheckbox").checked) return
    logEvenIfNotEnabled(message)
  }

  export const error = (message: string) => {
    logEvenIfNotEnabled(message)
    showLog()
  }

  /** This only shows the log. It does NOT turn logging on! */
  export const showLog = () => {
    textAreaWithId("logTextArea").style.display = "block"
  }

  export const toggleLog = (textAreaWithId: (id: string) => HTMLTextAreaElement) => () => {

    const log = textAreaWithId("logTextArea")
    if (log.style.display === "none") {
      log.style.display = "block"
      inputElementWithId("logReplaceRulesCheckbox").checked = true
    } else {
      log.style.display = "none"
      inputElementWithId("logReplaceRulesCheckbox").checked = false
    }
  }

}

namespace ReplaceByRules {
  // Overload signatures
  import inputElementWithId = HtmlUtils.NeverNull.inputElementWithId;

  export function withUiLog(rules: string, subject: string): string
  export function withUiLog(rules: string, subject: string, wholeWords: boolean): string
  export function withUiLog(rules: string, subject: string, wholeWords: boolean,
                            preserveCase: boolean): string

  export function withUiLog(rules: string, subject: string, wholeWords = false, preserveCase = false): string {
    const logFlag = inputElementWithId("logReplaceRulesCheckbox").checked
    const retVal = HelgeUtils.ReplaceByRules.replaceByRules(subject, rules, wholeWords, logFlag, preserveCase)
    Log.writeIfLoggingEnabled(retVal.log)
    return retVal.resultingText
  }

  // noinspection JSUnusedGlobalSymbols
  export function onlyWholeWordsWithUiLog(rules: string, subject: string) {
    return withUiLog(rules, subject, true)
  }
  export function onlyWholeWordsPreserveCaseWithUiLog(rules: string, subject: string) {
    return withUiLog(rules, subject, true, true)
  }
}


const getApiKey = () => Cookies.get(apiSelector.value + 'ApiKey')

const setApiKeyCookie = (apiKey: string) => {
  Cookies.set(apiSelector.value + 'ApiKey', apiKey)
}

export const loadFormData = () => {
  const getLocalStorageOrCookie = (key: string) => {
    return LocalStorage.get(key) ?? Cookies.get(key)
  }

  mainEditorTextarea.value = getLocalStorageOrCookie("editorText")??""
  transcriptionPromptEditor.value = getLocalStorageOrCookie("prompt")??""
  replaceRulesTextArea.value = getLocalStorageOrCookie("replaceRules")
      ??`""->""\n` // Default replace rule

  apiSelector.value = Cookies.get("apiSelector")??'OpenAI'
  languageSelector.value = Cookies.get("languageSelector")??''
}

export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope)
        }, err => {
          console.log('ServiceWorker registration failed: ', err)
        })
  }
}

const runTests = () => {
  if (!RUN_TESTS) return
  HelgeUtils.runTests()
}

const init = () => {
  runTests()
  UiFunctions.Buttons.addEventListeners()
  registerServiceWorker()
  loadFormData()
  elementWithId("versionSpan").innerHTML = VERSION
  mainEditor.setCursorAtEnd().focus()
}

init()

