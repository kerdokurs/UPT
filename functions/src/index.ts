import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();

//TODO: Migreeri funktsioonid Node.js süntaksi peale.
//* https://firebase.google.com/docs/firestore/manage-data/transactions?authuser=0#node.js

const indexRef = db.collection('index').doc('index');

export const onCategoryCreate = functions.firestore
  .document('sisu/{kategooria}')
  .onCreate(async (snap, context) => {
    const data: any = snap.data();

    const { id, title, order } = data;
    const uusKategooria = { id, title, order, teemad: {} };

    await db.runTransaction(async transaction => {
      const doc = await transaction.get(indexRef);

      if (doc.exists) {
        const { sisu }: any = doc.data();
        const uusSisu = { ...sisu };
        uusSisu[id] = uusKategooria;
        transaction.update(indexRef, { sisu: uusSisu });
      } else {
        const sisu: any = {};
        sisu[id] = uusKategooria;

        transaction.create(indexRef, { sisu });
      }
    });
  });

export const onCategoryDelete = functions.firestore
  .document('sisu/{kategooria}')
  .onDelete(async (snap, context) => {
    const data: any = snap.data();

    const { id } = data;

    await db.runTransaction(async transaction => {
      const doc = await transaction.get(indexRef);

      if (doc.exists) {
        const { sisu }: any = doc.data();
        const uusSisu: any = { ...sisu };
        delete uusSisu[id];

        transaction.update(indexRef, { sisu: uusSisu });
      }
    });
  });

export const onCategoryUpdate = functions.firestore
  .document('sisu/{kategooria}')
  .onUpdate(async (change, context) => {
    const data: any = change.after.data();

    const { id, title, order } = data;

    await db.runTransaction(async transaction => {
      const doc = await transaction.get(indexRef);

      if (doc.exists) {
        const { sisu }: any = doc.data();
        const uusSisu: any = { ...sisu };

        uusSisu[id].title = title;
        uusSisu[id].order = order;

        transaction.update(indexRef, { sisu: uusSisu });
      } else {
        const sisu: any = {};
        sisu[id] = { id, title, order, teemad: {} };

        transaction.create(indexRef, { sisu });
      }
    });
  });

/* export const onTopicCreate = functions.firestore
  .document('sisu/{kategooria}/teemad/{teema}')
  .onCreate((snap, context) => {
    const data: any = snap.data();

    const { id, title, category, order, shared } = data;

    if (shared) {
      const indexRef = db.collection('index').doc('index');

      return db.runTransaction(transaction => {
        return transaction.get(indexRef).then(doc => {
          const { sisu }: any = doc.data();
          const uusSisu: any = { ...sisu };

          if (uusSisu[category] == null) uusSisu[category] = { teemad: {} };
          uusSisu[category].teemad[id] = { id, title, order };

          transaction.update(indexRef, { sisu: uusSisu });
        });
      });
    } else return null;
  }); */

export const newUser = functions.auth.user().onCreate(user => {
  const { displayName, email, uid, photoURL } = user;

  return db
    .collection('kasutajad')
    .doc(uid)
    .set({
      uid,
      email,
      displayName,
      photoURL,
      admin: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
});
