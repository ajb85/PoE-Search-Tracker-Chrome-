function $(x) {
  return document.getElementById(x);
}
function $c(x) {
  return document.createElement(x);
}
function $t(x) {
  return document.createTextNode(x);
}
function exportProfiles(data) {
  chrome.storage.sync.set({ profiles: data }, function() {
    console.log(`The following data was succesfully saved: ${data}`);
  });
}
function getProfileNames(savedSearches) {
  const remove = "lastActive";
  const sortedSearches = Object.keys(savedSearches)
    .filter(_ => _ !== remove)
    .sort();
  return sortedSearches;
}
function deleteIfExists(elementID, element) {
  let getEleID = $(elementID);
  if (getEleID) {
    getEleID.parentNode.removeChild(getEleID);
  }
}
export { $, $c, $t, exportProfiles, getProfileNames, deleteIfExists };
