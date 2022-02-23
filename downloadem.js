const Parser = require("rss-parser");
const fs = require("fs");
const https = require("https");
var fetch = require("node-fetch");

const parser = new Parser();

const lastFailedDownload = 173; // last successful one was 75, so put this as 76...

async function downloadEm(url) {
  const data = await parser.parseURL(url);
  console.log(data.title);
  const eps = data.items;

  const len = eps.length - 1;
  let counter = lastFailedDownload;

  for (var i = len - lastFailedDownload; i >= 0; i--) {
    var ep = eps[i];
    if (!ep || !ep.enclosure || !ep.enclosure.url) continue;
    const res = await fetch(ep.enclosure.url);

    const numberStr = counter.toString();
    const padded = numberStr.padStart(5, "0");
    const path = `${__dirname}/downloads/${padded} - ${ep.title}.mp3`;

    console.log("downloading " + path);
    console.log(ep.link);
    const fileStream = fs.createWriteStream(path);
    await new Promise((resolve, reject) => {
      res.body.pipe(fileStream);
      res.body.on("error", reject);
      fileStream.on("finish", resolve);
    });
    counter++;
  }
}

downloadEm("https://revolutionspodcast.libsyn.com/rss/");
