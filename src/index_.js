import page from "page";
import "./components";
import "./views";
import "./shared";

const root = document.getElementById("root");

const home = document.createElement("view-home");
page("/", () => {
  root.appendChild(home);
});
const blog = document.createElement("view-blog");
page("/blog", () => {
  root.appendChild(blog);
});
page();
