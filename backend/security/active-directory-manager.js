const securityConfig = require("../config/security-config");
const ActiveDirectory = require("activedirectory");

const ad = new ActiveDirectory(securityConfig.adConfig);

// Password will be null if using PKI
const authenticate = async (username, password) => {
  let success = false;
  if (securityConfig.usePKI) {
    ad.userExists(username, (err, exists) => {
      success = exists;
    });
  } else {
    ad.authenticate(username, password, (err, auth) => {
      if (auth) {
        success = true;
      }
    });
  }

  return success;
};

module.exports = {
  authenticate,
};