const axios = require('axios');

const verifyCaptcha = async (req, res, next) => {
  const { captchaToken } = req.body;

  if (!captchaToken) {
    return res.status(400).json({ error: 'Captcha token is required' });
  }

  try {
    const response = await axios.post(
      process.env.RECAPTCHA_VERIFY_URL,
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: captchaToken
        }
      }
    );

    // console.log('Captcha verification response:', response.data); // Debug logging

    if (!response.data.success) {
      return res.status(400).json({ error: 'Invalid captcha' });
    }

    next();
  } catch (error) {
    console.error('Captcha verification failed:', error);
    res.status(500).json({ error: 'Captcha verification failed' });
  }
};

module.exports = verifyCaptcha;