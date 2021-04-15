const fs = require("fs");
const path = require("path");
const spdy = require("spdy");
const express = require("express");

const PORT = process.env.PORT || 3033;
const DIST = path.resolve(__dirname, "dist");
const INDEX = DIST + "/index.html";

const app = express();

app.use(express.static(DIST));

app.get("*", (req, res) => res.sendFile(INDEX));

spdy
  .createServer(
    {
      key: fs.readFileSync("./server.key"),
      cert: fs.readFileSync("./server.crt"),
    },
    app
  )
  .listen(PORT, (err) => {
    if (err) console.error(err);
    else console.log(`Running in ${PORT} port.`);
  });
