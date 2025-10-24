/* 
  Disclosure: Structural scaffolding and comments assisted by ChatGPT.  
  All code has been prepared and is understood by me (Logan Dutton-Anderson). 
*/


/* All classes that model and manage notes + storage live here */

/* wraps localStorage read/write of the notes array. */
class NotesStore {
  /* Reads notes array from localStorage */
  static load() {
    if (typeof Storage === 'undefined') {
      throw new Error(MSG.notSupported);
    }
    const raw = localStorage.getItem(C.LS_NOTES_KEY);
    // If nothing is stored yet, return an empty array.
    if (raw === null) {
      return [];
    }
    try {
      const obj = JSON.parse(raw);
      // ensure we always return an array.
      return Array.isArray(obj) === true ? obj : [];
    } catch (e) {
      // Corrupt data? start fresh.
      return [];
    }
  }

  /* Writes notes array to localStorage. */
  static save(notesArray) {
    const json = JSON.stringify(notesArray);
    localStorage.setItem(C.LS_NOTES_KEY, json);
  }
}

/* Represents a single Note in memory and on the page. */
class Note {
  constructor(id, text) {
    // Unique id lets us remove/update correctly.
    this.id = id;
    this.text = text;
    // DOM elements are created in render() so we keep references here.
    this.rootEl = null;
    this.textEl = null;
    this.removeEl = null;
  }

  /* Creates the DOM for this note */
  render(isWriter) {
    // Outer wrapper
    this.rootEl = document.createElement('div');
    this.rootEl.className = C.CLASS.note;
    this.rootEl.dataset.id = String(this.id);

    // Textarea
    this.textEl = document.createElement('textarea');
    this.textEl.className = C.CLASS.noteText;
    this.textEl.placeholder = MSG.placeholder;
    this.textEl.value = this.text;
    // Reader page should be read-only
    this.textEl.readOnly = isWriter === true ? false : true;

    this.rootEl.appendChild(this.textEl);

    // Remove button exists only on writer page
    if (isWriter === true) {
      this.removeEl = document.createElement('button');
      this.removeEl.className = C.CLASS.noteRemove;
      this.removeEl.type = 'button';
      this.removeEl.textContent = MSG.remove;

      // when clicked, ask parent page to remove this note.
      this.removeEl.addEventListener('click', () => {
        if (typeof this.onRemove === 'function') {
          this.onRemove(this);
        }
      });

      this.rootEl.appendChild(this.removeEl);
    }

    return this.rootEl;
  }

  /* Returns a plain object suitable for JSON.stringify. */
  toJSON() {
    return { id: this.id, text: this.textEl === null ? this.text : this.textEl.value };
  }

  /* Updates internal text value from DOM */
  syncFromDom() {
    if (this.textEl !== null) {
      this.text = this.textEl.value;
    }
  }
}
