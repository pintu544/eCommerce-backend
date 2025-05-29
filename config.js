require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce',
  
  // Using Mailtrap API token instead of SMTP credentials
  MAILTRAP_API_TOKEN: process.env['Api-Token'],
  
  // Keep these for backward compatibility but they won't be used
  MAILTRAP_USER: process.env.MAILTRAP_USER,
  MAILTRAP_PASS: process.env.MAILTRAP_PASS,
  MAILTRAP_HOST: process.env.MAILTRAP_HOST || 'sandbox.smtp.mailtrap.io',
  MAILTRAP_PORT: process.env.MAILTRAP_PORT || 2525
};
