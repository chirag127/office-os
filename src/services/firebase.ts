/**
 * Office OS - Firebase Service
 * Handles Authentication and Database interactions
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { APEX_CONFIG } from '../config/apex';

const { firebase: firebaseConfig } = APEX_CONFIG.baas;

export class FirebaseService {
  private static instance: FirebaseService;
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  private db: Firestore | null = null;

  private constructor() {
    if (firebaseConfig.enabled) {
      try {
        this.app = initializeApp(firebaseConfig.config);
        this.auth = getAuth(this.app);
        this.db = getFirestore(this.app);
        console.log('Firebase initialized');
      } catch (error) {
        console.error('Firebase initialization failed:', error);
      }
    }
  }

  static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  /**
   * Sign in with Google
   */
  async signIn(): Promise<User | null> {
    if (!this.auth) throw new Error('Firebase Auth not initialized');

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      return result.user;
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    if (!this.auth) return;
    await firebaseSignOut(this.auth);
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.auth?.currentUser || null;
  }

  /**
   * Get Firestore instance
   */
  getDB(): Firestore | null {
    return this.db;
  }
}

export const firebaseService = FirebaseService.getInstance();
