//** File is getting too bulky.  Needs to be broken into pieces.  ie: common functions
//** like $(x) could be placed in their own file.

fetchData();
//purgeCloudData();
function fetchData() {
  ///*
  //Live Code
  chrome.storage.sync.get(["profiles"], function(obj) {
    if (obj) {
      const savedSearches = obj.profiles ? obj.profiles : {};
      checkForNoProfiles(savedSearches);
    }
  });
  //*/
  /*
  //Local Code
  const obj = { profiles: savedData() };
  const savedSearches = obj.profiles;
  loadProfiles(savedSearches);
  //*/
}
function checkForNoProfiles(savedSearches) {
  if (Object.keys(savedSearches).length) {
    console.log("Prof");
    loadProfiles(savedSearches);
  } else {
    console.log("No prof");
    const profileName = prompt("Enter your first profile name");
    const profileObj = {
      [profileName]: [{ name: "Add New Links!", link: "http://poe.trade" }],
      lastActive: profileName
    };
    saveUserProfiles(profileObj);
    loadProfiles(profileObj);
  }
}
//Creates the dropdown menu on page load
function loadProfiles(savedSearches) {
  console.log("LP obj: ", savedSearches);
  //Create the dropdown menu
  //** Bukly function, needs to be broken apart
  let dropdownDIV = $("dropdownDIV");
  let lastActive = returnNewLastActive(savedSearches);
  console.log("last active: ", lastActive);
  let profileInputField = $("selectedProfile");
  profileInputField.value = lastActive;
  profileInputField.addEventListener("click", eraseInput);

  let dropdownDatalist = $("profiles");
  if (dropdownDatalist) {
    dropdownDIV.removeChild(dropdownDatalist);
  }
  dropdownDatalist = $c("datalist");
  dropdownDatalist.id = "profiles";

  //Grab saved profile names and populate dropdown and removes "lastActive"
  const sortedSearches = returnKeysWithoutLastActive(savedSearches);
  //Only create links if there are profiles
  if (sortedSearches && sortedSearches.length) {
    let options = sortedSearches.forEach(function(profileName) {
      let option = $c("option");
      let node = $t(profileName);
      option.value = profileName;
      option.appendChild(node);
      dropdownDatalist.appendChild(option);
    });

    profileInputField.onchange = function(event) {
      const profileInput = profileInputField.value;
      if (savedSearches[profileInput]) {
        updateLastActive(savedSearches, profileInput);
        profileLinksManager(savedSearches, profileInput);
      } else {
        createNewProfile(savedSearches, profileInput);
      }
    };
    dropdownDIV.appendChild(dropdownDatalist);
    profileLinksManager(savedSearches, lastActive);
    createButtons(savedSearches, lastActive);
  }
}
//Manages the creation of a list of links in a given profile
function profileLinksManager(savedSearches, profile) {
  console.log(savedSearches.lastActive);
  let listDIV = $("linkList");
  let nav = $("nav");
  //Remove any previous links if they exist
  if (nav) {
    listDIV.removeChild(nav);
  }
  nav = $c("nav");
  nav.id = "nav";
  if (savedSearches[profile] && savedSearches[profile][0].link) {
    //Creates and populates the links in a profile if they exist
    let links = savedSearches[profile].forEach(function(linkInfo, i) {
      let newDiv = $c("div");
      newDiv.className = "row";
      let regLink = createLinks(linkInfo);
      let liveLink = createLinks(linkInfo, 1);
      let deleteButton = createDeleteRowButton(savedSearches, profile, i);
      newDiv.appendChild(regLink);
      newDiv.appendChild(liveLink);
      newDiv.appendChild(deleteButton);
      nav.appendChild(newDiv);
    });
  } else if (savedSearches[profile]) {
    console.log(savedSearches[profile]);
    //If the profile exists but there aren't any links yet
    let para = $c("p");
    let node = $t(savedSearches[profile][0].name);
    para.appendChild(node);
    nav.appendChild(para);
  } else {
    //ruh roh
    console.log("Halp, no profile found");
  }
  listDIV.appendChild(nav);
  createButtons(savedSearches, profile);
}
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
function createDeleteRowButton(savedSearches, profile, row) {
  let button = $c("BUTTON");
  let node = $t("x");
  button.appendChild(node);
  button.type = "button";
  button.className = "deleteRowButton";
  button.addEventListener(
    "click",
    deleteRow.bind(this, savedSearches, profile, row)
  );
  return button;
}
function deleteRow(savedSearches, profile, row) {
  let updatedSearches = Object.assign({}, savedSearches);
  updatedSearches[profile] = updatedSearches[profile].filter(
    (_, i) => i !== row
  );
  if (!updatedSearches[profile].length) {
    updatedSearches[profile] = [
      { name: "Add New Links!", link: "http://poe.trade" }
    ];
  }
  saveUserProfiles(updatedSearches);
  profileLinksManager(updatedSearches, profile);
}
function eraseInput(event) {
  event.target.value = "";
}
function createNewProfile(savedSearches, newProfile) {
  let addNewProfile = Object.assign({}, savedSearches);
  addNewProfile[newProfile] = [
    { name: "Add New Links!", link: "http://poe.trade" }
  ];
  saveUserProfiles(addNewProfile);
  profileLinksManager(addNewProfile, newProfile);
}
function createButtons(savedSearches, profile) {
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
    deleteProfile.bind(this, savedSearches, profile)
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
function purgeCloudData() {
  saveUserProfiles({});
}
function deleteProfile(savedSearches, profileToDelete) {
  let updatedProfs = Object.assign({}, savedSearches);
  delete updatedProfs[profileToDelete];
  delete updatedProfs.lastActive;
  updatedProfs.lastActive = returnNewLastActive(updatedProfs);
  saveUserProfiles(updatedProfs);
  loadProfiles(updatedProfs);
}
function loadAllLinks(savedSearches, profile, live) {
  savedSearches[profile].forEach(function(linkInfo) {
    const livePath = live ? "/live" : "";
    const url = `${linkInfo.link}${livePath}`;
    chrome.tabs.create({ url });
  });
}
function updateLastActive(savedSearches, lastActive) {
  let updateLastActive = Object.assign({}, savedSearches);
  updateLastActive.lastActive = lastActive;
  saveUserProfiles(updateLastActive);
}
function saveUserProfiles(data) {
  chrome.storage.sync.set({ profiles: data }, function() {
    console.log(`The following data was succesfully saved: ${data}`);
  });
}
//Grabs lastActive value.  If it doesn't exist yet, assign it the first
//profile (alphabetically) or if there are no profiles, returns ""
function returnNewLastActive(obj) {
  console.log("Returning LA: ", obj);
  let lastActive = obj.lastActive;
  let profileNames = returnKeysWithoutLastActive(obj);
  if (!lastActive && profileNames.length) {
    lastActive = profileNames.sort()[0];
  } else if (!lastActive && !profileNames.length) {
    lastActive = "";
  }
  return lastActive;
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
function returnKeysWithoutLastActive(savedSearches) {
  const remove = "lastActive";
  const sortedSearches = Object.keys(savedSearches)
    .filter(_ => _ !== remove)
    .sort();
  return sortedSearches;
}
function $(x) {
  return document.getElementById(x);
}
function $c(x) {
  return document.createElement(x);
}
function $t(x) {
  return document.createTextNode(x);
}
//mock data placed in a function to hide at the bottom of the file
function savedData() {
  return {
    Interrobang: [
      { name: "Inpulsa", link: "http://poe.trade/search/goaomaninausiw" },
      {
        name: "Flask Effect Belt",
        link: "http://poe.trade/search/nigahumesinina"
      },
      { name: "Boots", link: "http://poe.trade/search/sikoosihigohot" },
      { name: "+2 Ring", link: "http://poe.trade/search/utenorurarenan" },
      {
        name: "Purity Amulet",
        link: "http://poe.trade/search/euzuamarahahei"
      },
      { name: "+30% Gloves", link: "http://poe.trade/search/ohokahokakohiw" },
      { name: "RF Jewel", link: "http://poe.trade/search/nitounomionoko" },
      {
        name: "Taste of Hate",
        link: "http://poe.trade/search/amohokerumenik"
      },
      {
        name: "Watcher 1-Stat",
        link: "http://poe.trade/search/huramariteraga"
      },
      {
        name: "Corrupted Ahn's",
        link: "http://poe.trade/search/ioninariyotoni"
      },
      {
        name: "Purity of Ice 21",
        link: "http://poe.trade/search/utonosikikiwok"
      }
    ],
    Sham: [
      {
        name: "Shav No Links/Slots",
        link: "http://poe.trade/search/inobawohitonod"
      },
      {
        name: "Doryani's Catalyst",
        link: "http://poe.trade/search/hasoisoyomomon"
      },
      { name: "Shield", link: "http://poe.trade/search/onokurahoyomeb" },
      {
        name: "Basic Gloves",
        link: "http://poe.trade/search/ikanotawokomas"
      },
      { name: "Boots", link: "http://poe.trade/search/ahahimenausaso" }
    ],
    Aritani: [
      {
        name: "Rings - Inquis",
        link: "http://poe.trade/search/tomitatororeto"
      },
      {
        name: "Boots - Inquis",
        link: "http://poe.trade/search/okoasihoyenomo"
      },
      {
        name: "Jewel - Inquis",
        link: "http://poe.trade/search/adamosisiozuku"
      },
      {
        name: "Belt - Inquis",
        link: "http://poe.trade/search/kisomomhitasin"
      }
    ]
  };
}
