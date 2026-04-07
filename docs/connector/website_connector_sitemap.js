console.log('Demo sitemap: updated July 24th, 2024')
SalesforceInteractions.setLoggingLevel('debug')

try {
  SalesforceInteractions.init({
    consents: window.CONSENTS
  }).then(() => {
    SalesforceInteractions.initSitemap({
      global: {},
      pageTypes: [
        createTestPageConfig()
      ]
    })
    console.log('sitemap initialized')
  })

  document.addEventListener(SalesforceInteractions.CustomEvents.OnConsentRevoke, () => {
    console.log('consent revoked')
    SalesforceInteractions.reinit()
  })
} catch (e) {
  SalesforceInteractions.log.error(e)
}

function createTestPageConfig () {
  return {
    name: 'test',
    isMatch: () => true,
    listeners: [
      SalesforceInteractions.listener('click', '#yeti', () => {
        console.log('yeti clicked')
        SalesforceInteractions.sendEvent({
          interaction: {
            name: 'View Catalog Object',
            catalogObject: {
              type: 'Product',
              id: 'yeti',
              attributes: {
                productCategory: 'ABC'
              }
            }
          }
        })
      }),
      SalesforceInteractions.listener('click', '#womensJacket', () => {
        console.log('womans jacket clicked')
        SalesforceInteractions.sendEvent({
          interaction: {
            name: 'View Catalog Object',
            catalogObject: {
              type: 'Product',
              id: 'womensJacket',
              attributes: {
                productCategory: 'ABC'
              }
            }
          }
        })
      }),
      SalesforceInteractions.listener('click', '#mensJacket', () => {
        SalesforceInteractions.sendEvent({
          interaction: {
            name: 'View Catalog Object',
            catalogObject: {
              type: 'Product',
              id: 'mensJacket',
              attributes: {
                productCategory: 'ABC'
              }
            }
          }
        })
      }),
      SalesforceInteractions.listener('click', '#electronics', () => {
        SalesforceInteractions.sendEvent({
          interaction: {
            name: 'View Catalog Object',
            catalogObject: {
              type: 'Product',
              id: 'electronics',
              attributes: {
                productCategory: 'ABC'
              }
            }
          }
        })
      }),
      SalesforceInteractions.listener('click', '#mensShoe', () => {
        SalesforceInteractions.sendEvent({
          interaction: {
            name: 'View Catalog Object',
            catalogObject: {
              type: 'Product',
              id: 'mensShoe',
              attributes: {
                productCategory: 'ABC'
              }
            }
          }
        })
      }),
      SalesforceInteractions.listener('click', '#womensShoe', () => {
        SalesforceInteractions.sendEvent({
          interaction: {
            name: 'View Catalog Object',
            catalogObject: {
              type: 'Product',
              id: 'womensShoe',
              attributes: {
                productCategory: 'ABC'
              }
            }
          }
        })
      }),
      SalesforceInteractions.listener('click', '#womensBackpack', () => {
        SalesforceInteractions.sendEvent({
          interaction: {
            name: 'View Catalog Object',
            catalogObject: {
              type: 'Product',
              id: 'womensBackpack',
              attributes: {
                productCategory: 'ABC'
              }
            }
          }
        })
      }),
      SalesforceInteractions.listener('click', '#mensBackpack', () => {
        SalesforceInteractions.sendEvent({
          interaction: {
            name: 'View Catalog Object',
            catalogObject: {
              type: 'Product',
              id: 'mensBackpack',
              attributes: {
                productCategory: 'ABC'
              }
            }
          }
        })
      }),
      SalesforceInteractions.listener('click', '#promo1', () => {
        SalesforceInteractions.sendEvent({
          interaction: {
            name: 'View Catalog Object',
            catalogObject: {
              type: 'Product',
              id: 'product-promo1',
              attributes: {
                productCategory: 'ABC'
              }
            }
          }
        })
      }),
      SalesforceInteractions.listener('click', '#promo2', () => {
        SalesforceInteractions.sendEvent({
          interaction: {
            name: 'View Catalog Object',
            catalogObject: {
              type: 'Product',
              id: 'product-promo2',
              attributes: {
                productCategory: 'ABC'
              }
            }
          }
        })
      }),
      SalesforceInteractions.listener('click', '#promo3', () => {
        SalesforceInteractions.sendEvent({
          interaction: {
            name: 'View Catalog Object',
            catalogObject: {
              type: 'Product',
              id: 'product-promo3',
              attributes: {
                productCategory: 'ABC'
              }
            }
          }
        })
      }),
      SalesforceInteractions.listener('click', '#register', () => {
        SalesforceInteractions.reinit()
        const email = window.email
        const phone = window.phonenumber
        const firstname = window.firstname
        const lastname = window.lastname

        if (email) {
          SalesforceInteractions.sendEvent({
            user: {
              attributes: {
                email: email,
                eventType: 'contactPointEmail'
              }
            }
          })
        }
        if (phone) {
          SalesforceInteractions.sendEvent({
            user: {
              attributes: {
                phoneNumber: phone,
                eventType: 'contactPointPhone'
              }
            }
          })
        }
        SalesforceInteractions.sendEvent({
          user: {
            attributes: {
              firstName: firstname || '',
              lastName: lastname || '',
              eventType: 'identity',
              isAnonymous: 0
            }
          }
        })
      }),
      SalesforceInteractions.listener('click', '#addToCart', () => {
        console.log('add to cart clicked')
        SalesforceInteractions.sendEvent({
          interaction: {
            name: 'Add To Cart',
            lineItem: {
              catalogObjectType: 'Product',
              catalogObjectId: 'product-1',
              price: 10,
              quantity: 3,
              attributes: {
                sku: 'product-1-sku'
              }
            }
          }
        })
      }),
      SalesforceInteractions.listener('click', '#remove', () => {
        console.log('remove to cart clicked')
        SalesforceInteractions.sendEvent({
          interaction: {
            name: 'Remove From Cart',
            lineItem: {
              catalogObjectType: 'Product',
              catalogObjectId: 'product-1',
              price: 10,
              quantity: 3,
              attributes: {
                sku: 'product-1-sku'
              }
            }
          }
        })
      }),
      SalesforceInteractions.listener('click', 'button.submit-shipping', () => {
        console.log('submit order')
        const totalValue = parseFloat(SalesforceInteractions
          .cashDom('.slds-size_1-of-3.order-summary > dl:nth-child(4) > dd')
          .text()
          .trim()
          .replace('$', '')
        )
        const catalogObjectId = SalesforceInteractions
          .cashDom('div.slds-col.slds-size_2-of-3.checkout-form > fieldset > div > div:nth-child(2) > dl > dd')
          .text()
          .trim()
        SalesforceInteractions.sendEvent({
          interaction: {
            name: 'Purchase',
            order: {
              id: `order-${Date.now()}`,
              totalValue: totalValue,
              currency: 'USD',
              lineItems: [{
                catalogObjectType: 'Product',
                catalogObjectId: catalogObjectId,
                quantity: 1
              }]
            }
          }
        })
      }),
    ]
  }
}