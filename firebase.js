import {initializeApp} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import {getFirestore,doc,onSnapshot,setDoc} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';

const app=initializeApp({apiKey:'AIzaSyB4le7ZejqnTC9UgczNQ78YrmAXr0dE4X4',authDomain:'punto-geo-campo.firebaseapp.com',projectId:'punto-geo-campo',storageBucket:'punto-geo-campo.firebasestorage.app',messagingSenderId:'837823165533',appId:'1:837823165533:web:8c7057e923a15af693c9b4'});
const auth=getAuth(app),db=getFirestore(app),workspace=doc(db,'puntoGeo','equipo');let stop;
window.puntoGeoLogin=(email,password)=>signInWithEmailAndPassword(auth,email,password);
const cloudCopy=data=>({operators:data.operators||[],jobs:(data.jobs||[]).map(({photo,...job})=>job),updatedAt:new Date().toISOString()});
window.addEventListener('puntoGeo:local-change',e=>{if(auth.currentUser)setDoc(workspace,cloudCopy(e.detail),{merge:true}).catch(()=>{})});
onAuthStateChanged(auth,user=>{window.dispatchEvent(new CustomEvent('puntoGeo:auth',{detail:user}));if(stop)stop();if(!user)return;stop=onSnapshot(workspace,snap=>{if(snap.exists())window.puntoGeoApplyRemote?.(snap.data());else setDoc(workspace,cloudCopy(JSON.parse(localStorage.getItem('punto-geo-campo-v1')||'{"operators":[],"jobs":[]}')),{merge:true})})});

