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
    const fromNode = this.adopters.get(node) || new Map();
    if (!fromNode.size) {
      this.adopters.set(node, fromNode);
    }
    if (!fromNode.has(name) && this.get(name)) {
      const sheet = this.get(name);
      node.appendChild(sheet);
      fromNode.set(name, sheet);
      return Promise.resolve(sheet);
    } else if (!this.get(name)) {
      return new Promise(resolve => {
        const interval = window.setInterval(() => {
          if (this.get(name)) {
            const sheet = this.get(name);
            node.appendChild(sheet);
            fromNode.set(name, sheet);
            resolve(sheet);
            window.clearInterval(interval);
          }
        }, 200);
      });
    } else {
      return Promise.resolve(fromNode.get(name));
    }
  }

  createSheet(textContent) {
    const sheet = document.createElement('style');
    sheet.textContent = textContent;
    return sheet;
  }

  define(name, value) {
    this.registry.set(name, value);
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
