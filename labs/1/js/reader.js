/* 
  Disclosure: Structural scaffolding and comments assisted by ChatGPT.  
  All code has been reviewed and is understood by me (Logan Dutton-Anderson). 
*/


/* Controls the reader.html page. Polls localStorage and displays notes read-only. */
class ReaderPage {
  constructor() {
    this.wrap = null;     // Notes container
    this.stamp = null;    // timestamp element
    this.fetchTimer = null;
  }

  init() {
    if (typeof Storage === 'undefined') {
      alert(MSG.notSupported);
      return;
    }

    this.wrap = document.querySelector(C.SEL.notesWrap);
    this.stamp = document.querySelector(C.SEL.stamp);

    // Label static text
    document.querySelector(C.SEL.title).textContent = MSG.appTitle;
    document.querySelector(C.SEL.name).textContent = MSG.studentName;
    document.querySelector(C.SEL.back).textContent = MSG.back;

    // First load + render
    this.refresh(MSG.updatedAt);

    // Periodic refresh so it tracks writer automatically
    this.fetchTimer = setInterval(() => {
      this.refresh(MSG.updatedAt);
    }, C.FETCH_INTERVAL_MS);
  }

  /* Pull notes from storage and render them read-only. */
  refresh(prefix) {
    const rawNotes = NotesStore.load(); // [{id,text}]
    // Clear container
    this.wrap.innerHTML = '';

    rawNotes.forEach(({ id, text }) => {
      const note = new Note(id, text);
      // "writer" flag is false → read-only textareas, no remove button
      const el = note.render(false);
      this.wrap.appendChild(el);
    });

    const now = new Date().toLocaleTimeString();
    this.stamp.textContent = `${prefix} ${now}`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const page = new ReaderPage();
  page.init();
});
