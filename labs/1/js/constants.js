/* 
  Disclosure: Structural scaffolding and comments assisted by ChatGPT.  
  All code has been reviewed and is understood by me (Logan Dutton-Anderson). 
*/


/* Centralized non-UI constants to avoid magic numbers & scattered strings. */
const C = {
  // LocalStorage key used by both pages
  LS_NOTES_KEY: 'comp4537.notes',

  // Poll/save intervals (ms)
  SAVE_INTERVAL_MS: 2000,
  FETCH_INTERVAL_MS: 2000,

  // CSS selectors / ids used by scripts
  SEL: {
    title: '#appTitle',
    name: '#studentName',
    toWriter: '#toWriter',
    toReader: '#toReader',
    back: '#backLink',
    stamp: '#timestamp',
    notesWrap: '#notes',
    addBtn: '#addBtn'
  },

  // CSS class names
  CLASS: {
    note: 'note',
    noteText: 'note__text',
    noteRemove: 'note__remove'
  }
};
