import {HelgeUtils} from "./HelgeUtils.js";
import {newNoteDelimiter} from "./config.js";

/* The current note is the text between the two newNoteDelimiters . */

export class CurrentNote {
  constructor(private mainEditorTextarea: HTMLTextAreaElement) {
  }

  public leftIndex() {
    return new HelgeUtils.Strings.DelimiterSearch(newNoteDelimiter)
        .leftIndex(this.mainEditorTextarea.value, this.mainEditorTextarea.selectionStart);
  }

  public rightIndex() {
    return new HelgeUtils.Strings.DelimiterSearch(newNoteDelimiter)
        .rightIndex(this.mainEditorTextarea.value, this.mainEditorTextarea.selectionStart);
  }

  public text() {
    return this.mainEditorTextarea.value.substring(this.leftIndex(), this.rightIndex());
  }
}

