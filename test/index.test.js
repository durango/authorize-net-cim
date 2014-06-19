var chai = require('chai')
  , expect = chai.expect
  , path = require('path')
  , config = require(path.resolve(process.env.AUTH_CONFIG))
  , Authorize = require('auth-net-types')
  , _AuthorizeCIM = require(__dirname + '/../index')
  , AuthorizeCIM = new _AuthorizeCIM(config);

chai.Assertion.includeStack = true;

// let's just quickly make 10 basic profiles
var id = (new Date().getTime())
  , i = 0
  , max = 10
  , profiles = [];

for (i = 0; i < max; ++i) {
  profiles[profiles.length] = {
    description: 'A simple test profile',
    merchantCustomerId: (id+i),
    email: 'fakeemail' + i + '@fakeemail.com'
  }
}

describe('AuthorizeNetCIM', function() {
  this.timeout(5000);

  describe('#create', function() {
    describe('#createCustomerProfile', function() {
      it('should be able to create a new profile with a pure JS object', function(done) {
        AuthorizeCIM.createCustomerProfile({customerProfile: profiles[0]}, function(err, resp) {
          expect(err).to.not.exist;
          expect(resp).to.be.an('object');
          expect(resp.messages).to.exist;
          expect(resp.messages.resultCode).to.equal('Ok');
          expect(resp.messages.message).to.exist;
          expect(resp.messages.message.code).to.equal('I00001');
          expect(resp.messages.message.text).to.equal('Successful.');

          profiles[0].customerProfileId = resp.customerProfileId;
          done();
        });
      });

      it('should be able to create a new profile with a payment profile object already created', function(done) {
        profiles[1].paymentProfiles = [{
          customerType: 'business',
          payment: {
            bankAccount: {
              accountType: 'businessChecking',
              routingNumber: '121042882',
              accountNumber: '123456789123',
              nameOnAccount: 'Jane Doe',
              bankName: 'Pandora Bank'
            }
          }
        }];

        AuthorizeCIM.createCustomerProfile({customerProfile: profiles[1]}, function(err, resp) {
          expect(err).to.not.exist;
          expect(resp).to.be.an('object');
          expect(resp.messages).to.exist;
          expect(resp.messages.resultCode).to.equal('Ok');
          expect(resp.messages.message).to.exist;
          expect(resp.messages.message.code).to.equal('I00001');
          expect(resp.messages.message.text).to.equal('Successful.');
          expect(resp.customerProfileId).to.exist;
          expect(resp.customerPaymentProfileIdList).to.be.an('object');
          expect(resp.customerPaymentProfileIdList.numericString).to.exist;

          profiles[1].paymentProfileIds = [resp.customerPaymentProfileIdList.numericString];
          profiles[1].customerProfileId = resp.customerProfileId;
          done();
        });
      });

      it('should be able to create a new profile with a payment profile instance already created', function(done) {
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

        profiles[2].paymentProfiles = new Authorize.PaymentProfiles({
          customerType: 'business',
          payment: payment
        });

        AuthorizeCIM.createCustomerProfile({customerProfile: profiles[2]}, function(err, resp) {
          expect(err).to.not.exist;
          expect(resp).to.be.an('object');
          expect(resp.messages).to.exist;
          expect(resp.messages.resultCode).to.equal('Ok');
          expect(resp.messages.message).to.exist;
          expect(resp.messages.message.code).to.equal('I00001');
          expect(resp.messages.message.text).to.equal('Successful.');
          expect(resp.customerProfileId).to.exist;
          expect(resp.customerPaymentProfileIdList).to.be.an('object');
          expect(resp.customerPaymentProfileIdList.numericString).to.exist;

          profiles[2].paymentProfileIds = [resp.customerPaymentProfileIdList.numericString];
          profiles[2].customerProfileId = resp.customerProfileId;
          done();
        });
      });

      it('should be able to create a new profile with several payment profile instances already created', function(done) {
        var bankAccount1 = new Authorize.BankAccount({
          accountType: 'businessChecking',
          routingNumber: '121042882',
          accountNumber: '123456789123',
          nameOnAccount: 'Jane Doe',
          bankName: 'Pandora Bank'
        })
        , bankAccount2 = new Authorize.BankAccount({
          accountType: 'businessChecking',
          routingNumber: '121042882',
          accountNumber: '123456789124',
          nameOnAccount: 'John Doe',
          bankName: 'Pandora Bank'
        })
        , payment = new Authorize.Payment({bankAccount: bankAccount1})
        , payment2 = new Authorize.Payment({bankAccount: bankAccount2});

        profiles[3].paymentProfiles = new Authorize.PaymentProfiles([{
            customerType: 'business',
            payment: payment
          },
          {
            customerType: 'individual',
            payment: payment2
          }
        ]);

        profiles[3] = new Authorize.Customer(profiles[3]);

        AuthorizeCIM.createCustomerProfile({customerProfile: profiles[3]}, function(err, resp) {
          expect(err).to.not.exist;
          expect(resp).to.be.an('object');
          expect(resp.messages).to.exist;
          expect(resp.messages.resultCode).to.equal('Ok');
          expect(resp.messages.message).to.exist;
          expect(resp.messages.message.code).to.equal('I00001');
          expect(resp.messages.message.text).to.equal('Successful.');
          expect(resp.customerProfileId).to.exist;
          expect(resp.customerPaymentProfileIdList).to.be.an('object');
          expect(resp.customerPaymentProfileIdList.numericString).to.exist;
          expect(resp.customerPaymentProfileIdList.numericString).to.be.instanceof(Array);
          expect(resp.customerPaymentProfileIdList.numericString.length).to.equal(2);

          profiles[3].paymentProfileIds = resp.customerPaymentProfileIdList.numericString;
          profiles[3].customerProfileId = resp.customerProfileId;
          done();
        });
      });
    });

    describe('#createCustomerPaymentProfile', function() {
      beforeEach(function(done) {
        var self = this
          , unix = (new Date()).getTime() + Math.floor(Math.random() * 100) + 1;

        AuthorizeCIM.createCustomerProfile({customerProfile: {
          description: 'A simple test profile',
          merchantCustomerId: unix,
          email: 'fakeemail' + unix.toString() + '@fakeemail.com'
        }}, function(err, resp) {
          self.customerProfileId = resp.customerProfileId;
          done();
        });
      });

      it("should be able to create a new payment profile with a normal object", function(done) {
        var date = new Date()
        , options = {
          customerType: 'individual',
          payment: {
            creditCard: {
              cardNumber: '4111111111111111',
              expirationDate: (date.getFullYear()+1) + '-10'
            }
          }
        }

        AuthorizeCIM.createCustomerPaymentProfile({
          customerProfileId: this.customerProfileId,
          paymentProfile: options
        }, function(err, resp) {
          expect(err).to.not.exist;
          expect(resp).to.be.an('object');
          expect(resp.messages).to.exist;
          expect(resp.messages.resultCode).to.equal('Ok');
          expect(resp.messages.message).to.exist;
          expect(resp.messages.message.code).to.equal('I00001');
          expect(resp.messages.message.text).to.equal('Successful.');
          expect(resp.customerPaymentProfileId).to.exist;
          done();
        });
      });

      it("should be able to create a new payment profile with a payment object", function(done) {
        var date = new Date()
        , options = {
          customerType: 'individual',
          payment: new Authorize.Payment({
            creditCard: new Authorize.CreditCard({
              cardNumber: '4111111111111111',
              expirationDate: (date.getFullYear()+1) + '-10'
            })
          })
        }

        AuthorizeCIM.createCustomerPaymentProfile({
          customerProfileId: this.customerProfileId,
          paymentProfile: options
        }, function(err, resp) {
          expect(err).to.not.exist;
          expect(resp).to.be.an('object');
          expect(resp.messages).to.exist;
          expect(resp.messages.resultCode).to.equal('Ok');
          expect(resp.messages.message).to.exist;
          expect(resp.messages.message.code).to.equal('I00001');
          expect(resp.messages.message.text).to.equal('Successful.');
          expect(resp.customerPaymentProfileId).to.exist;
          done();
        });
      });
    });

    describe('#createCustomerShippingAddress', function() {
      before(function(done) {
        var self = this;
        var id = (new Date()).getTime() + Math.floor(Math.random() * (100 - 10 + 1)) + 10;
        AuthorizeCIM.createCustomerProfile({customerProfile: {
          description: 'A simple description',
          merchantCustomerId: id,
          email: 'fakeemail' + id + '@fakemeail.com'
        }}, function(err, resp) {
          self.customerProfileId = resp.customerProfileId;
          done();
        });
      });

      it('should give us an error when we forget to enter in a customerProfileId', function(done) {
        expect(function() {
          AuthorizeCIM.createCustomerShippingAddress(function() {})
        }).to.throw(Error, 'You must enter in a customerProfileId.');
        done();
      });

      it('should be able to create a new customer shipping profile', function(done) {
        AuthorizeCIM.createCustomerShippingAddress({
          customerProfileId: this.customerProfileId,
          shippingAddress: new Authorize.ShippingAddress({
            firstName: 'Bob',
            lastName: 'Smith',
            address: '123 Sesame St',
            city: 'Gainesville',
            state: 'FL',
            zip: 32601,
            country: 'us'
          })
        }, function(err, res) {
          expect(err).to.not.exist;
          expect(res).to.exist;
          expect(res.messages).to.exist;
          expect(res.messages.message).to.exist;
          expect(res.messages.resultCode).to.equal('Ok');
          expect(res.messages.message.code).to.equal('I00001');
          expect(res.messages.message.text).to.equal('Successful.');
          expect(res.customerAddressId).to.exist;
          done();
        });
      });
    });
  });

  describe('#update', function() {
    describe('#updateCustomerProfile', function() {
      before(function(done) {
        var self = this
          , date = (new Date())
          , expiration = (date.getFullYear()+1) + '-10'
          , id = (new Date()).getTime() + Math.floor(Math.random() * (100 - 10 + 1)) + 10;

        AuthorizeCIM.createCustomerProfile({customerProfile: {
          description: 'A simple description',
          merchantCustomerId: id,
          email: 'fakeemail' + id + '@fakemeail.com',
          paymentProfiles: new Authorize.PaymentProfiles({
            customerType: 'individual',
            payment: new Authorize.Payment({
              creditCard: new Authorize.CreditCard({
                cardNumber: '4111111111111111',
                expirationDate: expiration
              })
            })
          })
        }}, function(err, res) {
          self.expirationDate = expiration;
          self.customerProfileId = res.customerProfileId;
          self.customerPaymentProfileId = res.customerPaymentProfileIdList.numericString;
          done();
        });
      });

      it('should give me an error when I don\'t provide a profile object', function(done) {
        expect(function() {
          AuthorizeCIM.updateCustomerProfile(function(){});
        }).to.throw(Error, 'You must provide a customer object.');
        done();
      });

      it('should give me an error when I don\'t provide a customerProfileId', function(done) {
        expect(function() {
          AuthorizeCIM.updateCustomerProfile({
            email: 'myemail@email.com'
          }, function(){});
        }).to.throw(Error, 'You must provide a customerProfileId.');
        done();
      });

      it('should allow me to update my profile', function(done) {
        var self = this;
        AuthorizeCIM.updateCustomerProfile(new Authorize.CustomerBasic({
          email: 'newfakeemail@email.com',
          merchantCustomerId: 1234,
          description: 'New description!',
          customerProfileId: this.customerProfileId
        }), function(err, res) {
          expect(err).to.not.exist;
          expect(res).to.exist;
          expect(res.messages).to.exist;
          expect(res.messages.message).to.exist;
          expect(res.messages.resultCode).to.equal('Ok');
          expect(res.messages.message.code).to.equal('I00001');
          expect(res.messages.message.text).to.equal('Successful.');

          AuthorizeCIM.getCustomerProfile(self.customerProfileId, function(err, res) {
            expect(err).to.not.exist;
            expect(res).to.exist;
            expect(res.messages).to.exist;
            expect(res.messages.message).to.exist;
            expect(res.messages.resultCode).to.equal('Ok');
            expect(res.messages.message.code).to.equal('I00001');
            expect(res.messages.message.text).to.equal('Successful.');

            expect(res.profile).to.exist;
            expect(res.profile.merchantCustomerId).to.equal('1234');
            expect(res.profile.description).to.equal('New description!');
            expect(res.profile.email).to.equal('newfakeemail@email.com');
            expect(res.profile.customerProfileId).to.equal(self.customerProfileId);

            done();
          });
        });
      });
    });

    describe('#updateCustomerPaymentProfile', function() {
      before(function(done) {
        var self = this
          , date = (new Date())
          , expiration = (date.getFullYear()+1) + '-10'
          , id = (new Date()).getTime() + Math.floor(Math.random() * (100 - 10 + 1)) + 10;

        AuthorizeCIM.createCustomerProfile({customerProfile: {
          description: 'A simple description',
          merchantCustomerId: id,
          email: 'fakeemail' + id + '@fakemeail.com',
          paymentProfiles: new Authorize.PaymentProfiles({
            customerType: 'individual',
            payment: new Authorize.Payment({
              creditCard: new Authorize.CreditCard({
                cardNumber: '4111111111111111',
                expirationDate: expiration
              })
            })
          })
        }}, function(err, res) {
          self.expirationDate = expiration;
          self.customerProfileId = res.customerProfileId;
          self.customerPaymentProfileId = res.customerPaymentProfileIdList.numericString;
          done();
        });
      });

      it('should give me an error when I don\'t pass customerProfileId or paymentProfile options', function(done) {
        expect(function() {
          AuthorizeCIM.updateCustomerPaymentProfile(function(){});
        }).to.throw(Error, 'You must enter in a customerProfileId and paymentProfile object.');
        done();
      });

      it('should give me an error when I don\'t pass a customerProfileId option', function(done) {
        expect(function() {
          AuthorizeCIM.updateCustomerPaymentProfile({id: 0}, function(){});
        }).to.throw(Error, 'You must provide a customerProfileId.');
        done();
      });

      it('should give me an error when I don\'t pass a paymentProfile option', function(done) {
        expect(function() {
          AuthorizeCIM.updateCustomerPaymentProfile({
            customerProfileId: 123
          }, function(){});
        }).to.throw(Error, 'You must provide a paymentProfile object.');
        done();
      });

      it('should give me an error with a fake paymentProfileId', function(done) {
        AuthorizeCIM.updateCustomerPaymentProfile({
          customerProfileId: this.customerProfileId,
          paymentProfile: new Authorize.PaymentProfile({
            customerPaymentProfileId: 444,
            customerType: 'business',
            payment: new Authorize.Payment({
              creditCard: new Authorize.CreditCard({
                cardNumber: '4007000000027',
                expirationDate: this.expirationDate,
                cardCode: 111
              })
            })
          })
        }, function(err, res) {
          expect(err).to.exist;
          expect(err.code).to.equal('E00040');
          expect(err.text).to.equal('The record cannot be found.');
          expect(res).to.not.exist;
          done();
        });
      });

      it('should allow me to update a paymentProfile', function(done) {
        AuthorizeCIM.updateCustomerPaymentProfile({
          customerProfileId: this.customerProfileId,
          paymentProfile: new Authorize.PaymentProfile({
            customerPaymentProfileId: this.customerPaymentProfileId,
            customerType: 'business',
            payment: new Authorize.Payment({
              creditCard: new Authorize.CreditCard({
                cardNumber: '4007000000027',
                expirationDate: this.expirationDate,
                cardCode: 111
              })
            })
          })
        }, function(err, res) {
          expect(err).to.not.exist;
          expect(res).to.exist;
          expect(res.messages).to.exist;
          expect(res.messages.message).to.exist;
          expect(res.messages.resultCode).to.equal('Ok');
          expect(res.messages.message.code).to.equal('I00001');
          expect(res.messages.message.text).to.equal('Successful.');

          done();
        });
      });
    });

    describe('#updateCustomerShippingAddress', function() {
      before(function(done) {
        var self = this
          , date = (new Date())
          , expiration = (date.getFullYear()+1) + '-10'
          , id = (new Date()).getTime() + Math.floor(Math.random() * (100 - 10 + 1)) + 10;

        AuthorizeCIM.createCustomerProfile({
          description: 'A simple description',
          merchantCustomerId: id,
          email: 'fakeemail' + id + '@fakemeail.com',
          shipToList: new Authorize.ShippingAddress({
            firstName: 'Bob',
            lastName: 'Smith',
            address: '123 Sesame St',
            city: 'Gainesville',
            state: 'FL',
            zip: 32601,
            country: 'us'
          }),
          paymentProfiles: new Authorize.PaymentProfiles({
            customerType: 'individual',
            payment: new Authorize.Payment({
              creditCard: new Authorize.CreditCard({
                cardNumber: '4111111111111111',
                expirationDate: expiration
              })
            })
          })
        }, function(err, res) {
          self.expirationDate = expiration;
          self.customerProfileId = res.customerProfileId;
          self.customerPaymentProfileId = res.customerPaymentProfileIdList.numericString;
          self.customerAddressId = res.customerShippingAddressIdList.numericString;
          done();
        });
      });

      it('should give me an error when I don\'t pass a customerProfileId an address object, and a customerShippingAddressId', function(done) {
        expect(function() {
          AuthorizeCIM.updateCustomerShippingAddress(function(){});
        }).to.throw(Error, 'You must enter in a customerProfileId, an address object, and a customerShippingAddressId.');
        done();
      });

      it('should give me an error when I don\'t pass a customerProfileId option', function(done) {
        expect(function() {
          AuthorizeCIM.updateCustomerShippingAddress({id: 0}, function(){});
        }).to.throw(Error, 'You must provide a customerProfileId.');
        done();
      });

      it('should give me an error when I don\'t pass an address option', function(done) {
        expect(function() {
          AuthorizeCIM.updateCustomerShippingAddress({
            customerProfileId: 123
          }, function(){});
        }).to.throw(Error, 'You must provide an address object.');
        done();
      });

      it('should give us an error with a customerAddressId missing', function(done) {
        AuthorizeCIM.updateCustomerShippingAddress({
          customerProfileId: this.customerProfileId,
          address: new Authorize.ShippingAddress({
            firstName: 'John',
            lastName: 'Smith',
            state: 'TX',
            country: 'US',
            zip: 11111,
            customerAddressId: null
          })
        }, function(err, res) {
          expect(err).to.exist;
          expect(err.code).to.equal('E00014');
          expect(err.text).to.equal('Customer Address ID is required.');
          expect(res).to.not.exist;
          done();
        });
      });

      it('should allow us to update a customer\'s address', function(done) {
        var self = this;
        AuthorizeCIM.updateCustomerShippingAddress({
          customerProfileId: this.customerProfileId,
          address: new Authorize.ShippingAddress({
            firstName: 'John',
            lastName: 'Smith',
            state: 'TX',
            country: 'US',
            zip: 11111,
            customerAddressId: this.customerAddressId
          })
        }, function(err, res) {
          expect(err).to.not.exist;
          expect(res).to.exist;
          expect(res.messages).to.exist;
          expect(res.messages.message).to.exist;
          expect(res.messages.resultCode).to.equal('Ok');
          expect(res.messages.message.code).to.equal('I00001');
          expect(res.messages.message.text).to.equal('Successful.');


          AuthorizeCIM.getCustomerShippingAddress({
            customerProfileId: self.customerProfileId,
            customerAddressId: self.customerAddressId
          }, function(err, res) {
            expect(err).to.not.exist;
            expect(res).to.exist;
            expect(res.messages).to.exist;
            expect(res.messages.message).to.exist;
            expect(res.messages.resultCode).to.equal('Ok');
            expect(res.messages.message.code).to.equal('I00001');
            expect(res.messages.message.text).to.equal('Successful.');

            expect(res.address).to.be.an('object');
            expect(res.address.firstName).to.equal('John');
            expect(res.address.lastName).to.equal('Smith');
            expect(res.address.address).to.not.exist;
            expect(res.address.city).to.not.exist;
            expect(res.address.state).to.equal('TX');
            expect(res.address.zip).to.equal('11111');
            expect(res.address.country).to.equal('US');
            expect(res.address.customerAddressId).to.equal(self.customerAddressId);

            done();
          });
        });
      });
    });
  });

  describe('#get', function() {
    describe('#getCustomerProfile', function() {
      beforeEach(function(done) {
        var self = this
          , date = (new Date())
          , id = (new Date()).getTime() + Math.floor(Math.random() * (100 - 10 + 1)) + 10;

        this.id = id;

        AuthorizeCIM.createCustomerProfile({
          description: 'A simple description',
          merchantCustomerId: id,
          email: 'fakeemail' + id + '@fakemeail.com',
          paymentProfiles: new Authorize.PaymentProfiles({
            customerType: 'individual',
            payment: new Authorize.Payment({
              creditCard: new Authorize.CreditCard({
                cardNumber: '4111111111111111',
                expirationDate: (date.getFullYear()+1) + '-10'
              })
            })
          })
        }, function(err, resp) {
          self.customerProfileId = resp.customerProfileId;
          done();
        });
      });

      it('should give us an error when we don\'t provide a customerProfileId', function(done) {
        expect(function() {
          AuthorizeCIM.getCustomerProfile(function(){});
        }).to.throw(Error, 'You must enter in a customerProfileId.');
        done();
      });

      it('should give us the customer profile', function(done) {
        var self = this;
        AuthorizeCIM.getCustomerProfile(this.customerProfileId, function(err, res) {
          expect(err).to.be.not.exist;
          expect(res).to.exist;
          expect(res.messages).to.exist;
          expect(res.messages.message).to.exist;
          expect(res.messages.resultCode).to.equal('Ok');
          expect(res.messages.message.code).to.equal('I00001');
          expect(res.messages.message.text).to.equal('Successful.');

          expect(res.profile).to.exist;
          expect(res.profile.merchantCustomerId).to.equal(self.id.toString());
          expect(res.profile.email).to.equal('fakeemail' + self.id.toString() + '@fakemeail.com');
          expect(res.profile.customerProfileId).to.equal(self.customerProfileId);
          expect(res.profile.paymentProfiles).to.be.an('object');
          done();
        });
      });
    });

    describe('#getCustomerProfileIds', function() {
      before(function(done) {
        var id = (new Date()).getTime() + Math.floor(Math.random() * (100 - 10 + 1)) + 10;
        AuthorizeCIM.createCustomerProfile({
          description: 'A simple description',
          merchantCustomerId: id,
          email: 'fakeemail' + id + '@fakemeail.com'
        }, function() {
          done();
        });
      });

      it("should be able to retrieve a list of all customer profiles", function(done) {
        AuthorizeCIM.getCustomerProfileIds(function(err, resp) {
          expect(err).to.not.exist;
          expect(resp.messages).to.exist;
          expect(resp.messages.resultCode).to.equal('Ok');
          expect(resp.messages.message).to.exist;
          expect(resp.messages.message.code).to.equal('I00001');
          expect(resp.messages.message.text).to.equal('Successful.');
          expect(resp.ids).to.be.an('object');
          expect(resp.ids.numericString).to.exist;
          done();
        });
      });
    });

    describe('#getCustomerPaymentProfile', function() {
      before(function(done) {
        var self = this
          , date = (new Date())
          , expiration = (date.getFullYear()+1) + '-10'
          , id = (new Date()).getTime() + Math.floor(Math.random() * (100 - 10 + 1)) + 10;

        AuthorizeCIM.createCustomerProfile({
          description: 'A simple description',
          merchantCustomerId: id,
          email: 'fakeemail' + id + '@fakemeail.com',
          paymentProfiles: new Authorize.PaymentProfiles({
            customerType: 'individual',
            payment: new Authorize.Payment({
              creditCard: new Authorize.CreditCard({
                cardNumber: '4111111111111111',
                expirationDate: expiration
              })
            })
          })
        }, function(err, res) {
          self.expirationDate = expiration;
          self.customerProfileId = res.customerProfileId;
          self.customerPaymentProfileId = res.customerPaymentProfileIdList.numericString;
          done();
        });
      });

      it('should give us an error when we forget to enter in profile IDs', function(done) {
        expect(function() {
          AuthorizeCIM.getCustomerPaymentProfile(function(){})
        }).to.throw(Error, 'You must enter in a customerProfileId and customerPaymentProfileId.');
        done();
      });

      it('should give us an error when we forgot to enter in a customerProfileId', function(done) {
        expect(function() {
          AuthorizeCIM.getCustomerPaymentProfile({paymentProfileId: 1}, function() {})
        }).to.throw(Error, 'You must enter in a customerProfileId.');
        done();
      });

      it('should give us an error when we forget to enter in a customerPaymentProfileId', function(done) {
        expect(function() {
          AuthorizeCIM.getCustomerPaymentProfile({customerProfileId: 1, paymentProfileId: 1}, function() {})
        }).to.throw(Error, 'You must enter in a customerPaymentProfileId.');
        done();
      });

      it('should give us payment profiles', function(done) {
        var self = this;
        AuthorizeCIM.getCustomerPaymentProfile({
          customerProfileId: this.customerProfileId,
          customerPaymentProfileId: this.customerPaymentProfileId
        }, function(err, res) {
          expect(err).to.not.exist;
          expect(res).to.exist;
          expect(res.messages).to.exist;
          expect(res.messages.message).to.exist;
          expect(res.messages.resultCode).to.equal('Ok');
          expect(res.messages.message.code).to.equal('I00001');
          expect(res.messages.message.text).to.equal('Successful.');

          expect(res.paymentProfile).to.exist;
          expect(res.paymentProfile.customerType).to.equal('individual');
          expect(res.paymentProfile.customerPaymentProfileId).to.equal(self.customerPaymentProfileId.toString());
          expect(res.paymentProfile.payment).to.be.an('object');
          expect(res.paymentProfile.payment.creditCard).to.be.an('object');
          expect(res.paymentProfile.payment.creditCard.cardNumber).to.equal('XXXX1111');
          expect(res.paymentProfile.payment.creditCard.expirationDate).to.equal('XXXX');

          done();
        });
      });
    });

    describe('#getCustomerShippingAddress', function() {
      before(function(done) {
        var self = this;
        var id = (new Date()).getTime() + Math.floor(Math.random() * (100 - 10 + 1)) + 10;
        AuthorizeCIM.createCustomerProfile({
          description: 'A simple description',
          merchantCustomerId: id,
          email: 'fakeemail' + id + '@fakemeail.com',
          shipToList: new Authorize.ShippingAddress({
            firstName: 'Bob',
            lastName: 'Smith',
            address: '123 Sesame St',
            city: 'Gainesville',
            state: 'FL',
            zip: 32601,
            country: 'us'
          })
        }, function(err, res) {
          self.customerProfileId = res.customerProfileId;
          self.customerAddressId = res.customerShippingAddressIdList.numericString;
          done();
        });
      });

      it('should give us an error when we forget to enter in profile IDs', function(done) {
        expect(function() {
          AuthorizeCIM.getCustomerShippingAddress(function(){})
        }).to.throw(Error, 'You must enter in a customerProfileId and customerAddressId.');
        done();
      });

      it('should give us an error when we forgot to enter in a customerProfileId', function(done) {
        expect(function() {
          AuthorizeCIM.getCustomerShippingAddress({addressId: 1}, function() {})
        }).to.throw(Error, 'You must enter in a customerProfileId.');
        done();
      });

      it('should give us an error when we forget to enter in a customerPaymentProfileId', function(done) {
        expect(function() {
          AuthorizeCIM.getCustomerShippingAddress({customerProfileId: 1, addressId: 1}, function() {})
        }).to.throw(Error, 'You must enter in a customerAddressId.');
        done();
      });

      it('should give us a shipping profile', function(done) {
        var self = this;
        AuthorizeCIM.getCustomerShippingAddress({
          customerProfileId: this.customerProfileId,
          customerAddressId: this.customerAddressId
        }, function(err, res) {
          expect(err).to.not.exist;
          expect(res).to.exist;
          expect(res.messages).to.exist;
          expect(res.messages.message).to.exist;
          expect(res.messages.resultCode).to.equal('Ok');
          expect(res.messages.message.code).to.equal('I00001');
          expect(res.messages.message.text).to.equal('Successful.');

          expect(res.address).to.be.an('object');
          expect(res.address.firstName).to.equal('Bob');
          expect(res.address.lastName).to.equal('Smith');
          expect(res.address.address).to.equal('123 Sesame St');
          expect(res.address.city).to.equal('Gainesville');
          expect(res.address.state).to.equal('FL');
          expect(res.address.zip).to.equal('32601');
          expect(res.address.country).to.equal('us');
          expect(res.address.customerAddressId).to.equal(self.customerAddressId.toString());

          done();
        });
      });
    });
  });

  describe('transactions', function() {
    describe('#validateCustomerPaymentProfile', function() {
      before(function(done) {
        var self = this
          , date = (new Date())
          , expiration = (date.getFullYear()+1) + '-10'
          , id = (new Date()).getTime() + Math.floor(Math.random() * (100 - 10 + 1)) + 10;

        AuthorizeCIM.createCustomerProfile({
          description: 'A simple description',
          merchantCustomerId: id,
          email: 'fakeemail' + id + '@fakemeail.com',
          paymentProfiles: new Authorize.PaymentProfiles({
            customerType: 'individual',
            payment: new Authorize.Payment({
              creditCard: new Authorize.CreditCard({
                cardNumber: '4111111111111111',
                expirationDate: expiration
              })
            })
          })
        }, function(err, res) {
          self.expirationDate = expiration;
          self.customerProfileId = res.customerProfileId;
          self.customerPaymentProfileId = res.customerPaymentProfileIdList.numericString;
          done();
        });
      });

      it('should give us an error for not providing enough information', function(done) {
        expect(function() {
          AuthorizeCIM.validateCustomerPaymentProfile(function(){});
        }).to.throw(Error, 'You must enter in a customerProfileId and a customerPaymentProfileId.');
        done();
      });

      it('should give us an error for not providing a customerProfileId', function(done) {
        expect(function() {
          AuthorizeCIM.validateCustomerPaymentProfile({
            customerId: 123
          }, function(){});
        }).to.throw(Error, 'You must provide a customerProfileId.');
        done();
      });

      it('should give us an error for not providing a customerPaymentProfileId', function(done) {
        expect(function() {
          AuthorizeCIM.validateCustomerPaymentProfile({
            customerProfileId: 123
          }, function(){});
        }).to.throw(Error, 'You must provide a customerPaymentProfileId.');
        done();
      });

      it('should give us an error for not providing a validationMode', function(done) {
        expect(function() {
          AuthorizeCIM.validateCustomerPaymentProfile({
            customerProfileId: 123,
            customerPaymentProfileId: 123
          }, function(){});
        }).to.throw(Error, 'You must provide a validationMode.');
        done();
      });

      it('should be able to validate', function(done) {
        AuthorizeCIM.validateCustomerPaymentProfile({
          customerProfileId: this.customerProfileId,
          customerPaymentProfileId: this.customerPaymentProfileId,
          validationMode: 'testMode'
        }, function(err, res) {
          expect(err).to.be.not.exist;
          expect(res).to.exist;
          expect(res.messages).to.exist;
          expect(res.messages.message).to.exist;
          expect(res.messages.resultCode).to.equal('Ok');
          expect(res.messages.message.code).to.equal('I00001');
          expect(res.messages.message.text).to.equal('Successful.');
          expect(res.directResponse).to.exist;
          done();
        })
      });
    });

    describe('#createCustomerProfileTransaction', function() {
      before(function(done) {
        var self = this
          , date = (new Date())
          , expiration = (date.getFullYear()+1) + '-10'
          , id = (new Date()).getTime() + Math.floor(Math.random() * (100 - 10 + 1)) + 10;

        AuthorizeCIM.createCustomerProfile({
          description: 'A simple description',
          merchantCustomerId: id,
          email: 'fakeemail' + id + '@fakemeail.com',
          paymentProfiles: new Authorize.PaymentProfiles({
            customerType: 'individual',
            payment: new Authorize.Payment({
              creditCard: new Authorize.CreditCard({
                cardNumber: '4111111111111111',
                expirationDate: expiration
              })
            })
          })
        }, function(err, res) {
          self.expirationDate = expiration;
          self.customerProfileId = res.customerProfileId;
          self.customerPaymentProfileId = res.customerPaymentProfileIdList.numericString;
          done();
        });
      });

      it('should return an error when we don\'t have enough arguments', function(done) {
        expect(function() {
          AuthorizeCIM.createCustomerProfileTransaction(function(){});
        }).to.throw(Error, 'You must enter in a transactionType, transaction object, and a callback');
        done();
      });

      it('should return an error when we don\'t provide a correct transactionType', function(done) {
        expect(function() {
          AuthorizeCIM.createCustomerProfileTransaction('fake', {}, function(){});
        }).to.throw(Error, 'Invalid transactionType. Must be: AuthCapture, AuthOnly, CaptureOnly, or PriorAuthCapture');
        done();
      });

      it('should return an error when we don\'t provide a callback function', function(done) {
        expect(function() {
          AuthorizeCIM.createCustomerProfileTransaction('AuthCapture', {}, {});
        }).to.throw(Error, 'You must provide a callback function as the last argument for createCustomerProfileTransaction');
        done();
      });

      it('should authorize and capture a transaction', function(done) {
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
          customerProfileId: this.customerProfileId,
          customerPaymentProfileId: this.customerPaymentProfileId,
          order: {
            invoiceNumber: 1337
          }
        };

        AuthorizeCIM.createCustomerProfileTransaction('AuthCapture', transaction, function(err, res) {
          expect(err).to.be.not.exist;
          expect(res).to.exist;
          expect(res.messages).to.exist;
          expect(res.messages.message).to.exist;
          expect(res.messages.resultCode).to.equal('Ok');
          expect(res.messages.message.code).to.equal('I00001');
          expect(res.messages.message.text).to.equal('Successful.');
          expect(res.directResponse).to.exist;
          done();
        });
      });
    });

    describe('#updateSplitTenderGroup', function() {
      it('should give us an error when we don\'t provide enough information', function(done) {
        expect(function() {
          AuthorizeCIM.updateSplitTenderGroup(function(){});
        }).to.throw(Error, 'You must enter in a splitTenderId and a splitTenderStatus.');
        done();
      });

      it('should give us an error when we don\'t provide a splitTenderId', function(done) {
        expect(function() {
          AuthorizeCIM.updateSplitTenderGroup({
            id: 0
          }, function(){});
        }).to.throw(Error, 'You must provide a splitTenderId.');
        done();
      });

      it('should give us an error when we don\'t provide a splitTenderStatus', function(done) {
        expect(function() {
          AuthorizeCIM.updateSplitTenderGroup({
            splitTenderId: 1
          }, function(){});
        }).to.throw(Error, 'You must provide a splitTenderStatus.');
        done();
      });

      it('should give us an error when we don\'t provide a splitTenderStatus', function(done) {
        expect(function() {
          AuthorizeCIM.updateSplitTenderGroup({
            splitTenderId: 1,
            splitTenderStatus: 'fake'
          }, function(){});
        }).to.throw(Error, 'splitTenderStatus must be either voided or completed.');
        done();
      });

      it('should return an error message saying the SplitTenderID is invalid', function(done) {
        AuthorizeCIM.updateSplitTenderGroup({
          splitTenderId: 1,
          splitTenderStatus: 'voided'
        }, function(err, res) {
          expect(err).to.exist;
          expect(err.code).to.equal('E00027');
          expect(err.text).to.equal('The specified SplitTenderID is invalid.');
          expect(res).to.not.exist;
          done();
        });
      });
    });
  });


  describe('#delete', function() {
    describe('#deleteCustomerPaymentProfile', function() {
      before(function(done) {
        var self = this
          , date = (new Date())
          , id = (new Date()).getTime() + Math.floor(Math.random() * (100 - 10 + 1)) + 10;

        AuthorizeCIM.createCustomerProfile({
          description: 'A simple description',
          merchantCustomerId: id,
          email: 'fakeemail' + id + '@fakemeail.com',
          paymentProfiles: new Authorize.PaymentProfiles({
            customerType: 'individual',
            payment: new Authorize.Payment({
              creditCard: new Authorize.CreditCard({
                cardNumber: '4111111111111111',
                expirationDate: (date.getFullYear()+1) + '-10'
              })
            })
          })
        }, function(err, resp) {
          self.customerProfileId = resp.customerProfileId;
          self.customerPaymentProfileId = resp.customerPaymentProfileIdList.numericString;
          done();
        });
      });

      it('should give us an error when we forget to enter in profile IDs', function(done) {
        expect(function() {
          AuthorizeCIM.deleteCustomerPaymentProfile(function(){})
        }).to.throw(Error, 'You must enter in a customerProfileId and customerPaymentProfileId.');
        done();
      });

      it('should give us an error when we forgot to enter in a customerProfileId', function(done) {
        expect(function() {
          AuthorizeCIM.deleteCustomerPaymentProfile({paymentProfileId: 1}, function() {})
        }).to.throw(Error, 'You must enter in a customerProfileId.');
        done();
      });

      it('should give us an error when we forget to enter in a customerPaymentProfileId', function(done) {
        expect(function() {
          AuthorizeCIM.deleteCustomerPaymentProfile({customerProfileId: 1, paymentProfileId: 1}, function() {})
        }).to.throw(Error, 'You must enter in a customerPaymentProfileId.');
        done();
      });

      it('should be able to delete a payment from a customer profile', function(done) {
        AuthorizeCIM.deleteCustomerPaymentProfile({
          customerProfileId: this.customerProfileId,
          customerPaymentProfileId: this.customerPaymentProfileId
        }, function(err, res) {
          expect(err).to.not.exist;
          expect(res).to.exist;
          expect(res.messages).to.exist;
          expect(res.messages.message).to.exist;
          expect(res.messages.resultCode).to.equal('Ok');
          expect(res.messages.message.code).to.equal('I00001');
          expect(res.messages.message.text).to.equal('Successful.');
          done();
        });
      });
    });

    describe('#deleteCustomerShippingAddress', function() {
      before(function(done) {
        var self = this
          , date = (new Date())
          , id = (new Date()).getTime() + Math.floor(Math.random() * (100 - 10 + 1)) + 10;

        AuthorizeCIM.createCustomerProfile({
          description: 'A simple description',
          merchantCustomerId: id,
          email: 'fakeemail' + id + '@fakemeail.com',
          shipToList: new Authorize.ShippingAddress({
            firstName: 'Bob',
            lastName: 'Smith',
            address: '123 Sesame St',
            city: 'Johnesville',
            state: 'FL',
            zip: 32601,
            country: 'US'
          }),
          paymentProfiles: new Authorize.PaymentProfiles({
            customerType: 'individual',
            payment: new Authorize.Payment({
              creditCard: new Authorize.CreditCard({
                cardNumber: '4111111111111111',
                expirationDate: (date.getFullYear()+1) + '-10'
              })
            })
          })
        }, function(err, resp) {
          self.customerProfileId = resp.customerProfileId;
          self.customerAddressId = resp.customerShippingAddressIdList.numericString;
          done();
        });
      });

      it('should give us an error when we don\'t enter in any credentials', function(done) {
        expect(function() {
          AuthorizeCIM.deleteCustomerShippingAddress(function(){});
        }).to.throw(Error, 'You must enter in a customerProfileId and a customerAddressId.')
        done();
      });

      it('should give us an error when we don\'t enter in a customerProfileId', function(done) {
        expect(function() {
          AuthorizeCIM.deleteCustomerShippingAddress({profileId: 1}, function(){});
        }).to.throw(Error, 'You must enter in a customerProfileId.');
        done();
      });

      it('should give us an error when we don\'t enter in a customerAddressId', function(done) {
        expect(function() {
          AuthorizeCIM.deleteCustomerShippingAddress({customerProfileId: 1, address: 2}, function(){});
        }).to.throw(Error, 'You must enter in a customerAddressId.');
        done();
      });

      it('should allow us to delete a shipping address profile', function(done) {
        AuthorizeCIM.deleteCustomerShippingAddress({
          customerProfileId: this.customerProfileId,
          customerAddressId: this.customerAddressId
        }, function(err, res) {
          expect(err).to.not.exist;
          expect(res).to.exist;
          expect(res.messages).to.exist;
          expect(res.messages.message).to.exist;
          expect(res.messages.resultCode).to.equal('Ok');
          expect(res.messages.message.code).to.equal('I00001');
          expect(res.messages.message.text).to.equal('Successful.');
          done();
        });
      });
    });

    describe('#deleteCustomerProfile', function() {
      it("should give me an error when I don't enter in a customerProfileId", function(done) {
        expect(function() {
          AuthorizeCIM.deleteCustomerProfile(function(){});
        }).to.throw(Error, 'You must enter in a customerProfileId.');
        done();
      });

      it("should give me an error when I don't have any arguments", function(done) {
        expect(function() {
          AuthorizeCIM.deleteCustomerProfile();
        }).to.throw(Error, 'You must enter in a customerProfileId.');
        done();
      });

      it("should be able to clear out all of our customer profiles", function(done) {
        this.timeout(0);
        AuthorizeCIM.getCustomerProfileIds(function(err, resp) {
          var profileIds = Array.isArray(resp.ids.numericString) ? resp.ids.numericString : [resp.ids.numericString]
            , length = profileIds.length
            , completed = 0
            , complete = function() { done(); };

          var iterate = function() {
            AuthorizeCIM.deleteCustomerProfile(profileIds[completed], function(err, resp) {
              if (err) {
                throw new Error(err);
              }

              expect(resp).to.exist;
              expect(resp.messages).to.exist;
              expect(resp.messages.resultCode).to.equal('Ok');

              completed += 1;
              if (completed >= length) {
                complete();
              } else {
                iterate();
              }
            });
          };
          iterate();
        });
      });
    });
  });
});
