const { Converter } = require("showdown");
const fs = require("fs");
const path = require("path");

const converter = new Converter({
  noHeaderId: true,
});

const files = fs.readdirSync(__dirname);

const postsFiles = files
  .filter((file) => file.split(".")[1] !== "js")
  .map((file) => path.resolve(__dirname, file));

const postsData = postsFiles.map((file) => {
  const data = fs.readFileSync(file, "utf-8");
  const chunks = data.split("---");
  chunks.shift();
  const metaChunk = chunks.shift().trim();
  const meta = metaChunk.split("\r\n").reduce((obj, text) => {
    const [key, value] = text.split(": ");
    obj[key] = value;
    return obj;
  }, {});
  const content = converter.makeHtml(chunks.join("---").trim());
  return { meta, content };
});

module.exports = postsData;
