export declare const OPEN_CLOZE_STR = "{{c1::";
export declare const CLOSE_CLOZE_STR = "}},,";
export declare namespace mainEditor {
    namespace Undo {
        const undo: () => void;
        const saveState: () => void;
    }
    const appendStringAndCursor: (insertedString: string) => void;
    const appendDelimiterAndCursor: () => void;
    const save: () => void;
    const insertNote: (changedText: string) => void;
}
export declare namespace Menu {
    const wireItem: (id: string, menuFunction: () => void) => void;
    const close: () => void;
}
export declare namespace UiFunctions {
    const runTests: () => void;
    namespace Buttons {
        const runTests: () => void;
        namespace BottomUi {
            const toggleHidden: () => void;
            const unhide: () => void;
        }
        /** This is WIP, not working. */
        namespace NonWordChars {
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
            const replaceWithSpace: (s: string, c: number) => [string, number];
            const runTests: () => void;
            const replaceWithSpaceInMainEditor: () => void;
            const addButtonEventListener: () => void;
        }
        namespace FixClipboard {
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
    const toggleLog: () => () => void;
}
export declare const loadFormData: () => void;
export declare const registerServiceWorker: () => void;
