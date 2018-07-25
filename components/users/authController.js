module.exports = (app, Models, mailController) => {
  let authController = {};

  authController.register = (req, res) => {
    res.json({message: "yo !"})
  };

  return authController;
};
