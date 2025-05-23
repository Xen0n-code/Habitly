
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useParams, useNavigate, Navigate } from 'react-router-dom';
import { Timestamp } from 'firebase/firestore';
import { 
  onAuthUserChanged, 
  signInWithGoogle as fbSignInWithGoogle, 
  signOutUser as fbSignOutUser,
  createHabit as fbCreateHabit,
  getUserHabits as fbGetUserHabits,
  getHabitById as fbGetHabitById,
  incrementStreak as fbIncrementStreak,
  joinHabitByInviteCode as fbJoinHabitByInviteCode,
  isHabitCompletedToday
} from './services/firebaseService';
import type { User, Habit, HabitMember, AuthState as AuthStateType } from './types';
import { AuthState } from './types';
import { PlusIcon, GoogleIcon, FireIcon, LogoutIcon, CalendarDaysIcon, TrophyIcon, LinkIcon, CheckCircleIcon, UserGroupIcon } from './components/Icons';
import { Modal } from './components/Modal';

// --- SignInPromptModal Component ---
interface SignInPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: () => Promise<void>;
}

const SignInPromptModal: React.FC<SignInPromptModalProps> = ({ isOpen, onClose, onSignIn }) => {
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    await onSignIn();
    setIsSigningIn(false);
    // onClose will typically be called by the parent upon successful sign-in state change
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sign In Required">
      <p className="text-slate-300 mb-6">To use this feature, please sign in with your Google account.</p>
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isSigningIn}
          className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-slate-100 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSignIn}
          disabled={isSigningIn}
          className="px-6 py-2 bg-sky-500 hover:bg-sky-600 rounded-md text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          {isSigningIn ? (
            <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
          ) : (
            <>
              <GoogleIcon className="w-5 h-5 mr-2" />
              Sign In with Google
            </>
          )}
        </button>
      </div>
    </Modal>
  );
};


// --- Helper Components defined outside to prevent re-renders ---

interface HabitCardProps {
  habit: Habit;
  currentUserUID: string | null; // Can be null for guests
  isGuest: boolean;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, currentUserUID, isGuest }) => {
  const memberData = currentUserUID ? habit.members[currentUserUID] : null;
  const streak = memberData ? memberData.currentStreak : 0;
  const completedToday = memberData ? isHabitCompletedToday(memberData) : false;

  return (
    <Link to={`/habit/${habit.id}`} className="block bg-slate-800 p-6 rounded-lg shadow-lg hover:shadow-sky-500/30 transition-all duration-300 transform hover:-translate-y-1 group">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-semibold text-sky-400 group-hover:text-sky-300 mb-2 truncate">{habit.name}</h3>
        {completedToday && <CheckCircleIcon className="w-6 h-6 text-emerald-500" />}
      </div>
      <p className="text-sm text-slate-400 mb-3">Created: {habit.createdAt.toDate().toLocaleDateString()}</p>
      <div className="flex items-center text-emerald-400">
        <FireIcon className="w-6 h-6 mr-2" />
        <span className="text-2xl font-bold">{streak}</span>
        <span className="ml-1 text-sm text-slate-400">day streak</span>
      </div>
       <div className="mt-2 text-xs text-slate-500 flex items-center">
        <UserGroupIcon className="w-4 h-4 mr-1" />
        {Object.keys(habit.members).length} member(s)
      </div>
    </Link>
  );
};

interface HabitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User; // This modal should only be opened for logged-in users
  onHabitCreated: (newHabit: Habit) => void;
}

const HabitFormModal: React.FC<HabitFormModalProps> = ({ isOpen, onClose, currentUser, onHabitCreated }) => {
  const [habitName, setHabitName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim()) {
      setError('Habit name cannot be empty.');
      return;
    }
    setIsLoading(true);
    setError('');
    const newHabit = await fbCreateHabit(currentUser, habitName);
    setIsLoading(false);
    if (newHabit) {
      onHabitCreated(newHabit);
      setHabitName('');
      onClose();
    } else {
      setError('Failed to create habit. Please try again.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Habit">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="habitName" className="block text-sm font-medium text-slate-300 mb-1">Habit Name</label>
          <input
            type="text"
            id="habitName"
            value={habitName}
            onChange={(e) => setHabitName(e.target.value)}
            placeholder="e.g., Morning Exercise, Read 30 mins"
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors"
            disabled={isLoading}
          />
        </div>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <div className="flex justify-end space-x-3">
          <button 
            type="button" 
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-slate-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={isLoading || !habitName.trim()}
            className="px-6 py-2 bg-sky-500 hover:bg-sky-600 rounded-md text-white font-semibold transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
            ) : "Create Habit"}
          </button>
        </div>
      </form>
    </Modal>
  );
};


// --- Main App Component ---
const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authState, setAuthState] = useState<AuthStateType>(AuthState.LOADING);
  const [isGuestSessionActive, setIsGuestSessionActive] = useState<boolean>(false);
  const [isSignInPromptOpen, setIsSignInPromptOpen] = useState<boolean>(false);
  // const navigate = useNavigate(); // REMOVED: App is not inside a Router yet

  useEffect(() => {
    const unsubscribe = onAuthUserChanged((user) => {
      setCurrentUser(user);
      setAuthState(user ? AuthState.AUTHENTICATED : AuthState.UNAUTHENTICATED);
      if (user) {
        setIsGuestSessionActive(false); // End guest session if a user logs in
        setIsSignInPromptOpen(false); // Close sign-in prompt if login successful
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    const user = await fbSignInWithGoogle();
    // onAuthUserChanged will handle state updates and navigation if successful
    if (user) {
       // Potentially navigate here if not handled by LoginPage's effect after currentUser updates
    }
  };

  const startGuestSession = () => {
    setCurrentUser(null);
    setAuthState(AuthState.UNAUTHENTICATED);
    setIsGuestSessionActive(true);
    // Navigation to '/' is handled by LoginPage
  };

  const endCurrentSessionAndGoToLogin = async (targetPath?: string) => {
    if (currentUser) {
      await fbSignOutUser(); // Triggers onAuthUserChanged
    }
    setIsGuestSessionActive(false);
    // Navigation to /login will be handled by route protection or Navbar's navigate call
    // Or force it if navigate is available here from a Router context higher up (which it's not directly)
    // So, rely on component navigation or <Navigate /> component
  };
  
  const openSignInPrompt = () => setIsSignInPromptOpen(true);
  const closeSignInPrompt = () => setIsSignInPromptOpen(false);

  const AppRouter: React.FC = () => {
    const navigateRouter = useNavigate(); // Hook for navigation within router context

    const handleSignOut = async () => {
        await fbSignOutUser();
        setIsGuestSessionActive(false);
        navigateRouter('/login'); 
    };
    
    const handleSignInRequest = () => {
        setIsGuestSessionActive(false);
        navigateRouter('/login');
    };


    if (authState === AuthState.LOADING) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900">
          <div className="w-16 h-16 border-4 border-t-transparent border-sky-500 rounded-full animate-spin"></div>
        </div>
      );
    }

    const isGuest = !currentUser && isGuestSessionActive;
    const canAccessApp = currentUser || isGuestSessionActive;

    return (
      <div className="min-h-screen flex flex-col bg-slate-900">
        {canAccessApp && (
          <Navbar 
            user={currentUser} 
            isGuest={isGuest} 
            onSignOut={handleSignOut} 
            onSignIn={handleSignInRequest} 
          />
        )}
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route 
              path="/login" 
              element={
                currentUser ? <Navigate to="/" replace /> : 
                <LoginPage 
                  onGoogleSignIn={handleGoogleSignIn} 
                  onGuestLogin={startGuestSession}
                  currentUser={currentUser} 
                />
              } 
            />
            <Route 
              path="/habit/:habitId" 
              element={canAccessApp ? <HabitDetailPage currentUser={currentUser} isGuest={isGuest} onRequireSignIn={openSignInPrompt} /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/join/:inviteCode" 
              element={canAccessApp ? <JoinHabitPage currentUser={currentUser} isGuest={isGuest} onRequireSignIn={openSignInPrompt} /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/" 
              element={canAccessApp ? <HomePage currentUser={currentUser} isGuest={isGuest} onRequireSignIn={openSignInPrompt} /> : <Navigate to="/login" replace />} 
            />
            <Route path="*" element={<Navigate to={canAccessApp ? "/" : "/login"} replace />} />
          </Routes>
        </main>
        <SignInPromptModal 
          isOpen={isSignInPromptOpen} 
          onClose={closeSignInPrompt} 
          onSignIn={async () => {
            await handleGoogleSignIn();
            // onAuthUserChanged should close the modal if sign-in is successful
          }} 
        />
      </div>
    );
  };
  
  return (
    <HashRouter>
      <AppRouter />
    </HashRouter>
  );
};


// --- Page Components ---

interface NavbarProps {
  user: User | null;
  isGuest: boolean;
  onSignOut: () => void;
  onSignIn: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, isGuest, onSignOut, onSignIn }) => {
  return (
    <nav className="bg-slate-800 shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-sky-400 hover:text-sky-300 transition-colors">
          Habitly
        </Link>
        <div className="flex items-center space-x-4">
          {user && !isGuest ? (
            <>
              {user.photoURL && <img src={user.photoURL} alt={user.displayName || 'User'} className="w-10 h-10 rounded-full border-2 border-sky-500" />}
              <span className="text-slate-300 hidden sm:block">{user.displayName || user.email}</span>
              <button 
                onClick={onSignOut}
                className="p-2 text-slate-400 hover:text-sky-400 transition-colors rounded-full hover:bg-slate-700"
                title="Sign Out"
              >
                <LogoutIcon className="w-6 h-6" />
              </button>
            </>
          ) : (
            <button
              onClick={onSignIn}
              className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-md transition-colors flex items-center"
            >
              <GoogleIcon className="w-5 h-5 mr-2" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

interface LoginPageProps {
  onGoogleSignIn: () => Promise<void>;
  onGuestLogin: () => void;
  currentUser: User | null;
}

const LoginPage: React.FC<LoginPageProps> = ({ onGoogleSignIn, onGuestLogin, currentUser }) => {
  const navigate = useNavigate();
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleGoogleSignInClick = async () => {
    setIsSigningIn(true);
    await onGoogleSignIn();
    setIsSigningIn(false); // Reset, navigation handled by effect or App state change
  };
  
  const handleGuestLoginClick = () => {
    onGuestLogin();
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] text-center px-4">
      <FireIcon className="w-24 h-24 text-sky-500 mb-6" />
      <h1 className="text-5xl font-bold text-slate-100 mb-4">Welcome to Habitly</h1>
      <p className="text-xl text-slate-400 mb-10 max-w-lg">Build habits, track your progress, and achieve your goals with friends.</p>
      <div className="space-y-4 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row">
        <button 
          onClick={handleGoogleSignInClick}
          disabled={isSigningIn}
          className="flex items-center justify-center bg-white text-slate-700 font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-slate-200 transition-colors text-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-70"
        >
          {isSigningIn ? (
            <div className="w-6 h-6 border-2 border-t-transparent border-slate-700 rounded-full animate-spin mr-3"></div>
          ) : (
            <GoogleIcon className="w-6 h-6 mr-3" />
          )}
          Sign in with Google
        </button>
        <button 
          onClick={handleGuestLoginClick}
          disabled={isSigningIn}
          className="flex items-center justify-center bg-slate-700 text-slate-100 font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-slate-600 transition-colors text-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-70"
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );
};

interface HomePageProps {
  currentUser: User | null;
  isGuest: boolean;
  onRequireSignIn: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ currentUser, isGuest, onRequireSignIn }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchHabits = useCallback(async () => {
    if (!currentUser) { // Guests cannot have habits listed on home page this way
      setHabits([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const userHabits = await fbGetUserHabits(currentUser.uid);
    setHabits(userHabits);
    setIsLoading(false);
  }, [currentUser]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const handleHabitCreated = (newHabit: Habit) => {
    setHabits(prevHabits => [newHabit, ...prevHabits].sort((a,b) => b.createdAt.toMillis() - a.createdAt.toMillis()));
  };

  const handleCreateHabitClick = () => {
    if (isGuest || !currentUser) {
      onRequireSignIn();
    } else {
      setIsModalOpen(true);
    }
  };

  if (isLoading && !isGuest) { // Don't show main loader for guests if they have no habits to load
    return (
      <div className="flex justify-center items-center py-10">
        <div className="w-12 h-12 border-4 border-t-transparent border-sky-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold text-slate-100">My Habits</h1>
      </div>
      
      {(isGuest || habits.length === 0) && !isLoading ? (
        <div className="text-center py-10 bg-slate-800 rounded-lg shadow-md">
          <CalendarDaysIcon className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <p className="text-xl text-slate-400 mb-2">{isGuest ? "Sign in to save habits." : "No habits yet."}</p>
          <p className="text-slate-500 mb-6">
            {isGuest ? "As a guest, you can explore. Sign in to create and track your progress!" : "Click the '+' button to create your first habit!"}
          </p>
          <button 
            onClick={handleCreateHabitClick}
            className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors flex items-center mx-auto"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            {isGuest ? "Sign In to Create" : "Create Habit"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {habits.map(habit => (
            <HabitCard key={habit.id} habit={habit} currentUserUID={currentUser ? currentUser.uid : null} isGuest={isGuest} />
          ))}
        </div>
      )}

      <button
        onClick={handleCreateHabitClick}
        className="fixed bottom-8 right-8 bg-sky-500 hover:bg-sky-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-900 z-40"
        aria-label="Create new habit"
      >
        <PlusIcon className="w-8 h-8" />
      </button>

      {currentUser && !isGuest && ( // Only render modal if logged in
          <HabitFormModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            currentUser={currentUser}
            onHabitCreated={handleHabitCreated}
          />
        )
      }
    </div>
  );
};

interface HabitDetailPageProps {
  currentUser: User | null;
  isGuest: boolean;
  onRequireSignIn: () => void;
}

const HabitDetailPage: React.FC<HabitDetailPageProps> = ({ currentUser, isGuest, onRequireSignIn }) => {
  const { habitId } = useParams<{ habitId: string }>();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStreak, setIsUpdatingStreak] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteLinkCopied, setInviteLinkCopied] = useState(false);
  const navigate = useNavigate();


  const fetchHabitDetails = useCallback(async () => {
    if (!habitId) return;
    setIsLoading(true);
    setError(null);
    const habitData = await fbGetHabitById(habitId);
    if (habitData) {
      // Guests can view, but membership check only for logged-in users who might not be members
      if (currentUser && !isGuest && !habitData.members[currentUser.uid]) { 
         setError("You are not a member of this habit or it doesn't exist.");
         setHabit(null);
      } else {
        setHabit(habitData);
      }
    } else {
      setError("Habit not found.");
    }
    setIsLoading(false);
  }, [habitId, currentUser, isGuest]);

  useEffect(() => {
    fetchHabitDetails();
  }, [fetchHabitDetails]);

  const handleIncrementStreak = async () => {
    if (isGuest || !currentUser || !habit || !habitId) {
      onRequireSignIn();
      return;
    }
    
    const member = habit.members[currentUser.uid];
    if (isHabitCompletedToday(member)) {
      alert("You've already marked this habit complete for today!");
      return;
    }

    setIsUpdatingStreak(true);
    const success = await fbIncrementStreak(habitId, currentUser.uid);
    if (success) {
      await fetchHabitDetails(); 
    } else {
      alert("Failed to update streak. Please try again.");
    }
    setIsUpdatingStreak(false);
  };

  const copyInviteLink = () => {
    if (isGuest || !currentUser) {
        onRequireSignIn();
        return;
    }
    if (!habit) return;
    const link = `${window.location.origin}${window.location.pathname}#/join/${habit.inviteCode}`;
    navigator.clipboard.writeText(link)
      .then(() => {
        setInviteLinkCopied(true);
        setTimeout(() => setInviteLinkCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy invite link: ', err));
  };

  const memberData = habit && currentUser ? habit.members[currentUser.uid] : null;
  const currentStreak = memberData ? memberData.currentStreak : 0;
  const completedToday = memberData ? isHabitCompletedToday(memberData) : false;

  const leaderboard = useMemo(() => {
    if (!habit) return [];
    return Object.values(habit.members)
      .sort((a, b) => b.currentStreak - a.currentStreak);
  }, [habit]);

  if (isLoading) {
    return <div className="flex justify-center items-center py-10"><div className="w-12 h-12 border-4 border-t-transparent border-sky-500 rounded-full animate-spin"></div></div>;
  }

  if (error) {
    return (
      <div className="text-center py-10 bg-slate-800 rounded-lg shadow-md">
        <p className="text-xl text-red-500">{error}</p>
        <Link to="/" className="mt-4 inline-block bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-md">
          Back to Home
        </Link>
      </div>
    );
  }
  
  if (!habit) {
    return <div className="text-center py-10 text-slate-400">Habit details could not be loaded.</div>;
  }

  const displayStreak = (isGuest || !currentUser) ? 0 : currentStreak;
  const displayCompletedToday = (isGuest || !currentUser) ? false : completedToday;


  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="mb-6 text-sky-400 hover:text-sky-300 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back
      </button>

      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl mb-8">
        <h1 className="text-4xl font-bold text-sky-400 mb-2 text-center">{habit.name}</h1>
        <p className="text-sm text-slate-500 text-center mb-8">Owner: {habit.members[habit.ownerId]?.displayName || 'Unknown'}</p>

        <div className="flex flex-col items-center justify-center my-10">
          <div 
            className={`relative w-48 h-48 md:w-60 md:h-60 rounded-full flex items-center justify-center text-center transition-all duration-300 ease-in-out
                        ${displayCompletedToday ? 'bg-emerald-500/20 border-4 border-emerald-500' : 'bg-sky-500/10 border-4 border-sky-500'}`}
          >
            <FireIcon className={`absolute -top-5 -left-5 w-12 h-12 ${displayStreak > 0 ? 'text-orange-500' : 'text-slate-600'}`} />
            <span className={`text-6xl md:text-7xl font-extrabold ${displayCompletedToday ? 'text-emerald-400' : 'text-sky-300'}`}>{displayStreak}</span>
            <span className={`absolute bottom-6 text-sm ${displayCompletedToday ? 'text-emerald-300' : 'text-sky-400'}`}>day streak</span>
          </div>
          
          <button 
            onClick={handleIncrementStreak}
            disabled={isUpdatingStreak || displayCompletedToday || isGuest}
            className={`mt-10 px-10 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800
                        ${displayCompletedToday 
                          ? 'bg-emerald-600 text-white cursor-not-allowed flex items-center' 
                          : (isGuest ? 'bg-slate-600 text-slate-400 cursor-default' : 'bg-sky-500 hover:bg-sky-600 text-white')}
                        disabled:opacity-70 ${isGuest ? '' : 'disabled:cursor-not-allowed'}`}
          >
            {isUpdatingStreak ? (
              <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
            ) : isGuest ? (
                "Sign In to Track"
            ) : displayCompletedToday ? (
              <>
                <CheckCircleIcon className="w-6 h-6 mr-2" /> Done for today!
              </>
            ) : (
              "Mark as Complete Today"
            )}
          </button>
          {memberData && memberData.lastCompletionDate && !isGuest && (
             <p className="text-xs text-slate-500 mt-3">
                Last completed: {memberData.lastCompletionDate.toDate().toLocaleDateString()}
                {completedToday ? " (Today)" : ""}
            </p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-slate-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-2xl font-semibold text-sky-400 mb-6 flex items-center">
            <TrophyIcon className="w-7 h-7 mr-3 text-yellow-400"/>
            Leaderboard
          </h2>
          {leaderboard.length > 0 ? (
            <ul className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {leaderboard.map((member, index) => (
                <li key={member.uid} className={`flex items-center justify-between p-4 rounded-lg transition-all duration-200 ${currentUser && member.uid === currentUser.uid ? 'bg-sky-700/50 ring-1 ring-sky-500' : 'bg-slate-700/70 hover:bg-slate-600/70'}`}>
                  <div className="flex items-center">
                    <span className={`text-lg font-semibold mr-3 w-8 text-center ${index < 3 ? 'text-yellow-400' : 'text-slate-400'}`}>{index + 1}.</span>
                    <img src={member.photoURL || `https://picsum.photos/seed/${member.uid}/40/40`} alt={member.displayName} className="w-10 h-10 rounded-full mr-3 border-2 border-slate-500"/>
                    <span className="text-slate-200 font-medium">{member.displayName}</span>
                  </div>
                  <div className="flex items-center text-emerald-400">
                    <FireIcon className="w-5 h-5 mr-1" />
                    <span className="text-lg font-bold">{member.currentStreak}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-400">No members data to display.</p>
          )}
        </div>

        <div className="bg-slate-800 p-6 rounded-xl shadow-xl">
          <h2 className="text-2xl font-semibold text-sky-400 mb-6 flex items-center">
            <UserGroupIcon className="w-7 h-7 mr-3"/>
            Invite Friends
          </h2>
          {isGuest ? (
            <div className="text-center">
              <p className="text-slate-400 mb-4">Sign in to get an invite link and share this habit with friends!</p>
              <button 
                onClick={onRequireSignIn}
                className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-md"
              >
                Sign In
              </button>
            </div>
          ) : habit ? (
            <>
              <p className="text-slate-400 mb-3">Share this invite code or link with your friends:</p>
              <div className="bg-slate-700 p-4 rounded-md mb-4">
                <p className="text-slate-300 text-sm">Invite Code:</p>
                <p className="text-2xl font-mono text-sky-400 tracking-widest break-all">{habit.inviteCode}</p>
              </div>
              <button 
                onClick={copyInviteLink}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-md transition-colors flex items-center justify-center"
              >
                <LinkIcon className="w-5 h-5 mr-2" />
                {inviteLinkCopied ? "Link Copied!" : "Copy Invite Link"}
              </button>
              {inviteLinkCopied && <p className="text-emerald-400 text-sm mt-2 text-center">Invite link copied to clipboard!</p>}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

interface JoinHabitPageProps {
  currentUser: User | null;
  isGuest: boolean;
  onRequireSignIn: () => void;
}

const JoinHabitPage: React.FC<JoinHabitPageProps> = ({ currentUser, isGuest, onRequireSignIn }) => {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const [message, setMessage] = useState<string>("Processing your invitation...");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const processJoin = async () => {
      if (!inviteCode) {
        setMessage("Invalid invitation link.");
        setIsLoading(false);
        return;
      }

      if (isGuest || !currentUser) {
        setMessage("Please sign in with Google to join this habit.");
        setIsLoading(false);
        // Optionally trigger onRequireSignIn here or let user click a button
        return;
      }

      setIsLoading(true);
      const joinedHabit = await fbJoinHabitByInviteCode(currentUser, inviteCode);
      
      if (joinedHabit) {
        setMessage(`Successfully joined habit: ${joinedHabit.name}! Redirecting...`);
        setTimeout(() => {
          navigate(`/habit/${joinedHabit.id}`);
        }, 2000);
      } else {
        setMessage("Failed to join habit. The invite code might be invalid, you might already be a member, or an error occurred.");
      }
      setIsLoading(false);
    };

    processJoin();
  }, [inviteCode, currentUser, isGuest, navigate, onRequireSignIn]); 

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
      {isLoading && <div className="w-12 h-12 border-4 border-t-transparent border-sky-500 rounded-full animate-spin mb-4"></div>}
      <p className={`text-xl ${isLoading ? 'text-slate-400' : (message.includes('Success') ? 'text-emerald-400' : 'text-red-500')}`}>
        {message}
      </p>
      {!isLoading && (isGuest || !currentUser) && message.includes("Please sign in") && (
        <button 
            onClick={onRequireSignIn}
            className="mt-6 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-6 rounded-md transition-colors flex items-center"
        >
            <GoogleIcon className="w-5 h-5 mr-2" />
            Sign In to Join
        </button>
      )}
      {!isLoading && (
        <Link to="/" className="mt-6 inline-block text-sky-400 hover:text-sky-300">
          Go to Home
        </Link>
      )}
    </div>
  );
};


export default App;
