function $(x) {
  return document.getElementById(x);
}
function $c(x) {
  return document.createElement(x);
}
function $t(x) {
  return document.createTextNode(x);
}
export { $, $c, $t };
