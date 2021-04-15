import css from "../../shared/css/button.hash.css";

const template = document.createElement("template");
template.innerHTML = /*html*/ `
  <link rel="stylesheet" href="/bundle/${css}"/>
  <button>
    <slot></slot>
  </button>
`;

export default template;
