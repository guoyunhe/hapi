#!/usr/bin/env node

import http from 'http';
import express from 'express';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import passport from 'passport';
import session from 'express-session';
import { Strategy as LocalStrategy } from 'passport-local';
import cors from 'cors';

const port = process.env.PORT || '3001';

const users = [];
let nextUserId = 1;
const todos = [];
let nextTodoId = 1;

const app = express();

app.set('port', port);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(function (username, password, done) {
    const user = users.find(
      (u) => u.username === username && u.password === password
    );
    if (!user) {
      return done(null, false);
    }
    return done(null, user);
  })
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(function (id, done) {
  const user = users.find((u) => u.id === id);
  if (user) {
    done(null, user);
  } else {
    done(new Error('User does not exist'));
  }
});

app.post('/register', (req, res, next) => {
  const { username, password } = req.body;
  if (!username) {
    return res.status(400).json({ username: 'username is required' });
  }
  if (users.some((u) => u.username === username)) {
    return res.status(400).json({ username: 'username is already taken' });
  }
  if (!password) {
    return res.status(400).json({ password: 'password is required' });
  }
  const user = { id: nextUserId, username, password };
  nextUserId++;
  users.push(user);
  passport.authenticate('local', { failureFlash: true })(req, res, () => {
    req.session.save((err) => {
      if (err) {
        return next(err);
      }
      res.status(200).send(user);
    });
  });
});

app.post(
  '/login',
  passport.authenticate('local', { failureFlash: true }),
  (req, res, next) => {
    req.session.save((err) => {
      if (err) {
        return next(err);
      }
      res.status(200).json(req.user || null);
    });
  }
);

app.get('/me', (req, res) => {
  res.status(200).json(req.user || null);
});

app.post('/logout', (req, res, next) => {
  req.logout({}, (err) => {
    if (err) {
      return next(err);
    }
    req.session.save((err) => {
      if (err) {
        return next(err);
      }
      res.status(200).send();
    });
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err,
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {},
  });
});

const server = http.createServer(app);

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error('Port ' + port + ' requires elevated privileges');
      return process.exit(1);
    case 'EADDRINUSE':
      console.error('Port ' + port + ' is already in use');
      return process.exit(1);
    default:
      throw error;
  }
}

function onListening() {
  console.log('Listening on ', server.address());
}
