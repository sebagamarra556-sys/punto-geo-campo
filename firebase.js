import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import {
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import { getFirestore, doc, onSnapshot, setDoc } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';

const app = initializeApp({
  apiKey: 'AIzaSyB4le7ZejqnTC9UgczNQ78YrmAXr0dE4X4',
  authDomain: 'punto-geo-campo.firebaseapp.com',
  projectId: 'punto-geo-campo',
  storageBucket: 'punto-geo-campo.firebasestorage.app',
  messagingSenderId: '837823165533',
  appId: '1:837823165533:web:8c7057e923a15af693c9b4'
});

const auth = getAuth(app);
const db = getFirestore(app);
const workspace = doc(db, 'puntoGeo', 'equipo');
let stopWorkspace = null;

function syncError() {
  window.dispatchEvent(new CustomEvent('puntoGeo:sync-error'));
}

function localWorkspace() {
  try {
    return JSON.parse(localStorage.getItem('punto-geo-campo-v1') || '{"operators":[],"jobs":[],"agenda":[]}');
  } catch {
    return { operators: [], jobs: [], agenda: [] };
  }
}

function cloudCopy(data) {
  const safe = data || {};
  return {
    operators: safe.operators || [],
    jobs: (safe.jobs || []).map(({ photo, ...job }) => job),
    agenda: Array.isArray(safe.agenda) ? safe.agenda : [],
    updatedAt: new Date().toISOString()
  };
}

function hasRealData(data) {
  const safe = data || {};
  return (safe.jobs || []).length > 0 || (safe.operators || []).some(operator => operator.id !== 'op-1') || (safe.agenda || []).length > 0;
}

window.puntoGeoLogin = (email, password) => signInWithEmailAndPassword(auth, email, password);
window.puntoGeoResetPassword = email => sendPasswordResetEmail(auth, email);
window.puntoGeoLogout = () => signOut(auth);

window.addEventListener('puntoGeo:local-change', event => {
  if (!auth.currentUser) return;
  setDoc(workspace, cloudCopy(event.detail), { merge: true }).catch(syncError);
});

onAuthStateChanged(
  auth,
  user => {
    window.dispatchEvent(new CustomEvent('puntoGeo:auth', { detail: user }));

    if (stopWorkspace) {
      stopWorkspace();
      stopWorkspace = null;
    }
    if (!user) return;

    stopWorkspace = onSnapshot(
      workspace,
      snapshot => {
        const local = localWorkspace();
        if (!snapshot.exists() || (!hasRealData(snapshot.data()) && hasRealData(local))) {
          setDoc(workspace, cloudCopy(local), { merge: true }).catch(syncError);
          return;
        }

        const remote = snapshot.data();
        if (!Array.isArray(remote.agenda) && (local.agenda || []).length) {
          setDoc(workspace, { agenda: local.agenda, updatedAt: new Date().toISOString() }, { merge: true }).catch(syncError);
        }
        if (typeof window.puntoGeoApplyRemote === 'function') {
          window.puntoGeoApplyRemote(remote);
        }
      },
      syncError
    );
  },
  syncError
);

