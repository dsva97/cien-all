import html from "./template.html";

const template = document.createElement("template");
template.innerHTML = html;

class PeButton extends HTMLElement {
  constructor() {
    super();
    this.appendChild(template.content.cloneNode(true));
  }
}

customElements.define("pe-button", PeButton);
