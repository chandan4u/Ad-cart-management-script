const fs = require('fs')
const path = require('path')
const util = require('util')
const _api = function (req, res) {
  req.check('classic', 'Classic must be an integer value').notEmpty().isInt()
  req.check('standout', 'Standout must be an Integer value').notEmpty().isInt()
  req.check('premium', 'Premium must be an Integer value').notEmpty().isInt()
  req.check('type', 'Offer only valid for UNILEVER, APPLE, NIKE, FORD').notEmpty().offerValidator(['Default', 'UNILEVER', 'APPLE', 'NIKE', 'FORD'])
  req.getValidationResult().then(function (result) {
    let _resultSet = null
    if (!result.isEmpty()) {
      _resultSet = {
        "resultSet": null,
        "errorMsg": {
          "message": util.inspect(result.array())
        }
      }
    } else {
      if (req.body.classic > 0 || req.body.standout > 0 || req.body.premium > 0) {
        const _expectedPrice = _offerPriceManagement(req.body)
        _resultSet = {
          "resultSet": {
            "customer": req.body.type,
            "idAdded": _idAdded(req.body),
            "totalExpected": _expectedPrice
          },
          "errorMsg": null
        }
      }
      else {
        _resultSet = {
          "resultSet": null,
          "errorMsg": {
            "message": "No Product selected."
          }
        }
      }
    }
    res.render(path.join(__basedir, '/public/product'), _resultSet)
  })
}

const _offerPriceManagement = function (bodyData) {
  const _priceList = { "classic": _adDefaultPrice.classic, "standout": _adDefaultPrice.standout, "premium": _adDefaultPrice.premium }
  if (bodyData.type === "UNILEVER" && bodyData.classic >= _unileverOffer.OffsetForDeal) {
    const newCountPrice = _getDeals(bodyData, _priceList, _unileverOffer.OffsetForDeal)
    bodyData.classic = newCountPrice.productCount
    _priceList.classic = newCountPrice.productPrice
  }
  if (bodyData.type === "APPLE") {
    _priceList.standout = _appleOffer.standout
  }
  if (bodyData.type === "NIKE" && bodyData.premium > _nikeOffer.OffsetLimit) {
    _priceList.premium = _nikeOffer.premium
  }
  if (bodyData.type === "FORD") {
    _priceList.standout = _fordOffer.standout
    if (bodyData.classic >= 4) {
      const newCountPrice = _getDeals(bodyData, _priceList, _fordOffer.OffsetForDeal)
      bodyData.classic = newCountPrice.productCount
      _priceList.classic = newCountPrice.productPrice
    }
    if (bodyData.premium >= _fordOffer.OffsetLimit) {
      _priceList.premium = _fordOffer.premium
    }
  }
  return _priceCalculator(_priceList, bodyData)
}

const _priceCalculator = function (priceList, productType) {
  const _expectedRate = (priceList.classic * productType.classic) + (priceList.standout * productType.standout) + (priceList.premium * productType.premium)
  return _expectedRate
}

const _idAdded = function (bodyData) {
  let _idString = ""
  const _products = ['classic', 'standout', 'premium']
  _products.forEach((product) => {
    for (let i = 0; i < bodyData[product]; i++) {
      _idString = _idString + " " + product + ",";
    }
  })
  return _idString.replace(/.$/, ".")
}

const _getDeals = function (bodyData, priceList, offerCount) {
  const _dealOffer = parseInt(bodyData.classic / offerCount)
  const _actualValueClassic = parseInt(bodyData.classic)
  bodyData.classic = parseInt(bodyData.classic) + _dealOffer
  priceList.classic = (priceList.classic * _actualValueClassic) / bodyData.classic
  return { 'productCount': bodyData.classic, 'productPrice': priceList.classic.toFixed(2) }
}

module.exports = {
  api: _api,
  getDeals: _getDeals,
  idAdded: _idAdded,
  priceCalculator: _priceCalculator,
  offerPriceManagement: _offerPriceManagement
}
