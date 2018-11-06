const functions = require('./functions');
const authModule = require('./modules/authModule');

module.exports = {
  get: async req => {
    const { uid } = req.cookies;
    const user = await authModule.getUser(uid);

    const _categories = await functions.getTopics();

    let admin = false;
    if (authModule.isUserLoggedIn(req))
      admin = await authModule.isUserAdmin(req);

    return {
      pageTitle: 'Kerdo UPT',

      _categories,
      user,
      admin
    };
  }
};
