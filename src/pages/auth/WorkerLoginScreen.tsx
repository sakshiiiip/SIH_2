import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCooperativeStore } from '../../store/cooperativeStore';
import { workerAuthService, WorkerAuthAccount } from '../../services/workerAuthService';
import { User, Worker } from '../../types';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Key,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { SahaAILogo } from '../../components/common/SahaAILogo';

interface WorkerLoginScreenProps {
  onSuccess: (userObj: User) => void;
}

export const WorkerLoginScreen: React.FC<WorkerLoginScreenProps> = ({ onSuccess }) => {
  const { t } = useTranslation();
  const { workers, showToast } = useCooperativeStore();

  // Screen steps: 'login' | 'first_time_password' | 'forgot_password'
  const [step, setStep] = useState<'login' | 'first_time_password' | 'forgot_password'>('login');

  // Form inputs
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // First-time password change states
  const [tempWorkerAccount, setTempWorkerAccount] = useState<WorkerAuthAccount | null>(null);
  const [tempPasswordInput, setTempPasswordInput] = useState('');
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forgot password flow states
  const [forgotStep, setForgotStep] = useState<'request' | 'verify_and_set'>('request');
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [maskedContact, setMaskedContact] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);

  // -------------------------------------------------------------
  // HANDLER: LOGIN SUBMISSION
  // -------------------------------------------------------------
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      showToast({
        title: 'Missing Credentials',
        message: 'Please enter your registered Email or Worker ID, and Password.',
        type: 'warning',
      });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      // Authenticate via workerAuthService
      const result = workerAuthService.authenticate(identifier, password);

      if (!result.success || !result.account) {
        showToast({
          title: 'Login Failed',
          message: result.error || 'Invalid Worker ID/Email or password.',
          type: 'warning',
        });
        return;
      }

      const account = result.account;

      // FIRST-TIME LOGIN FLOW CHECK
      if (result.isFirstLogin) {
        setTempWorkerAccount(account);
        setTempPasswordInput(password); // Pre-fill temporary password for validation
        setStep('first_time_password');
        showToast({
          title: 'First-Time Login',
          message: 'Please set your permanent password to continue.',
          type: 'info',
        });
        return;
      }

      // REGULAR LOGIN FLOW
      completeSuccessfulLogin(account, rememberMe);
    }, 600);
  };

  // -------------------------------------------------------------
  // HANDLER: FIRST TIME PASSWORD CHANGE
  // -------------------------------------------------------------
  const handleFirstTimePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempWorkerAccount) return;

    if (!tempPasswordInput.trim()) {
      showToast({
        title: 'Error',
        message: 'Please enter the temporary password issued to you.',
        type: 'warning',
      });
      return;
    }

    if (newPassword.length < 6) {
      showToast({
        title: 'Weak Password',
        message: 'Your new password must be at least 6 characters.',
        type: 'warning',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast({
        title: 'Password Mismatch',
        message: 'New password and confirmation do not match.',
        type: 'warning',
      });
      return;
    }

    if (newPassword === tempPasswordInput) {
      showToast({
        title: 'Invalid Password',
        message: 'New password cannot be the same as the temporary password.',
        type: 'warning',
      });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      const updateResult = workerAuthService.completeFirstTimePassword(
        tempWorkerAccount.workerId,
        tempPasswordInput,
        newPassword
      );

      if (!updateResult.success || !updateResult.account) {
        showToast({
          title: 'Update Failed',
          message: updateResult.error || 'Failed to update password.',
          type: 'warning',
        });
        return;
      }

      showToast({
        title: 'Password Changed ✓',
        message: 'Your permanent password has been set. Redirecting to your dashboard...',
        type: 'success',
      });

      // Redirect worker to Worker Dashboard
      completeSuccessfulLogin(updateResult.account, rememberMe);
    }, 700);
  };

  // -------------------------------------------------------------
  // HANDLER: FORGOT PASSWORD FLOW
  // -------------------------------------------------------------
  const handleForgotRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) {
      showToast({
        title: 'Required',
        message: 'Please enter your registered email or Worker ID.',
        type: 'warning',
      });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const res = workerAuthService.requestPasswordReset(forgotIdentifier);
      if (!res.success) {
        showToast({
          title: 'Not Found',
          message: res.error || 'No registered worker account found.',
          type: 'warning',
        });
        return;
      }

      setMaskedContact(res.maskedContact || forgotIdentifier);
      setForgotStep('verify_and_set');
      setVerificationCode('123456'); // Pre-fill mock verification code for demo ease
      showToast({
        title: 'Verification Sent',
        message: `6-digit reset code generated for ${res.maskedContact}`,
        type: 'info',
      });
    }, 600);
  };

  const handleForgotResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      showToast({
        title: 'Required',
        message: 'Please enter the verification code.',
        type: 'warning',
      });
      return;
    }

    if (forgotNewPassword.length < 6) {
      showToast({
        title: 'Weak Password',
        message: 'New password must be at least 6 characters.',
        type: 'warning',
      });
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      showToast({
        title: 'Mismatch',
        message: 'Passwords do not match.',
        type: 'warning',
      });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const res = workerAuthService.resetPassword(forgotIdentifier, forgotNewPassword);
      if (!res.success) {
        showToast({
          title: 'Error',
          message: res.error || 'Failed to reset password.',
          type: 'warning',
        });
        return;
      }

      showToast({
        title: 'Password Reset Successful',
        message: 'You can now sign in with your new password.',
        type: 'success',
      });
      setStep('login');
      setPassword('');
      setForgotStep('request');
      setForgotIdentifier('');
      setForgotNewPassword('');
      setForgotConfirmPassword('');
    }, 700);
  };

  // -------------------------------------------------------------
  // FINISH LOGIN & REDIRECT TO WORKER DASHBOARD
  // -------------------------------------------------------------
  const completeSuccessfulLogin = (account: WorkerAuthAccount, isRemembered: boolean) => {
    // Save session using token (never storing raw password in storage)
    workerAuthService.saveSession(account, isRemembered);

    // Find full worker object from store or build user object
    const matchedStoreWorker: Worker | undefined = workers.find(
      (w) =>
        w.id.toLowerCase() === account.workerId.toLowerCase() ||
        w.email.toLowerCase() === account.email.toLowerCase()
    );

    const userObj: User = {
      id: matchedStoreWorker ? matchedStoreWorker.id : account.workerId,
      name: account.name,
      email: account.email,
      phone: account.phone,
      role: 'worker',
      avatar:
        account.avatar ||
        matchedStoreWorker?.avatar ||
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      address: `Staff Block 102, Cooperative Quarters, ${account.societyName}`,
      societyId: account.societyId,
      societyName: account.societyName,
      tradeProfession: account.skills[0] || 'Tradesperson',
    };

    showToast({
      title: 'Sign In Successful',
      message: `Welcome back, ${account.name}! Redirecting to Worker Dashboard.`,
      type: 'success',
    });

    onSuccess(userObj);
  };

  // Helper to prefill dummy credentials for quick Hackathon evaluation
  const prefillDemo = (id: string, pass: string) => {
    setIdentifier(id);
    setPassword(pass);
  };

  // =============================================================
  // RENDER: FIRST TIME WORKER LOGIN ("Set Your New Password")
  // =============================================================
  if (step === 'first_time_password') {
    return (
      <div className="space-y-5 pt-1 relative z-10 animate-fade-in">
        <div className="p-4 bg-[#EEF4FA] border border-[#B8CBDD] rounded-2xl">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-[#537895]" />
            <h2 className="text-sm font-bold text-[#324F66]">{t('workerLogin.firstTimeTitle', { defaultValue: 'Set Your New Password' })}</h2>
          </div>
          <p className="text-xs text-[#537895] mt-1 leading-relaxed">
            {t('workerLogin.firstTimeWelcome', { defaultValue: 'Welcome to the cooperative network, ' })}
            <strong className="text-[#324F66]">{tempWorkerAccount?.name}</strong>.
            {' '}{t('workerLogin.firstTimeDesc', { defaultValue: 'You are signing in with a temporary password. Please establish a permanent password to access your Worker Dashboard.' })}
          </p>
        </div>

        <form onSubmit={handleFirstTimePasswordSubmit} className="space-y-4">
          {/* Temporary Password Field */}
          <div>
            <label className="text-xs font-bold text-[#524E47] block mb-1.5 uppercase tracking-wider">
              {t('workerLogin.tempPassword', { defaultValue: 'Temporary Password' })}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9A958B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showTempPassword ? 'text' : 'password'}
                value={tempPasswordInput}
                onChange={(e) => setTempPasswordInput(e.target.value)}
                placeholder={t('workerLogin.enterTempPassword', { defaultValue: 'Enter issued temporary password' })}
                className="w-full pl-10 pr-10 py-3 bg-[#FCF9F3] border border-[#E8E2D5] rounded-xl text-sm font-mono text-[#292824] focus:outline-none focus:ring-2 focus:ring-[#537895] shadow-subtle"
                required
              />
              <button
                type="button"
                onClick={() => setShowTempPassword(!showTempPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9A958B] hover:text-[#524E47] p-0.5 cursor-pointer"
                aria-label={showTempPassword ? 'Hide password' : 'Show password'}
              >
                {showTempPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password Field */}
          <div>
            <label className="text-xs font-bold text-[#524E47] block mb-1.5 uppercase tracking-wider">
              {t('workerLogin.newPassword', { defaultValue: 'New Password' })}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9A958B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('workerLogin.createStrongPassword', { defaultValue: 'Create a strong password (min 6 characters)' })}
                className="w-full pl-10 pr-10 py-3 bg-[#FCF9F3] border border-[#E8E2D5] rounded-xl text-sm text-[#292824] focus:outline-none focus:ring-2 focus:ring-[#537895] shadow-subtle"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9A958B] hover:text-[#524E47] p-0.5 cursor-pointer"
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password Field */}
          <div>
            <label className="text-xs font-bold text-[#524E47] block mb-1.5 uppercase tracking-wider">
              {t('workerLogin.confirmNewPassword', { defaultValue: 'Confirm New Password' })}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9A958B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('workerLogin.confirmPasswordPlaceholder', { defaultValue: 'Confirm your new password' })}
                className="w-full pl-10 pr-10 py-3 bg-[#FCF9F3] border border-[#E8E2D5] rounded-xl text-sm text-[#292824] focus:outline-none focus:ring-2 focus:ring-[#537895] shadow-subtle"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9A958B] hover:text-[#524E47] p-0.5 cursor-pointer"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember me checkbox */}
          <div className="flex items-center gap-2 px-1">
            <input
              type="checkbox"
              id="first-time-remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-[#B8CBDD] text-[#537895] focus:ring-[#537895] cursor-pointer"
            />
            <label htmlFor="first-time-remember" className="text-xs font-semibold text-[#524E47] cursor-pointer">
              {t('workerLogin.rememberDevice', { defaultValue: 'Remember me on this device' })}
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-[#537895] hover:bg-[#41637E] text-white transition-all duration-150 cursor-pointer shadow-sm active:scale-[0.98]"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{t('workerLogin.changePasswordContinue', { defaultValue: 'Change Password & Continue' })}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setStep('login')}
            className="text-xs font-bold text-[#77736B] hover:text-[#292824] transition-colors cursor-pointer"
          >
            {t('workerLogin.backToSignIn', { defaultValue: '← Back to Sign In' })}
          </button>
        </div>
      </div>
    );
  }

  // =============================================================
  // RENDER: FORGOT PASSWORD FLOW
  // =============================================================
  if (step === 'forgot_password') {
    return (
      <div className="space-y-5 pt-1 relative z-10 animate-fade-in">
        <div>
          <h2 className="text-lg font-bold text-[#292824]">{t('workerLogin.resetPasswordTitle', { defaultValue: 'Reset Your Password' })}</h2>
          <p className="text-xs text-[#77736B] mt-0.5">
            {forgotStep === 'request'
              ? t('workerLogin.forgotStepRequestDesc', { defaultValue: 'Enter your registered Email or Worker ID to receive a verification code.' })
              : t('workerLogin.forgotStepVerifyDesc', { defaultValue: 'Enter the code sent to {{contact}} and set your new password.', contact: maskedContact })}
          </p>
        </div>

        {forgotStep === 'request' ? (
          <form onSubmit={handleForgotRequest} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#524E47] block mb-1.5 uppercase tracking-wider">
                {t('workerLogin.registeredEmailOrId', { defaultValue: 'Registered Email or Worker ID' })}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9A958B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  placeholder={t('workerLogin.emailOrIdPlaceholder', { defaultValue: 'e.g. worker@example.com or WRK001' })}
                  className="w-full pl-10 pr-4 py-3 bg-[#FCF9F3] border border-[#E8E2D5] rounded-xl text-sm text-[#292824] focus:outline-none focus:ring-2 focus:ring-[#537895] shadow-subtle"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2.5">
              <Button
                variant="outline"
                type="button"
                className="flex-1 py-3"
                onClick={() => setStep('login')}
              >
                {t('common.cancel', { defaultValue: 'Cancel' })}
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 bg-[#537895] hover:bg-[#41637E] text-white"
              >
                {isLoading ? t('common.verifying', { defaultValue: 'Verifying...' }) : t('common.nextStep', { defaultValue: 'Next Step →' })}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleForgotResetSubmit} className="space-y-4">
            {/* Mock notice pill */}
            <div className="p-2.5 bg-[#EEF4FA] border border-[#B8CBDD] rounded-xl text-[11px] text-[#324F66]">
              {t('workerLogin.verificationSentNotice', { defaultValue: 'Verification code sent to ' })}<strong>{maskedContact}</strong>. ({t('workerLogin.demoCode', { defaultValue: 'Hackathon Demo code: ' })}<strong>123456</strong>)
            </div>

            <div>
              <label className="text-xs font-bold text-[#524E47] block mb-1.5 uppercase tracking-wider">
                {t('workerLogin.sixDigitCode', { defaultValue: '6-Digit Verification Code' })}
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="123456"
                className="w-full px-3.5 py-2.5 bg-[#FCF9F3] border border-[#E8E2D5] rounded-xl text-sm font-mono tracking-widest text-center text-[#292824] focus:outline-none focus:ring-2 focus:ring-[#537895]"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#524E47] block mb-1.5 uppercase tracking-wider">
                {t('workerLogin.newPassword', { defaultValue: 'New Password' })}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9A958B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showForgotNewPassword ? 'text' : 'password'}
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                  placeholder={t('workerLogin.enterNewPassword', { defaultValue: 'Enter new password' })}
                  className="w-full pl-10 pr-10 py-3 bg-[#FCF9F3] border border-[#E8E2D5] rounded-xl text-sm text-[#292824] focus:outline-none focus:ring-2 focus:ring-[#537895]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9A958B] cursor-pointer"
                >
                  {showForgotNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#524E47] block mb-1.5 uppercase tracking-wider">
                {t('workerLogin.confirmNewPassword', { defaultValue: 'Confirm New Password' })}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#9A958B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showForgotNewPassword ? 'text' : 'password'}
                  value={forgotConfirmPassword}
                  onChange={(e) => setForgotConfirmPassword(e.target.value)}
                  placeholder={t('workerLogin.confirmNewPassword', { defaultValue: 'Confirm new password' })}
                  className="w-full pl-10 pr-10 py-3 bg-[#FCF9F3] border border-[#E8E2D5] rounded-xl text-sm text-[#292824] focus:outline-none focus:ring-2 focus:ring-[#537895]"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2.5">
              <Button
                variant="outline"
                type="button"
                className="flex-1 py-3"
                onClick={() => setForgotStep('request')}
              >
                {t('common.back', { defaultValue: 'Back' })}
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 bg-[#537895] hover:bg-[#41637E] text-white"
              >
                {isLoading ? t('common.resetting', { defaultValue: 'Resetting...' }) : t('workerLogin.resetAndSignIn', { defaultValue: 'Reset & Sign In' })}
              </Button>
            </div>
          </form>
        )}
      </div>
    );
  }

  // =============================================================
  // RENDER: INDIVIDUAL WORKER LOGIN SCREEN (Main Form)
  // =============================================================
  return (
    <div className="space-y-6 pt-1 relative z-10 animate-fade-in">
      {/* Header matching requirements */}
      <div className="text-center space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold font-display text-[#292824] tracking-tight">
          {t('workerLogin.welcomeBack', 'Welcome back!')}
        </h2>
        <p className="text-xs sm:text-sm text-[#77736B]">
          {t('workerLogin.manageJobsDesc', 'Sign in to manage your jobs.')}
        </p>
      </div>

      <form onSubmit={handleLoginSubmit} className="space-y-4">
        {/* Field 1: Email / Worker ID */}
        <div>
          <label className="text-xs font-bold text-[#524E47] block mb-1.5 uppercase tracking-wider">
            {t('workerLogin.emailOrWorkerId', 'EMAIL / WORKER ID')}
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#9A958B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={t('workerLogin.enterRegisteredEmailOrId', 'Enter your registered email or Worker ID')}
              className="w-full pl-10 pr-4 py-3 bg-[#FCF9F3] border border-[#E8E2D5] rounded-xl text-sm font-medium text-[#292824] placeholder:text-[#9A958B] focus:outline-none focus:ring-2 focus:ring-[#537895] shadow-subtle transition-all"
              required
            />
          </div>
        </div>

        {/* Field 2: Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-[#524E47] uppercase tracking-wider">
              {t('workerLogin.password', 'PASSWORD')}
            </label>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#9A958B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('workerLogin.enterPassword', 'Enter your password')}
              className="w-full pl-10 pr-10 py-3 bg-[#FCF9F3] border border-[#E8E2D5] rounded-xl text-sm text-[#292824] placeholder:text-[#9A958B] focus:outline-none focus:ring-2 focus:ring-[#537895] shadow-subtle transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9A958B] hover:text-[#524E47] transition-colors p-0.5 cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember me Checkbox */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember-me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-[#B8CBDD] text-[#537895] focus:ring-[#537895] cursor-pointer"
            />
            <label
              htmlFor="remember-me"
              className="text-xs font-semibold text-[#524E47] cursor-pointer select-none"
            >
              {t('workerLogin.rememberMe', 'Remember me')}
            </label>
          </div>

          <button
            type="button"
            onClick={() => setStep('forgot_password')}
            className="text-xs font-bold text-[#537895] hover:underline cursor-pointer"
          >
            {t('workerLogin.forgotPasswordQuestion', 'Forgot password?')}
          </button>
        </div>

        {/* [ Sign In ] Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-[#537895] hover:bg-[#41637E] text-white transition-all duration-150 cursor-pointer shadow-sm active:scale-[0.98]"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>{t('workerLogin.signIn', 'Sign In')}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Footer text required by prompt */}
      <div className="pt-2 text-center border-t border-[#E8E2D5]">
        <p className="text-xs text-[#77736B]">
          {t('workerLogin.noAccount', "Don't have an account?")}{' '}
          <span className="font-bold text-[#292824]">{t('workerLogin.contactSocietyManager', 'Contact your Society Manager.')}</span>
        </p>
      </div>

      {/* QUICK DEMO CREDENTIALS BOX (Per user request) */}
      <div className="p-3 bg-[#F3EEE4] border border-[#E8E2D5] rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#77736B] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#537895]" />
            <span>{t('workerLogin.testDemoCredentials', 'TEST / DEMO CREDENTIALS')}</span>
          </span>
          <span className="text-[10px] text-[#9A958B]">{t('workerLogin.clickToTest', 'Click to test')}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {/* Demo 1: First-time login */}
          <button
            type="button"
            onClick={() => prefillDemo('WRK001', 'temp123')}
            className="p-2 text-left bg-white border border-[#E8E2D5] hover:border-[#537895] rounded-lg transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <strong className="text-[11px] text-[#292824] block">{t('workerLogin.demo1Title', '1. First-Time Login')}</strong>
              <span className="text-[9px] px-1.5 py-0.2 bg-[#FAEDE8] text-[#80432E] rounded font-bold">{t('workerLogin.tempPassBadge', 'Temp Pass')}</span>
            </div>
            <span className="text-[10px] text-[#77736B] font-mono block mt-0.5">
              ID: WRK001 · Pass: temp123
            </span>
          </button>

          {/* Demo 2: Activated account */}
          <button
            type="button"
            onClick={() => prefillDemo('WRK002', 'worker123')}
            className="p-2 text-left bg-white border border-[#E8E2D5] hover:border-[#537895] rounded-lg transition-colors cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <strong className="text-[11px] text-[#292824] block">{t('workerLogin.demo2Title', '2. Regular Worker')}</strong>
              <span className="text-[9px] px-1.5 py-0.2 bg-[#E6ECE4] text-[#364A32] rounded font-bold">{t('workerLogin.directAccessBadge', 'Direct Access')}</span>
            </div>
            <span className="text-[10px] text-[#77736B] font-mono block mt-0.5">
              ID: WRK002 · Pass: worker123
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
