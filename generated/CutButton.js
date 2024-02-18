import { HtmlUtils } from "./HtmlUtils.js";
import { mainEditor } from "./Main.js";
import { CurrentNote } from "./CurrentNote.js";
var buttonWithId = HtmlUtils.NeverNull.buttonWithId;
const clipboard = navigator.clipboard;
export const createCutFunction = (mainEditorTextarea, prefix = "", postfix = "") => {
    return () => {
        mainEditor.Undo.saveState();
        const currentNote = new CurrentNote(mainEditorTextarea);
        clipboard.writeText(prefix + currentNote.text().trim() + postfix).then(() => {
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
            mainEditorTextarea.focus();
        });
    };
};
//# sourceMappingURL=CutButton.js.map