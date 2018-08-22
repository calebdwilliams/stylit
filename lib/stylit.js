export class StyleSheetRegistry {
  constructor() {      
    this.adopters = new WeakMap();
    this.registry = new Map();
    this.observer = new MutationObserver(mutationsList => {
      mutationsList.forEach(mutation => {
        [...mutation.removedNodes].forEach(node => {
          if (this.adopters.has(node)) {
            this.adopters.delete(node);
          } else if (this.adopters.has(node.shadowRoot)) {
            this.adopters.delete(node.shadowRoot);
          }
        });
      });
    });
    
    this.observer.observe(document.body, {
      childList: true
    });
  }

  adopt(node, name) {
    const fromNode = this.adopters.get(node) || new Set();
    if (!fromNode.size) {
      this.adopters.set(node, fromNode);
    }
    if (!fromNode.has(name)) {
      node.appendChild(this.get(name));
      fromNode.add(name);
    } 
  }

  createSheet(textContent) {
    const sheet = document.createElement('style');
    sheet.textContent = textContent;
    return sheet;
  }

  define(name, value) {
    let sheetText;
    sheetText = value;
    this.registry.set(name, sheetText);
    return Promise.resolve({name});
  }

  get(name) {
    return this.createSheet(this.registry.get(name));
  }
  
  load(name, url) {
    return fetch(url)
      .then(response => response.text())
      .then(styleText => {
        this.define(name, styleText);
        return name;
      });
  }
}
