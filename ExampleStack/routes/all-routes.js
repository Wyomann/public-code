require('./public/account-routes');
require('./public/authorization-routes');
require('./public/game-routes');

require('./private/account-routes');
require('./private/authorization-routes');
require('./private/game-routes');


//All calls using private-api must have a valid token to continue
App.use('/private-api', ExpressJwt({
  secret: process.env.JWT_SECRET_KEY,
  getToken: function fromHeaderOrQuerystring(req) {
    console.log("Auth: " + req.headers.authorization);
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      let token = req.headers.authorization.split(' ')[1];
      req.body.token = token;
      console.log("token: " + token);
      return token;
    }
    else {
      return null;
    }
  }
}));
