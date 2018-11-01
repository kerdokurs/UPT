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
      pageTitle: 'Kerdo UPT 0.1',

      _categories,
      user,
      admin
    };
  }
};
