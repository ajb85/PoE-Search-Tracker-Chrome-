//** File is getting too bulky.  Needs to be broken into pieces.  ie: common functions
//** like $(x) could be placed in their own file.
import {
  $,
  $c,
  $t,
  exportProfiles,
  getProfileNames
} from "./modules/commonFunctions.js";
import { createLinks } from "./modules/linkList.js";
import {
  createDeleteRowButton,
  createButtons,
  createLoadAllButton,
  loadAllLinks
} from "./modules/buttons.js";

fetchData();
//purgeCloudData();
function fetchData() {
  chrome.storage.sync.get(["profiles"], function(obj) {
    if (obj) {
      const savedSearches = obj.profiles ? obj.profiles : {};
      checkForNoProfiles(savedSearches);
    }
  });
}
function checkForNoProfiles(savedSearches) {
  //As long as there is a profile, move on
  if (Object.keys(savedSearches).length) {
    //Profile "input" box
    let profileInputField = $("selectedProfile");
    profileInputField.addEventListener("click", eraseInput);
    let bindFillEmpty = fillEmptyInput.bind(this, savedSearches.lastActive);
    profileInputField.addEventListener("blur", bindFillEmpty);
    loadProfiles(savedSearches, bindFillEmpty);
  } else {
    //If no profile is found, ask for one
    let profileName;
    //Force user to enter a profile name
    while (!profileName) {
      profileName = prompt("Enter your first profile name");
    }
    createNewProfile(savedSearches, profileName);
  }
}
//Manages the creation of all the elements in the popup.
function loadProfiles(savedSearches, bindFillEmpty) {
  console.log("loadProfiles: ", savedSearches);
  //Parent div for the drop down menu
  let dropdownDIV = $("dropdownDIV");
  updateInputField(savedSearches, bindFillEmpty);
  //Populates the drop down list
  let dataListForDropDown = createDataList(savedSearches);
  dropdownDIV.appendChild(dataListForDropDown);
  //Populates the links attached to a profile
  profileLinksManager(savedSearches);
}
//Creates an initial value for the field and its onchange event
function updateInputField(savedSearches, bindFillEmpty) {
  console.log("updating Input for: ", savedSearches.lastActive);
  let profileInputField = $("selectedProfile");
  //Initial value
  profileInputField.value = savedSearches.lastActive;

  profileInputField.onchange = function(event) {
    profileInputField.removeEventListener("blur", bindFillEmpty);
    let newActiveProfile = Object.assign({}, savedSearches);
    newActiveProfile.lastActive = event.target.value;
    bindFillEmpty = fillEmptyInput.bind(this, newActiveProfile.lastActive);
    profileInputField.addEventListener("blur", bindFillEmpty);
    //if the profile exists, load it
    if (savedSearches[event.target.value]) {
      exportProfiles(newActiveProfile);
      loadProfiles(newActiveProfile, bindFillEmpty);
    } else {
      createNewProfile(savedSearches, event.target.value, bindFillEmpty);
    }
  };
}
function createDataList(savedSearches) {
  let dropdownDatalist = $("profiles");
  if (dropdownDatalist) {
    dropdownDIV.removeChild(dropdownDatalist);
  }
  dropdownDatalist = $c("datalist");
  dropdownDatalist.id = "profiles";

  //Grab saved profile names and populate dropdown and removes "lastActive"
  const sortedSearches = getProfileNames(savedSearches);
  //Only create links if there are profiles
  if (sortedSearches && sortedSearches.length) {
    let options = sortedSearches.forEach(function(profileName) {
      let option = $c("option");
      let node = $t(profileName);
      option.value = profileName;
      option.appendChild(node);
      dropdownDatalist.appendChild(option);
    });
    return dropdownDatalist;
  }
}
//Populates the links for the active profile
function profileLinksManager(savedSearches) {
  let profile = savedSearches.lastActive;
  console.log("profileLinksManager");
  //100-107 is just for DOM manipulation
  //Parent div for profile dataList
  let listDIV = $("linkList");
  let nav = $("nav");
  //Remove any previous links if they exist
  if (nav) {
    listDIV.removeChild(nav);
  }
  nav = $c("nav");
  nav.id = "nav";
  if (savedSearches[profile] && savedSearches[profile].length) {
    //Creates and populates the links in a profile if they exist
    let links = savedSearches[profile].forEach(function(linkInfo, i) {
      let newDiv = $c("div");
      newDiv.className = "row";
      let regLink = createLinks(linkInfo);
      let liveLink = createLinks(linkInfo, 1);
      let deleteButton = createDeleteRowButton(
        savedSearches,
        profile,
        i,
        profileLinksManager
      );
      newDiv.appendChild(regLink);
      newDiv.appendChild(liveLink);
      newDiv.appendChild(deleteButton);
      nav.appendChild(newDiv);
    });
  } else if (savedSearches[profile]) {
    console.log(profile, " has no links D:");
  } else {
    //ruh roh something broke
    console.log("Halp, no profile found in LinkMgmt");
  }
  listDIV.appendChild(nav);
  createButtons(savedSearches, loadProfiles);
}
function eraseInput(event) {
  event.target.value = "";
}
function fillEmptyInput(lastActive) {
  console.log("Filling empty input: ", lastActive);
  let profileField = $("selectedProfile");
  if (profileField.value === "") {
    profileField.value = lastActive;
  }
}
function createNewProfile(savedSearches, newProfile, bindFillEmpty) {
  console.log("New profile: ", newProfile);
  let addNewProfile = Object.assign({}, savedSearches);
  addNewProfile[newProfile] = [
    { name: "Add New Links!", link: "http://poe.trade", starter: 1 }
  ];
  addNewProfile.lastActive = newProfile;
  exportProfiles(addNewProfile);
  loadProfiles(addNewProfile, bindFillEmpty);
}

function purgeCloudData() {
  exportProfiles({});
}
function deleteIfExists(elementID, element) {
  let getEleID = $(elementID);
  let parent = getEleID.parentNode;
  if (getEleID) {
    parent.removeChild(getEleID);
  }
  getEleID = $c(element);
  return getEleID;
}
