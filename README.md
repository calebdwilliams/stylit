# Stylit

Stylit is a simple, small utility for creating CSS registries that can be reused in an application. The primary use-case for Stylit is for the `customElements` spec, specifically to keep CSS out of the custom element's mark up ([see templiteral for custom element markup and reactive data](https://www.npmjs.com/package/templiteral)).

## Installation

You can either copy and paste the code from [this repository](https://github.com/calebdwilliams/stylit/blob/master/lib/stylit.min.js) or you can [install Stylit into your project using NPM](https://docs.npmjs.com/cli/install).

## API 

To create a new style registry, import the `StyleSheetRegistry` into your application and/or webpage:

```javascript
import { StyleSheetRegistry } from 'stylit.js';

const registry = new StyleSheetRegistry();
```

The returned registry will give you access to several methods for creating and adopting style sheets.


### Define and use a style sheet

```javascript
import { StyleSheetRegistry } from 'stylit.js';
import { Component } from 'templiteral.js';

const registry = new StyleSheetRegistry();
registry.define('everything-tomato', `
* {
    color: tomato;
}
`);

customElements.define('test-component', class TestComponent extends Component {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    onInit() {
        registry
            .adopt(this.shadowRoot, 'everything-tomato')
            .then(styleElement => console.log(styleElement));
    }

    render() {
        this.html`
            <h1>This will be tomato-colored</h1>
            <p>This will too.</p>
        `;
    }
});
```

You can also define sheets from an external dependency for caching later:

```javascript
import { StyleSheetRegistry } from 'stylit.js';

const registry = new StyleSheetRegistry();

reg.load('lato', 'https://fonts.googleapis.com/css?family=Lato:300,400,400italic,700,700italic').then(console.log);
```

Attempting to adopt a non-defined stylesheet will currently trigger an interval until the sheet is defined. This could cause performance issues and will be addressed in a later release.

## Demo

You can see a [working demo of Stylit (and templiteral) on CodePen](https://codepen.io/calebdwilliams/pen/mXBryE).

## Is this a good idea?

To be honest, I'm not entirely sure yet. Feel free to open up an issue and/or pull request to help figure out if this is a worthwhile project.
