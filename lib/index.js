var AuthorizeRequest = require('auth-net-request')
  , Types = require('auth-net-types');

module.exports = (function() {
  /**
    A class that contains all of the functions for CIM.


    @param {Object} [options={}] An object with options.
      @param {Boolean} [options.sandbox=false] Determine whether or not to use sandbox URLs.
      @param {String} [options.api=''] Your account's API.
      @param {String} [options.key=''] Your account's API key.

    @example
      var Auth = new AuthorizeCIM({
        sandbox: true,
        api: '1234',
        key: '1234567890'
      });

    @class AuthorizeNetCIM
    @constructor
  */

  var AuthorizeNetCIM = function(options) {
    options = options || {};

    this.AuthorizeRequest = new AuthorizeRequest(options);
    this.AuthorizeRequest.refId = options.refId || false;
    this.extraOptions = {};
    this.transactionTypes = [
      'AuthOnly', 'AuthCapture',
      'CaptureOnly', 'PriorAuthCapture',
      'Refund', 'Void'
    ];
  }

  /**
    Optional. Used if the merchant wants to set a reference ID.


    @param {String} refId The reference ID.

    @example
      AuthorizeNetCIM.setRefId('1234');
  */
  AuthorizeNetCIM.prototype.setRefId = function(refId) {
    this.AuthorizeRequest.refId = refId;
  }

  /**
    Create a customer profile.


    @param {Object} [options={}] An object with options.
      @param {Object|Customer} [options.customerProfile={}] An object with options for Customer or a Customer instance.
        @param {String|Number} [options.customerProfile.merchantCustomerId=''] Merchant's customer ID.
        @param {String} [options.customerProfile.description=''] Description of the customer.
        @param {String} [options.customerProfile.email=''] Customer's email.
        @param {String|Number} [options.customerProfile.customerProfileId=''] Customer's profile ID
        @param {Array|Object|AuthorizePaymentProfiles} [options.customerProfile.paymentProfiles=AuthorizePaymentProfiles] An object with paymentProfile values.
          @param {String} [options.customerProfile.customerType=''] Customer's type (individual or business).
          @param {String|Number} [options.customerProfile.paymentProfileId=''] Customer's payment profile ID.
          @param {Array|Object|AuthorizeBillingAddress} [options.customerProfile.billTo=AuthorizeBillingAddress] An object with billing addresses.
            @param {String} [options.customerProfile.billTo.firstName=''] Billing addressee's first name.
            @param {String} [options.customerProfile.billTo.lastName=''] Billing addressee's last name.
            @param {String} [options.customerProfile.billTo.address=''] Billing address.
            @param {String} [options.customerProfile.billTo.city=''] Billing address' city.
            @param {String|Number} [options.customerProfile.billTo.zip=''] Billing address' ZIP/Postal code.
            @param {String} [options.customerProfile.billTo.country='']  Billing address' country.
            @param {String} [options.customerProfile.billTo.phoneNumber=''] Billing address' phone number.
            @param {String} [options.customerProfile.billTo.faxNumber=''] Billing address' fax number.
          @param {Array|Object|AuthorizePayment} [options.customerProfile.payment=AuthorizePayment] Payment information.
            @param {Object|AuthorizeCreditCard} [options.customerProfile.payment.creditCard=AuthorizeCreditCard] Credit card information.
              @param {String|Number} [options.customerProfile.payment.creditCard.cardNumber=''] Credit card's number.
              @param {String} [options.customerProfile.payment.creditCard.expirationDate=''] Credit card's expiration date.
              @param {String|Number} [options.customerProfile.payment.creditCard.cardCode=''] CCV/credit card's code.
            @param {Object|AuthorizeBankAccount} [options.customerProfile.payment.bankAccount=AuthorizeBankAccount] Bank account information.
              @param {String} [options.customerProfile.payment.bankAccount.accountType=''] Bank account's type (e.g. checking)
              @param {String|Number} [options.customerProfile.payment.bankAccount.routingNumber=''] Bank account's routing number.
              @param {String|Number} [options.customerProfile.payment.bankAccount.accountNumber=''] Bank acocunt's account number.
              @param {String} [options.customerProfile.payment.bankAccount.nameOnAccount=''] The bank acocunt's owner's name.
              @param {String} [options.customerProfile.payment.bankAccount.echeckType=''] The type of electronic check transaction (CCD, PPD, TEL, or WEB)
              @param {String} [options.customerProfile.payment.bankAccount.bankName=''] The bank's name.
      @param {String} [options.validationMode='none'] Set the validation mode.
    @param {Function} [done=function(){}] Callback function.

    @example
      AuthorizeNetCIM.createCustomerProfile({customerProfile: {
        merchantCustomerId: 123,
        description: 'A customer with a lot of cash.',
        email: 'completelyfake@dontemail.com',
        customerProfileId: 1234
      }}, function(err, response){})
  */
  AuthorizeNetCIM.prototype.createCustomerProfile = function(options, done) {
    options = typeof options === "object" ? options : {};
    if (!options.validationMode && !options.customerProfile) {
      options.customerProfile = options || {};
    }
    options.customerProfile = options.customerProfile || {};

    var customerProfiles = new Types.Customer(options.customerProfile);
    var xml = customerProfiles.toXml()

    var xmlOptions = {
      validationMode: options.validationMode || 'none'
    }

    this.AuthorizeRequest.send('createCustomerProfile', xml, xmlOptions, done);
  }

  /**
    Create a customer payment profile.


    @param {Object} [options={}] An object with options.
      @param {String|Number} [options.customerProfileId=''] Customer's profile ID.
      @param {Object|PaymentProfile} [options.paymentProfile={}] Customer's payment profile object/instance.
        @param {String} [profiles.customerType=''] Customer's type, either individual or business.
        @param {Object|Array} [profiles.billTo=[{}]] An object/an array of objects of billing addresses.
          @param {String} [profiles.billTo.firstName=''] Addressee's first name.
          @param {String} [profiles.billTo.lastName=''] Addressee's last name.
          @param {String} [profiles.billTo.company=''] Addresee's company name.
          @param {String} [profiles.billTo.address=''] Addressee's street address.
          @param {String} [profiles.billTo.city=''] Addressee's city.
          @param {String} [profiles.billTo.state=''] Addressee's state.
          @param {String|Number} [profiles.billTo.zip=''] Addressee's postal/ZIP code.
          @param {String} [profiles.billTo.country=''] Addressee's country.
          @param {String} [profiles.billTo.phoneNumber=''] Addressee's phone number.
          @param {String} [profiles.billTo.faxNumber=''] Addressee's fax number.
          @param {String} [profiles.billTo.customerAddressId=''] Customer's address ID.
        @param {Object|Array} [profiles.payment=[{}]] An object/an array of objects of payments.
          @param {Object|Array} [options.payment.creditCard=[{}]] An array of objects/an object for credit cards.
            @param {String|Number} [options.payment.creditCard.cardNumber=''] Customer's credit card number.
            @param {String} [options.payment.creditCard.expirationDate=''] Customer's credit card expiration date.
            @param {String|Number} [options.payment.creditCard.cardCode=''] Customer's credit card code.
          @param {Object|Array} [options.payment.bankAccount=[{}]] An array of objects/an object of bank accounts.
            @param {String} [options.payment.bankAccount.accountType=''] Customer's bank account type (individual or business).
            @param {String|Number} [options.payment.bankAccount.routingNumber=''] Customer's routing number.
            @param {String|Number} [options.payment.bankAccount.accountNumber=''] Customer's account number.
            @param {String} [options.payment.bankAccount.nameOnAccount=''] Name on the bank account.
            @param {String} [options.payment.bankAccount.echeckType=''] Customer's echeck type.
            @param {String} [options.payment.bankAccount.bankName=''] Bank's name.
        @param {String|Number} [profiles.customerPaymentProfileId=''] Customer's payment profile ID.
    @param {Function} [done=function(){}] Callback function.

    @example
      var profile = new Types.PaymentProfiles({
        customerType: 'individual',
        billTo: new Types.BillingAddress({
          firstName: 'Dan',
          lastName: 'Smith',
          company: 'Company LLC',
          address: '123 Sesame St',
          city: 'Johnesville',
          state: 'fl',
          zip: 123,
          country: 'us',
          phoneNumber: 5551231234,
          faxNumber: 5551231235,
          customerAddressId: 1
        }),
        payment: new Types.Payment({
          creditCard: {
            cardNumber: 41111111111111111,
            expirationDate: '2012-01',
            cardCode: 111
          }
        }),
        customerPaymentProfileId: 123
      });


      AuthorizeNetCIM.createCustomerPaymentProfile({
        customerProfileId: '123',
        paymentProfile: profile
      }, function(err, response){})
  */
  AuthorizeNetCIM.prototype.createCustomerPaymentProfile = function(options, done) {
    options = typeof options === "object" ? options : {};
    options.customerProfileId = options.customerProfileId || '';
    options.paymentProfile = new Types.PaymentProfile(options.paymentProfile);

    var xml = '<customerProfileId>' + options.customerProfileId + '</customerProfileId>' +
        options.paymentProfile.toXml();

    var xmlOptions = {
      validationMode: options.validationMode || 'none'
    }

    this.AuthorizeRequest.send('createCustomerPaymentProfile', xml, xmlOptions, done);
  }

  /**
    Create a shipping address.


    @param {Object} [options={}] An object with options.
      @param {String|Number} [options.customerProfile=''] Customer's profile ID.
      @param {Object|ShippingAddress} [options.shippingAddress={}] Customer's shipping address information.
        @param {String} [options.shippingAddress.firstName=''] Addressee's first name.
        @param {String} [options.shippingAddress.lastName=''] Addressee's last name.
        @param {String} [options.shippingAddress.company=''] Addresee's company name.
        @param {String} [options.shippingAddress.address=''] Addressee's street address.
        @param {String} [options.shippingAddress.city=''] Addressee's city.
        @param {String} [options.shippingAddress.state=''] Addressee's state.
        @param {String|Number} [options.shippingAddress.zip=''] Addressee's postal/ZIP code.
        @param {String} [options.shippingAddress.country=''] Addressee's country.
        @param {String} [options.shippingAddress.phoneNumber=''] Addressee's phone number.
        @param {String} [options.shippingAddress.faxNumber=''] Addressee's fax number.
        @param {String} [options.shippingAddress.customerAddressId=''] Customer's address ID.
    @param {Function} [done=function(){}] Callback function.

    @example
      var address = {
        firstName: 'Dan',
        lastName: 'Smith',
        company: 'Company LLC',
        address: '123 Sesame St',
        city: 'Johnesville',
        state: 'fl',
        zip: 123,
        country: 'us',
        phoneNumber: 5551231234,
        faxNumber: 5551231235,
        customerAddressId: 1
      }

      AuthorizeNetCIM.createCustomerShippingAddress({
        customerProfileId: '123',
        shippingAddress: address
      }, function(err, response){})
  */
  AuthorizeNetCIM.prototype.createCustomerShippingAddress = function(options, done) {
    options = typeof options === "object" ? options : {};
    options.customerProfileId = options.customerProfileId || '';
    options.shippingAddress = new Types.ShippingAddress(options.shippingAddress);

    if (arguments.length < 1 || !options.customerProfileId) {
      throw new Error("You must enter in a customerProfileId.");
    }

    var xml = '<customerProfileId>' + options.customerProfileId + '</customerProfileId>' +
      '<address>' + options.shippingAddress.toXml() + '</address>';

    this.AuthorizeRequest.send('createCustomerShippingAddress', xml, done);
  }

  /**
    Create a transaction.


    @param {String} [transactionType=''] Set the transaction type ("AuthCapture", "AuthOnly", "CaptureOnly", or "PriorAuthCapture")
    @param {Object|Transaction} [options={}] An object with Transaction type options.
      @param {String|Number|Float} [options.amount=''] The transaction's amount.
      @param {Object} [options.tax={}] The transaction's tax information.
        @param {String|Number|Float} [options.tax.amount=''] Tax's amount.
        @param {String|Number} [options.tax.name=''] Tax's line item name.
        @param {String} [options.tax.description=''] Tax's description.
      @param {Object|Array} [options.shipping=[{}]] An array of objects/an object of shipping addresses.
        @param {String|Number|Float} [options.shipping.amount=''] Shipping's amount.
        @param {String|Number} [options.shipping.name=''] Shipping's line item name.
        @param {String} [options.shipping.description=''] Shipping's description.
      @param {Object} [options.duty={}] An object containing transaction's duty information.
        @param {String|Number|Float} [options.duty.amount=''] Duty's amount.
        @param {String} [options.duty.name=''] Duty's name.
        @param {String} [options.duty.description=''] Duty's description.
      @param {Object|Array} [options.lineItems=[{}]] An array of objects/an object of the transaction's line items.
        @param {String|Number} [options.lineItems.itemId=''] Line item's ID.
        @param {String} [options.lineItems.name=''] Line item's name.
        @param {String} [options.lineItems.description=''] Line item's description.
        @param {String|Number|Float} [options.lineItems.quantity=''] Line item's quantity.
        @param {String|Number|Float} [options.lineItems.unitPrice=''] Line item's unit price.
        @param {Boolean} [options.lineItems.taxable] If the line item is taxable or not.
      @param {String} [options.creditCardNumberMasked=''] Credit card's masked value (usually includes "*"s).
      @param {String} [options.bankAccountNumberMasked=''] Bank account's masked value (usually includes "*"s).
      @param {String|Number} [options.customerProfileId=''] Customer's profile ID.
      @param {String|Number} [options.customerPaymentProfileId=''] Customer's payment profile ID.
      @param {String|Number} [options.customerShippingAddressId=''] Customer's shipping address ID.
      @param {Object} [options.order={}] An object containing the order's information.
        @param {String|Number|Float} [options.order.invoiceNumber=''] Order's invoice number.
        @param {String} [options.order.description=''] Order's description.
        @param {String|Number} [options.order.orderNumber=''] Orders's purchase order number.
      @param {String|Number} [options.transId=''] Transaction's ID.
      @param {Boolean} [options.taxExempt=''] Determines whether the transaction is tax exempted or not (default is left out).
      @param {Boolean} [options.recurringBilling=''] Determines whether this transaction will be recurring (default is left out).
      @param {String|Number} [options.cardCode=''] Transaction's card code.
      @param {String|Number} [options.splitTenderId=''] The split tender's ID for the transaction.
      @param {String|Number} [options.approvalCode=''] The transaction's approval code (usually given to you from Auth.net after a verification process).
    @param {Function} [done=function(){}] Callback function.

    @example
      AuthorizeNetCIM.createCustomerProfileTransaction('AuthCapture',
        new AuthorizeTypes.Transaction({
          amount: 5.41,
          tax: new Types.Tax({
            amount: 5.42,
            name: 'Tax Item',
            description: 'Tax Desc'
          }),
          shipping: new Types.Shipping({
            amount: 5.99,
            name: 'Ship Item',
            description: 'Ship Desc'
          }),
          duty: new Types.Duty({
            amount: 5.42,
            name: 'Duty Item',
            description: 'Duty Desc'
          }),
          lineItems: new Types.LineItems(lineItems),
          creditCardNumberMasked: '****',
          bankAccountNumberMasked: '****',
          customerProfileId: 5,
          customerPaymentProfileId: 8,
          customerShippingAddressId: 3,
          order: new Types.Order({
            invoiceNumber: 542,
            description: 'Order Desc',
            orderNumber: 123
          }),
          transId: 111,
          taxExempt: true,
          recurringBilling: false,
          cardCode: 444,
          splitTenderId: 8934,
          approvalCode: 21931
        })
      , function(err, response){})
  */
  AuthorizeNetCIM.prototype.createCustomerProfileTransaction = function(transactionType, options, done) {
    if (arguments.length < 3) {
      throw new Error('You must enter in a transactionType, transaction object, and a callback');
    }

    options = typeof options === "object" ? options : {};
    var transaction = new Types.Transaction(options);

    if (transactionType !== "AuthCapture" && transactionType !== "AuthOnly" && transactionType !== "CaptureOnly" && transactionType !== "PriorAuthCapture") {
      throw new Error('Invalid transactionType. Must be: AuthCapture, AuthOnly, CaptureOnly, or PriorAuthCapture');
    }

    if (typeof done !== "function") {
      throw new Error('You must provide a callback function as the last argument for createCustomerProfileTransaction');
    }

    var xml = '<transaction>' +
        '<profileTrans' + transactionType + '>' +
        transaction.toXml() +
        '</profileTrans' + transactionType + '>' +
      '</transaction>';

    this.AuthorizeRequest.send('createCustomerProfileTransaction', xml, done);
  }

  /**
    Delete a customer profile.


    @param {String|Number} [options=0] Customer's profile ID.
    @param {Function} [done=function(){}] Callback function.

    @example
      AuthorizeNetCIM.deleteCustomerProfileTransaction('123', function(err, response){})
  */
  AuthorizeNetCIM.prototype.deleteCustomerProfile = function(options, done) {
    options = typeof options === "string" || typeof options === "number" ? options : 0;

    if (arguments.length < 1 || options < 1) {
      throw new Error('You must enter in a customerProfileId.');
    }

    var xml = '<customerProfileId>' + options + '</customerProfileId>';

    this.AuthorizeRequest.send('deleteCustomerProfile', xml, done);
  }

  /**
    Delete a payment profile.


    @param {Object} [options={}] An object with options.
      @param {String|Number} [options.customerProfileId=''] Customer's profile ID.
      @param {String|Number} [options.customerPaymentProfileId=''] Customer's payment profile ID.
    @param {Function} [done=function(){}] Callback function.

    @example
      AuthorizeNetCIM.deleteCustomerPaymentProfileTransaction({
        customerProfileId: '123',
        customerPaymentProfileId: '1234'
      }, function(err, response){})
  */
  AuthorizeNetCIM.prototype.deleteCustomerPaymentProfile = function(options, done) {
    options = typeof options === "object" ? options : {};
    options.customerProfileId = options.customerProfileId || '';
    options.customerPaymentProfileId = options.customerPaymentProfileId || '';

    if (arguments.length < 2) {
      throw new Error('You must enter in a customerProfileId and customerPaymentProfileId.');
    }

    if (!options.customerProfileId) {
      throw new Error('You must enter in a customerProfileId.');
    }

    if (!options.customerPaymentProfileId) {
      throw new Error('You must enter in a customerPaymentProfileId.');
    }

    var xml = '<customerProfileId>' + options.customerProfileId + '</customerProfileId>' +
      '<customerPaymentProfileId>' + options.customerPaymentProfileId + '</customerPaymentProfileId>';

    this.AuthorizeRequest.send('deleteCustomerPaymentProfile', xml, done);
  }

  /**
    Delete a shipping address.


    @param {Object} [options={}] An object with no options.
      @param {String|Number} [options.customerProfileId=''] Customer's profile ID.
      @param {String|Number} [options.customerAddressId=''] Customer's address ID.
    @param {Function} [done=function(){}] Callback function.

    @example
      AuthorizeNetCIM.deleteCustomerShippingAddress({
        customerProfileId: '123',
        customerAddressId: '1234'
      }, function(err, response){})
  */
  AuthorizeNetCIM.prototype.deleteCustomerShippingAddress = function(options, done) {
    options = typeof options === "object" ? options : {};
    options.customerProfileId = options.customerProfileId || '';
    options.customerAddressId = options.customerAddressId || '';

    if (arguments.length < 2) {
      throw new Error('You must enter in a customerProfileId and a customerAddressId.');
    }

    if (!options.customerProfileId) {
      throw new Error('You must enter in a customerProfileId.');
    }

    if (!options.customerAddressId) {
      throw new Error('You must enter in a customerAddressId.');
    }

    var xml = '<customerProfileId>' + options.customerProfileId + '</customerProfileId>' +
      '<customerAddressId>' + options.customerAddressId + '</customerAddressId>';

    this.AuthorizeRequest.send('deleteCustomerShippingAddress', xml, done);
  }

  /**
    Get all customer profile ids.

    @param {Function} [done=function(){}] Callback function.

    @example
      AuthorizeNetCIM.getCustomerProfileIds(function(err, response) {})
  */
  AuthorizeNetCIM.prototype.getCustomerProfileIds = function(done) {
    this.AuthorizeRequest.send('getCustomerProfileIds', '', done);
  }

  /**
    Get a customer profile.

    @param {String|Number} [options=0] Customer's profile ID.
    @param {Function} [done=function(){}] Callback function.

    @example
      AuthorizeNetCIM.getCustomerProfile('123', function(err, response){})
  */
  AuthorizeNetCIM.prototype.getCustomerProfile = function(options, done) {
    options = typeof options === "string" || typeof options === "number" ? options : 0;

    if (arguments.length < 2 || options < 1) {
      throw new Error('You must enter in a customerProfileId.');
    }

    var xml = '<customerProfileId>' + options + '</customerProfileId>';

    this.AuthorizeRequest.send('getCustomerProfile', xml, done);
  }

  /**
    Get a payment profile.


    @param {Object} [options={}] An object with options
      @param {String|Number} [options.customerProfileId=''] Customer's profile ID.
      @param {String|Number} [options.customerPaymentProfileId=''] Customer's payment profile ID.
    @param {Function} [done=function(){}] Callback function.

    @example
      AuthorizeNetCIM.getCustomerPaymentProfile({
        customerProfileId: '123',
        customerPaymentProfileId: '1234'
      }, function(err, response){})
  */
  AuthorizeNetCIM.prototype.getCustomerPaymentProfile = function(options, done) {
    options = typeof options === "object" ? options : {};
    options.customerProfileId = options.customerProfileId || '';
    options.customerPaymentProfileId = options.customerPaymentProfileId || '';

    if (arguments.length < 2) {
      throw new Error('You must enter in a customerProfileId and customerPaymentProfileId.');
    }

    if (!options.customerProfileId) {
      throw new Error('You must enter in a customerProfileId.');
    }

    if (!options.customerPaymentProfileId) {
      throw new Error('You must enter in a customerPaymentProfileId.');
    }

    var xml = '<customerProfileId>' + options.customerProfileId + '</customerProfileId>' +
      '<customerPaymentProfileId>' + options.customerPaymentProfileId + '</customerPaymentProfileId>';

    this.AuthorizeRequest.send('getCustomerPaymentProfile', xml, done);
  }

  /**
    Get a shipping address.


    @param {Object} [options={}] An object with options.
      @param {String|Number} [options.customerProfileId=''] Customer's profile ID.
      @param {String|Number} [options.customerAddressId=''] Customer's address ID.
    @param {Function} [done=function(){}] Callback function.

    @example
      AuthorizeNetCIM.getCustomerShippingAddress({
        customerProfileId: '123',
        customerAddressId: '1234'
      }, function(err, response){})
  */
  AuthorizeNetCIM.prototype.getCustomerShippingAddress = function(options, done) {
    options = typeof options === "object" ? options : {};
    options.customerProfileId = options.customerProfileId || '';
    options.customerAddressId = options.customerAddressId || '';

    if (arguments.length < 2) {
      throw new Error('You must enter in a customerProfileId and customerAddressId.');
    }

    if (!options.customerProfileId) {
      throw new Error('You must enter in a customerProfileId.');
    }

    if (!options.customerAddressId) {
      throw new Error('You must enter in a customerAddressId.');
    }

    var xml = '<customerProfileId>' + options.customerProfileId + '</customerProfileId>' +
      '<customerAddressId>' + options.customerAddressId + '</customerAddressId>';

    this.AuthorizeRequest.send('getCustomerShippingAddress', xml, done);
  }

  /**
    Update a profile.


    @param {Object|CustomerBasic} [options={}] An object with CustomerBasic options or CustomerBasic instance.
    @param {Function} [done=function(){}] Callback function.

    @example
      AuthorizeNetCIM.updateCustomerProfile(new AuthorizeTypes.CustomerBasic({
        email: 'newfakeemail@email.com',
        merchantCustomerId: 1234,
        description: 'New description!',
        customerProfileId: 123
      }, function(err, response){})
  */
  AuthorizeNetCIM.prototype.updateCustomerProfile = function(options, done) {
    options = typeof options === "object" ? options : {};
    var customerProfile = new Types.CustomerBasic(options);

    if (arguments.length < 2) {
      throw new Error('You must provide a customer object.');
    }

    if (!customerProfile.customerProfileId) {
      throw new Error('You must provide a customerProfileId.');
    }

    this.AuthorizeRequest.send('updateCustomerProfile', customerProfile.toXml(), done);
  }

  /**
    Update a payment profile.


    @param {Object} [options={}] An object with options.
      @param {String|Number} [options.customerProfileId=''] Customer's profile ID.
      @param {Object|PaymentProfile} [options.paymentProfile] An object with options for PaymentProfile or a PaymentProfile instance.
      @param {String} [options.validationMode='none'] Set the validation mode.
    @param {Function} [done=function(){}] Callback function.

    @example
      var profile = new Types.PaymentProfile({
        customerType: 'individual',
        billTo: new Types.BillingAddress({
          firstName: 'Dan',
          lastName: 'Smith',
          company: 'Company LLC',
          address: '123 Sesame St',
          city: 'Johnesville',
          state: 'fl',
          zip: 123,
          country: 'us',
          phoneNumber: 5551231234,
          faxNumber: 5551231235,
          customerAddressId: 1
        }),
        payment: new Types.Payment({
          creditCard: {
            cardNumber: 41111111111111111,
            expirationDate: '2012-01',
            cardCode: 111
          }
        }),
        customerPaymentProfileId: 123
      });

      AuthorizeNetCIM.updateCustomerPaymentProfile({
        customerProfileId: '123',
        paymentProfile: profile
      }, function(err, response) {})
  */
  AuthorizeNetCIM.prototype.updateCustomerPaymentProfile = function(options, done) {
    options = typeof options === "object" ? options : {};
    options.customerProfileId = options.customerProfileId || '';
    options.paymentProfile = new Types.PaymentProfile(options.paymentProfile);
    options.validationMode = options.validationMode || 'none';

    if (arguments.length < 2) {
      throw new Error('You must enter in a customerProfileId and paymentProfile object.');
    }

    if (!options.customerProfileId) {
      throw new Error('You must provide a customerProfileId.');
    }

    if (options.paymentProfile.length < 1) {
      throw new Error('You must provide a paymentProfile object.');
    }

    var xml = '<customerProfileId>' + options.customerProfileId + '</customerProfileId>' +
        options.paymentProfile.toXml();

    var xmlOptions = {
      validationMode: options.validationMode
    }

    this.AuthorizeRequest.send('updateCustomerPaymentProfile', xml, xmlOptions, done);
  }

  /**
    Update a shipping address.


    @param {Object} [options={}] An object with options.
      @param {String|Number} [options.customerProfileId=''] Customer's profile ID.
      @param {Object|ShippingAddress} [options.address={}] An object with ShippingAddress options or a ShippingAddress instance.
    @param {Function} [done=function(){}] Callback function.

    @example
      var address = new AuthorizeTypes.ShippingAddress({
        firstName: 'Dan',
        lastName: 'Smith',
        company: 'Company LLC',
        address: '123 Sesame St',
        city: 'Johnesville',
        state: 'fl',
        zip: 123,
        country: 'us',
        phoneNumber: 5551231234,
        faxNumber: 5551231235,
        customerAddressId: 1
      });

      AuthorizeNetCIM.updateCustomerShippingAddress({
        customerProfileId: '123',
        address: address
      }, function(err, response) {})
  */
  AuthorizeNetCIM.prototype.updateCustomerShippingAddress = function(options, done) {
    options = typeof options === "object" ? options : {};
    options.customerProfileId = options.customerProfileId || '';
    options.address = new Types.ShippingAddress(options.address);

    if (arguments.length < 2) {
      throw new Error('You must enter in a customerProfileId, an address object, and a customerShippingAddressId.');
    }

    if (!options.customerProfileId) {
      throw new Error('You must provide a customerProfileId.');
    }

    if (!options.address || options.address.length < 1) {
      throw new Error('You must provide an address object.');
    }

    var xml = '<customerProfileId>' + options.customerProfileId + '</customerProfileId>' +
      '<address>' + options.address.toXml() + '</address>';

    this.AuthorizeRequest.send('updateCustomerShippingAddress', xml, done);
  }

  /**
    Update the status of an existing order that contains multiple transactions with the same splitTenderId.


    @param {Object} [options={}] An object with options.
      @param {String|Number} [options.splitTenderId=''] Split tender's ID.
      @param {String} [options.splitTenderStatus=''] Split tender's status.
    @param {Function} [done=function(){}] Callback function.
  */
  AuthorizeNetCIM.prototype.updateSplitTenderGroup = function(options, done) {
    options = typeof options === "object" ? options : {};
    options.splitTenderId = options.splitTenderId || '';
    options.splitTenderStatus = options.splitTenderStatus || '';

    if (arguments.length < 2) {
      throw new Error('You must enter in a splitTenderId and a splitTenderStatus.');
    }

    if (!options.splitTenderId) {
      throw new Error('You must provide a splitTenderId.');
    }

    if (!options.splitTenderStatus) {
      throw new Error('You must provide a splitTenderStatus.');
    }

    if (options.splitTenderStatus !== "voided" && options.splitTenderStatus !== "completed") {
      throw new Error('splitTenderStatus must be either voided or completed.');
    }

    var xml = '<splitTenderId>' + options.splitTenderId + '</splitTenderId>' +
      '<splitTenderStatus>' + options.splitTenderStatus + '</splitTenderStatus>';

    this.AuthorizeRequest.send('updateSplitTenderGroup', xml, done);
  }

  /**
    Validate a customer payment profile.


    @param {Object} [options={}] An object with options.
      @param {String|Number} [options.customerProfileId=''] Customer's profile ID.
      @param {String|Number} [options.customerPaymentProfileId=''] Customer's payment profile ID.
      @param {String|Number} [options.customerShippingAddressId=''] Customer's shipping address ID.
      @param {String} [options.cardCode=''] Customer's card code.
      @param {String} [options.validationMode] The request's validation mode.
    @param {Function} [done=function(){}] Callback function.

    @example
      AuthorizeNetCIM.validateCustomerPaymentProfile({
        customerProfileId: '123',
        customerPaymentProfileId: '1234',
        customerShippingAddressId: '1235',
        cardCode: '123',
        validationMode: 'none'
      }, function(err, response) {})
  */
  AuthorizeNetCIM.prototype.validateCustomerPaymentProfile = function(options, done) {
    options = typeof options === "object" ? options : {};
    options.customerProfileId = options.customerProfileId || '';
    options.customerPaymentProfileId = options.customerPaymentProfileId || '';
    options.customerShippingAddressId = options.customerShippingAddressId || '';
    options.cardCode = options.cardCode || '';

    if (arguments.length < 2) {
      throw new Error('You must enter in a customerProfileId and a customerPaymentProfileId.');
    }

    if (!options.customerProfileId) {
      throw new Error('You must provide a customerProfileId.');
    }

    if (!options.customerPaymentProfileId) {
      throw new Error('You must provide a customerPaymentProfileId.');
    }

    if (!options.validationMode) {
      throw new Error('You must provide a validationMode.');
    }

    var xml = '<customerProfileId>' + options.customerProfileId + '</customerProfileId>' +
      '<customerPaymentProfileId>' + options.customerPaymentProfileId + '</customerPaymentProfileId>' +
      (!!options.customerShippingAddressId ? '<customerShippingAddressId>' + options.customerShippingAddressId + '</customerShippingAddressId>' : '') +
      (!!options.cardCode ? '<cardCode>' + options.cardCode + '</cardCode>' : '');

    var xmlOptions = {
      validationMode: options.validationMode
    }

    this.AuthorizeRequest.send('validateCustomerPaymentProfile', xml, xmlOptions, done);
  }

  return AuthorizeNetCIM;
})();
