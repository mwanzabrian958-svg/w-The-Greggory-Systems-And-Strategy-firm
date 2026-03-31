import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const GoogleSignIn = ({ buttonText = 'Sign up with Google', isSignUp = true }) => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      
      // Call your backend to authenticate or register the user
      const response = await usersAPI.googleAuth({
        token: credentialResponse.credential,
        isSignUp,
      });

      // Login the user
      login(response.data.token, response.data.user);
      
      // Redirect to dashboard or intended page
      navigate('/dashboard');
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      alert('Failed to sign in with Google. Please try again.');
    }
  };

  const handleError = () => {
    console.error('Google Sign-In Failed');
    alert('Google Sign-In was not successful. Please try again.');
  };

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
