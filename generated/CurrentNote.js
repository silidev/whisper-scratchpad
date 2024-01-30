import { HelgeUtils } from "./HelgeUtils.js";
import { newNoteDelimiter } from "./config.js";
/* The current note is the text between the two newNoteDelimiters . */
export class CurrentNote {
    constructor(mainEditorTextarea) {
        this.mainEditorTextarea = mainEditorTextarea;
    }
    leftIndex() {
        return new HelgeUtils.Strings.DelimiterSearch(newNoteDelimiter)
            .leftIndex(this.mainEditorTextarea.value, this.mainEditorTextarea.selectionStart);
    }
    rightIndex() {
        return new HelgeUtils.Strings.DelimiterSearch(newNoteDelimiter)
            .rightIndex(this.mainEditorTextarea.value, this.mainEditorTextarea.selectionStart);
    }
    textOf() {
        return this.mainEditorTextarea.value.substring(this.leftIndex(), this.rightIndex());
    }
}
//# sourceMappingURL=CurrentNote.js.map