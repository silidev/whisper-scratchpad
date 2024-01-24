import { sendCtrlZ } from "./DontInspect.js";
import { HtmlUtils } from "./HtmlUtils.js";
import { HelgeUtils } from "./HelgeUtils.js";
var TextAreas = HtmlUtils.TextAreas;
var buttonWithId = HtmlUtils.buttonWithId;
var blinkFast = HtmlUtils.blinkFast;
var blinkSlow = HtmlUtils.blinkSlow;
var inputElementWithId = HtmlUtils.inputElementWithId;
var escapeRegExp = HelgeUtils.Strings.escapeRegExp;
var elementWithId = HtmlUtils.elementWithId;
// ############## Config ##############
const INSERT_EDITOR_INTO_PROMPT = true;
const VERSION = "Holdemaid";
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
var UiFunctions;
(function (UiFunctions) {
    // noinspection SpellCheckingInspection
    let Buttons;
    (function (Buttons) {
        var textAreaWithId = HtmlUtils.textAreaWithId;
        var insertTextAtCursor = HtmlUtils.TextAreas.insertTextAtCursor;
        var copyToClipboard = HtmlUtils.copyToClipboard;
        let Media;
        (function (Media) {
            let mediaRecorder;
            let audioChunks = [];
            let audioBlob;
            let isRecording = false;
            let stream;
            let sending = false;
            let StateIndicator;
            (function (StateIndicator) {
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
            /**
             * @param audioBlob
             * @param insertAtCursorFlag
             * - If true, the transcription is inserted at the cursor position
             * in the main editor, but often it is inserted at the beginning of the text instead.
             * - If false, it will be appended.
             */
            const transcribeAndHandleResult = async (audioBlob, insertAtCursorFlag) => {
                sending = true;
                StateIndicator.update();
                const apiName = getApiSelectedInUi();
                if (!apiName) {
                    insertAtCursor("You must select an API below.");
                    return;
                }
                const promptForWhisper = () => transcriptionPromptEditor.value
                    + INSERT_EDITOR_INTO_PROMPT ? mainEditorTextarea.value.substring(0, mainEditorTextarea.selectionStart /*The start is relevant b/c the selection will be overwritten by the
                                                new text. */).slice(-(750 /* Taking the last 750 CHARS is for sure less than the max 250 TOKENS whisper is considering. This is
              important because the last words of the last transcription should always be included to avoid hallucinations
              if it otherwise would be an incomplete sentence. */
                    - transcriptionPromptEditor.value.length)) : "";
                const removeLastDot = (text) => {
                    if (text.endsWith('.')) {
                        return text.slice(0, -1) + " ";
                    }
                    return text;
                };
                function aSpaceIfNeeded() {
                    return mainEditorTextarea.selectionStart > 0
                        && !mainEditorTextarea.value.charAt(mainEditorTextarea.selectionStart - 1).match(/\s/)
                        ? " " : "";
                }
                try {
                    const removeLastDotIfNotAtEnd = (input) => {
                        if (mainEditorTextarea.selectionStart < mainEditorTextarea.value.length) {
                            return removeLastDot(input);
                        }
                        return input;
                    };
                    const transcriptionText = await HelgeUtils.Transcription.transcribe(apiName, audioBlob, getApiKey(), promptForWhisper());
                    if (insertAtCursorFlag)
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
                transcribeAndHandleResult(audioBlob, true).then(NotVisibleAtThisTime.hideSpinner);
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
                transcribeAndHandleResult(audioBlob, true).then(NotVisibleAtThisTime.hideSpinner);
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
            // aboutButton
            HtmlUtils.addClickListener(buttonWithId("pasteButton"), () => {
                navigator.clipboard.readText().then(text => {
                    insertAtCursor(text);
                });
            });
            // cutButton
            const cutButton = () => {
                //** The text that is expected before and after the text that is cut. */
                const cutMarker = ')))---(((\n';
                //** Returns the positions of the adjacent cut markers or the start and end of the text if is no cut marker in that direction. */
                const positionsOfAdjacentCutMarkersOrEnd = (textArea) => {
                    const text = textArea.value;
                    const cursorPosition = textArea.selectionStart;
                    const findNearestMarker = (startIndex, searchForward) => {
                        const step = searchForward ? 1 : -1;
                        for (let i = startIndex; searchForward ? i < text.length : i >= 0; i += step) {
                            if (text.substring(i, i + cutMarker.length) === cutMarker) {
                                return i + (searchForward ? cutMarker.length : 0);
                            }
                        }
                        return searchForward ? text.length : 0;
                    };
                    return {
                        prev: findNearestMarker(cursorPosition, false),
                        next: findNearestMarker(cursorPosition, true)
                    };
                };
                const markerPositions = positionsOfAdjacentCutMarkersOrEnd(mainEditorTextarea);
                copyToClipboard(inputElementWithId("mainEditorTextarea")
                    .value.substring(markerPositions.prev + cutMarker.length, markerPositions.next - cutMarker.length)).then(() => {
                    const button = buttonWithId("cutButton");
                    button.innerHTML = '✂<br>✔️';
                    setTimeout(() => {
                        button.innerHTML = '✂<br>Cut';
                    }, 500);
                    // Delete the text between the markers
                    mainEditorTextarea.value =
                        mainEditorTextarea.value.substring(0, markerPositions.prev)
                            + mainEditorTextarea.value.substring(markerPositions.next - cutMarker.length);
                    // mainEditorTextarea.value = '';
                    saveEditor();
                    mainEditorTextarea.focus();
                });
            };
            buttonWithId("cutButton").addEventListener('click', cutButton);
            // copyButtons
            /** Adds an event listener to a button that copies the text of an input element to the clipboard. */
            const addEventListenerForCopyButton = (buttonId, inputElementId) => {
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
    })(Buttons = UiFunctions.Buttons || (UiFunctions.Buttons = {}));
    var elementWithId = HtmlUtils.elementWithId;
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
const saveEditor = () => HtmlUtils.Cookies.set("editorText", HtmlUtils.textAreaWithId("mainEditorTextarea").value);
TextAreas.setAutoSave('replaceRules', 'replaceRulesTextArea');
const saveReplaceRules = () => HtmlUtils.Cookies.set("replaceRules", HtmlUtils.textAreaWithId("replaceRulesTextArea").value);
HtmlUtils.textAreaWithId('replaceRulesTextArea').addEventListener('input', UiFunctions.replaceRulesTextAreaOnInput);
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
    var textAreaWithId = HtmlUtils.textAreaWithId;
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
    function withUiLog(rules, subject, wholeWords = false, preserveCase = false) {
        const logFlag = inputElementWithId("logReplaceRulesCheckbox").checked;
        const retVal = HelgeUtils.ReplaceByRules.replaceByRules(subject, rules, wholeWords, logFlag, preserveCase);
        Log.write(retVal.log);
        return retVal.resultingText;
    }
    ReplaceByRules.withUiLog = withUiLog;
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
    mainEditorTextarea.value = Cookies.get("editorText");
    transcriptionPromptEditor.value = Cookies.get("prompt");
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
const init = () => {
    UiFunctions.Buttons.addButtonEventListeners();
    registerServiceWorker();
    loadFormData();
    elementWithId("versionSpan").innerHTML = VERSION;
};
init();
//# sourceMappingURL=script.js.map