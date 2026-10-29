import { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  updatePassword,
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { getAdminUser, registerAdminUser } from '../firebase/firestore';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);
const DEFAULT_TENANT_ID = 'jaykedar-carrental';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [adminRole, setAdminRole] = useState(null); // 'admin' | null
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Helper to verify & fetch admin role from Firestore
  const verifyAdminRoleInFirestore = async (firebaseUser) => {
    if (!firebaseUser) {
      setAdminRole(null);
      setIsAdmin(false);
      return false;
    }

    if (firebaseUser.email && (
      firebaseUser.email.toLowerCase() === 'admin@gmail.com' ||
      firebaseUser.email.toLowerCase() === 'shashikantmaske1958@gmail.com' ||
      firebaseUser.email.toLowerCase() === 'abhiparekar58@gmail.com'
    )) {
      setAdminRole('admin');
      setIsAdmin(true);
      return true;
    }

    setAdminRole(null);
    setIsAdmin(false);
    return false;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await verifyAdminRoleInFirestore(firebaseUser);
      } else {
        setAdminRole(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();
    const targetEmail = 'admin@gmail.com';
    const validEmails = ['admin@gmail.com', 'shashikantmaske1958@gmail.com', 'abhiparekar58@gmail.com'];
    const validPasswords = ['admin@1234', 'Admin@1234'];

    if (!validEmails.includes(cleanEmail) || !validPasswords.includes(cleanPassword)) {
      const msg = 'Invalid admin credentials. Login ID: admin@gmail.com | Password: admin@1234';
      toast.error(msg);
      throw new Error(msg);
    }

    // Try primary password (admin@1234) and fallback (Admin@1234)
    const candidatePasswords = [cleanPassword, ...validPasswords.filter(p => p !== cleanPassword)];
    let lastError = null;

    for (const pwd of candidatePasswords) {
      try {
        const result = await signInWithEmailAndPassword(auth, targetEmail, pwd);
        await registerAdminUser(DEFAULT_TENANT_ID, result.user.uid, {
          email: targetEmail,
          name: 'Administrator',
          role: 'admin',
        });
        setAdminRole('admin');
        setIsAdmin(true);
        toast.success('Admin Sign In Successful! Welcome Administrator.');
        return result;
      } catch (err) {
        lastError = err;
        if (
          err.code === 'auth/wrong-password' ||
          err.code === 'auth/invalid-credential'
        ) {
          continue;
        } else {
          break;
        }
      }
    }

    // Auto-create administrator on initial setup if user not found
    if (
      lastError?.code === 'auth/user-not-found' ||
      lastError?.code === 'auth/invalid-credential' ||
      lastError?.code === 'auth/wrong-password'
    ) {
      try {
        const createRes = await createUserWithEmailAndPassword(auth, targetEmail, 'admin@1234');
        await registerAdminUser(DEFAULT_TENANT_ID, createRes.user.uid, {
          email: targetEmail,
          name: 'Administrator',
          role: 'admin',
        });
        setAdminRole('admin');
        setIsAdmin(true);
        toast.success('Admin Account Initialized & Signed In!');
        return createRes;
      } catch (createErr) {
        if (createErr.code === 'auth/email-already-in-use') {
          for (const pwd of validPasswords) {
            try {
              const retryRes = await signInWithEmailAndPassword(auth, targetEmail, pwd);
              setAdminRole('admin');
              setIsAdmin(true);
              toast.success('Admin Sign In Successful!');
              return retryRes;
            } catch (e) {
              // ignore
            }
          }
        }
        console.error(createErr);
        toast.error(createErr.message);
        throw createErr;
      }
    }

    toast.error(lastError?.message || 'Authentication failed');
    throw lastError;
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setAdminRole(null);
    setIsAdmin(false);
    toast.success('Signed out');
  };

  const createAdmin = async (email = 'admin@gmail.com', password = 'admin@1234', name = 'Administrator') => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      if (res.user) {
        await registerAdminUser(DEFAULT_TENANT_ID, res.user.uid, {
          email: res.user.email,
          name: name || 'Admin',
          role: 'admin',
        });
        setAdminRole('admin');
        setIsAdmin(true);
      }
      return res;
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        return signIn(email, password);
      }
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, adminRole, isAdmin, loading, signIn, signOut, createAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  return ctx || { user: null, adminRole: null, isAdmin: false, loading: false, signIn: async () => {}, signOut: async () => {} };
}
