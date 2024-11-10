import React, { createContext, useContext, useState } from "react";

type SessionContextType = {
  isLoggedIn: boolean;
  username: string | null;
  setLoginStatus: (status: boolean, username: string | null) => void;
  logout: () => void;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  const setLoginStatus = (status: boolean, username: string | null) => {
    setIsLoggedIn(status);
    setUsername(username);
  };

  const logout = () => {
    localStorage.removeItem("sessionId");
    setIsLoggedIn(false);
    setUsername(null);
  };

  return (
    <SessionContext.Provider
      value={{ isLoggedIn, username, setLoginStatus, logout }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
