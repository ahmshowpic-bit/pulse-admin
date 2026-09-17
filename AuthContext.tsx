import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, ADMIN_EMAIL, onAuthStateChanged, User } from './firebase';

interface AuthContextValue {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, isAdmin: false, loading: true });

// مصدر واحد لحالة تسجيل الدخول لكل اللوحة: مستمع onAuthStateChanged واحد
// بس، وأي مكوّن محتاج يعرف هل الزائر أدمن ولا لأ بيستخدم useAuth() بدل ما
// يعمل مستمع منفصل لنفسه.
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const isAdmin = !!user && user.email === ADMIN_EMAIL;

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
