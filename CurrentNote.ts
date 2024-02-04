import {HelgeUtils} from "./HelgeUtils.js";
import {NEW_NOTE_DELIMITER} from "./config.js";

/** The current note is the text between the two newNoteDelimiters. */
export class CurrentNote {
  constructor(private mainEditorTextarea: HTMLTextAreaElement) {
  }

  public leftIndex() {
    return new HelgeUtils.Strings.DelimiterSearch(NEW_NOTE_DELIMITER)
        .leftIndex(this.mainEditorTextarea.value, this.mainEditorTextarea.selectionStart);
  }

  public rightIndex() {
    return new HelgeUtils.Strings.DelimiterSearch(NEW_NOTE_DELIMITER)
        .rightIndex(this.mainEditorTextarea.value, this.mainEditorTextarea.selectionStart);
  }

  public text() {
    return this.mainEditorTextarea.value.substring(this.leftIndex(), this.rightIndex());
  }
}

