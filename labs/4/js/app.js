// Assistance from ChatGPT for project structure and help with learning AJAX and Fetch API

import { Lang } from '../lang/en/en.js';

export class AppConfig {
  static API_BASE = 'https://ilakoukiaisa.com';
  static API_PATH = '/COMP4537/labs/4/api/definitions';

  static HEADER_JSON = 'application/json';
  static METHOD_GET = 'GET';
  static METHOD_POST = 'POST';
  static CORS_MODE = 'cors';

  static CLASS_OK = 'ok';
  static CLASS_ERR = 'err';
  static DISPLAY_BLOCK = 'block';
  static DISPLAY_NONE = 'none';

  static WORD_SRC = "^[A-Za-z][A-Za-z\\-']*$";
  static NO_DIGITS_SRC = '^[^\\d]*$';
  static TRIM_SRC = '^\\s+|\\s+$';

  static WORD_PATTERN = new RegExp(AppConfig.WORD_SRC);
  static NO_DIGITS_PATTERN = new RegExp(AppConfig.NO_DIGITS_SRC);
  static TRIM_PATTERN = new RegExp(AppConfig.TRIM_SRC, 'g');

  static I18N = Lang;
}

// Simple DOM utility functions
export class Dom {
  static byId(id) { return document.getElementById(id); }
  static text(el, msg) { el.textContent = msg; }
  static html(el, markup) { el.innerHTML = markup; }
  static show(el) { el.style.display = AppConfig.DISPLAY_BLOCK; }
  static hide(el) { el.style.display = AppConfig.DISPLAY_NONE; }
  static setClass(el, addName, removeName) {
    if (removeName) el.classList.remove(removeName);
    if (addName) el.classList.add(addName);
  }
  static value(el) { return (el.value || '').replace(AppConfig.TRIM_PATTERN, ''); }
  static escape(s) {
    return String(s)
      .replaceAll('&','&amp;').replaceAll('<','&lt;')
      .replaceAll('>','&gt;').replaceAll('"','&quot;')
      .replaceAll("'", '&#39;');
  }
}

// API interaction functions
export class DictionaryApi {
  static endpoint() { return `${AppConfig.API_BASE}${AppConfig.API_PATH}`; }
  static async create(word, definition) {
    const res = await fetch(DictionaryApi.endpoint(), {
      method: AppConfig.METHOD_POST,
      mode: AppConfig.CORS_MODE,
      headers: { 'Content-Type': AppConfig.HEADER_JSON },
      body: JSON.stringify({ word, definition })
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, data };
  }
  static async get(word) {
    const url = new URL(DictionaryApi.endpoint());
    url.searchParams.set('word', word);
    const res = await fetch(url.toString(), {
      method: AppConfig.METHOD_GET,
      mode: AppConfig.CORS_MODE,
      headers: { 'Accept': AppConfig.HEADER_JSON }
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, data };
  }
}

// Input validation functions
export class Validator {
  static isValidWord(word) {
    return word.length > 0 && AppConfig.WORD_PATTERN.test(word);
  }
  static isValidDefinition(definition) {
    const notEmpty = definition.length > 0;
    const noDigits = AppConfig.NO_DIGITS_PATTERN.test(definition);
    return notEmpty && noDigits;
  }
}

// Page-specific logic for store page
export class StorePage {
  static init() {
    if (Dom.byId('storeForm') === null) return;

    Dom.text(Dom.byId('title'), AppConfig.I18N.TITLE_STORE);
    Dom.text(Dom.byId('intro'), AppConfig.I18N.INTRO_STORE);
    Dom.text(Dom.byId('wordLabel'), AppConfig.I18N.LABEL_WORD);
    Dom.text(Dom.byId('wordHint'), AppConfig.I18N.HINT_WORD);
    Dom.text(Dom.byId('defLabel'), AppConfig.I18N.LABEL_DEF);
    Dom.text(Dom.byId('defHint'), AppConfig.I18N.HINT_DEF);
    Dom.text(Dom.byId('submitBtn'), AppConfig.I18N.BTN_CREATE);

    Dom.byId('storeForm').addEventListener('submit', StorePage.onSubmit);
  }
  static async onSubmit(evt) {
    evt.preventDefault();
    const word = Dom.value(Dom.byId('wordInput'));
    const definition = Dom.value(Dom.byId('defInput'));
    const statusEl = Dom.byId('status');

    if (!Validator.isValidWord(word)) {
      Dom.text(statusEl, AppConfig.I18N.MSG_WORD_INVALID);
      Dom.setClass(statusEl, AppConfig.CLASS_ERR, AppConfig.CLASS_OK);
      Dom.show(statusEl);
      return;
    }
    if (!Validator.isValidDefinition(definition)) {
      Dom.text(statusEl, AppConfig.I18N.MSG_DEF_INVALID);
      Dom.setClass(statusEl, AppConfig.CLASS_ERR, AppConfig.CLASS_OK);
      Dom.show(statusEl);
      return;
    }

    try {
      const result = await DictionaryApi.create(word, definition);
      if (result.ok === true) {
        const parts = [];
        if (typeof result.data.requestCount !== 'undefined') {
          parts.push(`${AppConfig.I18N.MSG_REQ_PREFIX}${result.data.requestCount}`);
        }
        if (typeof result.data.totalEntries !== 'undefined') {
          parts.push(`${AppConfig.I18N.MSG_TOTAL_PREFIX}${result.data.totalEntries}`);
        }
        if (typeof result.data.message === 'string') {
          parts.push(result.data.message);
        } else {
          parts.push(`${AppConfig.I18N.MSG_NEW_ENTRY_PREFIX} "${word} : ${definition}"`);
        }
        Dom.text(statusEl, parts.join(' • '));
        Dom.setClass(statusEl, AppConfig.CLASS_OK, AppConfig.CLASS_ERR);
        Dom.show(statusEl);
      } else {
        const msg = (result.data && result.data.message) ? result.data.message : AppConfig.I18N.MSG_SERVER_ERROR;
        Dom.text(statusEl, `Error: ${msg}`);
        Dom.setClass(statusEl, AppConfig.CLASS_ERR, AppConfig.CLASS_OK);
        Dom.show(statusEl);
      }
    } catch (err) {
      Dom.text(statusEl, `${AppConfig.I18N.MSG_NETWORK_PREFIX} ${String(err)}`);
      Dom.setClass(statusEl, AppConfig.CLASS_ERR, AppConfig.CLASS_OK);
      Dom.show(statusEl);
    }
  }
}

// Page-specific logic for search page
export class SearchPage {
  static init() {
    if (Dom.byId('searchForm') === null) return;

    Dom.text(Dom.byId('title'), AppConfig.I18N.TITLE_SEARCH);
    Dom.text(Dom.byId('intro'), AppConfig.I18N.INTRO_SEARCH);
    Dom.text(Dom.byId('wordLabel'), AppConfig.I18N.LABEL_WORD);
    Dom.text(Dom.byId('wordHint'), AppConfig.I18N.HINT_WORD);
    Dom.text(Dom.byId('searchBtn'), AppConfig.I18N.BTN_FIND);

    Dom.byId('searchForm').addEventListener('submit', SearchPage.onSearch);
  }
  static async onSearch(evt) {
    evt.preventDefault();
    const word = Dom.value(Dom.byId('searchInput'));
    const panel = Dom.byId('result');

    if (!Validator.isValidWord(word)) {
      Dom.html(panel, AppConfig.I18N.MSG_WORD_INVALID);
      Dom.setClass(panel, AppConfig.CLASS_ERR, AppConfig.CLASS_OK);
      Dom.show(panel);
      return;
    }

    try {
      const result = await DictionaryApi.get(word);
      if (result.ok === true && result.data && typeof result.data.definition === 'string') {
        const safeWord = Dom.escape(result.data.word || word);
        const safeDef = Dom.escape(result.data.definition);
        const req = (typeof result.data.requestCount !== 'undefined')
          ? ` • ${AppConfig.I18N.MSG_REQ_PREFIX}${result.data.requestCount}` : '';
        Dom.html(
          panel,
          `<div><span class="k">Word:</span> <span class="v">${safeWord}</span></div>
           <div><span class="k">Definition:</span> <span class="v">${safeDef}</span></div>
           <div class="muted">${req}</div>`
        );
        Dom.setClass(panel, AppConfig.CLASS_OK, AppConfig.CLASS_ERR);
        Dom.show(panel);
      } else {
        const fallback = AppConfig.I18N.MSG_NOT_FOUND_PREFIX.replace('{w}', word);
        const serverMsg = (result.data && result.data.message) ? String(result.data.message) : fallback;
        const req = (result.data && typeof result.data.requestCount !== 'undefined')
          ? `${AppConfig.I18N.MSG_REQ_PREFIX}${result.data.requestCount}, ` : '';
        Dom.html(panel, `${req}${Dom.escape(serverMsg)}`);
        Dom.setClass(panel, AppConfig.CLASS_ERR, AppConfig.CLASS_OK);
        Dom.show(panel);
      }
    } catch (err) {
      Dom.html(panel, `${AppConfig.I18N.MSG_NETWORK_PREFIX} ${Dom.escape(String(err))}`);
      Dom.setClass(panel, AppConfig.CLASS_ERR, AppConfig.CLASS_OK);
      Dom.show(panel);
    }
  }
}

// Bootstrapping logic
export class Boot {
  static start() {
    // Auto-detect which page to initialize
    StorePage.init();
    SearchPage.init();
  }
}
