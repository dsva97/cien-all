const path = require("path");
const express = require("express");
const livereload = require("livereload");
const connectLivereload = require("connect-livereload");

const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, "dist"));

liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 200);
});

const PORT = process.env.PORT || 3033;
const DIST = path.resolve(__dirname, "dist");
const INDEX = DIST + "/index.html";

const app = express();

app.use(connectLivereload());

app.use(express.static(DIST));

app.get("*", (req, res) => res.sendFile(INDEX));

app.listen(PORT, () => console.log(`Running in ${PORT} port.`));
