import {HelgeUtils} from "./HelgeUtils.js";
import {newNoteDelimiter} from "./config.js";
import {HtmlUtils} from "./HtmlUtils.js";
import copyToClipboard = HtmlUtils.copyToClipboard;
import buttonWithId = HtmlUtils.NeverNull.buttonWithId;
import {saveEditor} from "./script.js";

export function createCutButtonClickListener(mainEditorTextarea: HTMLTextAreaElement) {
  const clickListener = () => {

    // Because this seldom does something bad, first backup the whole text to clipboard:
    copyToClipboard(mainEditorTextarea.value).then(() => {

      const markerSearch = new HelgeUtils.Strings.DelimiterSearch(newNoteDelimiter);
      const between = {
        left: markerSearch.leftIndex(mainEditorTextarea.value, mainEditorTextarea.selectionStart),
        right: markerSearch.rightIndex(mainEditorTextarea.value, mainEditorTextarea.selectionStart)
      };

      const trimmedText =
          () => mainEditorTextarea.value
              .substring(between.left, between.right)
              .trim();

      copyToClipboard(trimmedText()).then(() => {

        HtmlUtils.signalClickToUser(buttonWithId("cutButton"));
        {
          /** If DELETE==true, the text between the markers is deleted. Do NOT use this yet because sometimes
           * something goes wrong. */
          const DELETE = true;
          if (DELETE) mainEditorTextarea.value =
              HelgeUtils.Strings.DelimiterSearch.deleteBetweenDelimiters(between.left, between.right, mainEditorTextarea.value, newNoteDelimiter);
        }
        const selectionStart = between.left - (between.left > newNoteDelimiter.length ? newNoteDelimiter.length : 0);
        const selectionEnd = between.right;
        mainEditorTextarea.setSelectionRange(selectionStart, selectionEnd);
        saveEditor();
        mainEditorTextarea.focus();
      });
    });
  };
  return clickListener;
}