var express = require('express'), 
   path = require('path');

var router = express.Router();

var Board = require('../models/board');
var Comment = require('../models/comment');


/// 추가 부분 // 로그인, 회원가입
const User = require("../models/user");
const mongoose = require("mongoose");
const crypto = require("crypto");
///


/* GET home page. */
router.get('/main', function(req, res, next) {
  Board.find({}, function (err, board) {
      res.render('main', { title: 'Express', board: board });
  });
});

/* Write board page */
router.get('/write', function(req, res, next) {
    res.render('write', { title: '자신의 버킷리스트를 공유해 보세요!' });
});

/* board insert mongo */
router.post('/board/write', function (req, res) {
  var board = new Board();
  board.title = req.body.title;
  board.contents = req.body.contents;
  board.author = req.body.author;

  board.save(function (err) {
    if(err){
      console.log(err);
      res.redirect('/main');
    }
    res.redirect('/main');
  });
});

/* board find by id */
router.get('/board/:id', function (req, res) {
    Board.findOne({_id: req.params.id}, function (err, board) {
        res.render('board', { title: 'bucket list', board: board });
    })
});

/* comment insert mongo*/
router.post('/comment/write', function (req, res){
    var comment = new Comment();
    comment.contents = req.body.contents;
    comment.author = req.body.author;

    Board.findOneAndUpdate({_id : req.body.id}, { $push: { comments : comment}}, function (err, board) {
        if(err){
            console.log(err);
            res.redirect('/main');
        }
        res.redirect('/board/'+req.body.id);
    });
});


///// 밑으로 추가 부분 // 로그인, 회원가입



router.get('/', (req, res) => res.render('index'));
router.get("/login", (req, res) => res.render("login", {page: "login"}));
router.get("/signup", (req, res) => res.render("signup", {page: "signup"}));
router.get("/main", (req, res) => res.render("main", {page: "main"})); // 메인 페이지, 로그인 성공시 이동

// 비밀번호 암호화 하는 부분 , 회원가입
router.post("/signup", (req, res, next) => {
  console.log(req.body);
  User.find({ email:req.body.email })
      .exec()
      .then(user => {
          if (user.length >= 1) {
              res.send('<script type="text/javascript">alert("이미 존재하는 이메일입니다."); window.location="/signup"; </script>');
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              name:req.body.name,
              email: req.body.email,
              password: crypto.createHash('sha512').update(req.body.password).digest('base64')
          });
              user
                  .save()
                  .then(result => {
                      console.log(result);
                      res.redirect("/");
                  })
                  .catch(err => {
                      console.log(err);
                  });
                }
      });
});

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

//로그인에 성공할 시 serializeUser 메서드를 통해서 사용자 정보를 세션에 저장
passport.serializeUser(function (user, done) {
    done(null, user);
});

//사용자 인증 후 요청이 있을 때마다 호출
passport.deserializeUser(function (user, done) {
    done(null, user);
});                

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField : 'password',
  passReqToCallback : true//request callback 여부
},
function (req, email, password, done)
{
  User.findOne({email: email, password: crypto.createHash('sha512').update(password).digest('base64')}, function(err, user){
      if (err) {
          throw err;
      } else if (!user) {
          return done(null, false, req.flash('login_message','이메일 또는 비밀번호를 확인하세요.')); // 로그인 실패
      } else {
          return done(null, user); // 로그인 성공
      }
  });
}
));

router.post('/login', passport.authenticate('local', {failureRedirect: '/login', failureFlash: true}), // 인증 실패 시 '/login'으로 이동
function (req, res) {
  res.redirect('/main');
  //로그인 성공 시 '/'으로 이동
});

router.get('/signup', function (req, res) {
    if (req.user == undefined) {
        res.render('main', {logged: false});
    }
    else{
        res.render('main', {logged: true, username: req.user.name}); 

    }
});

router.get("/login", (req, res) => res.render("login", {message: req.flash('login_message')}));

module.exports = router;

