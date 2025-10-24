class EnText {
  static get keys() {
    return {
      init: {
        listening: 'Connected to MariaDB and ensured DB/table.',
        initFailed: 'Failed to initialize database'
      },
      http: {
        notFound: 'Not found',
        invalidJson: 'Invalid JSON body'
      },
      sql: {
        onlyPatientAllowed: 'Only INSERT INTO `patient` or SELECT ... FROM `patient` are allowed'
      },
      result: {
        ok: 'OK'
      }
    };
  }
}

module.exports = EnText;
