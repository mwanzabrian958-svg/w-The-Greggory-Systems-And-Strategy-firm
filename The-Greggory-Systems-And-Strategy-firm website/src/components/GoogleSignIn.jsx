import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const GoogleSignIn = ({ buttonText = 'Sign up with Google', isSignUp = true }) => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Google Sign-In only activates when a real OAuth client ID is configured.
  // Placeholder/unset IDs previously crashed Google's script with console errors
  // and could blank the surrounding auth pages.
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const GOOGLE_ENABLED =
    Boolean(GOOGLE_CLIENT_ID) && !/your_google_client_id/i.test(GOOGLE_CLIENT_ID);

  const handleSuccess = async (credentialResponse) => {
    try {
      // Call backend to verify and authenticate
      const response = await usersAPI.googleAuth({
        credential: credentialResponse.credential,
        isSignUp
      });

      if (!response.success) throw new Error(response.message || 'Authentication failed');

      const userData = response.user;
      const userInfo = {
        role: userData.role || 'user',
        name: userData.display_name || (userData.first_name && userData.last_name
          ? `${userData.first_name} ${userData.last_name}`
          : userData.email.split('@')[0]),
        email: userData.email,
        userId: userData.id,
        id: userData.id,
        first_name: userData.first_name,
        last_name: userData.last_name,
        display_name: userData.display_name,
        token: response.token,
        has_photo: !!userData.has_photo,
        whatsapp_verified: true
      };

      // Store in auth context
      login(userInfo);
      
      // Redirect to home/dashboard
      navigate('/');
    } catch (error) {
      console.error('MISSION CRITICAL: Google Auth Protocol Failure:', error);
      alert(error.message || 'Failed to authorize via Google Secure Relay.');
    }
  };

  const handleError = () => {
    console.error('Google Sign-In Failed');
    alert('Google Sign-In was not successful. Please try again.');
  };

  if (!GOOGLE_ENABLED) return null;

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div className="w-full">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap={isSignUp}
          text={isSignUp ? 'signup_with' : 'signin_with'}
          size="large"
          width="100%"
          theme="outline"
          shape="rectangular"
          logo_alignment="left"
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleSignIn;
