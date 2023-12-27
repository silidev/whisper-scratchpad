"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfoButton = void 0;
class InfoButton extends HTMLElement {
    constructor() {
        super();
        this.toggleHiddenClass = () => {
            const targetElement = this.shadow.getElementById(this.getAttribute('target-id'));
            if (targetElement) {
                targetElement.classList.toggle('hidden');
            }
        };
        this.shadow = this.attachShadow({ mode: 'open' });
        const targetId = this.getAttribute('target-id') || '';
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
      <span id="${targetId}" class="hidden">
        ${infoText}
        <a href="${moreInfoLink}">${moreInfoText}</a>
      </span>
    `;
    }
    connectedCallback() {
        this.addEventListener('click', this.toggleHiddenClass);
    }
}
exports.InfoButton = InfoButton;
//# sourceMappingURL=InfoButton.js.map