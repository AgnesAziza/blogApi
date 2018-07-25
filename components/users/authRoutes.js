module.exports = (app, Models, mailController) => {
  const authController = require("./authController")(app, Models, mailController);

  app.route("/user/register").post((req, res) => authController.register(req, res))
;


  app.route("/user/signin").post((req, res)) => authController.register(req, res));

  app.route("/user/activation").put((req, res)) => authController.register(req, res));




}

 
