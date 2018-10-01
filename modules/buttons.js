import {
  $,
  exportProfiles,
  getProfileNames,
  deleteIfExists
} from "./commonFunctions.js";
import { Element, Button } from "../Classes/Element.js";
//Delete buttons
function createDeleteRowButton(savedSearches, profile, row, linkMgr) {
  let button = new Button("BUTTON", "", "deleteRowButton", "x", "button");
  button.listener(
    "click",
    deleteRow.bind(this, savedSearches, profile, row, linkMgr)
  );
  return button.done();
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
function createButtons(savedSearches, loadProf, noProf) {
  const profile = savedSearches.lastActive;
  let contentBG = $("contentBG");
  deleteIfExists("loadButtons");
  let buttonDIV = new Element("DIV", "loadButtons");
  //** Stole from function above.  Could be re-written to only be used once.
  //** I wanted to get this running, leave me alone
  if (savedSearches[profile] && savedSearches[profile][0].link) {
    //Load All & Load Live buttons
    let button = createLoadAllButton(savedSearches, profile);
    let liveButton = createLoadAllButton(savedSearches, profile, 1);
    buttonDIV.add([button, liveButton]);
  }
  //Delete Profile BUTTON
  let deleteProfileButton = new Button(
    "BUTTON",
    "",
    "deleteProf",
    "Delete Profile",
    "button"
  );
  deleteProfileButton.listener(
    "click",
    deleteProfile.bind(this, savedSearches, profile, loadProf, noProf)
  );
  buttonDIV.add(deleteProfileButton.done());
  contentBG.appendChild(buttonDIV.done());
}
function createLoadAllButton(savedSearches, profile, live) {
  let button;
  if (live) {
    button = new Button("BUTTON", "", "loadAllLive", "Load All LIVE", "button");
    button.listener(
      "click",
      loadAllLinks.bind(this, savedSearches, profile, 1)
    );
  } else {
    button = new Button("BUTTON", "", "loadAll", "Load All Links", "button");
    button.listener(
      "click",
      loadAllLinks.bind(this, savedSearches, profile, 0)
    );
  }
  return button.done();
}
function loadAllLinks(savedSearches, profile, live) {
  savedSearches[profile].forEach(function(linkInfo) {
    const livePath = live ? "/live" : "";
    const url = `${linkInfo.link}${livePath}`;
    chrome.tabs.create({ url });
  });
}
function deleteProfile(
  savedSearches,
  profileToDelete,
  loadProfiles,
  noProfiles
) {
  let updatedProfs = Object.assign({}, savedSearches);
  delete updatedProfs[profileToDelete];
  updatedProfs.lastActive = getProfileNames(updatedProfs).sort()[0];
  if (updatedProfs.lastActive) {
    exportProfiles(updatedProfs);
    loadProfiles(updatedProfs);
  } else {
    console.log("no");
    noProfiles({});
  }
}
export {
  createDeleteRowButton,
  createButtons,
  createLoadAllButton,
  loadAllLinks
};
