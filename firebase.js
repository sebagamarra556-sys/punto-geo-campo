import {initializeApp} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,signOut} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import {getFirestore,doc,onSnapshot,setDoc} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';

const app=initializeApp({apiKey:'AIzaSyB4le7ZejqnTC9UgczNQ78YrmAXr0dE4X4',authDomain:'punto-geo-campo.firebaseapp.com',projectId:'punto-geo-campo',storageBucket:'punto-geo-campo.firebasestorage.app',messagingSenderId:'837823165533',appId:'1:837823165533:web:8c7057e923a15af693c9b4'});
const auth=getAuth(app),db=getFirestore(app),workspace=doc(db,'puntoGeo','equipo');let stop;
window.puntoGeoLogin=(email,password)=>signInWithEmailAndPassword(auth,email,password);
window.puntoGeoLogout=()=>signOut(auth);
const cloudCopy=data=>({operators:data.operators||[],jobs:(data.jobs||[]).map(({photo,...job})=>job),agenda:Array.isArray(data.agenda)?data.agenda:[],updatedAt:new Date().toISOString()});
window.addEventListener('puntoGeo:local-change',e=>{if(auth.currentUser)setDoc(workspace,cloudCopy(e.detail),{merge:true}).catch(()=>window.dispatchEvent(new CustomEvent('puntoGeo:sync-error')))});
const hasRealData=data=>(data.jobs||[]).length>0||(data.operators||[]).some(o=>o.id!=='op-1')||(data.agenda||[]).length>0;
onAuthStateChanged(auth,user=>{window.dispatchEvent(new CustomEvent('puntoGeo:auth',{detail:user}));if(stop)stop();if(!user)return;stop=onSnapshot(workspace,snap=>{const local=JSON.parse(localStorage.getItem('punto-geo-campo-v1')||'{"operators":[],"jobs":[],"agenda":[]}');if(!snap.exists()||(!hasRealData(snap.data())&&hasRealData(local))){setDoc(workspace,cloudCopy(local),{merge:true}).catch(()=>window.dispatchEvent(new CustomEvent('puntoGeo:sync-error')));return}const remote=snap.data();if(!Array.isArray(remote.agenda)&&(local.agenda||[]).length)setDoc(workspace,{agenda:local.agenda,updatedAt:new Date().toISOString()},{merge:true}).catch(()=>window.dispatchEvent(new CustomEvent('puntoGeo:sync-error'));window.puntoGeoApplyRemote?.(remote)},()=>window.dispatchEvent(new CustomEvent('puntoGeo:sync-error'))) });

