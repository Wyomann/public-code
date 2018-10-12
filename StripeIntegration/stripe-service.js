let service = {};
/**********************************************************************************************************************
 * Begin Util Functions - the methods called as a synchronous utility function
 *********************************************************************************************************************/

/**********************************************************************************************************************
 * End Util Functions - the methods called as a synchronous utility function
 *********************************************************************************************************************/

/**********************************************************************************************************************
 * Begin ASYNC Functions - the methods called from an ASYNC Chain
 *********************************************************************************************************************/

service.captureCharge = function (aSyncModel, callback) {
  if (aSyncModel.testing) {
    Services.logService.log("capture charge: " + aSyncModel.testing);
    aSyncModel.result.charge_response = Services.generatorService.getSalt();
    callback(null, aSyncModel);
  }
  else {
    stripe.charges.capture(aSyncModel.result.context.customer_session.charge_id, (err, capture_response) => {
      if (err) {
        Services.logService.error(err);
        aSyncModel.resultHandler("Stripe capture error.", aSyncModel)
      }
      else {
        Services.logService.log('captured charge: ' + aSyncModel.result.context.customer_session.charge_id);
        aSyncModel.result.charge_response = JSON.stringify(capture_response);
        callback(null, aSyncModel);
      }
    });
  }
};


service.createCharge = function (aSyncModel, callback) {
  if (aSyncModel.testing) {
    Services.logService.log("createCharge Testing: " + aSyncModel.testing);
    aSyncModel.result.charge = {id: Services.generatorService.getSalt()};
    callback(null, aSyncModel);
  }
  else {
    stripe.charges.create({
      amount: aSyncModel.payment_amount,
      capture: false,
      currency: "usd",
      description: aSyncModel.customer_session.description,
      metadata: aSyncModel.customer_session,
      source: aSyncModel.payment_token
    }, {
      idempotency_key: new Date().getTime()
    }, (err, charge) => {
      if (err) {
        Services.logService.error(err);
        aSyncModel.resultHandler("Stripe charge error.", aSyncModel)
      }
      else {
        Services.logService.log('stripe charge created');
        aSyncModel.result.charge = charge;
        callback(null, aSyncModel);
      }
    });
  }
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
