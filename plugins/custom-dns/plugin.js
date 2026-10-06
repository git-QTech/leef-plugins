export default class CustomDNSPlugin {
  constructor(api) {
    this.api = api;
  }

  onEnable() {
    if (this.api.settings && this.api.settings.dnsServer) {
      if (typeof this.api.setDNS === 'function') {
        this.api.setDNS(this.api.settings.dnsServer);
      } else {
        console.warn('Leef version does not support api.setDNS');
      }
    }
  }

  onDisable() {
    if (typeof this.api.setDNS === 'function') {
      // Revert to Cloudflare (1.1.1.1) which is Leef's default
      this.api.setDNS('https://cloudflare-dns.com/dns-query');
    }
  }
}
