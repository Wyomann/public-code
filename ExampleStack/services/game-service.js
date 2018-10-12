let service = {};
/**********************************************************************************************************************
 * Begin Util Functions - the methods called as a synchronous utility function
 *********************************************************************************************************************/

service.getGameQuery = (aSyncModel) => {
  let where = {};
  let allSearchLike = '%' + aSyncModel.all_search + '%';

  if (aSyncModel.all_search) {
    where = {
      [Op.or]: [{
        name: {[Op.like]: allSearchLike}
      }, {
        city: {[Op.like]: allSearchLike}
      }, {
        state: {[Op.like]: allSearchLike}
      }, {
        country: {[Op.like]: allSearchLike}
      }]
    }
  }

  if (aSyncModel.class_search) {
    where.classes = {
      [Op.like]: '%' + aSyncModel.class_search + '%'
    }
  }

  if (aSyncModel.year_search) {
    let greaterThanDate = new Date(aSyncModel.year_search, 0, 1);
    let lessThanDate = new Date(parseInt(aSyncModel.year_search) + 1, 0, 1);
    where.date_start = {
      [Op.and]: {
        [Op.gt]: greaterThanDate,
        [Op.lt]: lessThanDate
      }

    }
  }
  return where;
};

service.getIncludes = () => {
  return [
    {
      model: Models.organization_game, include: [{
        model: Models.organization
      }]
    },
    {model: Models.game_ad, include: [{model: Models.account}]}
  ];
};

/**********************************************************************************************************************
 * End Util Functions - the methods called as a synchronous utility function
 *********************************************************************************************************************/

/**********************************************************************************************************************
 * Begin QUERY Functions - the methods return database promise results
 *********************************************************************************************************************/

service.queryGamesByAccountId = (aSyncModel) => {
  Services.logService.log("queryGamesByAccountId", true);

  return Models.game_ad.findAll({
    where: {
      account_id: aSyncModel.account_id
    },
    include: [{
      model: Models.game, include: [{
        model: Models.organization_game, include: [{
          model: Models.organization
        }]
      }]
    }]
  });
};

service.queryGameById = (aSyncModel) => {
  Services.logService.log("queryGameById", true);

  return Models.game.findOne({
    where: {
      id: aSyncModel.game_id
    },
    include: Services.gameService.getIncludes()
  });
};

service.queryGameSearch = (aSyncModel) => {
  Services.logService.log("offset limit: " + aSyncModel.offset + " " + aSyncModel.limit);

  let query = {
    where: Services.gameService.getGameQuery(aSyncModel),
    include: Services.gameService.getIncludes(),
    order: [
      ['date_start', 'ASC']
    ]
  };

  if (aSyncModel.offset && aSyncModel.limit) {
    query.offset = aSyncModel.offset;
    query.limit = aSyncModel.limit;
  }

  Services.logService.log(JSON.stringify(query), true);

  return Models.game.findAll(query);
};

service.queryGetGameThrow = (aSyncModel) => {
    let arrayWhere = [
        {game_id: aSyncModel.game_id}
    ];

    if(aSyncModel.class){
        arrayWhere.push({class: aSyncModel.class});
    }

    if(aSyncModel.account_id){
        arrayWhere.push({account_id: aSyncModel.account_id});
    }

    return Models.game_throw.findAll({
        where: {
            [Op.and]: arrayWhere
        },
        include: [{model: Models.account}],
        order: [
            ['placing', 'ASC']
        ]
    });
};

service.querySaveGameThrow = function (item) {
  return Models.game_throw.upsert(item, {returning: true});
};

/**********************************************************************************************************************
 * End QUERY Functions - the methods return database promise results
 *********************************************************************************************************************/


/**********************************************************************************************************************
 * Begin ASYNC Functions - the methods called from an ASYNC Chain
 *********************************************************************************************************************/


/**********************************************************************************************************************
 * End ASYNC Functions - the methods called from an ASYNC Chain
 *********************************************************************************************************************/

/**********************************************************************************************************************
 * Begin Wrapper Functions - the wrapper methods that coordinate the async calls
 *********************************************************************************************************************/

service.getGamesWrapper = async (aSyncModel) => {
  try {
    let games = await Services.gameService.queryGameSearch(aSyncModel);
    aSyncModel.result.games = Services.scrubService.scrubObject(games);
    return aSyncModel;
  }
  catch (err) {
    return err;
  }
};

service.getGamesByAccountIdWrapper = async (aSyncModel) => {
  try {
    let game_ads = await Services.gameService.queryGamesByAccountId(aSyncModel);
    let games = [];
    game_ads.forEach((element) => {
      games.push(element.game);
    });

    aSyncModel.result.games = Services.scrubService.scrubObject(games);
    return aSyncModel;
  }
  catch (err) {
    return err;
  }
};

service.getGameByIdWrapper = async (aSyncModel) => {
  try {
    aSyncModel.result.game = await Services.gameService.queryGameById(aSyncModel);
    return aSyncModel;
  }
  catch (err) {
    return err;
  }
};

service.getGameThrowsWrapper = async (aSyncModel) => {
  try {
    Services.logService.log("getGameThrowsWrapper");
    aSyncModel.result.game_throws = await Services.gameService.queryGetGameThrow(aSyncModel);
    return aSyncModel;
  }
  catch (err) {
    return err;
  }
};

service.getOrganizationsByAccountWrapper = async (aSyncModel) => {
  try {
    Services.logService.log("getOrganizationsByAccountWrapper");
    aSyncModel.result.organizations = await Services.gameService.queryGetOrganizationsByAccount(aSyncModel);
    return aSyncModel;
  }
  catch (err) {
    return err;
  }
};

service.saveGameWrapper = async (aSyncModel) => {
  try {
    Services.logService.log("saveGameWrapper");
    let accountMatchingToken = await Services.accountService.getAccountByRoleQuery(aSyncModel);
    if (Services.authenticateService.authorizeAccountRole(accountMatchingToken, aSyncModel) && aSyncModel.result.isAD) {
      let game = await Services.gameService.querySaveGame(aSyncModel);
      Services.logService.log("game saved: ", true);
      Services.logService.log(game);

      if (game.id) {
        aSyncModel.result.game = game;
      }
      else {
        aSyncModel.result.game = aSyncModel.game;
      }
      return aSyncModel;
    }
    else {
      return new Error("Unauthorized");
    }
  }
  catch (err) {
    return err;
  }
};

service.saveGameThrowsWrapper = async (aSyncModel) => {
  try {
    Services.logService.log("saveGameThrowsWrapper");
    let accountMatchingToken = await Services.accountService.getAccountByRoleQuery(aSyncModel);
    if (Services.authenticateService.authorizeAccountRole(accountMatchingToken, aSyncModel) && aSyncModel.result.isAD) {

      for (let item of aSyncModel.game_throws) {
        item.points = Services.throwingService.calculatePoints(item);
        await Services.gameService.querySaveGameThrow(item)
      }

      aSyncModel.result.game_throws = await Services.gameService.queryGetGameThrow(aSyncModel);
      return aSyncModel;
    }
    else {
      return new Error("Unauthorized");
    }
  }
  catch (err) {
    return err;
  }
};

/**********************************************************************************************************************
 * End Wrapper Functions - the wrapper methods that coordinate the async calls
 *********************************************************************************************************************/

/**********************************************************************************************************************
 * Begin API Functions - the methods called externally via the REST API routes
 *********************************************************************************************************************/

service.apiGetGames = (req, res) => {
  Services.logService.log("apiGetGames called");

  let aSyncModel = Services.responseService.getASyncModel(req, res);
  aSyncModel.all_search = req.body.all_search;
  aSyncModel.class_search = req.body.class_search;
  aSyncModel.year_search = req.body.year_search;

  Services.responseService.callAsync(Services.gameService.getGamesWrapper, aSyncModel);
};

service.apiGetGamesByAccountId = (req, res) => {
  Services.logService.log("apiGetGameByAccountId called");

  let aSyncModel = Services.responseService.getASyncModel(req, res);
  aSyncModel.account_id = req.body.account_id;

  Services.responseService.callAsync(Services.gameService.getGamesByAccountIdWrapper, aSyncModel);
};

service.apiGetGameById = (req, res) => {
  Services.logService.log("apiGetGameById called");

  let aSyncModel = Services.responseService.getASyncModel(req, res);
  aSyncModel.game_id = req.body.game_id;

  Services.responseService.callAsync(Services.gameService.getGameByIdWrapper, aSyncModel);
};

service.apiGetGameThrows = (req, res) => {
  Services.logService.log("apiSaveGameThrows called");

  let aSyncModel = Services.responseService.getASyncModel(req, res);
  aSyncModel.game_id = req.body.game_id;
  aSyncModel.class = req.body.class;
  aSyncModel.account_id = req.body.account_id;

  Services.responseService.callAsync(Services.gameService.getGameThrowsWrapper, aSyncModel);
};

service.apiSaveGame = (req, res) => {
  Services.logService.log("apiSaveGame called");

  let aSyncModel = Services.responseService.getASyncModel(req, res);
  aSyncModel.game = req.body.game;

  Services.responseService.callAsync(Services.gameService.saveGameWrapper, aSyncModel);
};

/**********************************************************************************************************************
 * End API Functions - the methods called externally via the REST API routes
 *********************************************************************************************************************/

module.exports = service;
