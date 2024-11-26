import React, { useState, useEffect } from 'react';
import { User, Lock, Mail, Shield } from 'lucide-react';
import emailjs from '@emailjs/browser';

interface LoginProps {
  onLogin: (username: string) => void;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSignUp) {
      // Handle sign up
      if (passcode !== '123456') {
        setError('Invalid passcode');
        return;
      }

      if (!email.includes('@')) {
        setError('Please enter a valid email');
        return;
      }

      // Store user data in localStorage
      localStorage.setItem('userName', username);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userPassword', password);
      onLogin(username);
    } else {
      if (is2FAStep) {
        // Verify 2FA code
        if (verificationCode === generatedCode) {
          onLogin(username);
        } else {
          setError('Invalid verification code');
        }
        return;
      }

      // Handle initial login
      const storedUsername = localStorage.getItem('userName');
      const storedPassword = localStorage.getItem('userPassword');
      const storedEmail = localStorage.getItem('userEmail');

      if ((username === storedUsername && password === storedPassword) || 
          (username === 'admin' && password === '12345')) {
        
        // Generate and send 2FA code
        const code = generateVerificationCode();
        setGeneratedCode(code);
        
        // Get the correct email based on the login type
        let emailToUse;
        if (username === 'admin') {
          emailToUse = 'admin@example.com';
        } else {
          // Find the email associated with this username
          emailToUse = localStorage.getItem('userEmail');
          if (!emailToUse) {
            setError('No email found for this account');
            return;
          }
        }

        console.log('Attempting to send email to:', emailToUse); // Debug log
        
        const emailSent = await sendVerificationEmail(emailToUse, code);

        if (emailSent) {
          setIs2FAStep(true);
          setError('Verification code sent to ' + emailToUse); // Show user where the code was sent
          setTimeout(() => setError(''), 5000);
        } else {
          setError('Failed to send verification code. Please try again.');
        }
      } else {
        setError('Invalid username or password');
        setTimeout(() => setError(''), 3000);
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
                <p className="mt-2 text-sm text-gray-500">
                  Please check your email for the verification code.
                </p>
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