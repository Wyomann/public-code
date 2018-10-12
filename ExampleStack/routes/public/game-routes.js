PublicApiRouter.post('/get-games-by-accountid', function (req, res) {
  Services.gameService.apiGetGamesByAccountId(req, res);
});

PublicApiRouter.post('/get-game-by-id', function (req, res) {
  Services.gameService.apiGetGameById(req, res);
});

PublicApiRouter.post('/get-games', function (req, res) {
  Services.gameService.apiGetGames(req, res);
});

module.exports = PublicApiRouter;
