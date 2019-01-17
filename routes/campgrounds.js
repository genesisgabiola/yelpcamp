var express= require('express');
var router = express.Router();
var Campground = require('../models/campground');
var middleware = require('../middleware');

// INDEX - Show all campgrounds
router.get('/', function(req, res) {
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    // Get all campgrounds from DB
    Campground.find({$or: [{name: regex,}, {location: regex}, {"author.username": regex}]}, function(err, allCampgrounds) {
      if (err) {
        console.log(err);
      } else {
        if (allCampgrounds.length < 1) {
          req.flash('error', 'Campground not found');
          return res.redirect('back');
        }
        res.render('campgrounds/index', {campgrounds: allCampgrounds});
      }
    });
  } else {
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds) {
      if (err) {
        console.log(err);
      } else {
        res.render('campgrounds/index', {campgrounds: allCampgrounds});
      }
    });
  }
});

// CREATE - Add new campground to DB
router.post('/', middleware.isLoggedIn, function(req, res) {
  // get data from form and add to campgrounds array
  var name = req.body.name;
  var price = req.body.price;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
    id: req.user._id,
    username: req.user.username
  }
  var newCampground = {name: name, price: price, image: image, description: desc, author: author};
  // Create a new campground and save to DB
  Campground.create(newCampground, function(err, newlyCreated) {
    if (err) {
      console.log(err);
    } else {
      // redirect back to campgrounds page
      // console.log(newlyCreated);
      res.redirect('/campgrounds');
    }
  });
});

// NEW - Show form to create new campground
router.get('/new', middleware.isLoggedIn, function(req, res) {
  res.render('campgrounds/new');
});

// SHOW - Shows more info about one campground
router.get('/:id', function(req, res) {
  // Find the campground with provided ID
  Campground.findById(req.params.id).populate('comments').exec(function(err, foundCampground) {
    if (err || !foundCampground) {
      req.flash('error', 'Campground not found');
      res.redirect('back');
    } else {
      // console.log(foundCampground);
      // Render show template with that campground
      res.render('campgrounds/show', {campground: foundCampground});
    }
  });
});

// EDIT - CAMPGROUND ROUTE
router.get('/:id/edit', middleware.checkCampgroundOwnership, function(req, res) {
  Campground.findById(req.params.id, function(err, foundCampground) {
    res.render('campgrounds/edit', {campground: foundCampground});
  });
});

// UPDATE CAMPGROUND ROUTE
router.put('/:id', middleware.checkCampgroundOwnership, function(req, res) {
  // Find and update the correct campground
  Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground) {
    if (err) {
      res.redirect('/campgrounds');
    } else {
      // Redirect somewhere (show page)
      res.redirect('/campgrounds/' + req.params.id)
    }
  });
});

// DESTROY CAMPGROUND ROUTE
router.delete('/:id/', middleware.checkCampgroundOwnership, function(req, res) {
  Campground.findByIdAndRemove(req.params.id, function(err) {
    if (err) {
      res.redirect('/campgrounds');
    } else {
      res.redirect('/campgrounds');
    }
  });
});

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;