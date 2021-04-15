import template from "./template";

class XCard extends HTMLElement {
  static get observedAttributes() {
    return ["img", "title", "tag", "width"];
  }
  constructor() {
    super();
    this.$root = this.attachShadow({ mode: "open" });
    this.$root.appendChild(template.content.cloneNode(true));
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      switch (name) {
        case "width":
          this.$card.style = "width: " + newValue;
          break;
        case "img":
          this.$linkImg.setAttribute("href", newValue);
          this.$img.setAttribute("src", newValue);
          break;
        case "title":
          this.$img.setAttribute("alt", newValue);
          this.$title.innerText = newValue;
          break;
        case "tag":
          this.$tag.innerText = newValue;
          break;
      }
    }
  }
  get $linkImg() {
    return this.$root.querySelector('link[as="image"]');
  }
  get $card() {
    return this.$root.querySelector(".card");
  }
  get $img() {
    return this.$root.querySelector("img");
  }
  get $tag() {
    return this.$root.querySelector(".title button");
  }
  get $title() {
    return this.$root.querySelector(".title h4");
  }
}

customElements.define("x-card", XCard);
