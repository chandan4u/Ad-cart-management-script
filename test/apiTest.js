const expect = require('expect')
const filterApi = require('./../api/apiController')
const request = require('request')
const app = require('./../server.js').app

describe('Ad Price Management System', function () {
  let server;
  before(function () {
    server = app.listen(8000)
  })

  it('should return 200 and valid response', function (done) {
    const options = {
      url: 'http://localhost:8000/product-offer',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ "classic": 8, "standout": 3, "premium": 9, "type": "NIKE" })
    }
    request.post(options, function (err, res, body) {
      const expectedResult = res.body.split('<div id="resultSet">')[1].replace(/\s/g, "")
      expect(res.statusCode).toEqual(200)
      expect(expectedResult).toEqual('\n\n<h3>Result ::</h3>\n<b>Customer::</b>\nNIKE\n<br />\n<b>SKUs Scanned::</b>\nclassic, classic, classic, classic, classic, classic, classic, classic, standout, standout, standout, premium, premium, premium, premium, premium, premium, premium, premium, premium.\n<br />\n<b>Total expected ::</b> $\n6548.8\n\n\n</div>\n</body>\n\n</html>'.replace(/\s/g, ""))
      done()
    })
  })

  after(function () {
    server.close()
  })


  it('should return expected price for Ad', async () => {
    const _priceList = { "classic": 269.99, "standout": 322.99, "premium": 394.99 }
    const _productType = { "classic": 1, "standout": 3, "premium": 4 }
    const response = await filterApi.priceCalculator(_priceList, _productType)
    expect(response).toEqual(2818.92)
  })

  it('should return valid Ad type string', async () => {
    const _productType = { "classic": 1, "standout": 3, "premium": 4 }
    const response = await filterApi.idAdded(_productType)
    expect(response).toEqual(' classic, standout, standout, standout, premium, premium, premium, premium.')
  })

  it('should return valid product count and price for Ad', async () => {
    const _productType = { "classic": 8, "standout": 3, "premium": 4 }
    const _priceList = { "classic": 269.99, "standout": 322.99, "premium": 394.99 }
    const offerCount = 4;
    const response = await filterApi.getDeals(_productType, _priceList, offerCount)
    expect(response.productCount).toEqual(10)
    expect(response.productPrice).toEqual(215.99)
  })

  it('should return valid expected price for Default plan', async () => {
    const _productType = { "classic": 8, "standout": 3, "premium": 4, "type": "Default" }
    const response = await filterApi.offerPriceManagement(_productType)
    expect(response).toEqual(4708.85)
  })

  it('should return valid expected price for UNILEVER plan', async () => {
    const _productType = { "classic": 8, "standout": 3, "premium": 4, "type": "UNILEVER" }
    const response = await filterApi.offerPriceManagement(_productType)
    expect(response).toEqual(4708.81)
  })

  it('should return valid expected price for APPLE plan', async () => {
    const _productType = { "classic": 8, "standout": 3, "premium": 4, "type": "APPLE" }
    const response = await filterApi.offerPriceManagement(_productType)
    expect(response).toEqual(4639.85)
  })

  it('should return valid expected price for NIKE plan', async () => {
    const _productType = { "classic": 8, "standout": 3, "premium": 9, "type": "NIKE" }
    const response = await filterApi.offerPriceManagement(_productType)
    expect(response).toEqual(6548.8)
  })

  it('should return valid expected price for FORD plan', async () => {
    const _productType = { "classic": 8, "standout": 3, "premium": 4, "type": "FORD" }
    const response = await filterApi.offerPriceManagement(_productType)
    expect(response).toEqual(4649.83)
  })

})
