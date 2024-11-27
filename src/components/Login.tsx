import React, { useState, useEffect } from 'react';
import { User, Lock, Mail, Shield } from 'lucide-react';
import emailjs from '@emailjs/browser';

interface LoginProps {
  onLogin: (username: string) => void;
}

interface User {
  username: string;
  password: string;
  name: string;
  email: string;
  airtableBaseName: string;
  createdAt: string;
}

export default function Login({ onLogin }: LoginProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [is2FAStep, setIs2FAStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init("UPMrTeNnHFYu9daXu"); // Initialize with your public key
  }, []);

  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const sendVerificationEmail = async (userEmail: string, code: string) => {
    try {
      console.log('Sending email to:', userEmail, 'with code:', code); // Debug log

      const templateParams = {
        to_email: userEmail,
        verification_code: code,
        // Add these parameters to match your EmailJS template
        to_name: username,
        message: `Your verification code is: ${code}`,
      };

      const response = await emailjs.send(
        'service_1medfdc',
        'template_rhy4ndg',
        templateParams,
        'UPMrTeNnHFYu9daXu'
      );

      console.log('Email sent successfully:', response); // Debug log
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      setError('Failed to send verification code: ' + (error as Error).message);
      return false;
    }
  };

  const validateSignUp = () => {
    // Password validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Passcode validation
    if (passcode !== '123456') {
      setError('Invalid passcode');
      return false;
    }

    // Get existing users
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');

    // Check for duplicate username
    if (existingUsers.some((user: User) => user.username === username)) {
      setError('Sorry unfortunately this username is already taken.');
      return false;
    }

    // Check for duplicate email
    if (existingUsers.some((user: User) => user.email === email)) {
      setError('The email address you entered is already associated with an existing account. Please use a different email address or log in to your account.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSignUp) {
      // Validate sign up form
      if (!validateSignUp()) {
        return;
      }

      // Create new user with 2FA disabled by default, no API key, and empty airtable base name
      const newUser: User = {
        username,
        password,
        name: username,
        email,
        airtableBaseName: '', // Initialize as empty string
        createdAt: new Date().toISOString()
      };

      // Get existing users and save new user
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      localStorage.setItem('users', JSON.stringify([...existingUsers, newUser]));
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      
      // Initialize user settings
      localStorage.setItem(`2FA_${username}`, 'false');
      localStorage.setItem(`vapiKey_${username}`, ''); // Initialize empty API key
      
      // Remove any existing API key to prevent inheritance
      localStorage.removeItem('vapiKey');
      
      onLogin(username);
    } else {
      // Special case for admin login - check this BEFORE other logic
      if (username === 'admin' && password === '12345') {
        localStorage.setItem('userName', username);
        localStorage.setItem('userPassword', password);
        localStorage.setItem('currentUser', JSON.stringify({
          username: 'admin',
          password: '12345',
          name: 'Administrator',
          email: 'admin@example.com',
          airtableBaseName: 'Sabos Account',
          createdAt: new Date().toISOString()
        }));
        
        // Initialize admin's API key as empty if it doesn't exist
        if (!localStorage.getItem('vapiKey_admin')) {
          localStorage.setItem('vapiKey_admin', '');
        }
        
        onLogin(username);
        return;
      }

      if (is2FAStep) {
        // Handle 2FA verification
        if (verificationCode === generatedCode) {
          // Get the user data from the users array
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const currentUser = users.find((u: User) => u.username === username);
          
          if (currentUser) {
            // Save all user data to localStorage
            localStorage.setItem('userName', currentUser.name);
            localStorage.setItem('userEmail', currentUser.email);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Get the avatar if it exists
            const userAvatar = localStorage.getItem(`avatar_${currentUser.username}`);
            if (userAvatar) {
              localStorage.setItem('userAvatar', userAvatar);
            }
            
            onLogin(username);
          } else {
            setError('User data not found');
          }
        } else {
          setError('Invalid verification code');
        }
        return;
      }

      // Regular user login logic
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: User) => u.username === username && u.password === password);

      if (user) {
        // Check if 2FA is enabled for this specific user
        const is2FAEnabled = localStorage.getItem(`2FA_${user.username}`) === 'true';
        
        if (is2FAEnabled) {
          // Store user data temporarily
          localStorage.setItem('tempUserData', JSON.stringify(user));
          
          // Generate and send 2FA code
          const code = generateVerificationCode();
          setGeneratedCode(code);
          const emailSent = await sendVerificationEmail(user.email, code);
          
          if (emailSent) {
            setIs2FAStep(true);
            setError('Verification code sent to ' + user.email);
            setTimeout(() => setError(''), 5000);
          }
        } else {
          localStorage.setItem('userName', user.name);
          localStorage.setItem('userPassword', user.password);
          localStorage.setItem('userEmail', user.email);
          localStorage.setItem('currentUser', JSON.stringify(user));
          
          // Remove any existing API key to prevent inheritance
          localStorage.removeItem('vapiKey');
          
          // Initialize API key if it doesn't exist
          if (!localStorage.getItem(`vapiKey_${user.username}`)) {
            localStorage.setItem(`vapiKey_${user.username}`, '');
          }
          
          onLogin(username);
        }
      } else {
        setError('Invalid username or password');
      }
    }
  };

  const handleResendCode = async () => {
    const code = generateVerificationCode();
    setGeneratedCode(code);
    
    let emailToUse;
    if (username === 'admin') {
      emailToUse = 'admin@example.com';
    } else {
      emailToUse = localStorage.getItem('userEmail');
      if (!emailToUse) {
        setError('No email found for this account');
        return;
      }
    }

    const emailSent = await sendVerificationEmail(emailToUse, code);
    if (emailSent) {
      setError('New verification code sent to ' + emailToUse);
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img 
            src="/mrceeschatbot.png" 
            alt="mrceeschatbot Logo" 
            className="h-16 w-16 rounded-full bg-indigo-600 p-2"
          />
        </div>
        <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900">
          {isSignUp ? 'Create an account' : is2FAStep ? 'Enter Verification Code' : 'Sign in to your account'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg relative">
              {error}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!is2FAStep ? (
              <>
                <div>
                  <label htmlFor="username" className="block text-base font-medium text-gray-700">
                    Username
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-6 w-6 text-gray-400" />
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-12 text-base border-gray-300 rounded-lg h-12"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                </div>

                {isSignUp && (
                  <div>
                    <label htmlFor="email" className="block text-base font-medium text-gray-700">
                      Email
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-6 w-6 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-12 text-base border-gray-300 rounded-lg h-12"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="password" className="block text-base font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-6 w-6 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-12 text-base border-gray-300 rounded-lg h-12"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                {isSignUp && (
                  <div>
                    <label htmlFor="passcode" className="block text-base font-medium text-gray-700">
                      Passcode
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-6 w-6 text-gray-400" />
                      </div>
                      <input
                        id="passcode"
                        name="passcode"
                        type="password"
                        required
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-12 text-base border-gray-300 rounded-lg h-12"
                        placeholder="Enter passcode"
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div>
                <label htmlFor="verificationCode" className="block text-base font-medium text-gray-700">
                  Verification Code
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-6 w-6 text-gray-400" />
                  </div>
                  <input
                    id="verificationCode"
                    name="verificationCode"
                    type="text"
                    required
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-12 text-base border-gray-300 rounded-lg h-12"
                    placeholder="Enter verification code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Resend verification code
                </button>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isSignUp ? 'Sign up' : is2FAStep ? 'Verify' : 'Sign in'}
              </button>
            </div>
          </form>

          {!is2FAStep && (
            <div className="mt-6">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setUsername('');
                  setPassword('');
                  setEmail('');
                  setPasscode('');
                }}
                className="w-full text-center text-sm text-indigo-600 hover:text-indigo-500"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 