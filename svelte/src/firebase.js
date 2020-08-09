import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDIL2H0gjIv0bWQ07p6Km0IGXEa_PoIxJo',
  authDomain: 'kerdoupt.firebaseapp.com',
  databaseURL: 'https://kerdoupt.firebaseio.com',
  projectId: 'kerdoupt',
  storageBucket: 'kerdoupt.appspot.com',
  messagingSenderId: '177350205015',
  appId: '1:177350205015:web:254e691873ae6dcf230d12',
};

firebase.initializeApp(firebaseConfig);

const firestore = firebase.firestore();

firestore.settings({
  host: 'localhost:8080',
  ssl: false,
});

export const db = firestore;
export const auth = firebase.auth();
export const googleProvider = new firebase.auth.GoogleAuthProvider();
