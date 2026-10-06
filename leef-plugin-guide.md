# Leef Browser Plugin Development Guide

Welcome to the Leef Browser Plugin System! This guide explains how to build, test, and publish custom plugins that can securely execute Javascript and inject CSS into web pages.

## How it works

Leef Browser uses a fully decoupled Plugin System:
1. Leef connects to your GitHub repository and dynamically scans the `plugins/` directory.
2. It fetches the `manifest.json` for every plugin.
3. When a user installs your plugin, it downloads the raw `plugin.js` and securely evaluates it using standard Javascript modules. (Plugins are fully cached, meaning they work 100% offline after installation).

## Creating Your First Plugin

To create a new plugin, create a new folder inside the `plugins/` directory of this repository (e.g., `plugins/my-new-plugin`).

Inside that folder, create two files: `manifest.json` and `plugin.js`.

### 1. manifest.json

This file tells the Plugin Store everything it needs to know about your plugin.

```json
{
  "id": "my-new-plugin",
  "name": "My New Plugin",
  "description": "A short description of what your plugin does.",
  "version": "1.0.0",
  "author": "Your Name",
  "main": "plugin.js",
  "min_leef_version": "1.1.1" 
}
```

- `id`: A unique identifier (lowercase, no spaces).
- `min_leef_version`: (Optional) Prevents users on older versions of Leef from installing your plugin if it uses newer APIs.

### 2. plugin.js

This is where your logic lives. Your Javascript must export a default ES6 Class with an `onEnable()` and `onDisable()` method. The browser will pass an `api` object into the constructor.

```javascript
export default class MyNewPlugin {
  constructor(api) {
    this.api = api;
  }

  onEnable() {
    // 1. Inject CSS into the Browser UI itself
    this.api.addBrowserClass('my-custom-mode');
    
    // 2. Inject CSS directly into every Web Page
    this.api.injectCSS(`body { background: red !important; }`);
    
    // 3. Execute Javascript inside every Web Page (Great for injecting scripts or DOM elements)
    this.api.executeJavaScript(`console.log("Hello from Leef Plugin!");`);
  }

  onDisable() {
    // ALWAYS clean up your changes when the user disables your plugin!
    this.api.removeBrowserClass('my-custom-mode');
    this.api.removeCSS();
    
    // Automatically reloads web pages to wipe out injected JS state
    this.api.removeJS(); 
  }

  onSettings() {
    // Optional! If you include this method, a Gear icon (⚙️) will appear next to your plugin.
    // When the user clicks it, this code runs. You can show an alert(), open a modal, etc.
    alert("Welcome to the Settings for My New Plugin!");
  }
}
```

## The Leef Plugin API

When your plugin is instantiated, it receives an `api` object with the following methods:

- `api.addBrowserClass(className)`: Adds a CSS class to the main Leef Browser UI `<body>`.
- `api.removeBrowserClass(className)`: Removes a CSS class from the Leef Browser UI.
- `api.injectCSS(cssString)`: Instantly applies CSS styling to **all currently open web tabs** and any future tabs you open.
- `api.removeCSS()`: Reverts the injected CSS from all web tabs.
- `api.executeJavaScript(jsString)`: Injects and executes raw Javascript code into the DOM of **all open web tabs**. 
- `api.removeJS()`: Tells the browser to hard-reload all web tabs to scrub out any Javascript state or DOM elements your plugin injected. 

## Publishing

Because the Plugin Store dynamically scans the GitHub API, publishing is incredibly easy:

1. Commit your new plugin folder to the `plugins/` directory of your GitHub repository.
2. Push your code.
3. Your plugin will instantly appear in the Plugin Store for all Leef users!
