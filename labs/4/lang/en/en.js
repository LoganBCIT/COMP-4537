// Assistance from ChatGPT for project structure and help with learning AJAX and Fetch API

export class Lang {
  static TITLE_STORE = 'Store a Definition';
  static TITLE_SEARCH = 'Search a Definition';
  static INTRO_STORE = "This page sends a POST to Server 2's REST API.";
  static INTRO_SEARCH = "This page sends a GET to Server 2's REST API.";
  static LABEL_WORD = 'Word';
  static LABEL_DEF = 'Definition';
  static BTN_CREATE = 'Create Definition';
  static BTN_FIND = 'Find Definition';
  static HINT_WORD = "Letters only; hyphen ( - ) and apostrophe ( ' ) allowed.";
  static HINT_DEF = 'Required, and should not contain digits for this lab.';
  static MSG_WORD_INVALID = 'Validation error: word must be alphabetic and non-empty.';
  static MSG_DEF_INVALID = 'Validation error: definition must be non-empty and contain no digits.';
  static MSG_NEW_ENTRY_PREFIX = 'New entry recorded:';
  static MSG_SERVER_ERROR = 'Server returned an error.';
  static MSG_NETWORK_PREFIX = 'Network error:';
  static MSG_NOT_FOUND_PREFIX = "word '{w}' not found!";
  static MSG_REQ_PREFIX = 'Request # ';
  static MSG_TOTAL_PREFIX = 'Total entries: ';
}
