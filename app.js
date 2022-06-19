const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const axios = require('axios')
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/:user', async (req, res) => {
  let streamer = {}
  res.setHeader("Access-Control-Allow-Origin", "*");
  console.log(req.params.user)
  await axios.get('https://api.twitch.tv/helix/users?login=' + req.params.user, {
    headers: {
      'Authorization': "Bearer " + process.env.TOKEN,
      'Client-Id': process.env.CLIENTID
    }
  }).then((res) => {
    if(res.data.data.length) {
      console.log(res.data.data[0]['profile_image_url'])
      streamer['user'] = res.data.data[0]['display_name'];
      streamer['picture_url'] = res.data.data[0]['profile_image_url'];
    }else{
      streamer["err"] =  "Streamer not found";
    }
  }).catch((err) =>{
        console.log(err);

      }
  );
  if(!streamer['err']) {
    await axios.get('https://api.twitch.tv/helix/streams?user_login=' + req.params.user, {
      headers: {
        'Authorization': "Bearer 1ly6y2pweepnwvt79sqrwiie7hbru5",
        'Client-Id': process.env.CLIENTID
      }
    }).then((res) => {
      if (!res.data.data.length) {
        streamer['online'] = false;
      } else {
        streamer['online'] = true;
        streamer['game'] = res.data.data[0]['game_name'];
        console.log(res.data.data[0]['game_name'])
      }
    }).catch((err) =>
        console.log(err)
    )
  }
  res.json(streamer)
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});





// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
