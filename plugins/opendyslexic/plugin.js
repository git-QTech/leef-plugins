// plugin.js
export default class OpenDyslexicPlugin {
  constructor(api) {
    this.api = api;
  }

  onEnable() {
    this.api.addBrowserClass('opendyslexic-mode');
    
    // Inject CSS for the UI directly
    this.api.injectCSS(`* { font-family: 'OpenDyslexic', sans-serif !important; }`);
    
    // Inject Fontsource link into the head of all web pages
    const script = `
      if (!document.getElementById('leef-plugin-opendyslexic-font')) {
        const link = document.createElement('link');
        link.id = 'leef-plugin-opendyslexic-font';
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/@fontsource/opendyslexic/index.css';
        if (document.head) document.head.appendChild(link);
      }
    `;
    this.api.executeJavaScript(script);
  }

  onDisable() {
    this.api.removeBrowserClass('opendyslexic-mode');
    this.api.removeCSS();
    this.api.removeJS();
    
    const removeScript = `
      const fontLink = document.getElementById('leef-plugin-opendyslexic-font');
      if (fontLink) fontLink.remove();
    `;
    this.api.executeJavaScript(removeScript);
    // removeJS automatically reloads tabs, but we execute the cleanup just in case.
  }
}
