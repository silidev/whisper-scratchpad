import { HtmlUtils } from "./HelgeUtils/HtmlUtils.js";
import { Log, mainEditor } from "./Main.js";
import { CurrentNote } from "./CurrentNote.js";
var buttonWithId = HtmlUtils.NullThrowsException.buttonWithIdNte;
var showToast = HtmlUtils.showToast;
import { ankiSpecialsSwitch } from './Config.js';
import { HelgeUtils } from './HelgeUtils/HelgeUtils.js';
const ClozeMarkers = HelgeUtils.Anki?.ClozeMarkers;
const clipboard = navigator.clipboard;
export const createCutFunction = (mainEditorTextarea, prefix = "", postfix = "") => {
    return () => {
        mainEditor.Undo.saveState();
        const currentNote = new CurrentNote(mainEditorTextarea);
        let text = prefix + currentNote.text().trim() + postfix;
        if (ankiSpecialsSwitch && text.includes(ClozeMarkers.openC1)) {
            text += ClozeMarkers.closeAndShowFront;
        }
        clipboard.writeText(text)
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