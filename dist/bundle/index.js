(() => {
  // src/components/button/style.hash.css
  var style_hash_default = "./style.hash-MU7VMKTQ.css";

  // src/components/button/index.js
  var linkStyle = document.createElement("link");
  linkStyle.setAttribute("rel", "stylesheet");
  linkStyle.setAttribute("href", "/bundle/" + style_hash_default);
  var linkPreload = document.createElement("link");
  linkPreload.setAttribute("rel", "preload");
  linkPreload.setAttribute("as", "style");
  linkPreload.setAttribute("href", "/bundle/" + style_hash_default);
  document.head.appendChild(linkPreload);
  document.head.appendChild(linkStyle);

  // src/components/x-card/style.hash.css
  var style_hash_default2 = "./style.hash-XGIHC7HG.css";

  // src/components/x-card/template.js
  var template = document.createElement("template");
  template.innerHTML = `
  <link rel="preload" as="image" href="" />

  <link rel="preload" as="style" href="/bundle/${style_hash_default2}"/>
  <link rel="preload" as="style" href="/bundle/${style_hash_default}"/>
  
  <link rel="stylesheet" href="/global.css"/>
  <link rel="stylesheet" href="/bundle/${style_hash_default2}"/>
  <link rel="stylesheet" href="/bundle/${style_hash_default}"/>

  <div class="card">
    <img src="" alt=""/>
    <div class="title">
      <button class="fill"></button>
      <h4></h4>
    </div>
  </div>
`;
  var template_default = template;

  // src/components/x-card/index.js
  var XCard = class extends HTMLElement {
    static get observedAttributes() {
      return ["img", "title", "tag", "width"];
    }
    constructor() {
      super();
      this.$root = this.attachShadow({mode: "open"});
      this.$root.appendChild(template_default.content.cloneNode(true));
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
  };
  customElements.define("x-card", XCard);
})();
