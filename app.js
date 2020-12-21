
var mongoose = require('mongoose');
var promise = mongoose.connect('mongodb://localhost/mydb', {
    useMongoClient: true
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    // we're connected!
    console.log('connected successfully');
});

////////////////////////////////////////// 사진 업로드 소스

var express = require('express'); // ExpressJS 모듈을 추가

var app = express();

var mongojs = require('mongojs'); // MongoDB 연결 해야되니 MongoJS 모듈도 추가

var db = mongojs('mydb', ['images']); // 여기서 genie는 database 이름이고 images테이블을 사용할꺼라고 선언

var bodyParser = require('body-parser'); // json 형태로 파싱할꺼니까 모듈 추가

var formidable = require('formidable'); // form 태그 데이터들을 가져오는 모듈

var fs = require('fs-extra'); // 파일을 복사하거나 디렉토리 복사하는 모듈




app.use(express.static(__dirname + '/public')); //public 폴더 안에 javascript 파일과 css파일을 모아둘 예정

app.use(bodyParser.json()); // body-parser 모듈을 사용해서 파싱 해줌

app.engine('html', require('ejs').__express);

app.set('views', __dirname + '/views'); // ejs 파일들을 저장하기 위해 경로 추가했음

app.set('view engine', 'ejs'); // ejs를 html로 바꿔주면 html로 파일 실행됩니다.



app.get('/', function(req, res) { // 웹에서 실행할 주소가 localhost:3000/ 이거일때를 선언

    res.render('index'); // index.ejs로 써도 되고 index만 써도 파일 실행을 해줍니다.

});



app.post('/upload',function(req,res){ 

    var name = "";

    var filePath = "";

    var form = new formidable.IncomingForm();



    form.parse(req, function(err, fields, files) {

        name = fields.name;

    });



    form.on('end', function(fields, files) {

  for (var i = 0; i < this.openedFiles.length; i++) {

  var temp_path = this.openedFiles[i].path;

            var file_name = this.openedFiles[i].name;

            var index = file_name.indexOf('/'); 

            var new_file_name = file_name.substring(index + 1);

            var new_location = 'public/resources/images/'+name+'/';

            var db_new_location = 'resources/images/'+name+'/';

            //실제 저장하는 경로와 db에 넣어주는 경로로 나눠 주었는데 나중에 편하게 불러오기 위해 따로 나눠 주었음

            filePath = db_new_location + file_name;

            fs.copy(temp_path,new_location + file_name, function(err) { // 이미지 파일 저장하는 부분임

                if (err) {

                    console.error(err);

                }

            });

  }



db.images.insert({"name":name,"filePath":filePath},function(err,doc){

//디비에 저장

});

  });

    res.redirect("/write"); // http://localhost:3000/ 으로 이동!

});

app.get('/image',function(req,res){ //몽고디비에서 filePath 와 name을 불러옴

    db.images.find(function(err,doc){

        res.json(doc);

    });

});


///////////////////////////////////////// 여기까지 사진 업로드 소스


var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');




const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Session = require('express-session');
const flash = require('connect-flash');

var MongoDBStore = require('connect-mongodb-session')(Session);

app.use(passport.initialize());
app.use(passport.session());








// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static("public"));
app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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

///// 밑으로 추가 부분  /// 로그인 , 회원가입



//board sample master
var favicon = require('serve-favicon');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var index = require('./routes/index');
var users = require('./routes/users');
//



app.use(bodyParser.urlencoded({extended: true}));

// routes
const indexRoute      = require("./routes/index");

let url =  "mongodb://localhost/mydb";
mongoose.connect(url, {useNewUrlParser: true});


// 뷰엔진 설정
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));

// use routes
app.use("/", indexRoute);


app.use(flash());
app.use(index);

//세션
var store = new MongoDBStore({//세션을 저장할 공간
    uri: url,//db url
    collection: 'sessions'//콜렉션 이름
});

store.on('error', function(error) {//에러처리
    console.log(error);
});

app.use(Session({
    secret:'dalhav', //세션 암호화 key
    resave:false,//세션 재저장 여부
    saveUninitialized:true,
    rolling:true,//로그인 상태에서 페이지 이동 시마다 세션값 변경 여부
    cookie:{maxAge:1000*60*60},//유효시간
    store: store
}));







module.exports = app;
