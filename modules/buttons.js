import {
  $,
  $c,
  $t,
  exportProfiles,
  getProfileNames
} from "./commonFunctions.js";
//Delete buttons
function createDeleteRowButton(savedSearches, profile, row, callback) {
  let button = $c("BUTTON");
  let node = $t("x");
  button.appendChild(node);
  button.type = "button";
  button.className = "deleteRowButton";
  button.addEventListener(
    "click",
    deleteRow.bind(this, savedSearches, profile, row, callback)
  );
  return button;
}
function deleteRow(savedSearches, profile, row, linkManager) {
  let updatedSearches = Object.assign({}, savedSearches);
  updatedSearches[profile] = updatedSearches[profile].filter(
    (_, i) => i !== row
  );
  if (!updatedSearches[profile].length) {
    updatedSearches[profile] = [
      { name: "Add New Links!", link: "http://poe.trade" }
    ];
  }
  exportProfiles(updatedSearches);
  linkManager(updatedSearches);
}

//Load All buttons
function createButtons(savedSearches, callback) {
  const profile = savedSearches.lastActive;
  let contentBG = $("contentBG");
  let buttonDIV = $("loadButtons");
  if (buttonDIV) {
    contentBG.removeChild(buttonDIV);
  }
  buttonDIV = $c("DIV");
  buttonDIV.id = "loadButtons";
  //** Stole from function above.  Could be re-written to only be used once.
  //** I wanted to get this running, leave me alone
  if (savedSearches[profile] && savedSearches[profile][0].link) {
    //Load All & Load Live buttons
    let button = createLoadAllButton(savedSearches, profile);
    let liveButton = createLoadAllButton(savedSearches, profile, 1);
    buttonDIV.appendChild(button);
    buttonDIV.appendChild(liveButton);
  }
  //Delete Profile BUTTON
  let deleteProfileButton = $c("BUTTON");
  deleteProfileButton.className = "delProfButton";
  const nodeDPB = document.createTextNode("Delete Profile");
  deleteProfileButton.appendChild(nodeDPB);
  deleteProfileButton.addEventListener(
    "click",
    deleteProfile.bind(this, savedSearches, profile, callback)
  );
  buttonDIV.appendChild(deleteProfileButton);
  contentBG.appendChild(buttonDIV);
}
function createLoadAllButton(savedSearches, profile, live) {
  let button = $c("button");
  button.type = "button";
  if (live) {
    button.className = "loadAllLive";
    const buttonText = $t("Load All LIVE");
    button.appendChild(buttonText);
    button.addEventListener(
      "click",
      loadAllLinks.bind(this, savedSearches, profile, 1)
    );
  } else {
    button.className = "loadAll";
    const buttonText = $t("Load All Links");
    button.appendChild(buttonText);
    button.addEventListener(
      "click",
      loadAllLinks.bind(this, savedSearches, profile)
    );
  }
  return button;
}
function loadAllLinks(savedSearches, profile, live) {
  savedSearches[profile].forEach(function(linkInfo) {
    const livePath = live ? "/live" : "";
    const url = `${linkInfo.link}${livePath}`;
    chrome.tabs.create({ url });
  });
}
function deleteProfile(savedSearches, profileToDelete, loadProfiles) {
  let updatedProfs = Object.assign({}, savedSearches);
  delete updatedProfs[profileToDelete];
  updatedProfs.lastActive = getProfileNames(updatedProfs).sort()[0];
  exportProfiles(updatedProfs);
  loadProfiles(updatedProfs);
}
export {
  createDeleteRowButton,
  createButtons,
  createLoadAllButton,
  loadAllLinks
};
