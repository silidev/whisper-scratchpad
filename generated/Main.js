/*
 * Copyright (c) 2024 by Helge Tobias Kosuch
 */
var textAreaWithId = HtmlUtils.NeverNull.textAreaWithId;
var TextAreas = HtmlUtils.TextAreas;
var blinkFast = HtmlUtils.blinkFast;
var blinkSlow = HtmlUtils.blinkSlow;
var escapeForRegExp = HelgeUtils.Strings.escapeRegExp;
var elementWithId = HtmlUtils.NeverNull.elementWithId;
var TextAreaWrapper = HtmlUtils.TextAreas.TextAreaWrapper;
var Cookies = HtmlUtils.BrowserStorage.Cookies;
import { ctrlYRedo, ctrlZUndo } from "./DontInspect.js";
import { HelgeUtils } from "./HelgeUtils.js";
import { INSERT_EDITOR_INTO_PROMPT, NEW_NOTE_DELIMITER, VERIFY_LARGE_STORAGE, VERSION, WHERE_TO_INSERT_AT, WHISPER_TEMPERATURE } from "./Config.js";
import { createCutFunction } from "./CutButton.js";
import { HtmlUtils } from "./HtmlUtils.js";
import { CurrentNote } from "./CurrentNote.js";
// @ts-ignore
import { download, generateCsv, mkConfig } from "../node_modules/export-to-csv/output/index.js";
const LARGE_STORAGE_PROVIDER = VERIFY_LARGE_STORAGE
    ? HtmlUtils.BrowserStorage.LocalStorageVerified
    : HtmlUtils.BrowserStorage.LocalStorage;
/** Inlined from HelgeUtils.Test.runTestsOnlyToday */
const RUN_TESTS = HtmlUtils.isMsWindows() && new Date().toISOString()
    .slice(0, 10) === "2024-01-27";
if (RUN_TESTS)
    console.log("RUN_TESTS is true. This is only for " +
        "testing. Set it to false in production.");
HtmlUtils.ErrorHandling.ExceptionHandlers.installGlobalDefault();
export var mainEditor;
(function (mainEditor) {
    let Undo;
    (function (Undo) {
        let undoBuffer = "";
        Undo.undo = () => {
            const swapBuffer = mainEditorTextarea.value;
            mainEditorTextarea.value = undoBuffer;
            undoBuffer = swapBuffer;
            mainEditor.save();
        };
        Undo.saveState = () => {
            undoBuffer = mainEditorTextarea.value;
        };
    })(Undo = mainEditor.Undo || (mainEditor.Undo = {}));
    mainEditor.append = (insertedString) => {
        TextAreas.appendTextAndPutCursorAfter(mainEditorTextarea, insertedString);
        mainEditor.save();
        TextAreas.scrollToEnd(mainEditorTextarea);
    };
    mainEditor.appendDelimiter = () => {
        mainEditorTextareaWrapper.trim();
        mainEditor.append('\n' + NEW_NOTE_DELIMITER);
        mainEditorTextarea.focus();
    };
    mainEditor.save = () => {
        try {
            LARGE_STORAGE_PROVIDER.set("editorText", textAreaWithId("mainEditorTextarea").value);
        }
        catch (e) {
            prompt("Error saving editor text: " + e);
        }
        // Delete old cookie
        // Cookies.set("editorText", ""); // This used to be stored in a cookie.
    };
})(mainEditor || (mainEditor = {}));
var Misc;
(function (Misc) {
    Misc.applyReplaceRulesToMainEditor = () => {
        mainEditor.Undo.saveState();
        const selectionStart = mainEditorTextarea.selectionStart;
        const selectionEnd = mainEditorTextarea.selectionEnd;
        mainEditorTextarea.value = ReplaceByRules.withUiLog(replaceRulesTextArea.value, mainEditorTextarea.value);
        mainEditorTextarea.selectionStart = selectionStart;
        mainEditorTextarea.selectionEnd = selectionEnd;
    };
    Misc.addKeyboardShortcuts = () => {
        const cutFromMainEditor = createCutFunction(mainEditorTextarea, "{{c1::", "}}");
        document.addEventListener('keyup', (event) => {
            // console.log(event.key,event.shiftKey,event.ctrlKey,event.altKey)
            if (event.key === 'X' && event.shiftKey && event.ctrlKey) {
                // Prevent default action to avoid any browser shortcut conflicts
                event.preventDefault();
                cutFromMainEditor();
            }
        });
    };
})(Misc || (Misc = {}));
export var Menu;
(function (Menu) {
    var WcMenu = HtmlUtils.Menus.WcMenu;
    Menu.wireMenuItem = WcMenu.addItem("editorMenuHeading");
    Menu.close = () => WcMenu.close("editorMenuHeading");
})(Menu || (Menu = {}));
export var UiFunctions;
(function (UiFunctions) {
    var buttonWithId = HtmlUtils.NeverNull.buttonWithId;
    let Buttons;
    (function (Buttons) {
        var buttonWithId = HtmlUtils.NeverNull.buttonWithId;
        var inputElementWithId = HtmlUtils.NeverNull.inputElementWithId;
        var textAreaWithId = HtmlUtils.NeverNull.textAreaWithId;
        var Cookies = HtmlUtils.BrowserStorage.Cookies;
        var addKeyboardShortcuts = Misc.addKeyboardShortcuts;
        var suppressUnusedWarning = HelgeUtils.suppressUnusedWarning;
        let Media;
        (function (Media) {
            var DelimiterSearch = HelgeUtils.Strings.DelimiterSearch;
            var applyReplaceRulesToMainEditor = Misc.applyReplaceRulesToMainEditor;
            var buttonWithId = HtmlUtils.NeverNull.buttonWithId;
            var suppressUnusedWarning = HelgeUtils.suppressUnusedWarning;
            let mediaRecorder;
            let audioChunks = [];
            let audioBlob;
            let isRecording = false;
            suppressUnusedWarning(isRecording);
            let stream;
            let sending = false;
            Media.transcribeAudioBlob = () => {
                transcribeAndHandleResult(audioBlob, WHERE_TO_INSERT_AT).then();
            };
            let StateIndicator;
            (function (StateIndicator) {
                var buttonWithId = HtmlUtils.NeverNull.buttonWithId;
                /** Updates the recorder state display. That consists of the text
                 * and color of the stop button and the pause record button. */
                StateIndicator.update = () => {
                    if (mediaRecorder?.state === 'recording') {
                        setRecording();
                    }
                    else if (mediaRecorder?.state === 'paused') {
                        StateIndicator.setPaused();
                    }
                    else {
                        StateIndicator.setStopped();
                    }
                };
                const setRecording = () => {
                    setHtmlOfButtonStop('◼<br>Stop');
                    setHtmlOfButtonPauseRecord(blinkFast('🔴 Recording') + '<br>|| Pause');
                };
                StateIndicator.setPaused = () => {
                    setHtmlOfButtonStop('◼<br>Stop');
                    setHtmlOfButtonPauseRecord(blinkSlow('|| Paused') + '<br>⬤▶ Cont. Rec');
                };
                StateIndicator.setStopped = () => {
                    setHtmlOfButtonStop('◼<br>Stop');
                    setHtmlOfButtonPauseRecord(sending
                        ? blinkFast('✎ Scribing') + '<br>⬤ Record'
                        : '<br>⬤ Record');
                };
                const setHtmlOfButtonStop = (html) => {
                    buttonWithId("stopButton").innerHTML = html;
                };
                const setHtmlOfButtonPauseRecord = (html) => {
                    buttonWithId("pauseRecordButton").innerHTML = html;
                };
            })(StateIndicator = Media.StateIndicator || (Media.StateIndicator = {}));
            const transcribeAndHandleResult = async (audioBlob, whereToPutTranscription) => {
                try {
                    const calcMaxEditorPrompt = (textArea) => {
                        const text = textArea.value;
                        /* maxLeftIndex.
                         * Searching for the Delimiter. It is ")))---(((" at this time.
                         * "max" because this might be shortened later on. */
                        const maxLeftIndex = (() => {
                            return WHERE_TO_INSERT_AT === "appendAtEnd"
                                ? text.length
                                : textArea.selectionStart; /* Only the start is relevant
                            b/c the selection will be overwritten by the new text. */
                        })();
                        const indexAfterPreviousDelimiter = (() => {
                            return new DelimiterSearch(NEW_NOTE_DELIMITER).leftIndex(text, maxLeftIndex);
                        })();
                        return text.substring(indexAfterPreviousDelimiter, maxLeftIndex);
                    };
                    const removeLastDot = (text) => {
                        if (text.endsWith('.')) {
                            return text.slice(0, -1) + " ";
                        }
                        return text;
                    };
                    const aSpaceIfNeeded = () => {
                        return mainEditorTextarea.selectionStart > 0
                            && !mainEditorTextarea.value.charAt(mainEditorTextarea.selectionStart - 1).match(/\s/)
                            ? " " : "";
                    };
                    const finalPrompt = () => {
                        if (inputElementWithId("ignorePromptCheckbox").checked) {
                            Log.error("Prompt ignored.");
                            return "";
                        }
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
                                ? maxEditorPrompt.slice(-maxCharsFromEditor)
                                : "");
                    };
                    const getTranscriptionText = async () => await HelgeUtils.Transcription.transcribe(apiName, audioBlob, getApiKey(), finalPrompt(), getLanguageSelectedInUi(), inputElementWithId("translateCheckbox").checked);
                    const removeLastDotIfNotAtEnd = (input) => {
                        if (mainEditorTextarea.selectionStart < mainEditorTextarea.value.length) {
                            return removeLastDot(input);
                        }
                        return input;
                    };
                    sending = true;
                    StateIndicator.update();
                    const apiName = getApiSelectedInUi();
                    if (!apiName) {
                        TextAreas.insertTextAndPutCursorAfter(mainEditorTextarea, "You must select an API below.");
                        return;
                    }
                    const transcriptionText = await getTranscriptionText();
                    if (whereToPutTranscription == "insertAtCursor") {
                        TextAreas.insertTextAndPutCursorAfter(mainEditorTextarea, aSpaceIfNeeded() + removeLastDotIfNotAtEnd(transcriptionText));
                    }
                    else {
                        mainEditorTextareaWrapper.trim().appendTextAndPutCursorAfter(transcriptionText.trim());
                    }
                    if (inputElementWithId("autoReplaceCheckbox").checked) {
                        applyReplaceRulesToMainEditor();
                    }
                    mainEditorTextareaWrapper.trim().focus();
                    mainEditor.save();
                    sending = false;
                    StateIndicator.update();
                }
                catch (error) {
                    if (error instanceof HelgeUtils.Transcription.TranscriptionError) {
                        Log.error(JSON.stringify(error.payload, null, 2));
                    }
                    else
                        throw error;
                }
            };
            let StopCallbackCreator;
            (function (StopCallbackCreator) {
                StopCallbackCreator.createCancelingCallback = () => createInternal(true);
                StopCallbackCreator.transcribingCallback = () => createInternal(false);
                const createInternal = (cancel) => {
                    return () => {
                        HtmlUtils.Media.releaseMicrophone(stream);
                        isRecording = false;
                        StateIndicator.update();
                        audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
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
                            .then();
                    };
                };
            })(StopCallbackCreator = Media.StopCallbackCreator || (Media.StopCallbackCreator = {}));
            const getOnStreamReady = (beginPaused) => {
                return (streamParam) => {
                    stream = streamParam;
                    mediaRecorder = new MediaRecorder(stream);
                    audioChunks = [];
                    mediaRecorder.start();
                    isRecording = true;
                    StateIndicator.update();
                    mediaRecorder.ondataavailable = event => {
                        audioChunks.push(event.data);
                    };
                    if (beginPaused)
                        mediaRecorder.pause();
                    StateIndicator.update();
                };
            };
            const startRecording = (beginPaused = false) => {
                navigator.mediaDevices.getUserMedia({ audio: true }).then(getOnStreamReady(beginPaused));
            };
            const wireUploadButton = () => {
                const transcribeSelectedFile = () => {
                    const fileInput = inputElementWithId('fileToUploadSelector');
                    if (!fileInput?.files?.[0])
                        return;
                    const file = fileInput.files[0];
                    const reader = new FileReader();
                    reader.onload = event => {
                        if (event.target === null || event.target.result === null)
                            return;
                        audioBlob = new Blob([event.target.result], { type: file.type });
                        mainEditor.appendDelimiter();
                        Media.transcribeAudioBlob();
                    };
                    reader.readAsArrayBuffer(file);
                    Menu.close();
                };
                elementWithId('fileToUploadSelector').addEventListener('change', transcribeSelectedFile);
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
                  stopRecording()
                } else {
                  NotVisibleAtThisTime.showSpinner()
                  startRecording()
                }
                */
            };
            buttonWithId("stopButton").addEventListener('click', stopButton);
            // ############## cancelRecording ##############
            Media.cancelRecording = () => {
                if (!mediaRecorder)
                    return;
                mediaRecorder.onstop = StopCallbackCreator.createCancelingCallback();
                mediaRecorder.stop();
            };
            // ############## stop_transcribe_startNewRecording_and_pause ##############
            const stop_transcribe_startNewRecording_and_pause = () => {
                mediaRecorder.onstop = () => {
                    audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    audioChunks = [];
                    sending = true;
                    transcribeAndHandleResult(audioBlob, WHERE_TO_INSERT_AT).then();
                    startRecording(true);
                };
                mediaRecorder.stop();
            };
            // ############## pauseRecordButton ##############
            const pauseRecordButton = () => {
                if (mediaRecorder?.state === 'recording') {
                    mediaRecorder.pause();
                    StateIndicator.update();
                }
                else if (mediaRecorder?.state === 'paused') {
                    mediaRecorder.resume();
                    StateIndicator.update();
                }
                else {
                    startRecording();
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
            // ############## transcribeAudioBlob ##############
            Menu.wireMenuItem("transcribeAgainButton", Media.transcribeAudioBlob);
            // ############## Misc ##############
            wireUploadButton();
            StateIndicator.update();
        })(Media = Buttons.Media || (Buttons.Media = {})); // End of media buttons
        const clipboard = navigator.clipboard;
        Buttons.addEventListeners = () => {
            addKeyboardShortcuts();
            Menu.wireMenuItem("undoActionButton", mainEditor.Undo.undo);
            // ############## Toggle Log Button ##############
            Menu.wireMenuItem("toggleLogButton", Log.toggleLog(textAreaWithId));
            // ############## Crop Highlights Menu Item ##############
            const cropHighlights = () => {
                mainEditor.Undo.saveState();
                mainEditorTextarea.value = HelgeUtils.extractHighlights(mainEditorTextarea.value).join(' ');
                mainEditor.save();
            };
            Menu.wireMenuItem("cropHighlightsMenuItem", cropHighlights);
            // ############## Copy Backup to clipboard Menu Item ##############
            const copyBackupToClipboard = () => {
                clipboard.writeText("## Replace Rules\n" + replaceRulesTextArea.value + "\n"
                    + "## Prompt\n" + transcriptionPromptEditor.value).then();
            };
            Menu.wireMenuItem("copyBackupMenuItem", copyBackupToClipboard);
            // ############## Focus the main editor textarea Menu Item ##############
            Menu.wireMenuItem("focusMainEditorMenuItem", mainEditorTextarea.focus);
            // ############## du2Ich Menu Item ##############
            const du2ichMenuItem = () => {
                mainEditor.Undo.saveState();
                const currentNote = new CurrentNote(mainEditorTextarea);
                const changedText = HelgeUtils.Misc.du2ich(currentNote.text(), ReplaceByRules.onlyWholeWordsPreserveCaseWithUiLog);
                currentNote.delete();
                { // Insert the changed text
                    const cursorIsAtTheEndOfTheTextarea = mainEditorTextarea.value.length == mainEditorTextarea.selectionStart;
                    if (cursorIsAtTheEndOfTheTextarea) {
                        mainEditorTextareaWrapper.insertTextAndPutCursorAfter(NEW_NOTE_DELIMITER + changedText);
                    }
                    else {
                        mainEditorTextareaWrapper.insertTextAndPutCursorAfter(changedText + NEW_NOTE_DELIMITER);
                    }
                }
                mainEditor.save();
            };
            Menu.wireMenuItem("du2ichMenuItem", du2ichMenuItem);
            // ############## saveAPIKeyButton ##############
            const saveAPIKeyButton = () => {
                setApiKeyCookie(apiKeyInput.value);
                apiKeyInput.value = '';
            };
            HtmlUtils.addClickListener(("saveAPIKeyButton"), () => {
                saveAPIKeyButton();
            });
            const replaceButton = () => {
                Misc.applyReplaceRulesToMainEditor();
                mainEditorTextarea.focus();
                // window.scrollBy(0,-100000)
            };
            // replaceButtons
            HtmlUtils.addClickListener(("replaceButton1"), () => {
                replaceButton();
            });
            HtmlUtils.addClickListener(("replaceButton2"), () => {
                replaceButton();
            });
            // ############## backslashButton ##############
            HtmlUtils.addClickListener(("backslashButton"), () => {
                TextAreas.insertTextAndPutCursorAfter(replaceRulesTextArea, "\\b");
            });
            // ############## Undo #############
            const addUndoClickListener = (ctrlZButtonId, textArea) => {
                HtmlUtils.addClickListener(ctrlZButtonId, () => {
                    textArea.focus();
                    ctrlZUndo();
                });
            };
            addUndoClickListener("ctrlZButtonOfReplaceRules", replaceRulesTextArea);
            addUndoClickListener("ctrlZButtonOfPrompt", transcriptionPromptEditor);
            HtmlUtils.addClickListener("ctrlYButton", ctrlYRedo);
            HtmlUtils.addClickListener("addReplaceRuleButton", addReplaceRule);
            HtmlUtils.addClickListener("addWordReplaceRuleButton", Buttons.addWordReplaceRule);
            HtmlUtils.addClickListener("insertNewNoteDelimiterButton", mainEditor.appendDelimiter);
            // cancelRecording
            Menu.wireMenuItem("cancelRecording", Buttons.Media.cancelRecording);
            // cutAllButton
            Menu.wireMenuItem(("cutAllButton"), () => clipboard.writeText(mainEditorTextarea.value).then(() => {
                mainEditorTextarea.value = '';
                mainEditor.save();
            }));
            // aboutButton
            HtmlUtils.addClickListener(("pasteButton"), () => {
                clipboard.readText().then(text => {
                    TextAreas.insertTextAndPutCursorAfter(mainEditorTextarea, text);
                });
            });
            // cutNoteButton
            buttonWithId("cutNoteButton").addEventListener('click', createCutFunction(mainEditorTextarea));
            // cutAnkiButton
            buttonWithId("cutAnkiButton").addEventListener('click', createCutFunction(mainEditorTextarea, "{{c1::", "}}"));
            // copyButtons
            /** Adds an event listener to a button that copies the text of an input element to the clipboard. */
            const addEventListenerForCopyButton = (buttonId, inputElementId) => {
                buttonWithId(buttonId).addEventListener('click', () => {
                    clipboard.writeText(inputElementWithId(inputElementId).value).then(() => {
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
            // ############## Misc ##############
            buttonWithId("saveAPIKeyButton").addEventListener('click', function () {
                inputElementWithId('apiKeyInputField').value = ''; // Clear the input field
            });
            apiSelector.addEventListener('change', () => {
                Cookies.set('apiSelector', apiSelector.value);
            });
            languageSelector.addEventListener('change', () => {
                Cookies.set('languageSelector', languageSelector.value);
            });
            // ############## downloadCsvs ##############
            const downloadCsv = (prefix = "", postfix = "") => {
                // Uses https://github.com/alexcaza/export-to-csv
                const csvConfig = mkConfig({
                    columnHeaders: ["t1"], showColumnHeaders: false, useTextFile: true
                });
                const textArray = mainEditorTextareaWrapper.value().split(NEW_NOTE_DELIMITER);
                // Build a new array with elements like this: { text: textArray[i] }
                const csvData = textArray.map((text) => ({
                    t1: prefix + text + postfix
                }));
                const csv = generateCsv(csvConfig)(csvData);
                return download(csvConfig)(csv);
            };
            const ankiClozeCsv = () => {
                return downloadCsv("{{c1::", "}}");
            };
            Menu.wireMenuItem("ankiClozeCsv", ankiClozeCsv);
            Menu.wireMenuItem("downloadCsv", downloadCsv);
        };
        const insertTextIntoMainEditor = (insertedString) => {
            TextAreas.insertTextAndPutCursorAfter(mainEditorTextarea, insertedString);
            mainEditor.save();
        };
        suppressUnusedWarning(insertTextIntoMainEditor);
        // addReplaceRuleButton
        const addReplaceRule = (requireWordBoundaryAtStart = false) => {
            const inputStr = TextAreas.selectedText(mainEditorTextarea);
            /* The following builds a rule like this:
             * "REGEX"gm->"REPLACEMENT" */
            const quote = `"`;
            const maybeWordBoundary = requireWordBoundaryAtStart ? "\\b" : "";
            const regEx = escapeForRegExp(inputStr);
            const optionsAndArrow = 'gm->';
            /** This is the part before the text selection in the UI */
            const ruleStrPart1 = quote
                + maybeWordBoundary
                + regEx
                + quote
                + optionsAndArrow
                + quote;
            const ruleStrPart2 = inputStr + quote;
            const ruleString = ruleStrPart1 + ruleStrPart2;
            const lengthBefore = replaceRulesTextArea.value.length;
            const APPEND = true;
            if (APPEND) {
                const ruleBeforeSelection = "\n" + ruleStrPart1;
                TextAreas.appendTextAndPutCursorAfter(replaceRulesTextArea, ruleBeforeSelection + ruleStrPart2);
                const SELECT_REPLACEMENT = true;
                if (SELECT_REPLACEMENT) {
                    replaceRulesTextArea.selectionStart = lengthBefore + ruleBeforeSelection.length;
                    replaceRulesTextArea.selectionEnd = replaceRulesTextArea.value.length - 1;
                }
                else { // delete this if branch later
                    replaceRulesTextArea.selectionStart = lengthBefore;
                    replaceRulesTextArea.selectionEnd = replaceRulesTextArea.value.length;
                }
                TextAreas.scrollToEnd(replaceRulesTextArea);
            }
            else {
                TextAreas.insertTextAndPutCursorAfter(replaceRulesTextArea, ruleString + "\n");
                replaceRulesTextArea.selectionStart = 0;
                replaceRulesTextArea.selectionEnd = ruleString.length;
            }
            replaceRulesTextArea.focus();
            saveReplaceRules();
        };
        Buttons.addWordReplaceRule = () => addReplaceRule(true);
    })(Buttons = UiFunctions.Buttons || (UiFunctions.Buttons = {})); // End of Buttons namespace
    const replaceRulesTest = () => {
        // noinspection SpellCheckingInspection
        const magicText = (numberToMakeItUnique) => {
            return `Das hier ist ein ziemlich langer ganz normaler Text, an dem die Rules nichts verändern sollten! Dadurch fail'en auch Rules. und das ist auch gut so.`
                + numberToMakeItUnique;
        };
        const createTestRule = (numberToMakeItUnique) => `\n\n"${escapeForRegExp(magicText(numberToMakeItUnique))}"gm->""\n\n`;
        const testRules = createTestRule(1)
            + replaceRulesTextArea.value
            + createTestRule(2);
        const replaceResult = ReplaceByRules.withUiLog(testRules, magicText(1) + magicText(2));
        buttonWithId("testFailIndicatorOfReplaceRules").style.display =
            replaceResult === ''
                ? "none" : "block";
    };
    UiFunctions.replaceRulesTextAreaOnInput = () => replaceRulesTest;
})(UiFunctions || (UiFunctions = {}));
const downloadLink = document.getElementById('downloadLink');
const apiSelector = document.getElementById('apiSelector');
const languageSelector = document.getElementById('languageSelector');
const apiKeyInput = document.getElementById('apiKeyInputField');
const mainEditorTextarea = document.getElementById('mainEditorTextarea');
const mainEditorTextareaWrapper = new TextAreaWrapper(mainEditorTextarea);
const transcriptionPromptEditor = document.getElementById('transcriptionPromptEditor');
const replaceRulesTextArea = document.getElementById('replaceRulesTextArea');
const saveReplaceRules = () => {
    LARGE_STORAGE_PROVIDER.set("replaceRules", textAreaWithId("replaceRulesTextArea").value);
    Cookies.set("replaceRules", ""); // This used to be stored in a cookie.
    // Delete old cookie
};
textAreaWithId('replaceRulesTextArea').addEventListener('input', UiFunctions
    .replaceRulesTextAreaOnInput);
// Autosaves
{
    const handleAutoSaveError = (msg) => {
        Log.error(msg);
    };
    TextAreas.setAutoSave('replaceRules', 'replaceRulesTextArea', handleAutoSaveError, LARGE_STORAGE_PROVIDER);
    TextAreas.setAutoSave('editorText', 'mainEditorTextarea', handleAutoSaveError, LARGE_STORAGE_PROVIDER);
    TextAreas.setAutoSave('prompt', 'transcriptionPromptEditor', handleAutoSaveError, LARGE_STORAGE_PROVIDER);
}
const getApiSelectedInUi = () => apiSelector.value;
const getLanguageSelectedInUi = () => (languageSelector.value);
var Log;
(function (Log) {
    var inputElementWithId = HtmlUtils.NeverNull.inputElementWithId;
    const MAX_LOG_LEN = 1000;
    // noinspection JSUnusedGlobalSymbols
    Log.turnOnLogging = () => {
        inputElementWithId("logReplaceRulesCheckbox").checked = true;
    };
    function logEvenIfNotEnabled(message) {
        const logTextArea = textAreaWithId("logTextArea");
        const oldLog = logTextArea.value;
        logTextArea.value = (oldLog + "\n" + message).slice(-MAX_LOG_LEN).trim();
        TextAreas.scrollToEnd(logTextArea);
    }
    Log.writeIfLoggingEnabled = (message) => {
        if (!inputElementWithId("logReplaceRulesCheckbox").checked)
            return;
        logEvenIfNotEnabled(message);
    };
    Log.error = (message) => {
        logEvenIfNotEnabled(message);
        Log.showLog();
    };
    /** This only shows the log. It does NOT turn logging on! */
    Log.showLog = () => {
        textAreaWithId("logTextArea").style.display = "block";
    };
    Log.toggleLog = (textAreaWithId) => () => {
        const log = textAreaWithId("logTextArea");
        if (log.style.display === "none") {
            log.style.display = "block";
            inputElementWithId("logReplaceRulesCheckbox").checked = true;
        }
        else {
            log.style.display = "none";
            inputElementWithId("logReplaceRulesCheckbox").checked = false;
        }
    };
})(Log || (Log = {}));
var ReplaceByRules;
(function (ReplaceByRules) {
    // Overload signatures
    var inputElementWithId = HtmlUtils.NeverNull.inputElementWithId;
    function withUiLog(rules, subject, wholeWords = false, preserveCase = false) {
        const logFlag = inputElementWithId("logReplaceRulesCheckbox").checked;
        const retVal = HelgeUtils.ReplaceByRules.replaceByRules(subject, rules, wholeWords, logFlag, preserveCase);
        Log.writeIfLoggingEnabled(retVal.log);
        return retVal.resultingText;
    }
    ReplaceByRules.withUiLog = withUiLog;
    // noinspection JSUnusedGlobalSymbols
    function onlyWholeWordsWithUiLog(rules, subject) {
        return withUiLog(rules, subject, true);
    }
    ReplaceByRules.onlyWholeWordsWithUiLog = onlyWholeWordsWithUiLog;
    function onlyWholeWordsPreserveCaseWithUiLog(rules, subject) {
        return withUiLog(rules, subject, true, true);
    }
    ReplaceByRules.onlyWholeWordsPreserveCaseWithUiLog = onlyWholeWordsPreserveCaseWithUiLog;
})(ReplaceByRules || (ReplaceByRules = {}));
const getApiKey = () => Cookies.get(apiSelector.value + 'ApiKey');
const setApiKeyCookie = (apiKey) => {
    Cookies.set(apiSelector.value + 'ApiKey', apiKey);
};
export const loadFormData = () => {
    const getLocalStorageOrCookie = (key) => {
        return LARGE_STORAGE_PROVIDER.get(key) ?? Cookies.get(key);
    };
    mainEditorTextarea.value = getLocalStorageOrCookie("editorText") ?? "";
    transcriptionPromptEditor.value = getLocalStorageOrCookie("prompt") ?? "";
    replaceRulesTextArea.value = getLocalStorageOrCookie("replaceRules")
        ?? `""->""\n`; // Default replace rule
    apiSelector.value = Cookies.get("apiSelector") ?? 'OpenAI';
    languageSelector.value = Cookies.get("languageSelector") ?? '';
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
    if (!RUN_TESTS)
        return;
    HelgeUtils.runTests();
};
const init = () => {
    runTests();
    UiFunctions.Buttons.addEventListeners();
    registerServiceWorker();
    loadFormData();
    elementWithId("versionSpan").innerHTML = `${VERSION}, temperature: ${WHISPER_TEMPERATURE}`;
    mainEditorTextareaWrapper.setCursorAtEnd().focus();
};
init();
//# sourceMappingURL=Main.js.map