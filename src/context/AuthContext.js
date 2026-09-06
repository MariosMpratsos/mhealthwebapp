import { createContext, useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import jwt_decode from 'jwt-decode';

// Δημιουργία του Context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();

    // Ασφαλής ανάκτηση των tokens
    const [authTokens, setAuthTokens] = useState(() => {
        try {
            const tokens = localStorage.getItem('authTokens');
            return tokens ? JSON.parse(tokens) : null;
        } catch (error) {
            localStorage.removeItem('authTokens');
            return null;
        }
    });

    // Ασφαλής αποκωδικοποίηση χρήστη
    const [user, setUser] = useState(() => {
        try {
            const tokens = localStorage.getItem('authTokens');
            return tokens ? jwt_decode(JSON.parse(tokens).access) : null;
        } catch (error) {
            return null;
        }
    });

    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    // Ref για closures
    const authTokenRef = useRef(authTokens);

    useEffect(() => {
        authTokenRef.current = authTokens;
    }, [authTokens]);

    // 1. Τυπικό Login
    const loginUser = async (e) => {
        e.preventDefault();
        setAuthError(null);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/token/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    'email': e.target.email.value, 
                    'password': e.target.password.value 
                })
            });

            const data = await response.json();

            if (response.status === 200) {
                setAuthTokens(data);
                setUser(jwt_decode(data.access));
                localStorage.setItem('authTokens', JSON.stringify(data));
                navigate('/summary');
            } else {
                setAuthError('Invalid credentials. Check your email or password.');
            }
        } catch (error) {
            setAuthError('Connection to backend failed. Is the server running?');
        }
    };

    // 2. Google Login
    const loginGoogleUser = async (googleResponse) => {
        setAuthError(null);
        localStorage.setItem('google_access_token', googleResponse.access_token);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/google-login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 'access_token': googleResponse.access_token })
            });

            const data = await response.json();

            if (response.status === 200) {
                setAuthTokens(data);
                setUser(jwt_decode(data.access));
                localStorage.setItem('authTokens', JSON.stringify(data));
                navigate('/summary');
            } else {
                localStorage.removeItem('google_access_token');
                setAuthError('Google login failed at the backend level.');
            }
        } catch (error) {
            setAuthError('Server error during Google Authentication.');
        }
    };

    // 3. Logout (Καθαρίζει τα πάντα)
    const logoutUser = useCallback(() => {
        localStorage.removeItem('authTokens');
        localStorage.removeItem('google_access_token');
        setAuthTokens(null);
        setUser(null);
        navigate('/');
    }, [navigate]);

    // 4. Update Token (Refresh Logic)
    const updateToken = useCallback(async () => {
        if (!authTokenRef.current?.refresh) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/token/refresh/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 'refresh': authTokenRef.current.refresh })
            });

            const data = await response.json();

            if (response.status === 200) {
                const updatedTokens = {
                    ...authTokenRef.current,
                    access: data.access
                };
                setAuthTokens(updatedTokens);
                setUser(jwt_decode(data.access));
                localStorage.setItem('authTokens', JSON.stringify(updatedTokens));
            } else {
                logoutUser();
            }
        } catch (error) {
            console.error("Critical: Token refresh failed.");
        } finally {
            if (loading) setLoading(false);
        }
    }, [loading, logoutUser]);

    // --- ⏱️ 5. SECURITY FEATURE: 10-MINUTE IDLE TIMEOUT ⏱️ ---
    useEffect(() => {
        let timeoutId;

        // Συνάρτηση που πετάει τον χρήστη έξω
        const logoutDueToInactivity = () => {
            if (user) {
                alert("  Your session has expired due to 10 minutes of inactivity for privacy reasons. Please log in again.");
                logoutUser();
            }
        };

        // Συνάρτηση που μηδενίζει το χρονόμετρο αν ο χρήστης κουνηθεί
        const resetTimer = () => {
            if (timeoutId) clearTimeout(timeoutId);
            if (user) {
                // 10 Λεπτά = 10 * 60 * 1000 milliseconds
                // Για να το τεστάρεις άμεσα, βάλε 5000 (5 δευτερόλεπτα)
                timeoutId = setTimeout(logoutDueToInactivity, 10 * 60 * 1000); 
            }
        };

        // Ξεκινάμε το χρονόμετρο
        resetTimer();

        // Παρακολουθούμε κινήσεις ποντικιού, κλικ, scroll και πληκτρολόγιο
        const events = ['mousemove', 'keydown', 'scroll', 'click'];
        events.forEach(event => window.addEventListener(event, resetTimer));

        // Cleanup όταν κλείνει το component
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            events.forEach(event => window.removeEventListener(event, resetTimer));
        };
    }, [user, logoutUser]);

    // --- 6. JWT Refresh Lifecycle ---
    useEffect(() => {
        updateToken();
        const interval = setInterval(() => {
            if (authTokenRef.current) {
                updateToken();
            }
        }, 1000 * 60 * 4); // Ανανέωση token κάθε 4 λεπτά
        return () => clearInterval(interval);
    }, [updateToken]);

    // Δεδομένα προς διαμοιρασμό
    const contextData = {
        user,
        authTokens,
        authError,
        loginUser,
        loginGoogleUser,
        logoutUser
    };

    return (
        <AuthContext.Provider value={contextData}>
            {loading ? (
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    height: '100vh',
                    fontFamily: 'Arial'
                }}>
                    <p style={{ marginTop: '15px', color: '#666' }}>Loading Fitness Tracker...</p>
                </div>
            ) : children}
        </AuthContext.Provider>
    );
};

// Export στο τέλος για αποφυγή Webpack errors
export default AuthContext;
