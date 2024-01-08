/**
 * Access:
 * const myTextareaComponent = document.querySelector('#my-toggle-textarea');
 * if (myTextareaComponent instanceof ToggleTextarea) {
 *   const content = myTextareaComponent.textarea.value;
 *   console.log(content); // Logs the content of the textarea
 * }
 */
class HideableTextArea extends HTMLElement {
  private shadow: ShadowRoot;
  public textarea: HTMLTextAreaElement;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
    this.textarea = document.createElement('textarea');
    this.textarea.id = 'textarea';
  }

  connectedCallback() {
    const buttonLabel = this.getAttribute('button-label') || 'Log';

    this.shadow.innerHTML = `
      <style>
        #textarea {
          width: 100%;
          min-height: 100px;
          margin-bottom: 10px;
          display: none;
        }
        #toggleButton {
          padding: 5px 10px;
          cursor: pointer;
        }
      </style>
    `;



    const toggleButton = document.createElement('button');
    toggleButton.textContent = buttonLabel;
    toggleButton.id = 'toggleButton';
    toggleButton.addEventListener('click', () => {
      this.textarea.style.display = this.textarea.style.display === 'none' ? 'block' : 'none';
    });

    this.shadow.appendChild(this.textarea);
    this.shadow.appendChild(toggleButton);

    const textareaStyle = this.getAttribute('textarea-style');
    const buttonStyle = this.getAttribute('button-style');

    if (textareaStyle) this.textarea.style.cssText = textareaStyle;
    if (buttonStyle) this.shadow.getElementById('toggleButton').style.cssText = buttonStyle;
  }
}

customElements.define('hideable-textarea', HideableTextArea);
