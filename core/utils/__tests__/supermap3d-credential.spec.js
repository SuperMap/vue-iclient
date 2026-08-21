import {
  applySuperMap3DCredential,
  enableSuperMap3DProxyCookies,
  getCredentialRootUrl,
  getSuperMap3DIportalKey,
  isIportalProxyUrl,
  prepareSuperMap3DServiceAuth,
  registerSuperMap3DIportalKey
} from '../scene/supermap3d-credential';

describe('supermap3d-credential', () => {
  const portalUrl =
    'http://172.16.14.125:8195/portalproxy/0473bca11589edc9/iserver/services/map-world/rest/maps/world';
  const iserverUrl = 'http://172.16.14.12:8090/iserver/services/map-world/rest/maps/world';

  beforeEach(() => {
    registerSuperMap3DIportalKey(null);
    class Credential {
      constructor(value, name) {
        this.value = value;
        this.name = name;
        this._keymap = {};
      }

      addCredential(entries) {
        if (!Array.isArray(entries)) {
          return;
        }
        entries.forEach(item => {
          this._keymap[item.rooturl] = { type: item.type, value: item.value };
        });
      }
    }
    window.SuperMap3D = {
      Credential,
      CredentialType: {
        IPORTAL_KEY: 'key',
        ISERVER_TOKEN: 'token'
      },
      TrustedServers: {
        hosts: [],
        contains(url) {
          return this.hosts.some(item => url.includes(`${item.host}:${item.port}`));
        },
        add(host, port) {
          this.hosts.push({ host, port: String(port) });
        }
      }
    };
    window.SuperMap3D.Credential.CREDENTIAL = null;
  });

  afterEach(() => {
    registerSuperMap3DIportalKey(null);
    delete window.SuperMap3D;
    delete window.__SUPERMAP3D_IPORTAL_KEY__;
  });

  it('detects iPortal portalproxy urls', () => {
    expect(isIportalProxyUrl(portalUrl)).toBe(true);
    expect(isIportalProxyUrl(iserverUrl)).toBe(false);
    expect(getCredentialRootUrl(portalUrl)).toBe('http://172.16.14.125:8195/portalproxy');
  });

  it('applies IPORTAL_KEY as simple Credential so REST maps can append ?key=', () => {
    registerSuperMap3DIportalKey('iportal-default-key');
    expect(getSuperMap3DIportalKey()).toBe('iportal-default-key');
    expect(applySuperMap3DCredential(portalUrl)).toBe(true);
    expect(window.SuperMap3D.Credential.CREDENTIAL.value).toBe('iportal-default-key');
    expect(window.SuperMap3D.Credential.CREDENTIAL.name).toBe('key');
    expect(window.SuperMap3D.Credential.CREDENTIAL._keymap[portalUrl]).toEqual({
      type: 'key',
      value: 'iportal-default-key'
    });
  });

  it('reads iportal key from window when module key is empty', () => {
    window.__SUPERMAP3D_IPORTAL_KEY__ = 'window-key';
    expect(applySuperMap3DCredential(portalUrl)).toBe(true);
    expect(window.SuperMap3D.Credential.CREDENTIAL.value).toBe('window-key');
    expect(window.SuperMap3D.Credential.CREDENTIAL.name).toBe('key');
  });

  it('does not apply registered iportal key to direct iServer urls', () => {
    registerSuperMap3DIportalKey('iportal-default-key');
    expect(applySuperMap3DCredential(iserverUrl)).toBe(false);
    expect(window.SuperMap3D.Credential.CREDENTIAL).toBe(null);
  });

  it('applies ISERVER_TOKEN when credential value is provided', () => {
    expect(applySuperMap3DCredential(iserverUrl, { value: 'iserver-token' })).toBe(true);
    expect(window.SuperMap3D.Credential.CREDENTIAL.value).toBe('iserver-token');
    expect(window.SuperMap3D.Credential.CREDENTIAL.name).toBe('token');
  });

  it('overwrites simple Credential with the latest service credential', () => {
    applySuperMap3DCredential(portalUrl, { value: 'key-a' });
    applySuperMap3DCredential(portalUrl, { value: 'key-b' });
    applySuperMap3DCredential(iserverUrl, { value: 'token-a' });
    expect(window.SuperMap3D.Credential.CREDENTIAL.value).toBe('token-a');
    expect(window.SuperMap3D.Credential.CREDENTIAL.name).toBe('token');
  });

  it('adds portalproxy host to TrustedServers so SuperMap3D can send login cookies', () => {
    expect(enableSuperMap3DProxyCookies(portalUrl)).toBe(true);
    expect(enableSuperMap3DProxyCookies(iserverUrl)).toBe(false);
    expect(window.SuperMap3D.TrustedServers.hosts).toEqual([
      { host: '172.16.14.125', port: '8195' }
    ]);
  });

  it('prepares portalproxy auth with cookies even when no iportal key is registered', () => {
    expect(prepareSuperMap3DServiceAuth(portalUrl)).toBe(true);
    expect(window.SuperMap3D.TrustedServers.hosts).toEqual([
      { host: '172.16.14.125', port: '8195' }
    ]);
    expect(window.SuperMap3D.Credential.CREDENTIAL).toBe(null);
  });
});
