import firebase from 'firebase';
import '@firebase/firestore';
import config from '@/config/FirebaseConfig';

firebase.apps.length || (firebase.initializeApp(config));

export const db = firebase.firestore();
export const auth = firebase.auth();