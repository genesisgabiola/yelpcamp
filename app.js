var express        = require('express'),
    app            = express(),
    bodyParser     = require('body-parser'),
    mongoose       = require('mongoose'),
    flash          = require('connect-flash'),
    passport       = require('passport'),
    LocalStrategy  = require('passport-local'),
    methodOverride = require('method-override'),
    Campground     = require('./models/campground'),
    Comment        = require('./models/comment'),
    User           = require('./models/user'),
    seedDB         = require('./seeds');

// Requiring Routes
var commentRoutes    = require('./routes/comments'),
    campgroundRoutes = require('./routes/campgrounds'),
    indexRoutes      = require('./routes/index');

// Connect to the  database
var url = process.env.DATABASEURL || 'mongodb://localhost:27017/yelp_camp';
mongoose.connect(url, {useNewUrlParser: true, useFindAndModify: false});

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));
app.use(flash());
// seedDB(); // Seed the database

// Passport Configuration
app.use(require('express-session')({
  secret: 'Once again Abby is the cutest woman!',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next();
});

app.use('/', indexRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/comments', commentRoutes);

app.listen(process.env.PORT || 3000, process.env.IP, function() {
  console.log('The YelpCamp Server has Started!');
});


//Restful Routes

//name      url         verb        desc.
//=====================================================================
//Index     /dogs           Get         Displays a list of all dogs
//New       /dogs/new       Get         Displays form to make a new dog
//Create    /dogs           Post        Add new dog to DB
//Show      /dogs/:id       Get         Shows info about one dog
//Edit      /dogs/:id/edit  Get         Show edit form for one dog
//Update    /dogs/:id       Put         Update particular dog, then redirect somewhere
//Destroy   /dogs/:id       Delete      Delete a particular dog, then redirect somewhere

//Comment Routes
//New campgrounds/:id/comments/new
//Create campgrounds/:id/comments