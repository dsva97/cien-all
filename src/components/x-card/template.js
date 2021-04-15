import css from "./style.hash.css";
import { buttonStyles } from "../button";

const template = document.createElement("template");
template.innerHTML = /*html*/ `
  <link rel="preload" as="image" href="" />

  <link rel="preload" as="style" href="/bundle/${css}"/>
  <link rel="preload" as="style" href="/bundle/${buttonStyles}"/>
  
  <link rel="stylesheet" href="/global.css"/>
  <link rel="stylesheet" href="/bundle/${css}"/>
  <link rel="stylesheet" href="/bundle/${buttonStyles}"/>

  <div class="card">
    <img src="" alt=""/>
    <div class="title">
      <button class="fill"></button>
      <h4></h4>
    </div>
  </div>
`;

export default template;
