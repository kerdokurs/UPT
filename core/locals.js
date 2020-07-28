const functions = require('./functions');
const authModule = require('./modules/authModule');

const ROLES = require('./roles');

const moment = require('moment');

module.exports = {
  get: async req => {
    const session = (await authModule.getSession(req)) || {};
    const user = (await authModule.getUser(session.uid)) || null;

    const _categories = (await functions.getCategories()) || [];

    let admin = false;
    let role = session ? session.role : 0;
    if (await authModule.isUserLoggedIn(req)) {
      admin = (await authModule.isUserAdmin(req)) || false;
    }

    return {
      pageTitle: 'Õppekeskkond',

      _categories,
      user,
      admin,
      moment: time =>
        '[' +
        moment(time)
          .locale('et')
          .format('LTS L') +
        ']',
      ROLES,
      role
    };
  }
};
