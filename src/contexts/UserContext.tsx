import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// ---------------------------------------------
// Type Definitions
// ---------------------------------------------

interface UserSettings {
  impairedHand: string;
  spasticitySeverity: string;
  age: number;
  sex: string;
  pointingHandSize: number;
  targetHandSize: number;
}

interface UserContextType {
  userSettings: UserSettings | null;
  setUserSettings: React.Dispatch<React.SetStateAction<UserSettings | null>>;
  loading: boolean;
  refreshUserSettings: () => Promise<void>;
}

interface UserProviderProps {
  children: ReactNode;
}

const USER_ID = "guest";
const STORAGE_KEY = `user_${USER_ID}_profile`;

// ---------------------------------------------
// Context Setup
// ---------------------------------------------

const UserContext = createContext<UserContextType | undefined>(undefined);

// ---------------------------------------------
// UserProvider Component
// ---------------------------------------------

export const UserProvider = ({ children }: UserProviderProps) => {
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Load settings from localStorage
  const loadSettings = async () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: UserSettings = JSON.parse(stored);
        setUserSettings(parsed);
        console.log("👤🔄 User settings loaded from localStorage:", parsed);
      } else {
        console.warn("👤⚠️ No user settings found. Initializing default values.");

        const defaultSettings: UserSettings = {
          impairedHand: "Left",
          spasticitySeverity: "fingertips",
          age: 30,
          sex: "Prefer not to say",
          pointingHandSize: 0,
          targetHandSize: 0,
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSettings));
        setUserSettings(defaultSettings);
      }

    } catch (error) {
      console.error("👤❌ Error loading user settings from localStorage:", error);
      setUserSettings(null);
    }
  };

  // Manual refresh
  const refreshUserSettings = async () => {
    setLoading(true);
    await loadSettings();
    setLoading(false);
  };

  // Load on mount
  useEffect(() => {
    refreshUserSettings();
  }, []);

  // Auto-save to localStorage whenever userSettings changes
  useEffect(() => {
    if (userSettings) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userSettings));
      } catch (error) {
        console.error("❌ Error saving user settings to localStorage:", error);
      }
    }
  }, [userSettings]);

  return (
    <UserContext.Provider
      value={{
        userSettings,
        setUserSettings,
        loading,
        refreshUserSettings,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// ---------------------------------------------
// Custom Hook to Access User Context
// ---------------------------------------------

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("👤 useUser must be used within a UserProvider");
  }
  return context;
};
