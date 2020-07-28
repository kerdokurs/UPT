const router = require('express').Router();

const admin = require('../modules/firebase/admin');

const { prisma } = require('../prisma/client/index');

const authModule = require('../modules/authModule');

router.get('/login', async (req, res) => {
  if (await authModule.isUserLoggedIn()) res.redirect('/user/');
  else res.render('user/login');
});

router.get('/logout', async (req, res) => {
  req.session.destroy(err => {
    res.redirect('/user/');
  });
});

router.post('/login', async (req, res) => {
  const { uid } = req.query;

  if (uid) {
    const user = await prisma.user({ uid }).catch(err => console.error(err));

    if (user) {
      const { displayName, photoURL } = user;

      req.session.user = {
        uid,
        displayName,
        photoURL
      };

      await prisma.updateUser({
        data: {
          last_sign_in: new Date()
        },
        where: {
          uid
        }
      });

      res.redirect('/');
    } else {
      const user = await admin
        .auth()
        .getUser(uid)
        .catch(err => console.error(err));

      const { email, displayName, photoURL } = user;

      req.session.user = {
        uid,
        displayName,
        photoURL
      };

      await prisma.createUser({
        uid,
        displayName,
        photoURL,
        email,
        sign_up: new Date(),
        last_sign_in: new Date(),
        admin: false
      });
    }
  } else {
    //! Näita errorit
    res.redirect('/');
  }
});
