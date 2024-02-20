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
    namespace Buttons {
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
export declare const loadFormData: () => void;
export declare const registerServiceWorker: () => void;
