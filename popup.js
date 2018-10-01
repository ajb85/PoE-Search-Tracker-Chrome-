import {
  $,
  exportProfiles,
  getProfileNames,
  deleteIfExists
} from "./modules/commonFunctions.js";
import { createLinks } from "./modules/linkList.js";
import {
  createDeleteRowButton,
  createButtons,
  createLoadAllButton,
  loadAllLinks
} from "./modules/buttons.js";
import { Element, Option } from "./Classes/Element.js";

fetchData();
//Get data from Chrome storage
function fetchData() {
  chrome.storage.sync.get(["profiles"], function(obj) {
    if (obj) {
      const savedSearches = obj.profiles ? obj.profiles : {};
      checkForNoProfiles(savedSearches);
    }
  });
}
//If there are no profiles yet (or if they're deleted),
//User is prompted to input a profile name before continuing
function checkForNoProfiles(savedSearches) {
  //As long as there is a profile, move on
  if (Object.keys(savedSearches).length) {
    //Profile "input" box
    let profileInputField = $("selectedProfile");
    profileInputField.addEventListener("click", eraseInput);
    //bindFillEmpty saves the state of the listener so it can be
    //removed later
    const bindFillEmpty = fillEmptyInput.bind(this, savedSearches.lastActive);
    //
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
  //Parent div for the drop down menu
  let divForDD = $("dropdownDIV");
  updateProfileField(savedSearches, bindFillEmpty);
  //Populates the drop down list
  const datalistForDD = createDatalist(savedSearches);
  divForDD.appendChild(datalistForDD);
  //Populates the links attached to a profile
  populateProfilesLinks(savedSearches);
}
//Creates an initial value for the field and gives its onchange event
function updateProfileField(savedSearches, bindFillEmpty) {
  let profileInputField = $("selectedProfile");
  //Initial value
  profileInputField.value = savedSearches.lastActive;

  profileInputField.onchange = function(event) {
    //bindFillEmpty is passed around so the listener that deletes the input
    //when the field is clicked can be removed each this is ran.
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
function createDatalist(savedSearches) {
  deleteIfExists("profiles");
  let profilesList = new Element("datalist", "profiles");
  //Grab saved profile names and populate dropdown and removes "lastActive"
  const sortedProfileNames = getProfileNames(savedSearches);
  //Only create links if there are profiles
  if (sortedProfileNames && sortedProfileNames.length) {
    sortedProfileNames.forEach(function(profileName) {
      const option = new Option("option", "", "", profileName, profileName);
      profilesList.add(option.done());
    });
    return profilesList.done();
  }
}
//Populates the links for the active profile
function populateProfilesLinks(savedSearches) {
  const profile = savedSearches.lastActive;
  let divForLinkList = $("linkList");
  deleteIfExists("listOfLinks");
  let listOfLinks = new Element("nav", "listOfLinks");
  if (savedSearches[profile] && savedSearches[profile].length) {
    //Creates and populates the links in a profile if they exist
    savedSearches[profile].forEach(function(linkInfo, i) {
      let linkRow = new Element("div", "", "row");
      const regLink = createLinks(linkInfo);
      const liveLink = createLinks(linkInfo, 1);
      const deleteButton = createDeleteRowButton(
        savedSearches,
        profile,
        i,
        populateProfilesLinks
      );
      linkRow.add([regLink, liveLink, deleteButton]);
      listOfLinks.add(linkRow.done());
    });
  } else if (savedSearches[profile]) {
    console.log(profile, " has no links D:");
  } else {
    //ruh roh something broke
    console.log("Halp, no profile found in LinkMgmt");
  }
  divForLinkList.appendChild(listOfLinks.done());
  createButtons(savedSearches, loadProfiles, checkForNoProfiles);
}
function eraseInput(event) {
  event.target.value = "";
}
function fillEmptyInput(lastActive) {
  let profileField = $("selectedProfile");
  if (profileField.value === "") {
    profileField.value = lastActive;
  }
}
function createNewProfile(savedSearches, newProfile, bindFillEmpty) {
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
