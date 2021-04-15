import buttonStyles from "./style.hash.css";

const linkStyle = document.createElement("link");
linkStyle.setAttribute("rel", "stylesheet");
linkStyle.setAttribute("href", "/bundle/" + buttonStyles);

const linkPreload = document.createElement("link");
linkPreload.setAttribute("rel", "preload");
linkPreload.setAttribute("as", "style");
linkPreload.setAttribute("href", "/bundle/" + buttonStyles);

document.head.appendChild(linkPreload);
document.head.appendChild(linkStyle);

export { buttonStyles };
