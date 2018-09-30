const functions = require('./functions');
const authModule = require('./modules/authModule');

module.exports = {
  get: async req => {
    const { uid } = req.cookies;
    const user = await authModule.getUser(uid);

    const topics = functions.getTopics();

    return {
      pageTitle: 'Kerdo UPT 0.4',

      topics,
      user
    };
  }
};
