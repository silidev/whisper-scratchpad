import {HtmlUtils} from "./HtmlUtils.js"
import {saveMainEditor} from "./Main.js"
import {CurrentNote} from "./CurrentNote.js"
import buttonWithId = HtmlUtils.NeverNull.buttonWithId

const clipboard = navigator.clipboard

export const createCutFunction =
    (mainEditorTextarea: HTMLTextAreaElement,
     prefix = "", postfix = "") => {

  return () => {

    const currentNote = new CurrentNote(mainEditorTextarea)
    clipboard.writeText(prefix + currentNote.text().trim() + postfix).then(() => {
      HtmlUtils.signalClickToUser(buttonWithId("cutNoteButton"))
      {
        const DELETE = true
        if (DELETE) {
          /* If DELETE==true, the text between the markers is deleted. */
          currentNote.delete()
        } else {
          // When DELETE==false, just select the text between the markers:
          currentNote.select()
        }
      }
      saveMainEditor()
      mainEditorTextarea.focus()
    })
  }
}