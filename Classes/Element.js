class Element {
  constructor(element, id, className) {
    this.element = document.createElement(element);
    this.id = id;
    this.className = className;
    this.create();
  }
  create() {
    for (let key in this) {
      if (key !== "textNode") {
        this.element[key] = this[key];
      } else {
        this.element.appendChild(document.createTextNode(this.textNode));
      }
    }
  }
  add(newChildren) {
    if (!Array.isArray(newChildren)) {
      newChildren = [newChildren];
    }
    newChildren.forEach(child => {
      this.element.appendChild(child);
    });
  }
  listener(listenEvent, callback) {
    this.element.addEventListener(listenEvent, callback);
  }
  done() {
    return this.element;
  }
}
class Button extends Element {
  constructor(element, id, className, textNode, type) {
    super(element, id, className);
    this.textNode = textNode;
    this.type = type;
    this.create();
  }
}
class Link extends Element {
  constructor(element, id, className, href, target) {
    super(element, id, className);
    this.href = href;
    this.target = target;
    this.create();
  }
}
class Option extends Element {
  constructor(element, id, className, textNode, value) {
    super(element, id, className);
    this.textNode = textNode;
    this.value = value;
    this.create();
  }
}
export { Element, Button, Link, Option };
