# Leef Browser Plugin Development Guide

Welcome to the Leef Browser Plugin System! This guide explains how to build, test, and publish custom plugins that can securely execute Javascript, inject CSS into web pages, and customize the browser UI.

## How it works

Leef Browser uses a fully decoupled, offline-first Plugin System:
1. **Discovery:** Leef connects to your GitHub repository and dynamically scans the `plugins/` directory to fetch the `manifest.json` for every plugin.
2. **Installation & Offline Ready:** When a user installs your plugin, it downloads the raw `plugin.js` and securely evaluates it using standard Javascript modules. Plugins and their manifests are fully cached locally, meaning they work 100% offline after installation.
3. **Execution:** The plugin runs in the isolated renderer process with access to a special `api` object to interact safely with the browser and webviews.

---

## Creating Your First Plugin

To create a new plugin, create a new folder inside the `plugins/` directory of your plugin repository (e.g., `plugins/my-new-plugin`).

Inside that folder, create two essential files: `manifest.json` and `plugin.js`.

### 1. `manifest.json`

This file tells the Plugin Store everything it needs to know about your plugin, including metadata and configuration settings.

```json
{
  "id": "my-new-plugin",
  "name": "My New Plugin",
  "description": "A short description of what your plugin does.",
  "version": "1.0.0",
  "author": "Your Name",
  "main": "plugin.js",
  "min_leef_version": "1.1.1",
  "config": [
    {
      "id": "enableDarkTheme",
      "label": "Enable Dark Theme Overlay",
      "type": "boolean",
      "default": true
    },
    {
      "id": "opacityLevel",
      "label": "Background Opacity",
      "type": "number",
      "default": 0.8
    },
    {
      "id": "themeColor",
      "label": "Theme Color",
      "type": "select",
      "options": ["red", "blue", "green"],
      "default": "blue"
    }
  ]
}
```

- **`id`**: A unique identifier (lowercase, no spaces).
- **`main`**: The entrypoint JS file for your plugin.
- **`min_leef_version`**: (Optional) Prevents users on older versions of Leef from installing your plugin if it uses newer APIs.
- **`config`**: (Optional) An array defining the settings UI for your plugin. Leef automatically generates a settings UI based on this schema and passes the user's choices into your plugin at runtime. Supported types are `boolean`, `number`, `string`, and `select`.

---

### 2. `plugin.js`

This is where your logic lives. Your Javascript must export a default ES6 Class with an `onEnable()` and `onDisable()` method. The browser will pass an `api` object into the constructor.

```javascript
export default class MyNewPlugin {
  constructor(api) {
    this.api = api;
  }

  onEnable() {
    // Access user settings defined in your manifest's 'config' schema
    const isDarkTheme = this.api.settings.enableDarkTheme;
    const opacity = this.api.settings.opacityLevel;
    const color = this.api.settings.themeColor;

    // 1. Inject CSS into the Browser UI itself
    this.api.addBrowserClass('my-custom-mode');
    
    // 2. Inject CSS directly into every Web Page
    if (isDarkTheme) {
      this.api.injectCSS(`body { background: ${color} !important; opacity: ${opacity}; }`);
    }
    
    // 3. Execute Javascript inside every Web Page (Great for injecting scripts or DOM elements)
    this.api.executeJavaScript(`console.log("Hello from Leef Plugin! The chosen color is ${color}");`);
  }

  onDisable() {
    // ALWAYS clean up your changes when the user disables your plugin!
    this.api.removeBrowserClass('my-custom-mode');
    this.api.removeCSS();
    
    // Automatically reloads web pages to wipe out injected JS state
    this.api.removeJS(); 
  }

  onSettings() {
    // Optional! If your plugin requires complex configuration beyond the simple declarative `config` schema, 
    // you can define this method. When the user clicks the gear icon, this code runs. 
    // You can show an alert(), open a custom modal, etc.
    alert("Advanced settings initialized!");
  }
}
```

---

## The Leef Plugin API

When your plugin is instantiated, it receives an `api` object with the following properties and methods:

### Properties
- **`api.settings`**: A Javascript object containing the user's current configuration values, mapped from the `config` schema in your `manifest.json`. For example, `this.api.settings.themeColor`.

### Methods
- **`api.addBrowserClass(className)`**: Adds a CSS class to the main Leef Browser UI `<body>`. Use this to theme or modify the browser interface itself.
- **`api.removeBrowserClass(className)`**: Removes a CSS class from the Leef Browser UI. Always call this in `onDisable()`.
- **`api.injectCSS(cssString)`**: Instantly applies CSS styling to **all currently open web tabs** and any future tabs you open.
- **`api.removeCSS()`**: Reverts the injected CSS from all web tabs. Always call this in `onDisable()`.
- **`api.executeJavaScript(jsString)`**: Injects and executes raw Javascript code into the DOM of **all open web tabs**. 
- **`api.removeJS()`**: Tells the browser to hard-reload all web tabs to scrub out any Javascript state or DOM elements your plugin injected. Always call this in `onDisable()` if you injected JS.

---

## Publishing Your Plugin

Because the Plugin Store dynamically scans the GitHub API, publishing is incredibly easy and entirely decentralized:

1. Commit your new plugin folder to the `plugins/` directory of a public GitHub repository.
2. (Recommended) If you want it in the official store, open a Pull Request to the official `git-QTech/leef-plugins` repository.
3. Users can instantly install your plugin using a custom GitHub URL (e.g. `your-username/your-repo-name`) directly in the browser's Plugin Store "Installed" tab.

Happy hacking!
