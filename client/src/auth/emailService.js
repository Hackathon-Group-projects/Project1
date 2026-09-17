import emailjs from '@emailjs/browser';

// EmailJS credentials
export const EMAILJS_CONFIG = {
  PUBLIC_KEY: 'Rv9OI7Kuv-0fXPitD',
  SERVICE_ID: 'service_ks9da0p',
  TEMPLATE_ID: 'template_4apjjhf',
};

// Initialize EmailJS instance
emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);

// Generate random 4-digit numeric code
export function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Send OTP email
export async function sendOtpEmail(email, otpCode) {
  const templateParams = {
    email: email,
    passcode: otpCode,
    time: new Date(Date.now() + 15 * 60000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };

  return emailjs.send(
    EMAILJS_CONFIG.SERVICE_ID,
    EMAILJS_CONFIG.TEMPLATE_ID,
    templateParams
  );
}