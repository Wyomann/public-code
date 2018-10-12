let service = {};
/**********************************************************************************************************************
 * Begin Util Functions - the methods called as a synchronous utility function
 *********************************************************************************************************************/

service.graphUrl = "https://graph.facebook.com/";

/**********************************************************************************************************************
 * End Util Functions - the methods called as a synchronous utility function
 *********************************************************************************************************************/

/**********************************************************************************************************************
 * Begin ASYNC Functions - the methods called from an ASYNC Chain
 *********************************************************************************************************************/

service.isValidToken = function (token) {
  let url = this.graphUrl + "debug_token?input_token=" + token + "&access_token=" + process.env.FACEBOOK_APP_ID + "|" + process.env.FACEBOOK_APP_SECRET;
  return new Promise((resolve, reject) => {
    request(url, function (error, response, body) {
      let data = JSON.parse(body).data;
      if (data.error) {
        Services.logService.error(data.error.message);
        reject(false);
      }
      else {
        if (data.is_valid) {
          Services.logService.log(data);
          resolve(true);
        }
        else {
          Services.logService.error('Token invalid');
          reject(false);
        }
      }
    });
  });
};

/**********************************************************************************************************************
 * End ASYNC Functions - the methods called from an ASYNC Chain
 *********************************************************************************************************************/

/**********************************************************************************************************************
 * Begin API Functions - the methods called externally via the REST API routes
 *********************************************************************************************************************/

/**********************************************************************************************************************
 * End API Functions - the methods called externally via the REST API routes
 *********************************************************************************************************************/

module.exports = service;
