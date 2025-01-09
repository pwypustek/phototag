import React, { createContext, useContext, useState, useEffect } from "react";
import { graphqlClient, getRandomString } from "./graphqlClient";

type userJSONType = {
  apiKey: string | undefined;
  appActive: string | null;
  acl?: {
    app: ("fm" | "pralnia")[];
  };
};

type SessionContextType = {
  isLoggedIn: boolean;
  username: string | null;
  sessionId: string | null;
  cwid: string | null;
  setLoginStatus: (status: boolean, username: string | null, sessionId: string | null, cwid: string | null, userJSON: userJSONType | null, sessionJSON: object | null) => void;
  userJSON: userJSONType | null;
  sessionJSON: object | null;
  logout: () => void;
  browse: (tag: string) => void;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

let sessionData: SessionContextType | undefined;

export const useSessionOutsideReact = () => {
  if (!sessionData) {
    throw new Error("Session data is not initialized yet");
  }
  return sessionData;
};

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [userJSON, setUserJSON] = useState<userJSONType | null>(null);
  const [sessionJSON, setSessionJSON] = useState<object | null>(null);

  const [cwid, setCwid] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [isGalleryOpen, setGalleryOpen] = useState(false);

  const setLoginStatus = (status: boolean, username: string | null, sessionId: string | null, cwid: string | null, userJSON: userJSONType | null, sessionJSON: object | null) => {
    setIsLoggedIn(status);
    setUsername(username);
    setSessionId(sessionId);
    setCwid(cwid);
    setUserJSON(userJSON);
    setSessionJSON(sessionJSON);
  };

  const logout = () => {
    //localStorage.removeItem("sessionId");
    setIsLoggedIn(false);
    setSessionId(null);
    setCwid(null);
    setUsername(null);
  };

  // useEffect(() => {
  //   const fetchCwid = async () => {
  //     setCwid(await getRandomString());
  //   };
  //   fetchCwid();
  // }, []);

  // const browse = async (tag: string) => {
  //   alert("browse in context " + tag);

  //   try {
  //     const result = await graphqlClient(`photo`, {
  //       type: "browse",
  //       user: username,
  //       tag: tag,
  //     });
  //     setGalleryImages(result.photo.images || []);
  //     setGalleryOpen(true);
  //     alert(result.photo.images);
  //   } catch (error) {
  //     //await showAlert("Błąd podczas przeglądania zdjęć.");
  //     console.error(error);
  //   }
  // };

  const contextValue: SessionContextType = {
    isLoggedIn,
    username,
    sessionId,
    cwid,
    userJSON,
    sessionJSON,
    setLoginStatus,
    logout,
    browse: async (tag: string) => {
      alert("browse in context");
    },
  };

  // Save the context data to the global variable
  sessionData = contextValue;

  return <SessionContext.Provider value={contextValue}>{children}</SessionContext.Provider>;
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
