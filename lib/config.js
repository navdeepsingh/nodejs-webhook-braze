// Config File

// Create container for Config File
const environments = {};

environments.default = {
  'port': 3000,
  'envName': 'localhost',
  'hashingSecret': 'thisIsSecret',
  'api_key': 'f9a71ec5-ad91-4b8f-850d-749c37b0f795',
  'instance_url': 'rest.iad-03.braze.com'
}

environments.production = {
  'port': 5555,
  'envName': 'production',
  'hashingSecret': 'thisIsAlsoSecret',
  'api_key': 'f9a71ec5-ad91-4b8f-850d-749c37b0f795',
  'instance_url': 'rest.iad-03.braze.com'
}

const config = process.env.NODE_ENV !== 'production' ? environments.default : environments.production;

// Export Container
module.exports = config;