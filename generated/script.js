/*
 * Copyright (c) 2024 by Helge Tobias Kosuch
 */
// noinspection JSUnusedGlobalSymbols
var textAreaWithId = HtmlUtils.NeverNull.textAreaWithId;
var TextAreas = HtmlUtils.TextAreas;
var blinkFast = HtmlUtils.blinkFast;
var blinkSlow = HtmlUtils.blinkSlow;
var escapeRegExp = HelgeUtils.Strings.escapeRegExp;
var elementWithId = HtmlUtils.NeverNull.elementWithId;
import { sendCtrlZ } from "./DontInspect.js";
import { HtmlUtils } from "./HtmlUtils.js";
import { HelgeUtils } from "./HelgeUtils.js";
import { INSERT_EDITOR_INTO_PROMPT, NEW_NOTE_DELIMITER, VERSION, WHERE_TO_INSERT_AT } from "./config.js";
import { createCutButtonClickListener } from "./CutButton.js";
/** Inlined from HelgeUtils.Test.runTestsOnlyToday */
const RUN_TESTS = HtmlUtils.isMsWindows() && new Date().toISOString().slice(0, 10) === "2024-01-27";
if (RUN_TESTS)
    console.log("RUN_TESTS is true. This is only for " +
        "testing. Set it to false in production.");
var Functions;
(function (Functions) {
    Functions.applyReplaceRulesToMainEditor = () => {
        const selectionStart = mainEditorTextarea.selectionStart;
        const selectionEnd = mainEditorTextarea.selectionEnd;
        mainEditorTextarea.value = ReplaceByRules.withUiLog(replaceRulesTextArea.value, mainEditorTextarea.value);
        mainEditorTextarea.selectionStart = selectionStart;
        mainEditorTextarea.selectionEnd = selectionEnd;
    };
})(Functions || (Functions = {}));
export var UiFunctions;
(function (UiFunctions) {
    // noinspection SpellCheckingInspection
    var elementWithId = HtmlUtils.NeverNull.elementWithId;
    var buttonWithId = HtmlUtils.NeverNull.buttonWithId;
    let Buttons;
    (function (Buttons) {
        var insertTextAtCursor = HtmlUtils.TextAreas.insertTextAtCursor;
        var copyToClipboard = HtmlUtils.copyToClipboard;
        var textAreaWithId = HtmlUtils.NeverNull.textAreaWithId;
        var buttonWithId = HtmlUtils.NeverNull.buttonWithId;
        var inputElementWithId = HtmlUtils.NeverNull.inputElementWithId;
        let Media;
        (function (Media) {
            var buttonWithId = HtmlUtils.NeverNull.buttonWithId;
            var DelimiterSearch = HelgeUtils.Strings.DelimiterSearch;
            let mediaRecorder;
            let audioChunks = [];
            let audioBlob;
            let isRecording = false;
            let stream;
            let sending = false;
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
                        setStopped();
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
                const setStopped = () => {
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
                sending = true;
                StateIndicator.update();
                const apiName = getApiSelectedInUi();
                if (!apiName) {
                    insertAtCursor("You must select an API below.");
                    return;
                }
                const maxEditorPrompt = ((textArea) => {
                    const text = textArea.value;
                    /* maxRightIndex.
                     * "max" because this might be shortened
                     *  later on. */
                    const maxRightIndex = (() => {
                        return WHERE_TO_INSERT_AT === "appendAtEnd"
                            ? text.length
                            : textArea.selectionStart; /* Only the start is relevant b/c the
                      selection will be overwritten by the new text. */
                    })();
                    const indexAfterPreviousDelimiter = (() => {
                        return new DelimiterSearch(NEW_NOTE_DELIMITER).leftIndex(text, maxRightIndex);
                    })();
                    return text.substring(indexAfterPreviousDelimiter, maxRightIndex);
                })(mainEditorTextarea);
                const promptForWhisper = () => {
                    return transcriptionPromptEditor.value
                        + INSERT_EDITOR_INTO_PROMPT ? maxEditorPrompt.slice(-(750 /* Taking the last 750 CHARS is for sure less than the max 250
                     TOKENS whisper is considering. This is important because the last
                     words of the last transcription should always be included to
                     avoid hallucinations if it otherwise would be an incomplete sentence. */
                        - transcriptionPromptEditor.value.length)) : "";
                };
                const removeLastDot = (text) => {
                    if (text.endsWith('.')) {
                        return text.slice(0, -1) + " ";
                    }
                    return text;
                };
                const aSpaceIfNeeded = () => mainEditorTextarea.selectionStart > 0
                    && !mainEditorTextarea.value.charAt(mainEditorTextarea.selectionStart - 1).match(/\s/)
                    ? " " : "";
                const getTranscriptionText = async () => await HelgeUtils.Transcription.transcribe(apiName, audioBlob, getApiKey(), promptForWhisper());
                const removeLastDotIfNotAtEnd = (input) => {
                    if (mainEditorTextarea.selectionStart < mainEditorTextarea.value.length) {
                        return removeLastDot(input);
                    }
                    return input;
                };
                try {
                    const transcriptionText = await getTranscriptionText();
                    if (whereToPutTranscription == "insertAtCursor")
                        insertAtCursor(aSpaceIfNeeded() + removeLastDotIfNotAtEnd(transcriptionText));
                    else
                        TextAreas.appendText(mainEditorTextarea, transcriptionText);
                    Functions.applyReplaceRulesToMainEditor();
                    saveEditor();
                    navigator.clipboard.writeText(mainEditorTextarea.value).then();
                }
                catch (error) {
                    if (error instanceof HelgeUtils.Transcription.TranscriptionError) {
                        Log.write(JSON.stringify(error.payload, null, 2));
                        Log.showLog();
                    }
                    else {
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
                audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                audioChunks = [];
                { // Download button
                    downloadLink.href = URL.createObjectURL(audioBlob);
                    downloadLink.download = 'recording.wav';
                    downloadLink.style.display = 'block';
                }
                transcribeAndHandleResult(audioBlob, WHERE_TO_INSERT_AT)
                    .then(NotVisibleAtThisTime.hideSpinner);
            };
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
            const stopRecording = () => {
                mediaRecorder.onstop = stopCallback;
                mediaRecorder.stop();
            };
            // ############## stopButton ##############
            const stopButton = () => {
                if (isRecording) {
                    stopRecording();
                }
                else {
                    NotVisibleAtThisTime.showSpinner();
                    startRecording();
                }
            };
            buttonWithId("stopButton").addEventListener('click', stopButton);
            const stop_transcribe_startNewRecording_and_pause = () => {
                mediaRecorder.onstop = () => {
                    audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
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
                }
                else if (mediaRecorder?.state === 'paused') {
                    mediaRecorder.resume();
                    StateIndicator.update();
                }
                else {
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
        })(Media = Buttons.Media || (Buttons.Media = {})); // End of media buttons
        Buttons.addButtonEventListeners = () => {
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
                navigator.clipboard.writeText("## Replace Rules\n" + replaceRulesTextArea.value + "\n"
                    + "## Prompt\n" + transcriptionPromptEditor.value).then();
            };
            HtmlUtils.addClickListener(buttonWithId("copyBackupMenuItem"), () => {
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
                    mainEditorTextarea.value = HelgeUtils.Misc.du2ich(mainEditorTextarea.value, ReplaceByRules.onlyWholeWordsPreserveCaseWithUiLog);
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
                insertTextAtCursor(replaceRulesTextArea, "\\");
            });
            // ############## ctrlZButtons ##############
            const addCtrlZButtonEventListener = (ctrlZButtonId, textArea) => {
                HtmlUtils.addClickListener(buttonWithId(ctrlZButtonId), () => {
                    textArea.focus();
                    sendCtrlZ();
                });
            };
            addCtrlZButtonEventListener("ctrlZButtonOfReplaceRules", replaceRulesTextArea);
            addCtrlZButtonEventListener("ctrlZButtonOfPrompt", transcriptionPromptEditor);
            HtmlUtils.addClickListener(buttonWithId("addReplaceRuleButton"), addReplaceRule);
            HtmlUtils.addClickListener(buttonWithId("addWordReplaceRuleButton"), Buttons.addWordReplaceRule);
            function cancelButton() {
                saveEditor();
                window.location.reload();
            }
            // aboutButton
            HtmlUtils.addClickListener(buttonWithId("cancelButton"), () => {
                cancelButton();
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
                    insertAtCursor(text);
                });
            });
            // cutButton
            buttonWithId("cutButton").addEventListener('click', createCutButtonClickListener(mainEditorTextarea));
            // copyButtons
            /** Adds an event listener to a button that copies the text of an input element to the clipboard. */
            const addEventListenerForCopyButton = (buttonId, inputElementId) => {
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
                inputElementWithId('apiKey').value = ''; // Clear the input field
            });
            apiSelector.addEventListener('change', () => {
                HtmlUtils.Cookies.set('apiSelector', apiSelector.value);
            });
        };
        // addReplaceRuleButton
        const addReplaceRule = (wordsOnly = false) => {
            // add TextArea.selectedText() to the start of the replaceRulesTextArea
            TextAreas.setCursor(replaceRulesTextArea, 0);
            const selectedText = TextAreas.selectedText(mainEditorTextarea);
            const maybeWordBoundary = wordsOnly ? "\\b" : "";
            const insertedString = `"${maybeWordBoundary + escapeRegExp(selectedText)
                + maybeWordBoundary}"gm->"${selectedText}"\n`;
            TextAreas.insertTextAtCursor(replaceRulesTextArea, insertedString);
            replaceRulesTextArea.selectionStart = 0;
            replaceRulesTextArea.selectionEnd = insertedString.length; // was, delete on day: setCursor(12 + selectedText.length);
            // replaceRulesTextArea.focus(); // Taken out b/c this jumps way too much down on mobile.
            saveReplaceRules();
        };
        Buttons.addWordReplaceRule = () => {
            addReplaceRule(true);
        };
    })(Buttons = UiFunctions.Buttons || (UiFunctions.Buttons = {})); // End of Buttons namespace
    UiFunctions.closeEditorMenu = () => {
        elementWithId("editorMenuHeading").dispatchEvent(new CustomEvent('rootMenuClose'));
    };
    const replaceRulesTest = () => {
        // noinspection SpellCheckingInspection
        const magicText = (numberToMakeItUnique) => {
            return `Das hier ist ein ziemlich langer ganz normaler Text, an dem die Rules nichts verändern sollten! Dadurch fail'en auch Rules. und das ist auch gut so.`
                + numberToMakeItUnique;
        };
        const createTestRule = (numberToMakeItUnique) => `\n\n"${escapeRegExp(magicText(numberToMakeItUnique))}"gm->""\n\n`;
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
const spinner1 = document.getElementById('spinner1');
const apiSelector = document.getElementById('apiSelector');
const apiKeyInput = document.getElementById('apiKeyInputField');
const mainEditorTextarea = document.getElementById('mainEditorTextarea');
const transcriptionPromptEditor = document.getElementById('transcriptionPromptEditor');
const replaceRulesTextArea = document.getElementById('replaceRulesTextArea');
export const saveEditor = () => HtmlUtils.Cookies.set("editorText", textAreaWithId("mainEditorTextarea").value);
TextAreas.setAutoSave('replaceRules', 'replaceRulesTextArea');
const saveReplaceRules = () => HtmlUtils.Cookies.set("replaceRules", textAreaWithId("replaceRulesTextArea").value);
textAreaWithId('replaceRulesTextArea').addEventListener('input', UiFunctions.replaceRulesTextAreaOnInput);
TextAreas.setAutoSave('editorText', 'mainEditorTextarea');
TextAreas.setAutoSave('prompt', 'transcriptionPromptEditor');
const insertAtCursor = (text) => {
    TextAreas.insertTextAtCursor(mainEditorTextarea, text);
};
const getApiSelectedInUi = () => apiSelector.value;
var NotVisibleAtThisTime;
(function (NotVisibleAtThisTime) {
    NotVisibleAtThisTime.showSpinner = () => {
        // probably not needed anymore, delete later
        // spinner1.style.display = 'block';
    };
    // probably not needed anymore, delete later
    NotVisibleAtThisTime.hideSpinner = () => {
        spinner1.style.display = 'none';
    };
})(NotVisibleAtThisTime || (NotVisibleAtThisTime = {}));
var Log;
(function (Log) {
    var inputElementWithId = HtmlUtils.NeverNull.inputElementWithId;
    var buttonWithId = HtmlUtils.NeverNull.buttonWithId;
    const MAX_LOG_LEN = 1000;
    Log.write = (message) => {
        if (!inputElementWithId("logReplaceRulesCheckbox").checked)
            return;
        const logTextArea = textAreaWithId("logTextArea");
        const oldLog = logTextArea.value;
        logTextArea.value = (oldLog + "\n" + message).slice(-MAX_LOG_LEN);
        logTextArea.scrollTop = logTextArea.scrollHeight;
    };
    Log.showLog = () => {
        textAreaWithId("logTextArea").style.display = "block";
    };
    Log.addToggleLogButtonClickListener = (textAreaWithId) => {
        HtmlUtils.addClickListener(buttonWithId("toggleLogButton"), () => {
            UiFunctions.closeEditorMenu();
            const log = textAreaWithId("logTextArea");
            if (log.style.display === "none") {
                log.style.display = "block";
                inputElementWithId("logReplaceRulesCheckbox").checked = true;
            }
            else {
                log.style.display = "none";
                inputElementWithId("logReplaceRulesCheckbox").checked = false;
            }
        });
    };
})(Log || (Log = {}));
var ReplaceByRules;
(function (ReplaceByRules) {
    // Overload signatures
    var inputElementWithId = HtmlUtils.NeverNull.inputElementWithId;
    function withUiLog(rules, subject, wholeWords = false, preserveCase = false) {
        const logFlag = inputElementWithId("logReplaceRulesCheckbox").checked;
        const retVal = HelgeUtils.ReplaceByRules.replaceByRules(subject, rules, wholeWords, logFlag, preserveCase);
        Log.write(retVal.log);
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
const getApiKey = () => HtmlUtils.Cookies.get(apiSelector.value + 'ApiKey');
const setApiKeyCookie = (apiKey) => {
    HtmlUtils.Cookies.set(apiSelector.value + 'ApiKey', apiKey);
};
export const loadFormData = () => {
    const Cookies = HtmlUtils.Cookies;
    mainEditorTextarea.value = Cookies.get("editorText") ?? "";
    transcriptionPromptEditor.value = Cookies.get("prompt") ?? "";
    replaceRulesTextArea.value = Cookies.get("replaceRules") ?? `""->""\n`;
    apiSelector.value = Cookies.get("apiSelector") ?? 'OpenAI';
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
    UiFunctions.Buttons.addButtonEventListeners();
    registerServiceWorker();
    loadFormData();
    elementWithId("versionSpan").innerHTML = VERSION;
};
init();
//# sourceMappingURL=script.js.map