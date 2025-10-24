/* 
  Disclosure: Structural scaffolding and comments assisted by ChatGPT.  
  All code has been reviewed and is understood by me (Logan Dutton-Anderson). 
*/

/* Small class to label index page without inline text. */
class IndexPage {
  init() {
    document.querySelector(C.SEL.title).textContent = MSG.appTitle;
    document.querySelector(C.SEL.name).textContent = MSG.studentName;
    document.querySelector(C.SEL.toWriter).textContent = MSG.toWriter;
    document.querySelector(C.SEL.toReader).textContent = MSG.toReader;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const page = new IndexPage();
  page.init();
});
