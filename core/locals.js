const functions = require('./functions');
const authModule = require('./modules/authModule');

module.exports = {
  get: async req => {
    const { authUid } = req.cookies;
    const user = await authModule.getUser(authUid);

    const topics = functions.getTopics();

    return {
      pageTitle: 'Kerdo UPT 0.01',

      topics,
      user
    };
  }
};
