const { Resend } = require('resend');
const redisClient = require('../config/redis');

// Initialize Resend
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Helper to format phone number to E.164
const formatPhoneNumber = (phone) => {
  let formatted = phone.replace(/[\s()-]/g, '');
  if (!formatted.startsWith('+')) {
    if (formatted.startsWith('0')) {
      formatted = formatted.substring(1);
    }
    if (formatted.length === 10) {
      formatted = '+91' + formatted;
    } else {
      formatted = '+' + formatted;
    }
  }
  return formatted;
};

// Generates a 6-digit OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.requestOtp = async (req, res, next) => {
  try {
    const { email, phone, name } = req.body;
    const recipientName = name || 'User';

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        error: { message: 'Either email or phone number is required to request an OTP.' }
      });
    }

    const otpCode = generateOtp();

    if (email) {
      // Validate Email Format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: { message: 'Invalid email address format.' }
        });
      }

      // Store in Redis
      const redisKey = `otp:${email.trim().toLowerCase()}`;
      await redisClient.setex(redisKey, 600, otpCode);

      // Email HTML Template (Matching the premium branding in client)
      const htmlContent = `
        <div style="font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6; padding: 40px 10px; margin: 0; min-height: 100%;">
          <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;">
            <div style="background: linear-gradient(135deg, #121316 0%, #0a0a0b 100%); padding: 35px 20px; text-align: center; border-bottom: 3px solid #ca0013;">
              <div style="display: inline-block; margin-bottom: 15px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none" style="display: block; margin: 0 auto;">
                  <path d="M12 28C12 16.9543 20.9543 8 32 8C43.0457 8 52 16.9543 52 28" stroke="#FF9933" stroke-width="4" stroke-linecap="round"/>
                  <path d="M56 28C56 41.2548 45.2548 52 32 52C18.7452 52 8 41.2548 8 28" stroke="#128807" stroke-width="4" stroke-linecap="round"/>
                  <circle cx="32" cy="28" r="8" stroke="#000080" stroke-width="1.5"/>
                  <circle cx="32" cy="28" r="2" fill="#000080"/>
                  <line x1="32" y1="20" x2="32" y2="36" stroke="#000080" stroke-width="0.75"/>
                  <line x1="24" y1="28" x2="40" y2="28" stroke="#000080" stroke-width="0.75"/>
                  <line x1="26.34" y1="22.34" x2="37.66" y2="33.66" stroke="#000080" stroke-width="0.75"/>
                  <line x1="26.34" y1="33.66" x2="37.66" y2="22.34" stroke="#000080" stroke-width="0.75"/>
                  <path d="M18 38H46" stroke="#FF9933" stroke-width="3" stroke-linecap="round"/>
                  <path d="M22 42H42" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
                  <path d="M26 46H38" stroke="#128807" stroke-width="3" stroke-linecap="round"/>
                </svg>
              </div>
              <div style="font-size: 20px; font-weight: 900; letter-spacing: 2px; color: #ffffff; text-transform: uppercase; margin: 0; font-family: sans-serif;">
                <span style="color: #ffffff;">Bharat</span> <span style="color: #128807;">Aero</span>
              </div>
              <div style="font-size: 10px; font-weight: 700; color: #9ca3af; letter-spacing: 3px; text-transform: uppercase; margin-top: 4px;">
                Drone Flight Operations
              </div>
            </div>
            <div style="padding: 40px 30px; background-color: #ffffff; text-align: left;">
              <h3 style="font-size: 15px; color: #1f2937; margin-top: 0; margin-bottom: 12px; font-weight: 700; font-family: sans-serif;">
                Hello ${recipientName},
              </h3>
              <p style="font-size: 13px; color: #4b5563; line-height: 1.6; margin-bottom: 25px;">
                Welcome to the secure flight portal of <strong>Bharat Aero</strong>. Please verify your identity using the verification code below to gain access to your drone operations dashboard:
              </p>
              <div style="background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); border: 1px solid #e5e7eb; border-left: 5px solid #ca0013; border-radius: 16px; padding: 25px; text-align: center; margin-bottom: 30px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
                <span style="font-size: 10px; font-weight: 800; color: #ca0013; text-transform: uppercase; letter-spacing: 2px; display: block; margin-bottom: 12px;">Security Passcode</span>
                <div style="font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #111827; font-family: 'Courier New', Courier, monospace; text-shadow: 1px 1px 1px rgba(0,0,0,0.05); display: inline-block; padding-left: 8px;">
                  ${otpCode}
                </div>
                <span style="font-size: 11px; color: #6b7280; display: block; margin-top: 12px; font-weight: 500;">Valid for 10 minutes only</span>
              </div>
              <p style="font-size: 12px; color: #9ca3af; line-height: 1.5; margin-bottom: 0; border-top: 1px solid #f3f4f6; padding-top: 20px;">
                If you did not request this OTP, please disregard this transmission or contact Bharat Aero support immediately.
              </p>
            </div>
            <div style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #f3f4f6;">
              <div style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; font-size: 10px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 1.5px;">
                <span>Safe & Secure</span>
                <span style="color: #ca0013; font-size: 12px; margin: 0 4px;">•</span>
                <span>Proudly Made in India</span>
              </div>
              <p style="font-size: 9px; color: #d1d5db; margin: 8px 0 0 0;">
                © 2026 Bharat Aero Autonomous Systems. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `;

      if (resend) {
        try {
          await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Your Bharat Aero OTP Verification Code',
            html: htmlContent
          });
        } catch (resendErr) {
          console.warn('[Resend] Direct Resend dispatch failed:', resendErr.message);
          // Fallback simulation print for testing in case of sandbox or key issues
          console.log(`%c[BACKEND SECURITY SERVICE] OTP Verification code for ${email} is: ${otpCode}`, "background: #222; color: #ca0013; font-size: 14px; font-weight: bold; padding: 4px 8px; border-radius: 4px;");
        }
      } else {
        // Simulated output print
        console.log(`\n========================================\n[SIMULATION] OTP Verification code for ${email} is: ${otpCode}\n========================================\n`);
      }

      return res.status(200).json({
        success: true,
        message: 'OTP sent to email'
      });
    }

    if (phone) {
      const formattedPhone = formatPhoneNumber(phone);

      // Store in Redis
      const redisKey = `otp:${formattedPhone}`;
      await redisClient.setex(redisKey, 600, otpCode);

      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

      if (accountSid && authToken && twilioPhone) {
        try {
          const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
          const authHeader = 'Basic ' + Buffer.from(accountSid + ":" + authToken).toString('base64');
          
          const params = new URLSearchParams({
            To: formattedPhone,
            From: twilioPhone,
            Body: `Your Bharat Aero verification code is: ${otpCode}`
          });

          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
          });

          if (!response.ok) {
            const errText = await response.text();
            throw new Error(errText || 'Twilio request failed');
          }
        } catch (twilioErr) {
          console.warn('[Twilio] SMS dispatch failed:', twilioErr.message);
          console.log(`\n========================================\n[SIMULATION BACKUP] OTP Verification code for ${formattedPhone} is: ${otpCode}\n========================================\n`);
        }
      } else {
        console.log(`\n========================================\n[SIMULATION] SMS OTP Verification code for ${formattedPhone} is: ${otpCode}\n========================================\n`);
      }

      return res.status(200).json({
        success: true,
        message: 'OTP sent to phone'
      });
    }

  } catch (error) {
    next(error);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, phone, code } = req.body;

    if (!code || code.trim().length !== 6 || isNaN(Number(code))) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid code length. The code must be exactly a 6-digit number.' }
      });
    }

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        error: { message: 'Either email or phone number is required to verify the OTP.' }
      });
    }

    const identifier = email ? email.trim().toLowerCase() : formatPhoneNumber(phone);
    const redisKey = `otp:${identifier}`;

    const cachedCode = await redisClient.get(redisKey);

    if (!cachedCode) {
      return res.status(400).json({
        success: false,
        error: { message: 'Verification code expired or not found. Please request a new OTP.' }
      });
    }

    if (cachedCode === code.trim()) {
      // Delete key from cache after successful verification
      await redisClient.del(redisKey);
      
      return res.status(200).json({
        success: true,
        message: 'Verification successful'
      });
    } else {
      return res.status(400).json({
        success: false,
        error: { message: 'Incorrect verification code. Please check and try again.' }
      });
    }

  } catch (error) {
    next(error);
  }
};
