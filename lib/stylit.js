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
    
    this._error = Symbol('error');
    this._pending = Symbol('pending');
    
    this.pending = new Set();
  }

  adopt(node, name) {
    const fromNode = this.adopters.get(node) || new Map();
    if (!fromNode.size) {
      this.adopters.set(node, fromNode);
    }
    if (!fromNode.has(name) && this.get(name) !== this._pending) {
      const sheet = this.get(name);
      node.appendChild(sheet);
      fromNode.set(name, sheet);
      return Promise.resolve(sheet);
    } else if (this.get(name) === this._pending) {
      return new Promise((resolve, reject) => {
        const interval = window.setInterval(() => {
          if (this.get(name)) {
            const sheet = this.get(name);
            if (sheet !== this._error && sheet !== this._pending) {
              node.appendChild(sheet);
              fromNode.set(name, sheet);
              resolve(sheet);
              window.clearInterval(interval);
            } else if (sheet === this._error) {
              reject();
              window.clearInterval(interval);
            }
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
    if (this.registry.get(name)) {
      const cssText = this.registry.get(name);
      if (cssText === this._pending || cssText === this._error) {
        return cssText;
      }
      return this.createSheet(cssText);  
    } else {
      throw new Error(``)
    }
  }
  
  load(name, url, config) {
    this.registry.set(name, this._pending);
    return fetch(url, config)
      .then(response => response.text())
      .then(styleText => {
        this.define(name, styleText);
        return name;
      })
      .catch(error => {
        this.define(name, this._error);
      });
  }
}
