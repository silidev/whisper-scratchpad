class InfoButton extends HTMLElement {
  private shadow: ShadowRoot;
  private toggleHiddenClass: any;
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const targetId = this.getAttribute('target-id') || 'default-id';
    const infoText = this.getAttribute('info-text') || '';
    const moreInfoLink = this.getAttribute('more-info-link') || '#';
    const moreInfoText = this.getAttribute('more-info-text') || 'More info';

    this.shadow.innerHTML = `
      <style>
        .hidden {
          display: none;
        }
        :host {
          cursor: pointer;
        }
      </style>
      <a href="${moreInfoLink}">${moreInfoText}</a>
      <span id="${targetId}" class="hidden">
        ${infoText}
      </span>
    `;

    this.toggleHiddenClass = () => {
      const targetElement = this.shadow.getElementById(targetId);
      if (targetElement) {
        targetElement.classList.toggle('hidden');
      } else {
        console.error(`Element with id ${targetId} not found`);
      }
    };

    this.addEventListener('click', this.toggleHiddenClass);
  }
}

customElements.define('info-button', InfoButton);

