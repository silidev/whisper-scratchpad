/*
This file contains functions that are not meant to be inspected by IntelliJ IDEA, because at least the warnings in this file are not useful, but cannot be disabled.
 */
export const ctrlZUndo = () => {
  document.execCommand('undo');// Yes, deprecated, but works. I will replace it when it fails. Docs: https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand
};
export const ctrlYRedo = () => {
  document.execCommand('redo');// Yes, deprecated, but works. I will replace
  // it when it fails. Docs: https://developer.mozilla.org/en-US/docs/Web/API/Document/execCommand
};
