getUserProfilesOnLoad();

chrome.storage.onChanged.addListener(function(changes) {
  createTradeButtons(changes.profiles.newValue);
  let form = $("form");
  if (form) {
    form.parentNode.removeChild(form);
    createSavePopUp(changes.profiles.newValue);
  }
});

function getUserProfilesOnLoad() {
  chrome.storage.sync.get(["profiles"], function(obj) {
    if (Object.keys(obj.profiles).length) {
      createTradeButtons(obj.profiles);
    } else {
      let userJSON = prompt(
        "Please paste your existing JSON.",
        "Your JSON here"
      );
      if (userJSON) {
        saveUserProfiles(userJSON);
      }
    }
  });
}

function createTradeButtons(profiles) {
  let body = $("main");

  let newSearch = $("searchButton");
  if (newSearch) {
    body.removeChild(newSearch);
  }
  newSearch = newButton("Search", "New");
  newSearch.addEventListener("click", freshWindow.bind(this));

  let saveButton = $("saveButton");
  if (saveButton) {
    body.removeChild(saveButton);
  }
  saveButton = newButton("Save");
  saveButton.addEventListener("click", createSavePopUp.bind(this, profiles));

  let updateButton = $("updateButton");
  if (updateButton) {
    body.removeChild(updateButton);
  }
  updateButton = newButton("Update");
  updateButton.addEventListener("click", updateLink.bind(this, profiles));

  body.appendChild(saveButton);
  body.appendChild(newSearch);
  body.appendChild(updateButton);
}
function newButton(type, buttonText) {
  type = type.toLowerCase();
  let button = $c("BUTTON");
  button.id = `${type}Button`;
  button.className = type;
  button.type = "button";
  const node = buttonText
    ? $t(capitalize(buttonText.toLowerCase()))
    : $t(capitalize(type));
  button.appendChild(node);

  return button;
}
function capitalize(words) {
  return words
    .split(" ")
    .map(word => word[0].toUpperCase() + word.substr(1))
    .join(" ");
}
function saveUserProfiles(data) {
  chrome.storage.sync.set({ profiles: data }, function() {
    //console.log("saved: ", data);
  });
}
function saveURL(profiles) {
  const selectedProfile = $("profileButton").firstChild.nodeValue;
  const updating = $("updateField").value;
  let name = $("newName").value;
  if (updating && !name) {
    name = updating;
  }
  let link = window.location.href;
  //Verify a name is given before running
  if (!name) {
    $("newName").className = "newName badInput";
  } else {
    //remove live links if saved by mistake
    link = link.replace("/live", "");
    let updatedProfile = Object.assign({}, profiles);
    if (updating !== "blank") {
      updatedProfile[selectedProfile] = updatedProfile[selectedProfile].map(
        function(linkInfo) {
          if (linkInfo.name === updating) {
            return { name, link };
          } else {
            return linkInfo;
          }
        }
      );
    } else {
      updatedProfile[selectedProfile].push({ name, link });
    }
    saveUserProfiles(updatedProfile);
    closePopUp();
  }
}
function createSavePopUp(profiles) {
  //Encompassing form
  let form = $c("FORM");
  form.className = "savePopUp";
  form.id = "form";

  //Form Title
  let h2 = $c("H2");
  h2.appendChild($t("Save Current Link"));
  form.appendChild(h2);

  //Section Titles
  createTitleText("profileText", "Profile:", form);
  createTitleText("updateText", "Update Existing:", form);
  form.appendChild($c("BR"));

  //Parent div for the dropdown
  let pDiv = createDropDownButton(profiles);
  form.appendChild(pDiv);

  //Option to update existing link instead of saving new
  //Change to dropdown, populated with links.  First is empty
  let update = updateExistingDD(profiles[profiles.lastActive]);
  form.appendChild(update);
  form.appendChild($c("BR"));

  //Update Link input
  createTitleText("nameText", "Link Name:", form);
  form.appendChild($c("BR"));
  let name = $c("INPUT");
  name.type = "text";
  name.className = "newName";
  name.id = "newName";
  form.appendChild(name);

  //Save button
  let popUpSaveButton = CreatePopUpButton("saveButtonPU", "Save");
  popUpSaveButton.onclick = saveURL.bind(this, profiles);

  //Cancel Button
  let popUpCancelButton = CreatePopUpButton("cancelButtonPU", "Cancel");
  popUpCancelButton.onclick = closePopUp;
  form.appendChild(popUpSaveButton);
  form.appendChild(popUpCancelButton);
  let body = $("main");
  body.appendChild(form);
  name.focus();

  function createDropDownButton(profiles) {
    //Parent div for the dropdown
    let pDiv = $("dropdownDIV");
    if (!pDiv) {
      pDiv = $c("DIV");
      pDiv.className = "dropdownDIV";
      pDiv.id = "dropdownDIV";
    }
    //Button to change profile
    let profileButton = $("profileButton");
    if (!profileButton) {
      profileButton = $c("BUTTON");
      profileButton.id = "profileButton";
      profileButton.className = "ddButton";
      profileButton.type = "button";
    }
    profileButton.onclick = dropDaMenu.bind(this, profiles);
    if (profileButton.firstChild) {
      profileButton.removeChild(profileButton.firstChild);
    }
    profileButton.appendChild($t(`${profiles.lastActive}`));
    window.onclick = closeOnWindowClick.bind(this);
    pDiv.appendChild(profileButton);

    //Drop down menu to show when button is clicked
    let cDiv = $("ddMenu");
    if (cDiv) {
      cDiv.parentNode.removeChild(cDiv);
    }
    cDiv = createDropDown(profiles);
    pDiv.appendChild(cDiv);
    return pDiv;
  }
  function updateExistingDD(profile) {
    let select = $c("select");
    select.className = "updateInput";
    select.id = "updateField";

    //By default, updateExisting will be blank
    let defaultOption = $c("option");
    defaultOption.value = "blank";
    defaultOption.appendChild($t(""));
    select.appendChild(defaultOption);

    //Populate list with link names from given profile
    profile.forEach(function(linkInfo) {
      if (!linkInfo.starter) {
        let option = $c("option");
        option.value = linkInfo.name;
        option.className = "ddOption";
        option.appendChild($t(linkInfo.name));
        select.appendChild(option);
      }
    });
    return select;
  }
  function CreatePopUpButton(type, buttonText) {
    let newButton = $c("BUTTON");
    newButton.type = "button";
    newButton.className = `${type} popUpButtons`;
    newButton.appendChild($t(buttonText));
    return newButton;
  }
  function createTitleText(eleID, text, parent) {
    let element = $(eleID);
    if (!element) {
      element = $c("SPAN");
      element.id = eleID;
      element.className =
        eleID === "profileText" ? "titleText profile" : "titleText";
      element.appendChild($t(text));
      parent.appendChild(element);
    }
  }
  function createDropDown(profiles) {
    //Child div for dropdown once button is clicked
    let cDiv = $c("DIV");
    cDiv.id = "ddMenu";
    cDiv.className = "ddMenu";
    let ddProfNames = getProfileNamesNoLA(profiles);
    ddProfNames.forEach(function(profName) {
      let para = $c("p");
      para.className = "ddLink";
      para.appendChild($t(profName));
      let updatedProfiles = Object.assign({}, profiles);
      updatedProfiles.lastActive = profName;
      para.onclick = reloadForm.bind(this, updatedProfiles);
      cDiv.appendChild(para);
    });
    return cDiv;
  }
}
function reloadForm(profiles) {
  closePopUp();
  createSavePopUp(profiles);
}
function dropDaMenu(profiles) {
  document.getElementById("ddMenu").classList.toggle("show");
}
function closePopUp() {
  let form = $("form");
  form.parentNode.removeChild(form);
}

function freshWindow() {
  window.location.href = "poe.trade";
}
function updateLink(profiles) {}

function closeOnWindowClick(event) {
  if (!event.target.matches(".ddButton")) {
    let ddMenu = $("ddMenu");
    if (ddMenu.classList.contains("show")) {
      ddMenu.classList.remove("show");
    }
  }
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
function getProfileNamesNoLA(savedSearches) {
  const remove = ["lastActive", savedSearches.lastActive];
  const sortedSearches = Object.keys(savedSearches)
    .filter(prof => remove.indexOf(prof) === -1)
    .sort();
  return sortedSearches;
}
