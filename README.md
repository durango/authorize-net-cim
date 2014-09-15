# Authorize.net CIM

[![Dependency Status](https://david-dm.org/durango/authorize-net-cim.svg?theme=shields.io)](https://david-dm.org/durango/authorize-net-cim) [![devDependency Status](https://david-dm.org/durango/authorize-net-cim/dev-status.svg?theme=shields.io)](https://david-dm.org/durango/authorize-net-cim#info=devDependencies)

Authorize.net CIM bindings for Node.JS

## Install

    npm install auth-net-cim

## Tests

    AUTH_CONFIG=/path/to/config.json make tests

**config.json**

```js
{
  "api": "123",
  "key": "1234",
  "sandbox": true
}
```

## Usage

Assuming we're doing:

```js
var Authorize = require('auth-net-types')
  , _AuthorizeCIM = require('auth-net-cim')
  , AuthorizeCIM = new _AuthorizeCIM({
    api: '123',
    key: '124',
    sandbox: true // false
  });
```

### createCustomerProfile
```js
AuthorizeNetCIM.createCustomerProfile({customerProfile: {
  merchantCustomerId: 123,
  description: 'A customer with a lot of cash.',
  email: 'completelyfake@dontemail.com',
  customerProfileId: 1234
}}, function(err, response){})
```

```js
var profile = {
  merchantCustomerId: 123,
  description: 'A customer with a lot of cash.',
  email: 'completelyfake@dontemail.com',
  customerProfileId: 1234
}

var bankAccount = new Authorize.BankAccount({
  accountType: 'businessChecking',
  routingNumber: '121042882',
  accountNumber: '123456789123',
  nameOnAccount: 'Jane Doe',
  bankName: 'Pandora Bank'
})
, payment = new Authorize.Payment({
  bankAccount: bankAccount
});

profile.paymentProfiles = new Authorize.PaymentProfiles({
  customerType: 'business',
  payment: payment
});

AuthorizeNetCIM.createCustomerProfile({customerProfile: profile}, function(err, response){});
```

### createCustomerPaymentProfile
```js
var options = {
  customerType: 'individual',
  payment: new Authorize.Payment({
    creditCard: new Authorize.CreditCard({
      cardNumber: '4111111111111111',
      expirationDate: '2012-10'
    })
  })
}

AuthorizeCIM.createCustomerPaymentProfile({
  customerProfileId: '123',
  paymentProfile: options
}, function(err, response) {});
```

### createCustomerShippingAddress
```js
AuthorizeCIM.createCustomerShippingAddress({
  customerProfileId: '123',
  shippingAddress: new Authorize.ShippingAddress({
    firstName: 'Bob',
    lastName: 'Smith',
    address: '123 Sesame St',
    city: 'Gainesville',
    state: 'FL',
    zip: 32601,
    country: 'us'
  })
}, function(err, response) {});
```

### updateCustomerProfile
```js
AuthorizeCIM.updateCustomerProfile(new Authorize.CustomerBasic({
  email: 'newfakeemail@email.com',
  merchantCustomerId: 1234,
  description: 'New description!',
  customerProfileId: this.customerProfileId
}), function(err, response) {});
```

### updateCustomerPaymentProfile
```js
AuthorizeCIM.updateCustomerPaymentProfile({
  customerProfileId: '123',
  paymentProfile: new Authorize.PaymentProfile({
    customerPaymentProfileId: 444,
    customerType: 'business',
    payment: new Authorize.Payment({
      creditCard: new Authorize.CreditCard({
        cardNumber: '4007000000027',
        expirationDate: '2012-10',
        cardCode: 111
      })
    })
  })
}, function(err, response) {});
```

### updateCustomerShippingAddress
```js
AuthorizeCIM.updateCustomerShippingAddress({
  customerProfileId: '123',
  address: new Authorize.ShippingAddress({
    firstName: 'John',
    lastName: 'Smith',
    state: 'TX',
    country: 'US',
    zip: 11111,
    customerAddressId: null
  })
}, function(err, response) {});
```

### getCustomerProfile
```js
AuthorizeCIM.getCustomerProfile('123', function(err, response) {});
```

### getCustomerPaymentProfile
```js
AuthorizeCIM.getCustomerPaymentProfile({
  customerProfileId: '123',
  customerPaymentProfileId: '1234'
}, function(err, response) {});
```

### getCustomerShippingAddress
```js
AuthorizeCIM.getCustomerShippingAddress({
  customerProfileId: '123',
  customerAddressId: '1234'
}, function(err, response) {});
```

### validateCustomerPaymentProfile
```js
AuthorizeCIM.validateCustomerPaymentProfile({
  customerProfileId: '123',
  customerPaymentProfileId: '1234',
  validationMode: 'testMode' // liveMode
}, function(err, response) {});
```

### createCustomerProfileTransaction
```js
var transaction = {
  amount: 56.01,
  tax: {
    amount: 12.44,
    name: 'State Tax',
    description: 'FL'
  },
  shipping: {
    amount: 5.00,
    name: 'FedEx Ground',
    description: 'No Free Shipping Option'
  },
  customerProfileId: '123',
  customerPaymentProfileId: '1234',
  order: {
    invoiceNumber: 1337
  }
};

AuthorizeCIM.createCustomerProfileTransaction('AuthCapture' /* AuthOnly, CaptureOnly, PriorAuthCapture */, transaction, function(err, response) {});
```

### updateSplitTenderGroup
```js
AuthorizeCIM.updateSplitTenderGroup({
  splitTenderId: 1,
  splitTenderStatus: 'voided'
}, function(err, response) {});
```

### deleteCustomerPaymentProfile
```js
AuthorizeCIM.deleteCustomerPaymentProfile({
  customerProfileId: '123',
  customerPaymentProfileId: '1234'
}, function(err, response) {});
```

### deleteCustomerShippingAddress
```js
AuthorizeCIM.deleteCustomerShippingAddress({
  customerProfileId: '123',
  customerAddressId: '1234'
}, function(err, response) {});
```

### deleteCustomerProfile
```js
AuthorizeCIM.deleteCustomerProfile('123', function(err, response) {});
```

## Note

Version `>= 2.x.x` has a breaking change, all values are returned as strings rather than strings and numbers (unless the value is an object, array, etc).
