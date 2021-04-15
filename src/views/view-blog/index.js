import html from "./template.html";

const template = document.createElement("template");
template.innerHTML = html;

class ViewBlog extends HTMLElement {
  constructor() {
    super();
    // this.appendChild(document.importNode(template.content.cloneNode(true)));
  }
}

customElements.define("view-blog", ViewBlog);
