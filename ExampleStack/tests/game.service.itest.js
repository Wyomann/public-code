'use strict';

const chai = require('chai');
const expect = require('chai').expect;
chai.use(require('chai-http'));

let app = require('../../../node_server/app.js');

describe('game service integration', () => {

 describe('save new games', () => {
   before(async () => {
     await Models.sequelize.query("delete from game_ads").spread((results, metadata) => {
       Services.logService.log(results);
     });

     await Models.sequelize.query("delete from games").spread((results, metadata) => {
       Services.logService.log(results);
     });
   });

   let game = null;
   let index = 0;
   let indexMax = 6;
   while(index <= indexMax) {
     index++;
     it('should save game', async () => {

       let token = await Services.testService.createTestToken(Services.testService.initialAD1Id);

       let uniqueVal = Services.generatorService.getRandomPhone().substring(5, 9);
       let date = new Date();
       let sendObj = {
         "authenticator": {
           "requestingAccountId": Services.testService.initialAD1Id,
           "servicingAccountId": Services.testService.initialAD1Id,
           "requestingRoleType": [Models.role.names.ATHLETIC_DIRECTOR],
         },
         "game": {
           "name": "Game Name " + uniqueVal,
           "url": "http://www.gmail.com/" + uniqueVal,
           "classes": "Pro,Amateur A",
           "date_start": date,
           "date_end": date,
           "address1": uniqueVal + "Add1",
           "address2": uniqueVal + "Add2",
           "city": uniqueVal + "City",
           "state": uniqueVal%2 == 0? "California":"Oklahoma",
           "country": "US",
           "zip_code": "7310" + uniqueVal%2 == 0? "1":"6"
         }
       };

       return chai.request(app)
         .post('/private-api/save-game')
         .set('Content-Type', 'application/json')
         .set('Authorization', 'Bearer ' + token)
         .send(sendObj)
         .then(res => {
           expect(res.body).to.be.an('object');
           expect(res.body.game).to.be.an('object');
           expect(res.body.game.id).to.be.not.equal(null);
           expect(res.body.game.name).to.be.equal("Game Name " + uniqueVal);
           expect(res.body.game.url).to.be.equal("http://www.gmail.com/" + uniqueVal);
           expect(res.body.game.classes).to.be.equal("Pro,Amateur A");
           expect(res.body.game.date_start).to.be.not.equal(null);
           expect(res.body.game.date_end).to.be.not.equal(null);
           game = res.body.game;
         })
         .catch(err => {
           Services.logService.error(err);
           expect(err).to.be.equal(null);
         });
     });
   }

   it('should update game', async () => {

     let token = await Services.testService.createTestToken(Services.testService.initialAD1Id);

     let uniqueVal = Services.generatorService.getRandomPhone().substring(5, 9);
     let date = new Date();

     game.name = "Game Name " + uniqueVal;
     game.url = "http://www.gmail.com/" + uniqueVal;
     game.classes = "Pro,Amateur A";
     game.date_start = date;
     game.date_end = date;

     let sendObj = {
       "authenticator": {
         "requestingAccountId": Services.testService.initialAD1Id,
         "servicingAccountId": Services.testService.initialAD1Id,
         "requestingRoleType": [Models.role.names.ATHLETIC_DIRECTOR],
       },
       game
     };

     return chai.request(app)
       .post('/private-api/save-game')
       .set('Content-Type', 'application/json')
       .set('Authorization', 'Bearer ' + token)
       .send(sendObj)
       .then(res => {
         expect(res.body).to.be.an('object');
         expect(res.body.game).to.be.an('object');
         expect(res.body.game.id).to.be.not.equal(null);
         expect(res.body.game.name).to.be.equal("Game Name " + uniqueVal);
         expect(res.body.game.url).to.be.equal("http://www.gmail.com/" + uniqueVal);
         expect(res.body.game.classes).to.be.equal("Pro, Amateur A");
         expect(res.body.game.date_start).to.be.not.equal(null);
         expect(res.body.game.date_end).to.be.not.equal(null);
       })
       .catch(err => {
         Services.logService.error(err);
         expect(err).to.be.equal(null);
       });
   });
  });
  
  
  describe('create an organization', () => {
    it('should create an organization', async () => {
      let org = {
        name: Services.generatorService.getRandomPhone().substring(5, 9)
      };
  
      let result = await Models.organization.create(org);
      let model = result.get({plain: true});
      expect(model).to.be.an('object');
      expect(model.id).to.be.not.equal(null);
    });
  });
  
  describe('add organization to game', () => {
    let game = {};
    let organization = {};
  
    before(async () => {
      try {
        let games = await Models.game.findAll({
          include: {
            model: Models.organization_game
          }
        });
        game = games[0].get({plain: true});
  
        let organizations = await Models.organization.findAll();
        organization = organizations[0].get({plain: true});
      }
      catch (err) {
        Services.logService.error(err);
      }
    });
  
    it('should add an organization to a game', async () => {
      game.organization_games.push({
        game_id: game.id,
        organization_id: organization.id
      });
  
      let token = await Services.testService.createTestToken(Services.testService.initialAD1Id);
  
      let uniqueVal = Services.generatorService.getRandomPhone().substring(5, 9);
      game.name = "Game Name " + uniqueVal;
  
      let sendObj = {
        "authenticator": {
          "requestingAccountId": Services.testService.initialAD1Id,
          "servicingAccountId": Services.testService.initialAD1Id,
          "requestingRoleType": [Models.role.names.ATHLETIC_DIRECTOR],
        },
        game
      };
  
      return chai.request(app)
        .post('/private-api/save-game')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token)
        .send(sendObj)
        .then(res => {
          expect(res.body).to.be.an('object');
          expect(res.body.game).to.be.an('object');
          expect(res.body.game.id).to.be.not.equal(null);
          expect(res.body.game.name).to.be.equal("Game Name " + uniqueVal);
          expect(res.body.game.organization_games.length).to.be.gt(0);
          game = res.body.game;
        })
        .catch(err => {
          Services.logService.error(err);
          expect(err).to.be.equal(null);
        });
    });
  
    it('should remove an organization from a game', async () => {
      game.organization_games.pop();
  
      let token = await Services.testService.createTestToken(Services.testService.initialAD1Id);
  
      let uniqueVal = Services.generatorService.getRandomPhone().substring(5, 9);
      game.name = "Game Name " + uniqueVal;
  
      let sendObj = {
        "authenticator": {
          "requestingAccountId": Services.testService.initialAD1Id,
          "servicingAccountId": Services.testService.initialAD1Id,
          "requestingRoleType": [Models.role.names.ATHLETIC_DIRECTOR],
        },
        game
      };
  
      return chai.request(app)
        .post('/private-api/save-game')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token)
        .send(sendObj)
        .then(res => {
          expect(res.body).to.be.an('object');
          expect(res.body.game).to.be.an('object');
          expect(res.body.game.id).to.be.not.equal(null);
          expect(res.body.game.name).to.be.equal("Game Name " + uniqueVal);
          expect(res.body.game.organization_games.length).to.be.equal(0);
        })
        .catch(err => {
          Services.logService.error(err);
          expect(err).to.be.equal(null);
        });
    });
  });
  
  describe('search games', () => {
    Services.logService.log(Models.account);
    Services.logService.log(Models.game_ad);
  
    it('should find OK games', async () => {
      let sendObj = {
        "offset":0,
        "limit":50,
        "authenticator": {
          "requestingAccountId": Services.testService.initialAD1Id,
          "servicingAccountId": Services.testService.initialAD1Id,
          "requestingRoleType": [Models.role.names.ATHLETIC_DIRECTOR],
        },
        "all_search":"OK",
        "class_search":null
      };
  
      return chai.request(app)
        .post('/public-api/get-games')
        .set('Content-Type', 'application/json')
        .send(sendObj)
        .then(res => {
          expect(res.body).to.be.an('object');
          expect(res.body.games).to.be.an('array');
          expect(res.body.games.length).to.be.greaterThan(0);
          res.body.games.forEach((element) => {
            expect(element.state).to.be.equal("OK");
          });
        })
        .catch(err => {
          Services.logService.error(err);
          expect(err).to.be.equal(null);
        });
    });
  
    it('should find games no search specified', async () => {
      let sendObj = {
        "offset":0,
        "limit":50,
        "authenticator": {
          "requestingAccountId": Services.testService.initialAD1Id,
          "servicingAccountId": Services.testService.initialAD1Id,
          "requestingRoleType": [Models.role.names.ATHLETIC_DIRECTOR],
        },
        "all_search":null,
        "class_search":null
      };
  
      return chai.request(app)
        .post('/public-api/get-games')
        .set('Content-Type', 'application/json')
        .send(sendObj)
        .then(res => {
          expect(res.body).to.be.an('object');
          expect(res.body.games).to.be.an('array');
          expect(res.body.games.length).to.be.greaterThan(0);
        })
        .catch(err => {
          Services.logService.error(err);
          expect(err).to.be.equal(null);
        });
    });
  
    it('should find games by class', async () => {
      let sendObj = {
        "offset":0,
        "limit":50,
        "authenticator": {
          "requestingAccountId": Services.testService.initialAD1Id,
          "servicingAccountId": Services.testService.initialAD1Id,
          "requestingRoleType": [Models.role.names.ATHLETIC_DIRECTOR],
        },
        "all_search":null,
        "class_search":"Pro"
      };
  
      return chai.request(app)
        .post('/public-api/get-games')
        .set('Content-Type', 'application/json')
        .send(sendObj)
        .then(res => {
          expect(res.body).to.be.an('object');
          expect(res.body.games).to.be.an('array');
          expect(res.body.games.length).to.be.greaterThan(0);
        })
        .catch(err => {
          Services.logService.error(err);
          expect(err).to.be.equal(null);
        });
    });
  
  });
  
  describe('get games by account id', () => {

    it('should find account games', async () => {
      let sendObj = {
        "offset":0,
        "limit":50,
        "account_id":Services.testService.initialAD1Id
      };

      return chai.request(app)
        .post('/public-api/get-games-by-accountid')
        .set('Content-Type', 'application/json')
        .send(sendObj)
        .then(res => {
          expect(res.body).to.be.an('object');
          expect(res.body.games).to.be.an('array');
          expect(res.body.games.length).to.be.greaterThan(0);
          res.body.games.forEach((element) => {
            expect(element).to.be.an('object');
          });
        })
        .catch(err => {
          Services.logService.error(err);
          expect(err).to.be.equal(null);
        });
    });
  });

});
