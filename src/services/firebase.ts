import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  Firestore,
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';
import { VideoProject, GeneratedMusicTrack, GeneratedVoiceTrack } from '../types';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt?: string;
  lastLoginAt?: string;
}

// Safe initialization
const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
  measurementId: firebaseConfigData.measurementId || undefined,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize firestore with databaseId if specified
export const db: Firestore =
  firebaseConfigData.firestoreDatabaseId &&
  firebaseConfigData.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, firebaseConfigData.firestoreDatabaseId)
    : getFirestore(app);

// Authentication Functions
export const signInWithGoogle = async (): Promise<UserProfile | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Save or update user profile document in Firestore
    const userRef = doc(db, 'users', user.uid);
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      lastLoginAt: new Date().toISOString(),
    };

    await setDoc(
      userRef,
      {
        ...userProfile,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return userProfile;
  } catch (error: any) {
    console.error('Erro ao fazer login com Google:', error);
    throw error;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Erro ao encerrar sessão:', error);
    throw error;
  }
};

export const subscribeToAuthChanges = (
  callback: (user: UserProfile | null) => void
) => {
  return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      const profile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      };
      callback(profile);
    } else {
      callback(null);
    }
  });
};

// Firestore Projects CRUD
export const saveProjectToFirestore = async (
  userId: string,
  project: VideoProject
): Promise<void> => {
  if (!userId) throw new Error('Usuário não autenticado');
  const projectRef = doc(db, 'users', userId, 'projects', project.id);
  
  // Clean undefined values for Firestore compatibility
  const cleanProject = JSON.parse(JSON.stringify(project));

  await setDoc(
    projectRef,
    {
      ...cleanProject,
      userId,
      updatedAt: new Date().toISOString(),
      serverUpdatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

export const loadUserProjectsFromFirestore = async (
  userId: string
): Promise<VideoProject[]> => {
  if (!userId) return [];
  try {
    const projectsColl = collection(db, 'users', userId, 'projects');
    const snapshot = await getDocs(projectsColl);
    const projects: VideoProject[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      projects.push({
        id: data.id || docSnap.id,
        title: data.title || 'Projeto Sem Título',
        description: data.description || '',
        aspectRatio: data.aspectRatio || '16:9',
        style: data.style || 'cinematic',
        fps: data.fps || 24,
        resolution: data.resolution || '1080p',
        soundtrack: data.soundtrack || 'cinematic_epic',
        customAudioUrl: data.customAudioUrl,
        customAudioTitle: data.customAudioTitle,
        enableVoiceover: !!data.enableVoiceover,
        voiceGender: data.voiceGender || 'pt-BR-female',
        scenes: data.scenes || [],
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
        veoOperationName: data.veoOperationName,
        isVeoRendered: data.isVeoRendered,
        renderedVideoUrl: data.renderedVideoUrl,
      });
    });

    // Sort by most recently updated
    return projects.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch (error) {
    console.error('Erro ao carregar projetos do Firestore:', error);
    return [];
  }
};

export const deleteProjectFromFirestore = async (
  userId: string,
  projectId: string
): Promise<void> => {
  if (!userId || !projectId) return;
  const projectRef = doc(db, 'users', userId, 'projects', projectId);
  await deleteDoc(projectRef);
};

// Firestore Music Tracks
export const saveMusicTrackToFirestore = async (
  userId: string,
  track: GeneratedMusicTrack
): Promise<void> => {
  if (!userId) return;
  const trackRef = doc(db, 'users', userId, 'musicTracks', track.id);
  const cleanTrack = JSON.parse(JSON.stringify(track));
  await setDoc(trackRef, {
    ...cleanTrack,
    userId,
    createdAt: track.createdAt || new Date().toISOString(),
    serverCreatedAt: serverTimestamp(),
  });
};

export const loadMusicTracksFromFirestore = async (
  userId: string
): Promise<GeneratedMusicTrack[]> => {
  if (!userId) return [];
  try {
    const tracksColl = collection(db, 'users', userId, 'musicTracks');
    const snapshot = await getDocs(tracksColl);
    const tracks: GeneratedMusicTrack[] = [];
    snapshot.forEach((docSnap) => {
      tracks.push(docSnap.data() as GeneratedMusicTrack);
    });
    return tracks.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Erro ao carregar faixas de música do Firestore:', error);
    return [];
  }
};

export const deleteMusicTrackFromFirestore = async (
  userId: string,
  trackId: string
): Promise<void> => {
  if (!userId || !trackId) return;
  const trackRef = doc(db, 'users', userId, 'musicTracks', trackId);
  await deleteDoc(trackRef);
};

// Firestore Voice Tracks
export const saveVoiceTrackToFirestore = async (
  userId: string,
  track: GeneratedVoiceTrack
): Promise<void> => {
  if (!userId) return;
  const trackRef = doc(db, 'users', userId, 'voiceTracks', track.id);
  const cleanTrack = JSON.parse(JSON.stringify(track));
  await setDoc(trackRef, {
    ...cleanTrack,
    userId,
    createdAt: track.createdAt || new Date().toISOString(),
    serverCreatedAt: serverTimestamp(),
  });
};

export const loadVoiceTracksFromFirestore = async (
  userId: string
): Promise<GeneratedVoiceTrack[]> => {
  if (!userId) return [];
  try {
    const tracksColl = collection(db, 'users', userId, 'voiceTracks');
    const snapshot = await getDocs(tracksColl);
    const tracks: GeneratedVoiceTrack[] = [];
    snapshot.forEach((docSnap) => {
      tracks.push(docSnap.data() as GeneratedVoiceTrack);
    });
    return tracks.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Erro ao carregar faixas de voz do Firestore:', error);
    return [];
  }
};

export const deleteVoiceTrackFromFirestore = async (
  userId: string,
  voiceId: string
): Promise<void> => {
  if (!userId || !voiceId) return;
  const trackRef = doc(db, 'users', userId, 'voiceTracks', voiceId);
  await deleteDoc(trackRef);
};
