//routes.js
var express = require('express');
var router = express.Router();

var pagesRoutes = require('./pages/routes');

router.use('/pages', pagesRoutes);
router.use(function(err, req, res, next) {
	if(!err.status || err.status >= 500) {
		console.error(err.stack);
	}
	res.status(err.status || 500).send(err.message || 'Internal Server Error');
});
module.exports = router;
