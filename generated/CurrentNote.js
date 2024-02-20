import { HelgeUtils } from "./HelgeUtils.js";
import { NEW_NOTE_DELIMITER } from "./Config.js";
var DelimiterSearch = HelgeUtils.Strings.DelimiterSearch;
/** The current note is the text between the two newNoteDelimiters. */
export class CurrentNote {
    mainEditorTextarea;
    constructor(mainEditorTextarea) {
        this.mainEditorTextarea = mainEditorTextarea;
    }
    leftIndex() {
        return new HelgeUtils.Strings.DelimiterSearch(NEW_NOTE_DELIMITER)
            .leftIndex(this.mainEditorTextarea.value, this.mainEditorTextarea.selectionStart);
    }
    rightIndex() {
        return new HelgeUtils.Strings.DelimiterSearch(NEW_NOTE_DELIMITER)
            .rightIndex(this.mainEditorTextarea.value, this.mainEditorTextarea.selectionStart);
    }
    text() {
        return this.mainEditorTextarea.value.substring(this.leftIndex(), this.rightIndex());
    }
    delete() {
        const leftIndex = this.leftIndex();
        this.mainEditorTextarea.value =
            DelimiterSearch.deleteNote(this.mainEditorTextarea.value, leftIndex, this.rightIndex(), NEW_NOTE_DELIMITER);
        this.mainEditorTextarea.setSelectionRange(leftIndex, leftIndex);
    }
    /** Selects the text of the current note in the UI */
    select() {
        const selectionStart = this.leftIndex()
            // Also select the newNoteDelimiter before the note:
            - (this.leftIndex() > NEW_NOTE_DELIMITER.length ? NEW_NOTE_DELIMITER.length : 0);
        const selectionEnd = this.rightIndex();
        this.mainEditorTextarea.setSelectionRange(selectionStart, selectionEnd);
    }
}
//# sourceMappingURL=CurrentNote.js.map