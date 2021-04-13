import "./components";
import "./views";
import { Router } from "@vaadin/router";
import page from "page";

const root = document.getElementById("root");

const router = new Router(root);
router.setRoutes([
  { path: "/", component: "view-home" },
  { path: "/blog", component: "view-blog" },
]);
console.log(router);
