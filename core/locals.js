const functions = require('./functions');
const authModule = require('./modules/authModule');

const moment = require('moment');

module.exports = {
  get: async req => {
    const session = (await authModule.getSession(req)) || {};
    const user = (await authModule.getUser(session.uid)) || null;

    const _categories = (await functions.getCategories()) || [];

    let admin = false;
    if (await authModule.isUserLoggedIn(req))
      admin = (await authModule.isUserAdmin(req)) || false;

    return {
      pageTitle: 'Kerdo UPT',

      _categories,
      user,
      admin,
      moment: time => '[' + moment(time).format('LTS L') + ']'
    };
  }
};
