import twilio from 'twilio';

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let twilioClient = null;

// Initialize Twilio client only if credentials are provided
if (accountSid && authToken) {
  twilioClient = twilio(accountSid, authToken);
}

const twilioConfig = {
  accountSid,
  authToken,
  phoneNumber: twilioPhoneNumber,
  client: twilioClient,
  isConfigured: !!(accountSid && authToken && twilioPhoneNumber),
};

export default twilioConfig;
