import { $, $c, $t } from "./commonFunctions.js";
//Return for when there are no links in a profile yet
//Creates and returns a live or reg version of a link
function createLinks(linkInfo, live) {
  let newLink, node;
  newLink = $c("a");

  if (live) {
    node = $t("LIVE");
    newLink.href = `${linkInfo.link}/live`;
    newLink.className = "live";
  } else {
    node = $t(linkInfo.name);
    newLink.href = linkInfo.link;
    newLink.className = "nonLive";
  }
  newLink.target = "_blank";
  newLink.appendChild(node);
  return newLink;
}

export { createLinks };
