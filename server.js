const express = require('express')
const app = express()
const helmet = require('helmet')
const argv = require('yargs').argv
const path = require('path')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
// const csrf = require('csurf')
// const jwt = require("jsonwebtoken")
const expressValidator = require('express-validator')
const filterApi = require('./api/apiController')

global.__basedir = __dirname
const port = argv.PORT || process.env.PORT || 8080

// -------------------------- CORS (Cross-Origin Resource Sharing) Implementation --------------------------------
/**
 *  CORS - Cross-origin resource sharing (CORS) is a mechanism that allows restricted resources on a web page to be requested from another domain outside the domain from which the first resource was served.
 */
app.use(cors({
  origin: ['https://DEMO.example.in'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'x-access-token', 'XSRF-TOKEN'],
  preflightContinue: false
}))

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(expressValidator({
  customValidators: {
    offerValidator: (input, options) => options.includes(input)
  }
}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.set('view engine', 'ejs')

// -------------------------------- Global Value Declaration ------------------------------------------------------

global._adDefaultPrice = { "classic": 269.99, "standout": 322.99, "premium": 394.99 }
global._unileverOffer = { "OffsetForDeal": 2 }
global._appleOffer = { "standout": 299.99 }
global._nikeOffer = { "premium": 379.99, "OffsetLimit": 4 }
global._fordOffer = { "standout": 309.99, "premium": 389.99, "OffsetForDeal": 4, "OffsetLimit": 3 }

// --------------------------------    End  -----------------------------------------------------------------------

// ---------------------------- CSRF(Cross-Site Request Forgery) Implementation -----------------------------------

/**
 *  CSRF is not required in Rest API, use JWT token system
 */

// app.use(csrf({cookie: true}))
// app.use(function (req, res, next) {
//   var token = req.csrfToken()
//   res.cookie('XSRF-TOKEN', token)
//   res.locals.csrfToken = token
//   next()
// })

// ------------------ Helmet (https://helmetjs.github.io/) Implementation Node Security ---------------------------
/**
 *  It support given security features:
 *  dnsPrefetchControl controls browser DNS prefetching
 *  frameguard to prevent clickjacking
 *  hidePoweredBy to remove the X-Powered-By header
 *  hsts for HTTP Strict Transport Security
 *  ieNoOpen sets X-Download-Options for IE8+
 *  noSniff to keep clients from sniffing the MIME type
 *  xssFilter adds some small XSS protections
 */
app.use(helmet())
app.use(helmet.noCache())
app.use(helmet.frameguard({ action: 'deny' }))

app.use('/healthcheck', function (req, res) {
  res.render(path.join(__dirname, '/public/healthcheck'))
})

app.get('/product-offer', function(req, res) {
  const resultSet = {"resultSet": null, "errorMsg": null}
  res.render(path.join(__dirname, '/public/product'), resultSet)
})

app.post('/product-offer', filterApi.api)

// ------------------------- Port Listen SSL Implementation --------------------------------------------------------

// var privateKey = fs.readFileSync(__dirname + 'public/certificates/example.key', 'utf8')
// var certificate = fs.readFileSync(__dirname + 'public/certificates/star.example.in.crt', 'utf8')
// var credentials = { key: privateKey, cert: certificate }

// var server = https.createServer(credentials, app)
// server.listen(port, function () {
//     console.log('Express server listening to port ' + port)
// })

app.listen(port)
console.log('Server Start on given port:', port)

// ------------------------------------------- Port Listen --------------------------------------------------------

module.exports = { 
  app: app
}