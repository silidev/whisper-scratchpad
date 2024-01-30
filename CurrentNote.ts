import {HelgeUtils} from "./HelgeUtils.js";
import {newNoteDelimiter} from "./config.js";

/* The current note is the text between the two newNoteDelimiters . */

/** Returns the left and the right index of the current note. */
export class CurrentNote {
  constructor(private mainEditorTextarea: HTMLTextAreaElement) {
  }

  public rangeOf() {
    const markerSearch = new HelgeUtils.Strings.DelimiterSearch(newNoteDelimiter);
    const between = {
      left: markerSearch.leftIndex(this.mainEditorTextarea.value, this.mainEditorTextarea.selectionStart),
      right: markerSearch.rightIndex(this.mainEditorTextarea.value, this.mainEditorTextarea.selectionStart)
    };
    return between;
  };

  public textOf() {
    const between = this.rangeOf();
    return this.mainEditorTextarea.value.substring(between.left, between.right);
  }
}

