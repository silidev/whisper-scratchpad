export declare namespace mainEditor {
    namespace Undo {
        const undo: () => void;
        const saveState: () => void;
    }
    const append: (insertedString: string) => void;
    const appendDelimiter: () => void;
    const save: () => void;
}
export declare namespace Menu {
    const wireMenuItem: (id: string, menuFunction: () => void) => void;
    const close: () => void;
}
export declare namespace UiFunctions {
    const runTests: () => void;
    namespace Buttons {
        const runTests: () => void;
        /** From the current cursor position go back to the last word beginning.
         * Then got to the next comma, semicolon, period, colon, or newline and
         * remove it. Put the cursor at the end of the word. */
        namespace PunctuationNearCursor {
            const runTests: () => void;
            const kill: () => void;
            const addButtonEventListener: () => void;
        }
        namespace Media {
            const transcribeAudioBlob: () => void;
            namespace StateIndicator {
                /** Updates the recorder state display. That consists of the text
                 * and color of the stop button and the pause record button. */
                const update: () => void;
                const setPaused: () => void;
                const setStopped: () => void;
            }
            type WhereToPutTranscription = "appendAtEnd" | "insertAtCursor";
            namespace StopCallbackCreator {
                const createCancelingCallback: () => () => void;
                const transcribingCallback: () => () => void;
            }
            const cancelRecording: () => void;
        }
        const addEventListeners: () => void;
        const addWordReplaceRule: () => void;
    }
    const replaceRulesTextAreaOnInput: () => () => void;
}
export declare namespace Log {
    const turnOnLogging: () => void;
    const writeIfLoggingEnabled: (message: string) => void;
    const error: (message: string) => void;
    /** This only shows the log. It does NOT turn logging on! */
    const showLog: () => void;
    const toggleLog: (textAreaWithId: (id: string) => HTMLTextAreaElement) => () => void;
}
export declare const loadFormData: () => void;
export declare const registerServiceWorker: () => void;
