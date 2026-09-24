import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Google Sign-In is driven entirely by VITE_GOOGLE_CLIENT_ID, which Vite bakes
// into the bundle at BUILD time (import.meta.env is not read at runtime). A
// missing/placeholder value can never work, so the widget is hidden instead of
// rendering a broken Google button — and the dev console says exactly why.
const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();
export const googleSignInEnabled =
  Boolean(GOOGLE_CLIENT_ID) && !/your_google_client_id/i.test(GOOGLE_CLIENT_ID);

if (!googleSignInEnabled && import.meta.env?.DEV) {
  console.warn(
    '[GoogleSignIn] hidden — VITE_GOOGLE_CLIENT_ID is empty or still the placeholder. ' +
      'Set it in .env to the SAME OAuth 2.0 client id as GOOGLE_CLIENT_ID, then RESTART the ' +
      'dev server (Vite reads .env only at start-up; production needs it set at build time). ' +
      'Full walkthrough: GOOGLE_SIGNIN_SETUP.md'
  );
}

/**
 * Google sign-in / sign-up button, shared by /login and /signup.
 *
 * The backend (POST /api/users/google-auth) BOTH registers and signs in: the
 * first Google sign-in creates the client node, later ones sign it in. On
 * success we store the exact same session shape as the password login and drop
 * the client into the portal.
 */
const GoogleSignIn = ({ buttonText = 'Sign up with Google', isSignUp = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Google renders the button as an iframe and only accepts a PIXEL width
  // (200–400); `width="100%"` is rejected with "[GSI_LOGGER]: Provided button
  // width is invalid: 100%" and silently falls back to the default size. Track
  // the container width and clamp it into Google's accepted range instead.
  const wrapRef = useRef(null);
  const [buttonWidth, setButtonWidth] = useState(320);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const measured = Math.round(el.getBoundingClientRect().width);
      if (measured > 0) setButtonWidth(Math.min(400, Math.max(200, measured)));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const handleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      alert('Google did not return a sign-in credential. Please try again.');
      return;
    }

    try {
      // The backend verifies the Google ID token against GOOGLE_CLIENT_ID and
      // returns a real session token — never trust the credential in the client.
      const response = await usersAPI.googleAuth({
        credential: credentialResponse.credential,
        isSignUp
      });

      if (!response?.success) throw new Error(response?.message || 'Google authentication failed');

      // Tolerate both response shapes: { token, user: {...} } and flat fields.
      const userData = response.user || response;
      const token = response.token || userData.token;
      if (!token) throw new Error('Google sign-in succeeded but no session token was returned');

      const fallbackName =
        userData.display_name ||
        (userData.first_name && userData.last_name
          ? `${userData.first_name} ${userData.last_name}`
          : String(userData.email || '').split('@')[0]);

      // Same session shape the password login stores (AuthContext.login), so
      // PrivateRoute, /client-portal and every API call behave identically.
      login({
        role: userData.role || userData.primary_role || 'user',
        name: fallbackName,
        email: userData.email,
        userId: userData.id,
        id: userData.id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        display_name: userData.display_name,
        token,
        has_photo: !!userData.has_photo,
        profilePhotoData: userData.profilePhotoData || null,
        whatsapp_verified: true
      });

      // Same destination as the password login: back to the page that bounced
      // the client here, otherwise the portal (not the marketing home page).
      navigate(location.state?.from || '/client-portal', { replace: true });
    } catch (error) {
      console.error('Google Auth protocol failure:', error);
      alert(error.message || 'Google sign-in failed. Please try again.');
    }
  };

  const handleError = () => {
    console.error('Google Sign-In Failed');
    alert('Google Sign-In was not successful. Please try again.');
  };

  if (!googleSignInEnabled) return null;

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="w-full" ref={wrapRef}>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap={isSignUp}
          text={isSignUp ? 'signup_with' : 'signin_with'}
          size="large"
          width={buttonWidth}
          theme="outline"
          shape="rectangular"
          logo_alignment="left"
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleSignIn;
