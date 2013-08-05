# TODO

1. Create an easy-to-use wrapper around the library
2. Finish: getHostedProfilePageRequest—sends a request for access to the hosted CIM page.  The response includes a token that enables customers to update their information  directly on the Authorize.Net website.

## Notes

### For Refund Transactions
If you are submitting a refund against a previous CIM transaction, the following guidelines  apply:

* include customerProfileId, customerPaymentProfileId, and transId.
* customerShippingAddressId is optional.
* creditCardNumberMasked, bankRoutingNumberMasked, and  bankAccountNumberMasked do not need to be included, but they will be validated if  they are included.

If you are submitting a refund for a non-CIM transaction, the following guidelines apply:

* you must include transId, creditCardNumberMasked (or bankRoutingNumberMasked and bankAccountNumberMasked).
* do not include customerProfileId, customerPaymentProfileId, or customerShippingAddressId.

You can also issue an unlinked refund for a CIM transaction. In this case, the following  rules apply:

* you must be enrolled in Expanded Credit Capabilities (ECC). For more information about ECC, go to http://www.authorize.net/files/ecc.pdf.
* you must include customerProfileId and customerPaymentProfileId.
* customerShippingAddressId is optional.
* do not include transId, creditCardNumberMasked, bankRoutingNumberMasked, or bankAccountNumberMasked.
