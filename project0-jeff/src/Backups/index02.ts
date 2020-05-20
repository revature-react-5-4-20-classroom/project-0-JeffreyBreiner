"use strict";

var _express = _interopRequireDefault(require("express"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _sessionMiddleware = require("./middleware/sessionMiddleware");

var _loggingMiddleware = require("./middleware/loggingMiddleware");

var _userRouter = require("./routers/userRouter");

var _repository = require("./repository");

var _loginRouter = require("./routers/loginRouter");

var _reimbursementRouter = require("./routers/reimbursementRouter");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const PORT = 6464;
const app = (0, _express.default)();
app.use(_bodyParser.default.json());
app.use(_sessionMiddleware.sessionMiddleware);
app.use(_loggingMiddleware.loggingMiddleware);
app.use('/login', _loginRouter.loginRouter);
app.use('/users', _userRouter.userRouter);
app.use('/reimbursements', _reimbursementRouter.reimbursementRouter);
app.get('/views', (req, res) => {
  console.log(req.session); // try to log it

  if (req.session && req.session.views) {
    req.session.views++;
    res.send(`Reached this endpoint ${req.session.views} times`);
  } else if (req.session) {
    req.session.views = 1;
    res.send('Reached the views endpoint for the first time');
  } else {
    res.send('Reached the views endpoint without a session');
  }
});
app.listen(1999, () => {
  console.log("app has started, testing connection:");

  _repository.connectionPool.connect().then(client => {
    console.log('connected');
    client.query('SELECT * FROM books;').then(result => {
      console.log(result.rows[0]);
    });
  }).catch(err => {
    console.error(err.message);
  });
});