// Firebase config — sourced from your .env values
const firebaseConfig = {
  apiKey: "AIzaSyB3fl7dn8lv81VcAbR28KSgUXMjMw9KxcA",
  authDomain: "dev-campus-56014.firebaseapp.com",
  projectId: "dev-campus-56014",
  storageBucket: "dev-campus-56014.firebasestorage.app",
  messagingSenderId: "805713699705",
  appId: "1:805713699705:web:b38cddb48871211b8ac5a8",
  measurementId: "G-S5YMC2JLQ2"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db   = firebase.firestore();
