// Config File

// Create container for Config File
const environments = {};

environments.default = {
  'port': 3000,
  'envName': 'localhost',
  'hashingSecret': 'thisIsSecret',
  'braze_api_key': 'f9a71ec5-ad91-4b8f-850d-749c37b0f795',
  'braze_instance_url': 'rest.iad-03.braze.com',
  'omnisend_api_key': '5be3fca18653ed3b5e4ba20d-sCPTej7Zeu5MfUcVsXKDFYSlwlSTCfbZ6t7SONeDK9mmGNu3t2'
}

environments.production = {
  'port': 5555,
  'envName': 'production',
  'hashingSecret': 'thisIsAlsoSecret',
  'braze_api_key': 'f9a71ec5-ad91-4b8f-850d-749c37b0f795',
  'braze_instance_url': 'rest.iad-03.braze.com',
  'omnisend_api_key': '5be3fca18653ed3b5e4ba20d-sCPTej7Zeu5MfUcVsXKDFYSlwlSTCfbZ6t7SONeDK9mmGNu3t2'
}

const config = process.env.NODE_ENV !== 'production' ? environments.default : environments.production;

// Export Container
module.exports = config;
