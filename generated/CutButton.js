import { HtmlUtils } from "./HelgeUtils/HtmlUtils.js";
import { Log, mainEditor, UiFunctions } from './Main.js';
import { CurrentNote } from "./CurrentNote.js";
var buttonWithId = HtmlUtils.NullThrowsException.buttonWithIdNte;
var showToast = HtmlUtils.showToast;
const clipboard = navigator.clipboard;
export const createCutFunction = (mainEditorTextarea, addClozeMarkersIfNotPresentFlag) => {
    return () => {
        const addClozeMarkersIfNotPresent = (input, addClozeMarkersIfNotPresentFlag) => {
            if (!addClozeMarkersIfNotPresentFlag) {
                return input;
            }
            if (input.includes("{{c1::")) {
                if (input.includes("}}")) {
                    return input;
                }
                return input + "}}";
            }
            return "{{c1::" + input + "}},,";
        };
        mainEditor.Undo.saveState();
        UiFunctions.replaceAntwortWithClozeOpen();
        const currentNote = new CurrentNote(mainEditorTextarea);
        const output = addClozeMarkersIfNotPresent(currentNote.text().trim(), addClozeMarkersIfNotPresentFlag);
        clipboard.writeText(output)
            .then(() => {
            HtmlUtils.signalClickToUser(buttonWithId("cutNoteButton"));
            {
                const DELETE = true;
                if (DELETE) {
                    /* If DELETE==true, the text between the markers is deleted. */
                    currentNote.delete();
                }
                else {
                    // When DELETE==false, just select the text between the markers:
                    currentNote.select();
                }
            }
            mainEditor.save();
            showToast("The current note was cut out.");
            mainEditorTextarea.focus();
        }).catch(Log.error);
    };
};
//# sourceMappingURL=CutButton.js.map