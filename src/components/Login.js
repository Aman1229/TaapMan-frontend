import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Create this CSS file
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  const [timer, setTimer] = useState(112); // 1:52 in seconds
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let interval;
    if (showOtpField && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showOtpField, timer]);

  const handleSendOTP = async () => {
    try {
      setLoading(true);
      await axios.post('http://localhost:3001/api/auth/send-otp', { phone });
      setShowOtpField(true);
      setTimer(112); // Reset timer
      alert('OTP sent!');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setLoading(true);
      const { data } = await axios.post('http://localhost:3001/api/auth/verify-otp', { phone, otp });
      localStorage.setItem('token', data.token);
      setPhone('');
      setOtp('');
      navigate('/dashboard');
    } catch (error) {
      alert(error.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="brand-header">
          <img src="/taapman-logo.png" alt="Taapman Logo" className="logo" />
          <h2>Welcome to Taapman</h2>
        </div>

        {!showOtpField ? (
          <div className="phone-section">
            <h3>Sign In With Phone Number</h3>
            <div className="phone-input">
              <span className="country-code">+91</span>
              <input
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              />
            </div>
            <button 
              onClick={handleSendOTP}
              disabled={phone.length !== 10 || loading}
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </div>
        ) : (
          <div className="otp-section">
            <h3>OTP Verification</h3>
            <p className="otp-message">Enter the OTP sent to +91 {phone}</p>
            
            <div className="otp-input">
              <input
                type="number"
                value={otp}
                onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                placeholder="Enter 6-digit OTP"
              />
            </div>

            <div className="timer-resend">
              {timer > 0 ? (
                <span className="timer">Resend OTP in {formatTime(timer)}</span>
              ) : (
                <button 
                  className="resend-btn"
                  onClick={handleSendOTP}
                  disabled={loading}
                >
                  Resend Code
                </button>
              )}
            </div>

            <button 
              onClick={handleVerifyOTP}
              disabled={otp.length !== 6 || loading}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;