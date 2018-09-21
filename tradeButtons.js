getUserProfilesOnLoad();

function getUserProfilesOnLoad() {
  chrome.storage.sync.get(["profiles"], function(obj) {
    if (Object.keys(obj.profiles).length) {
      createTradeButtons(obj.profiles);
    } else {
      let userJSON = prompt(
        "Please paste your existing JSON.",
        "Your JSON here"
      );
      saveUserProfiles(userJSON);
    }
  });
}
function createTradeButtons(profiles) {
  let body = $("main");
  let saveButton = $c("BUTTON");
  saveButton.id = "saveButton";
  saveButton.className = "save";
  saveButton.type = "button";
  let node = $t("Save Link");
  saveButton.appendChild(node);
  saveButton.addEventListener("click", saveURL.bind(this, profiles));

  let newSearch = $c("BUTTON");
  newSearch.id = "searchButton";
  newSearch.className = "newSearch";
  newSearch.type = "button";
  let newSearchNode = $t("New Search");
  newSearch.appendChild(newSearchNode);
  newSearch.addEventListener("click", freshWindow.bind(this));

  body.appendChild(saveButton);
  body.appendChild(newSearch);
}
function saveUserProfiles(data) {
  chrome.storage.sync.set({ profiles: data }, function() {
    console.log(data);
  });
}
function saveURL(profiles) {
  const link = window.location.href;
  const name = prompt(
    `Name the link you're saving to profile ${profiles.lastActive}`,
    "name"
  );
  const profile = profiles.lastActive;
  profiles[profile].push({ name, link });
  saveUserProfiles(profiles);
  console.log("profiles: ", profiles);
}
function freshWindow() {
  window.location.href = "poe.trade";
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
