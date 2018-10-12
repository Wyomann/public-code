PrivateApiRouter.post('/save-game', function (req, res) {
  Services.gameService.apiSaveGame(req, res);
});

module.exports = PrivateApiRouter;
