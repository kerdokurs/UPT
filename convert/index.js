const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const admin = require('firebase-admin');
const creds = require('./creds.json');
admin.initializeApp({
  credential: admin.credential.cert(creds),
  databaseURL: 'https://kerdoupt.firebaseio.com',
});

require('dotenv').config();

const db = admin.firestore();
db.settings({
  host: 'localhost:8080',
  ssl: false,
});

//#region models
const categoryModel = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { collection: 'categories' }
);

const topicModel = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    parent: {
      type: String,
      required: true,
    },
    data: {
      type: String,
      required: true,
    },
    last_changed: {
      type: Date,
      required: false,
    },
  },
  { collection: 'topics' }
);
//#endregion

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  await mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const category = mongoose.model('category', categoryModel);
  const topic = mongoose.model('topic', topicModel);

  const categories = await category.find();
  const topics = await topic.find();

  transferData(categories, topics);
}

async function transferData(categories, topics) {
  const categoryBatch = db.batch();
  const topicBatch = db.batch();

  let i = 0;
  categories.forEach(async (category) => {
    const { id, title } = category;
    const data = {
      id,
      title,
      order: i++,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const ref = db.collection('sisu').doc(id);
    categoryBatch.set(ref, data);
  });

  topics = topics.sort((a, b) => a.parent > b.parent);

  const dict = { uldine: 0, dunaamika: 0, kinemaatika: 0, mehaanika: 0 };

  topics.forEach(async (topic) => {
    const { id, title, parent, data: content } = topic;

    const data = {
      id,
      title,
      category: parent,
      content,
      shared: true,
      order: dict[parent.toString()]++,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      modifiedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const ref = db.collection('sisu').doc(parent).collection('teemad').doc(id);
    topicBatch.set(ref, data);
  });

  await categoryBatch.commit();
  await topicBatch.commit();
  console.log('Converted!');
  await mongoose.disconnect();
}

main();
