import {HtmlUtils} from "./HelgeUtils/HtmlUtils.js"
import {Log, mainEditor} from "./Main.js"
import {CurrentNote} from "./CurrentNote.js"
import buttonWithId = HtmlUtils.NullThrowsException.buttonWithIdNte

import showToast = HtmlUtils.showToast
import {HelgeUtils} from './HelgeUtils/HelgeUtils.js'
const ClozeMarkers = HelgeUtils.Anki?.ClozeMarkers

const clipboard = navigator.clipboard

export const createCutFunction =
    (mainEditorTextarea: HTMLTextAreaElement,
     prefix = "", postfix = "") => {

  return () => {
    mainEditor.Undo.saveState()
    const currentNote = new CurrentNote(mainEditorTextarea)
    let text = prefix + currentNote.text().trim() + postfix
    if (text.includes("{{c1::") && !text.includes("}}")) {
      text += "}}"
    }
    clipboard.writeText(text)
        .then(() => {
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
          mainEditor.save()
          showToast("The current note was cut out.")
          mainEditorTextarea.focus()
        }).catch(Log.error)
  }
}