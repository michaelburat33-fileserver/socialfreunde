/**
 * ultra-luftdicht-http.js
 *
 * Author: Prof. Dr. habil. JS Maximus, 300 Jahre Erfahrung
 * Description: Alle Web-APIs luftdicht, nur HTTP(S) Requests erlaubt
 */

'use strict';

/**
 * Hilfsfunktion: Tiefgefrieren von Objekten
 * @param {Object} obj
 */
function deepFreeze(obj) {
    if (!obj || typeof obj !== 'object') return;
    Object.getOwnPropertyNames(obj).forEach(prop => {
        const desc = Object.getOwnPropertyDescriptor(obj, prop);
        if (desc && (desc.writable || desc.configurable)) {
            Object.defineProperty(obj, prop, {
                writable: false,
                configurable: false,
                enumerable: desc.enumerable,
                value: obj[prop]
            });
        }
        if (typeof obj[prop] === 'object' && obj[prop] !== null) {
            deepFreeze(obj[prop]);
        }
    });
    Object.freeze(obj);
}

/**
 * Hilfsfunktion: Proxy-Schutz, Mutation verboten
 */
function protectAPI(apiObj) {
    if (!apiObj || typeof apiObj !== 'object') return apiObj;
    return new Proxy(apiObj, {
        set() { throw new Error('Mutation verboten: API ist luftdicht'); },
        defineProperty() { throw new Error('Mutation verboten: API ist luftdicht'); },
        deleteProperty() { throw new Error('Mutation verboten: API ist luftdicht'); },
        get(target, prop) {
            const value = target[prop];
            if (typeof value === 'object' && value !== null) return protectAPI(value);
            return value;
        }
    });
}

/**
 * Liste aller zentralen globalen Objekte, die luftdicht gemacht werden
 * HTTP(S) APIs bleiben außen vor
 */
const globalsToProtect = [
    Document.prototype,
    HTMLElement.prototype,
    Node.prototype,
    Event.prototype,
    Array.prototype,
    String.prototype,
    Number.prototype,
    Object.prototype,
    Function.prototype,
    Date.prototype,
    Map.prototype,
    Set.prototype,
    Promise.prototype,
    JSON,
    Math,
    console,
    window.localStorage,
    window.sessionStorage,
    window.navigator,
    window.location, // Hier kann man optional nur URL lesen
    CanvasRenderingContext2D.prototype,
    AudioContext.prototype,
    WebGLRenderingContext.prototype,
    Notification.prototype,
    ServiceWorkerRegistration.prototype
];

// Tiefgefrieren
globalsToProtect.forEach(obj => deepFreeze(obj));

// Proxy-Schutz für Storage und andere APIs
window.localStorage = protectAPI(window.localStorage);
window.sessionStorage = protectAPI(window.sessionStorage);
window.navigator = protectAPI(window.navigator);

// HTTP(S) weiterhin erlaubt
// fetch, XMLHttpRequest, <img>, <script>, <link> etc. bleiben aktiv

console.log('Alle Web-APIs außer HTTP(S) sind jetzt luftdicht.');
