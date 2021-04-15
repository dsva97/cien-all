import template from "./template";

class PeButton extends HTMLElement {
  static get observedAttributes() {
    return ["class"];
  }
  constructor() {
    super();
    this.$root = this.attachShadow({ mode: "open" });
    this.$root.appendChild(template.content.cloneNode(true));
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.$root.querySelector("button").setAttribute("class", newValue);
    }
  }
}

customElements.define("pe-button", PeButton);
