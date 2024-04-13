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
import Cookies = HtmlUtils.BrowserStorage.Cookies;
import {ctrlYRedo, ctrlZUndo} from "./DontInspect.js"
import {HelgeUtils} from "./HelgeUtils.js"
import {
  INSERT_EDITOR_INTO_PROMPT, NEW_NOTE_DELIMITER, VERIFY_LARGE_STORAGE, VERSION, WHERE_TO_INSERT_AT, WHISPER_TEMPERATURE
} from "./Config.js"
import {createCutFunction} from "./CutButton.js"
import {HtmlUtils} from "./HtmlUtils.js"
import {CurrentNote} from "./CurrentNote.js";

//@ts-ignore
import {download, generateCsv, mkConfig} from "../node_modules/export-to-csv/output/index.js";

const LARGE_STORAGE_PROVIDER =
    VERIFY_LARGE_STORAGE
        ? HtmlUtils.BrowserStorage.LocalStorageVerified
        : HtmlUtils.BrowserStorage.LocalStorage;

export const OPEN_CLOZE_STR = "{{c1::";
export const CLOSE_CLOZE_STR = "}},,";

/** Inlined from HelgeUtils.Test.runTestsOnlyToday */
const RUN_TESTS = (() => {
  const d = new Date().toISOString().slice(0, 10);
  return HtmlUtils.isMsWindows()
      && (d === "2024-02-21" || d === "2024-02-22");
})()
if (RUN_TESTS) console.log("RUN_TESTS is true. This is only for " +
    "testing. Set it to false in production.")

HtmlUtils.ErrorHandling.ExceptionHandlers.installGlobalDefault()

export namespace mainEditor {

  export namespace Undo {
    let undoBuffer = ""

    export const undo = () => {
      const swapBuffer = mainEditorTextarea.value
      mainEditorTextarea.value = undoBuffer
      undoBuffer = swapBuffer
      mainEditor.save();
    }

    export const saveState = () => {
      undoBuffer = mainEditorTextarea.value
    };
  }

  export const appendStringAndCursor = (insertedString: string) => {
    TextAreas.appendTextAndCursor(mainEditorTextarea, insertedString)
    mainEditor.save();
    TextAreas.scrollToEnd(mainEditorTextarea);
  }

  export const appendDelimiterAndCursor = () => {
    mainEditorTextareaWrapper.trim()
/* delete later:
    const removeDate = (input: string) => {
      const pattern = / - \d\d?\.\d\d?\.\d\d\n?$/;
      return input.replace(pattern, '');
    }
    mainEditorTextarea.value = removeDate(mainEditorTextarea.value)
*/
    const dateAlreadyPresent =
        / - \d\d?\.\d\d?\.\d\d\n?$/.test(mainEditorTextarea.value)
    appendStringAndCursor(
        (dateAlreadyPresent ?
            ""
            : " - " + HelgeUtils.DatesAndTimes.Timestamps.ddmmyyPointed() +'\n'
        )
        + NEW_NOTE_DELIMITER)
    mainEditorTextarea.focus()
  };

  export const save = () => {
    try {
      LARGE_STORAGE_PROVIDER.set("editorText", textAreaWithId("mainEditorTextarea").value);
    } catch (e) {
      prompt("Error saving editor text: " + e)
    }
    // Delete old cookie
    // Cookies.set("editorText", ""); // This used to be stored in a cookie.
  };

  export const insertNote = (changedText: string) => {
    const cursorIsAtTheEndOfTheTextarea =
        mainEditorTextarea.value.length == mainEditorTextarea.selectionStart;

    if (cursorIsAtTheEndOfTheTextarea) {
      mainEditorTextareaWrapper
          .insertAndPutCursorAfter(NEW_NOTE_DELIMITER + changedText)
    } else {
      mainEditorTextareaWrapper
          .insertAndPutCursorAfter(changedText + NEW_NOTE_DELIMITER)
    }
    mainEditor.save();
  }

}

namespace Misc {

  export const replaceInCurrentNote = () => {
    mainEditor.Undo.saveState();
    const selectionStart = mainEditorTextarea.selectionStart
    // const selectionEnd = mainEditorTextarea.selectionEnd

    const currentNote = new CurrentNote(mainEditorTextarea)
    const changedText = ReplaceByRules.withUiLog(
        replaceRulesTextArea.value, currentNote.text())
    currentNote.delete()

    mainEditor.insertNote(changedText)

    mainEditorTextarea.selectionStart = selectionStart
    mainEditorTextarea.selectionEnd = selectionStart
  }

  export const addKeyboardShortcuts = () => {
    const cutFromMainEditor = createCutFunction(mainEditorTextarea, OPEN_CLOZE_STR, CLOSE_CLOZE_STR)

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

export namespace Menu {
  import WcMenu = HtmlUtils.Menus.WcMenu;

  export const wireItem = WcMenu.addItem("editorMenuHeading")
  export const close = () => WcMenu.close("editorMenuHeading")
}

const setPageBackgroundColor = (backgroundColor: string) => {
  document.body.style.backgroundColor = backgroundColor
  // set color of the margins of the page
  document.documentElement.style.backgroundColor = backgroundColor;
};

export namespace UiFunctions {
  import buttonWithId = HtmlUtils.NeverNull.buttonWithId;

  export const runTests = () => {
    Buttons.runTests()
  }

  export namespace Buttons {
    import buttonWithId = HtmlUtils.NeverNull.buttonWithId;
    import inputElementWithId = HtmlUtils.NeverNull.inputElementWithId;
    import textAreaWithId = HtmlUtils.NeverNull.textAreaWithId;
    import Cookies = HtmlUtils.BrowserStorage.Cookies;
    import addKeyboardShortcuts = Misc.addKeyboardShortcuts;
    import suppressUnusedWarning = HelgeUtils.suppressUnusedWarning;

    export const runTests = () => {
      NonWordChars.runTests()
    }

    buttonWithId('editorMenuHeading').addEventListener('click', () => {
      const menuIsHidden = elementWithId("editorMenuHeading")
          .nextElementSibling?.classList.contains('hidden')
      document.body.style.overflow = menuIsHidden ? "hidden" : "auto"
    });

    buttonWithId('toggleBottomUiButton').addEventListener('click', () => {
      elementWithId("bottomUi").classList.toggle('hidden')

      const isHidden = elementWithId("bottomUi").classList.contains('hidden')
      document.body.style.overflow = isHidden ? "hidden" : "auto"
    });

    namespace Cursor {
      // ############## findDuButton ##############
      buttonWithId('findDuButton').addEventListener('pointerdown', event => {
        event.preventDefault(); // Prevent the textarea from losing focus
        mainEditorTextareaWrapper.findAndSelect("du")
      });

      {
        const textarea = textAreaWithId('mainEditorTextarea')
        const wireCursorButton = (isLeft: boolean) => {
          buttonWithId('mainEditor'+(isLeft?"Left":"Right")+'Button')
              .addEventListener('pointerdown', (event: Event) => {
                event.preventDefault(); // Prevent the textarea from losing focus
                const noSelection = (textarea.selectionStart === textarea.selectionEnd)
                if (isLeft) {
                  textarea.selectionStart = textarea.selectionStart - 1
                  if (noSelection) textarea.selectionEnd = textarea.selectionStart
                } else {
                  textarea.selectionStart = textarea.selectionStart + 1
                  if (noSelection) textarea.selectionEnd = textarea.selectionStart
                }
              });
        }
        wireCursorButton(true);
        wireCursorButton(false);
      }
      namespace WordJumps {
        /** WConfig = word jump config */
        class WConfig {
          public constructor(
             /** word delimiter regex */
             public regex: RegExp,
             public negativeRegex: RegExp,
             public textarea: HTMLTextAreaElement) {
          }
        }

        const regex = /[" \-(),?!\n]/;
        const negativeRegex = /[^" \-(),?!\n]/;
        const mainEditorWConfig = new WConfig(regex,negativeRegex,
            textAreaWithId('mainEditorTextarea'));
        const replaceRulesWConfig = new WConfig(regex,negativeRegex,
            textAreaWithId('replaceRulesTextArea'))

        const createSelectWordLeftFunction = (wConfig: WConfig) => {
          const textarea = wConfig.textarea
          return (event: Event) => {
            event.preventDefault(); // Prevent the textarea from losing focus
            const text = textarea.value;
            const cursorPosition = textarea.selectionStart - 2;
            if (cursorPosition < 0) return;

            // Find the start of the previous word
            const prevNonDelimiter = HelgeUtils.Strings.regexLastIndexOf(text, wConfig.negativeRegex, cursorPosition);
            const prevDelimiter = HelgeUtils.Strings.regexLastIndexOf(text, wConfig.regex, prevNonDelimiter);
            let startOfPreviousWord;
            if (prevDelimiter === -1) {
              // If there is no previous space, the start of the previous word is
              // the start of the text
              startOfPreviousWord = 0;
            } else {
              // If there is a previous space, the start of the previous word is
              // the position after the space
              startOfPreviousWord = prevDelimiter + 1;
            }
            textarea.selectionStart = startOfPreviousWord;
          }
        }

        const createWordLeftFunction = (wConfig: WConfig) => {
          const textarea = wConfig.textarea
          return (event: Event) => {
            createSelectWordLeftFunction(wConfig)(event)
            textarea.selectionEnd = textarea.selectionStart;
          }
        }

        const createSelectWordRightFunction = (wConfig: WConfig) => {
          const textarea = wConfig.textarea
          return (event: Event) => {
            event.preventDefault(); // Prevent the textarea from losing focus
            const text = textarea.value;
            const cursorPosition = textarea.selectionStart + 1;
            if (cursorPosition >= text.length) return;

            // Find the end of the next word
            const a = HelgeUtils.Strings.regexIndexOf(text, wConfig.negativeRegex, cursorPosition);
            const b = HelgeUtils.Strings.regexIndexOf(text, wConfig.regex, a);
            let endOfNextWord;
            if (b === -1) {
              // If there is no next space, the end of the next word is the end
              // of the text
              endOfNextWord = text.length;
            } else {
              // If there is a next space, the end of the next word is the
              // position before the space
              endOfNextWord = b;
            }

            // Set the cursor position to the end of the next word
            textarea.selectionStart = endOfNextWord;
            // textarea.selectionEnd is NOT set on purpose here!
          }
        }

        const wireButtons = (editorIdPrefix: string, wConfig: WConfig) => {
          buttonWithId(editorIdPrefix + 'SelectWordLeftButton')
              .addEventListener('pointerdown', createSelectWordLeftFunction(wConfig));
          buttonWithId(editorIdPrefix + 'WordLeftButton')
              .addEventListener('pointerdown', createWordLeftFunction(wConfig));
          buttonWithId(editorIdPrefix + 'WordRightButton')
              .addEventListener('pointerdown', createSelectWordRightFunction(wConfig));
        }

        wireButtons("mainEditor", mainEditorWConfig);
        wireButtons("rr", replaceRulesWConfig);
      }
    }

    /** This is WIP, not working. */
    export namespace NonWordChars {

      import assert = HelgeUtils.Tests.assert;

      /** The inputStr until and including the word under the cursor

        In educational style to make it as easy as possible to understand.

        In the examples | is the cursor position. It is NOT part of the text.

        In this context a word character includes international characters.

        IF the cursor is on a non-word character: Go to the left until
        a word character is found.

        E.g. from "This is a test..|.bra." to
        "This is a test|...bra."

        Now delete the stretch of non-word characters to the right.
        For the example this yields: "This is a test|bra."

        Now uppercase the first letter of the word to the right.
        For the example this yields: "This is a test|Bra."

        Now insert a space before the word and put the cursor before the space.
        For the example this yields: "This is a test| Bra."
       */
      export const replaceWithSpace = (s: string, c: number): [string,number] => {
        // Step 1: Move cursor to the left until a word character is found
        while (c > 0 && !s[c - 1].match(/\w/)) {
          c--;
        }

        // Step 2: Delete the stretch of non-word characters to the right
        let rightPart = s.slice(c).replace(/^\W+/, '');

        // Step 3: Uppercase the first letter of the word to the right
        rightPart = rightPart.charAt(0).toUpperCase() + rightPart.slice(1);

        // Step 4: Insert a space before the word and adjust the cursor position
        const leftPart = s.slice(0, c);

        // The cursor position is simulated by returning the string with a '|' to indicate the cursor position
        return [`${leftPart} ${rightPart}` as string, leftPart.length];
      };

      // Delete:
      // export const replaceWithSpace = (s: string, c: number) =>
      // {
      //   /* IF the cursor is on a non-word character: Go to the left until
      //    a word character is found.*/
      //   while (c > 0 && !s.charAt(c-1).match(/\w/))
      //     c--
      //   return [s, c]
      // }


      export const runTests = () => {
        const equals = (a: any, b: any) => a[0]==b[0] && a[1]==b[1]

        assert(equals(replaceWithSpace("t.bra.",1),["t Bra.",1]))
        assert(equals(replaceWithSpace("t.bra.",4),["t Bra.",1]))
      }

      export const replaceWithSpaceInMainEditor = () => {
        const [newText, cursor] = replaceWithSpace(mainEditorTextarea.value,
                mainEditorTextarea.selectionStart);

        mainEditorTextarea.value = newText
        mainEditorTextarea.selectionStart = cursor
        mainEditorTextarea.selectionEnd = cursor
        mainEditor.save()
      }

      export const addButtonEventListener = () => {
        buttonWithId("removePunctuationButton").addEventListener('click', replaceWithSpaceInMainEditor)
      }
    }

    NonWordChars.addButtonEventListener()

    export namespace FixClipboard {
      import du2ich = HelgeUtils.Misc.du2ich;
      const fixClipboard = () => {
        clipboard.readText().then(text => {
          clipboard.writeText(
              du2ich(
                  ReplaceByRules.withUiLog(
                      replaceRulesTextArea.value, text))
                  .replaceAll("&#x27;","'")
          ).then().catch(Log.error)
        }).catch(Log.error)
      }

      export const addButtonEventListener = () => {
        buttonWithId("fixClipboardButton").addEventListener('click', fixClipboard)
      }
    }

    FixClipboard.addButtonEventListener()

    export namespace Media {

      import DelimiterSearch = HelgeUtils.Strings.DelimiterSearch;
      import replaceInCurrentNote = Misc.replaceInCurrentNote;
      import buttonWithId = HtmlUtils.NeverNull.buttonWithId;
      import suppressUnusedWarning = HelgeUtils.suppressUnusedWarning;
      let mediaRecorder: MediaRecorder
      let audioChunks: Blob[] = []
      let audioBlob: Blob
      let isRecording = false; suppressUnusedWarning(isRecording)
      let stream: MediaStream
      let sending = false

      export const transcribeAudioBlob = () => {
        transcribeAndHandleResult(audioBlob, WHERE_TO_INSERT_AT)
            .then().catch(Log.error)
      }

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
          setPageBackgroundColor("var(--backgroundColor)");
          buttonWithId("pauseRecordButton").style.animation = "none";
        }
        export const setPaused = () => {
          setHtmlOfButtonStop('◼<br>Stop')
          setHtmlOfButtonPauseRecord(blinkSlow('|| Paused')) // +'<br>⬤▶ Cont. Rec'
          setPageBackgroundColor("var(--pausedBackgroundColor)");
          // animation: blink 1s linear infinite;
          buttonWithId("pauseRecordButton").style.animation =
              "blink .5s linear infinite";
        }
        export const setStopped = () => {
          setHtmlOfButtonStop('◼<br>Stop')
          setHtmlOfButtonPauseRecord(sending
              ? blinkFast('✎ Scribing') + '<br>⬤ Record'
              : '<br>⬤ Record')
          setPageBackgroundColor("var(--backgroundColor)");
          buttonWithId("pauseRecordButton").style.animation = "none";
        }
        const setHtmlOfButtonStop = (html: string) => {
          buttonWithId("stopButton").innerHTML = html
          setPageBackgroundColor("var(--backgroundColor)");
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
          const finalPrompt = () => {
            if (inputElementWithId("ignorePromptCheckbox").checked) {
              Log.error("Prompt ignored.")
              return ""
            }
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
                  apiName, audioBlob, getApiKey() as string, finalPrompt(),
                  getLanguageSelectedInUi(),
                  inputElementWithId("translateCheckbox").checked)
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
            TextAreas.insertAndPutCursorAfter(mainEditorTextarea,
                "You must select an API below.")
            return
          }
          const transcriptionText = await getTranscriptionText()

          if (whereToPutTranscription=="insertAtCursor") {
            TextAreas.insertAndPutCursorAfter(mainEditorTextarea,
                aSpaceIfNeeded() + removeLastDotIfNotAtEnd(transcriptionText))
          } else {
            mainEditorTextareaWrapper.appendTextAndPutCursorAfter(transcriptionText.trim())
          }
          if (inputElementWithId("autoReplaceCheckbox").checked) {
            replaceInCurrentNote() //TODOh: Stu: TODOhStu:
            // Simplify this: Apply the rules before inserting the text into
            // the editor.
          }
          mainEditorTextareaWrapper.trim().focus()
          mainEditor.save();
        } catch (error) {
          if (error instanceof HelgeUtils.Transcription.TranscriptionError) {
            Log.error(JSON.stringify(error.payload, null, 2))
          } else throw error
        } finally {
          sending = false
          StateIndicator.update()
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
                .then().catch(Log.error)
          }
        }
      }

      const getOnStreamReady = (beginPaused: boolean) => {
        return (streamParam: MediaStream) => {
          stream = streamParam

          // const audioContext = new AudioContext({
          //   // sampleRate: 44100,
          // })

          // const source = audioContext.createMediaStreamSource(stream)

          // MediaRecorder options
          const options = {
            // mimeType: 'audio/webm; codecs=pcm',
            // audioBitsPerSecond: 32 * 44100 // 32 bits per sample * sample rate
          }

          /* https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/MediaRecorder */
          mediaRecorder = new MediaRecorder(stream, options)
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
        navigator.mediaDevices
            /* https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia */
            .getUserMedia({audio: true})
            .then(getOnStreamReady(beginPaused)).catch(Log.error)
      }

      const wireUploadButton = () => {

        const transcribeSelectedFile = () => {
          const fileInput = inputElementWithId('fileToUploadSelector')
          if (!fileInput?.files?.[0])
            return
          const file = fileInput.files[0];
          const reader = new FileReader();
          reader.onload = event => {
            if (event.target===null || event.target.result===null)
              return
            audioBlob = new Blob([event.target.result], {type: file.type});
            mainEditor.appendDelimiterAndCursor()
            /* The transcription of an uploaded file is tested and works fine.
            Sometimes the OpenAI API will yield an error saying unsupported
            file type even though the file type is listed as supported. That
            is only the API's fault, not this code's. */
            transcribeAudioBlob()
          };
          reader.readAsArrayBuffer(file);
          Menu.close()
        };

        elementWithId('fileToUploadSelector').addEventListener('change', transcribeSelectedFile)
      };

// ############## stopButton ##############
      const stopRecording = () => {
        if (!mediaRecorder) return
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
        mainEditor.Undo.undo()
        mediaRecorder.onstop = StopCallbackCreator.createCancelingCallback()
        mediaRecorder.stop()
      }

// ############## stop_transcribe_startNewRecording_and_pause ##############
      const stop_transcribe_startNewRecording_and_pause = () => {
        mediaRecorder.onstop = () => {
          audioBlob = new Blob(audioChunks, {type: 'audio/wav'})
          audioChunks = []
          sending = true
          transcribeAndHandleResult(audioBlob, WHERE_TO_INSERT_AT)
              .then().catch(Log.error)
          startRecording(true)
        }
        mediaRecorder.stop()
      }

      // ############## pauseRecordButton ##############
      const pauseRecordButton = (insertDelimiter: boolean) => {
        if (mediaRecorder?.state === 'recording') {
          mediaRecorder.pause()
          StateIndicator.update()
        } else if (mediaRecorder?.state === 'paused') {
          mediaRecorder.resume()
          StateIndicator.update()
        } else {
          if (insertDelimiter) {
            mainEditor.Undo.saveState()
            mainEditor.appendDelimiterAndCursor()
          } else {
            mainEditor.appendStringAndCursor(" ")
          }
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
        pauseRecordButton(false)
      }

// ############## transcribeButton ##############
      buttonWithId("transcribeButton").addEventListener('click', transcribeButton)
// ############## pauseRecordButtons ##############
      buttonWithId("pauseRecordButton").addEventListener('click',
          () => pauseRecordButton(true))
      buttonWithId("pauseRecordButtonWithoutDelimiter").addEventListener('click',
          () => {
            if (mediaRecorder?.state === 'recording') {
              mainEditor.Undo.undo()
            } else {
              pauseRecordButton(false)
            }
      })
// ############## transcribeAudioBlob ##############
      Menu.wireItem("transcribeAgainButton", transcribeAudioBlob)
// ############## Misc ##############
      wireUploadButton();

      StateIndicator.update()

    } // End of media buttons

    namespace clipboard {
      export const read = (f1: (text: string) => void) => {
        navigator.clipboard.readText().then(text => {
          f1(text);
        }).catch(Log.error)
      };

      export const readText = () => navigator.clipboard.readText();

      export const writeText = (text: string) => navigator.clipboard.writeText(text);
    }

    export const addEventListeners = () => {

      addKeyboardShortcuts()

      Menu.wireItem("undoActionButton", mainEditor.Undo.undo)

// ############## Toggle Log Button ##############
      Menu.wireItem("viewLogButton", Log.toggleLog(textAreaWithId))

// ############## Crop Highlights Menu Item ##############
      const cropHighlights = () => {
        mainEditor.Undo.saveState()
        mainEditorTextarea.value = HelgeUtils.extractHighlights(mainEditorTextarea.value).join(' ')
        mainEditor.save();
      }
      Menu.wireItem("cropHighlightsMenuItem", cropHighlights)

      const wireBackupMenuItems = () => {
        const backupString = () => "## Main Editor\n" + mainEditorTextarea.value + "\n" + "## Replace Rules\n" + replaceRulesTextArea.value + "\n" + "## Prompt\n" + transcriptionPromptEditor.value;

// ############## Copy Backup to clipboard Menu Item ##############
        const backupToClipboard = () => {
          clipboard.writeText(backupString()).then().catch(Log.error)
        }

        Menu.wireItem("backupToClipboard", backupToClipboard)

        const offerToDownload = (str: string, filename: string) => {
          const blob = new Blob([str], {type: 'text/plain'})
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = filename
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        };

// ############## backupDownload ##############
        const backupDownload = () => {
          offerToDownload(backupString(), "whisper-scratchpad-backup.txt");
        }

        Menu.wireItem("backupDownload", backupDownload)
      }

      wireBackupMenuItems()
// ############## Focus the main editor textarea Menu Item ##############
      Menu.wireItem("focusMainEditorMenuItem", mainEditorTextarea.focus)

// ############## du2Ich Menu Item ##############
      const du2ichMenuItem = () => {
        mainEditor.Undo.saveState();

        const currentNote = new CurrentNote(mainEditorTextarea)
        const changedText = HelgeUtils.Misc.du2ich(currentNote.text());
        currentNote.delete()

        mainEditor.insertNote(changedText)
      }
      Menu.wireItem("du2ichMenuItem", du2ichMenuItem)

// ############## saveAPIKeyButton ##############
      const saveAPIKeyButton = () => {
        setApiKeyCookie(apiKeyInput.value)
        apiKeyInput.value = ''
      };
      HtmlUtils.addClickListener(("saveAPIKeyButton"), () => {
        saveAPIKeyButton()
      })

      const replaceButton = () => {
        Misc.replaceInCurrentNote()
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
        alert("Inserting \b into replaceRulesEditor.") /* This alert is
        important because sometimes you hit this button by accident and this
        can break the replace rules! */
        TextAreas.insertAndPutCursorAfter(replaceRulesTextArea,"\\b")
      })

// ############## Undo #############
    const addUndoClickListener = (ctrlZButtonId: string, textArea: HTMLTextAreaElement) => {
      HtmlUtils.addClickListener(ctrlZButtonId, () => {
        textArea.focus()
        ctrlZUndo()
      })
    }
    addUndoClickListener("ctrlZButtonOfReplaceRules", replaceRulesTextArea)
    addUndoClickListener("ctrlZButtonOfPrompt", transcriptionPromptEditor)

    HtmlUtils.addClickListener("ctrlYButton", ctrlYRedo)
    HtmlUtils.addClickListener("addReplaceRuleButton", addReplaceRule)
    HtmlUtils.addClickListener("addWordReplaceRuleButton", addWordReplaceRule)
    HtmlUtils.addClickListener("insertNewNoteDelimiterButton1",
        mainEditor.appendDelimiterAndCursor)
    HtmlUtils.addClickListener("insertNewNoteDelimiterButton2",
        mainEditor.appendDelimiterAndCursor)

// cancelRecording
    Menu.wireItem("cancelRecording", Buttons.Media.cancelRecording)

// cutAllButton
    Menu.wireItem(("cutAllButton"), () =>
        clipboard.writeText(mainEditorTextarea.value).then(
          () => {
            mainEditorTextarea.value = ''
            mainEditor.save();
          }).catch(Log.error)
        )

// aboutButton
      HtmlUtils.addClickListener(("pasteButton"), () => {
        mainEditor.appendDelimiterAndCursor()

        clipboard.read((text: string) => {
          TextAreas.insertAndPutCursorAfter(mainEditorTextarea, text)
        });
      })

// cutNoteButton
      buttonWithId("cutNoteButton").addEventListener('click',
          createCutFunction(mainEditorTextarea))
// cutAnkiButton
      buttonWithId("cutAnkiButton").addEventListener('click',
          createCutFunction(mainEditorTextarea, OPEN_CLOZE_STR, CLOSE_CLOZE_STR))

// copyButtons
      /** Adds an event listener to a button that copies the text of an input element to the clipboard. */
      const addEventListenerForCopyButton = (buttonId: string, inputElementId: string) => {
        buttonWithId(buttonId).addEventListener('click', () => {
          clipboard.writeText(inputElementWithId(inputElementId).value).then(() => {
            buttonWithId(buttonId).innerHTML = '⎘<br>Copied!'
            setTimeout(() => {
              buttonWithId(buttonId).innerHTML = '⎘<br>Copy'
            }, 500)
          }).catch(Log.error)
        })
      }

      // copyButtons
      addEventListenerForCopyButton("copyReplaceRulesButton", "replaceRulesTextArea")
      addEventListenerForCopyButton("copyPromptButton", "transcriptionPromptEditor")

// ############## Misc ##############
      buttonWithId("saveAPIKeyButton").addEventListener('click', function () {
        inputElementWithId('apiKeyInputField').value = ''; // Clear the input field
      })

      apiSelector.addEventListener('change', () => {
        Cookies.set('apiSelector', apiSelector.value)
      })

      languageSelector.addEventListener('change', () => {
        Cookies.set('languageSelector', languageSelector.value)
      })

// ############## downloadCsvs ##############
      /** IF a note contains the stopWord, prefix and postfix are
       * NOT applied. */
      const downloadCsv = (prefix = "", postfix = "", stopWord = "") => {
        // Uses https://github.com/alexcaza/export-to-csv
        const csvConfig = mkConfig({
          columnHeaders: ["column1"], showColumnHeaders: false, useTextFile: true
        });
        const textArray = mainEditorTextareaWrapper.value().split(NEW_NOTE_DELIMITER)
        const csvData = textArray.map((text: string) => {
          if (stopWord!=="" && text.includes(stopWord))
            return {column1: text}
          return {column1: prefix + text + postfix}
        })
        const csv = generateCsv(csvConfig)(csvData);
        return download(csvConfig)(csv);
      };

      const exportAnkiClozeCsv = () => {
        window.open("obsidian://advanced-uri?vault=o1&heading=CL&uid=wscr2Anki", '_blank')
        alert(`Copy: 
- Von Desktop und Phone gleichzeitig!
- search for du
- Summaries`);
        return downloadCsv(OPEN_CLOZE_STR, CLOSE_CLOZE_STR,"{{");
      };
      Menu.wireItem("exportAnkiClozeCsv", exportAnkiClozeCsv);
      Menu.wireItem("downloadCsv", downloadCsv);
    }

    const insertTextIntoMainEditor = (insertedString: string) => {
      TextAreas.insertAndPutCursorAfter(mainEditorTextarea, insertedString)
      mainEditor.save();
    }
    suppressUnusedWarning(insertTextIntoMainEditor)

    // addReplaceRuleButton
    const addReplaceRule = (requireWordBoundaryAtStart = false) => {
      elementWithId("bottomUi").classList.remove('hidden')

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
        TextAreas.appendTextAndCursor(replaceRulesTextArea,
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
        TextAreas.insertAndPutCursorAfter(replaceRulesTextArea, ruleString+"\n")
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
const mainEditorTextareaWrapper = new TextAreaWrapper(mainEditorTextarea)
const transcriptionPromptEditor = document.getElementById('transcriptionPromptEditor') as HTMLTextAreaElement
const replaceRulesTextArea = document.getElementById('replaceRulesTextArea') as HTMLTextAreaElement

const saveReplaceRules = () => {
  LARGE_STORAGE_PROVIDER.set("replaceRules",
      textAreaWithId("replaceRulesTextArea").value)
  Cookies.set("replaceRules", ""); // This used to be stored in a cookie.
  // Delete old cookie
}

textAreaWithId('replaceRulesTextArea').addEventListener('input', UiFunctions
    .replaceRulesTextAreaOnInput)

// Autosaves
{
  const handleAutoSaveError = (msg: string) => {
    Log.error(msg)
  }
  TextAreas.setAutoSave('replaceRules', 'replaceRulesTextArea', handleAutoSaveError, LARGE_STORAGE_PROVIDER)
  TextAreas.setAutoSave('editorText', 'mainEditorTextarea', handleAutoSaveError, LARGE_STORAGE_PROVIDER)
  TextAreas.setAutoSave('prompt', 'transcriptionPromptEditor', handleAutoSaveError, LARGE_STORAGE_PROVIDER)
}

const getApiSelectedInUi = () => (apiSelector.value as HelgeUtils.Transcription.ApiName)
const getLanguageSelectedInUi = () => (languageSelector.value)

export namespace Log {
  import inputElementWithId = HtmlUtils.NeverNull.inputElementWithId;
  const MAX_LOG_LEN = 10000

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
  // noinspection JSUnusedGlobalSymbols
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
    return LARGE_STORAGE_PROVIDER.get(key) ?? Cookies.get(key)
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
        }).catch(Log.error)
  }
}

const mayRunTests = () => {
  if (!RUN_TESTS) return
  HelgeUtils.runTests()
  UiFunctions.runTests()
}

const init = () => {
  mayRunTests()
  UiFunctions.Buttons.addEventListeners()
  registerServiceWorker()
  loadFormData()
  elementWithId("versionSpan").innerHTML = `${VERSION}, temperature: ${WHISPER_TEMPERATURE}`
  mainEditorTextareaWrapper.setCursorAtEnd().focus()
}

init()

