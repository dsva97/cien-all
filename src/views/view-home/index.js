import "../../components/pe-button";
import html from "./template.html";

const template = document.createElement("template");
template.innerHTML = html;

class ViewHome extends HTMLElement {
  constructor() {
    super();
    this.$root = this.attachShadow({ mode: "open" });
    this.$root.appendChild(template.content.cloneNode(true));
  }
}

customElements.define("view-home", ViewHome);
