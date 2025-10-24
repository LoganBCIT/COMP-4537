/* 
  Disclosure: Structural scaffolding and comments assisted by ChatGPT.  
  All code has been reviewed and is understood by me (Logan Dutton-Anderson). 
*/


/* Controls the writer.html page. All logic is inside this class. */
class WriterPage {
  constructor() {
    this.notes = [];               // Array<Note>
    this.wrap = null;              // Notes container element
    this.addBtn = null;            // "add" button
    this.stamp = null;             // timestamp element
    this.saveTimer = null;         // setInterval handle
    this.nextId = 1;               // simple id counter
  }

  /* Entry point: called once DOM is ready. */
  init() {
    // Basic feature check
    if (typeof Storage === 'undefined') {
      alert(MSG.notSupported);
      return;
    }

    // Cache DOM references
    this.wrap = document.querySelector(C.SEL.notesWrap);
    this.addBtn = document.querySelector(C.SEL.addBtn);
    this.stamp = document.querySelector(C.SEL.stamp);

    // Label UI text shown on the page
    document.querySelector(C.SEL.title).textContent = MSG.appTitle;
    document.querySelector(C.SEL.name).textContent = MSG.studentName;
    this.addBtn.textContent = MSG.add;
    document.querySelector(C.SEL.back).textContent = MSG.back;

    // Load any previously stored notes and render them
    this.loadExistingNotes();

    // Wire the "add" button
    this.addBtn.addEventListener('click', () => {
      this.addEmptyNote();
      // Save immediately after adding so reader sees it right away
      this.saveAll(MSG.storedAt);
    });

    // Start periodic auto-save
    this.saveTimer = setInterval(() => {
      this.saveAll(MSG.storedAt);
    }, C.SAVE_INTERVAL_MS);
  }

  /* Create Note instances from storage and render them. */
  loadExistingNotes() {
    const rawNotes = NotesStore.load();
    // Determine nextId safely
    if (rawNotes.length > 0) {
      const maxId = rawNotes.reduce((m, n) => (n.id > m ? n.id : m), 0);
      this.nextId = maxId + 1;
    }
    rawNotes.forEach(({ id, text }) => {
      const note = new Note(id, text);
      this.attachNote(note);
    });
  }

  /* Adds a brand new empty note to the UI and internal list. */
  addEmptyNote() {
    const note = new Note(this.nextId, '');
    this.nextId += 1;
    this.attachNote(note);
  }

  /* Shared routine: render note, add remove handler, push to list. */
  attachNote(note) {
    // Render in writer mode
    const el = note.render(true);
    // Define how this note removes itself
    note.onRemove = (n) => {
      // Remove from internal array
      this.notes = this.notes.filter((x) => x.id !== n.id);
      // Remove from DOM
      if (n.rootEl && n.rootEl.parentNode) {
        n.rootEl.parentNode.removeChild(n.rootEl);
      }
      // Save immediately so reader is in sync
      this.saveAll(MSG.storedAt);
    };

    this.wrap.appendChild(el);
    this.notes.push(note);
  }

  /* Gathers textarea values and persists the array to localStorage. */
  saveAll(prefix) {
    // Pull the latest text from DOM into each Note model
    this.notes.forEach((n) => n.syncFromDom());
    // Convert to plain objects and save
    const payload = this.notes.map((n) => n.toJSON());
    NotesStore.save(payload);
    // Update timestamp display
    const now = new Date().toLocaleTimeString();
    this.stamp.textContent = `${prefix} ${now}`;
  }
}

/* Boot the page when DOM is ready */
document.addEventListener('DOMContentLoaded', () => {
  const page = new WriterPage();
  page.init();
});
