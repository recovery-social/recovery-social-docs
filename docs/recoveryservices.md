---
lip: RS
title: How do Recovery Services Work?
author:
discussions-to: https://discord.gg/E2rJPP4
status: Draft
type: LSP
created: 2021-2-14
requires: ERC725, LSP0, LSP2, LSP6
---

## Simple Summary

This describes how a **recovery service** works and how to set it up.

## Motivation

Running a Recovery Service can be worthwhile.

The LSP11 - Recovery Service Contract allows operators to define a price, which has to be paid if the user wants the operator to vote for an address.

A Recovery Service could also offer a monthly subscription for storing the authentification data.

See also [Recovery Service Business Model](./standards/lsp11recoveryservice#recovery-service-business-model)

## Setting up a Recovery Service

First of all you need to setup your website and your backend.
An Example is provided here: https://github.com/recovoery-social/recovery-service-totp

Then have to deploy your own [LSP11 - Recovery Service Contract](./recoveryservices.md) and add the Name, the API Endpoint and the Logo of your Service.

Set a pricing by calling [`changePricetoRecover`](./standards/lsp11recoveryservice#changepricetorecover)

## Onboarding Flow

All those steps explain how a recovery service works, you don't have to code them yourself, we provide examples for that.
https://github.com/recovery-social/recovery-service-totp
https://github.com/recovery-social/recovery-service-passkey

The recovery onboarding gets started by the recovery.social UI. The UI will open a window and open the Endpoint at this address

```
https://API_ENDPOINT/onboarding?LSP11ContractAddress={LSP11 - Social Recovery Contract Address}
```

In our Example:

```
https://totp.recovery.social/onboarding?LSP11ContractAddress={LSP11 - Social Recovery Contract Address}
```

Now the recovery service knows which LSP11 address it is.

After page load the Recovery Service should authenticate the user with a signature the EOA should do.

Verify the signature by calling `isValidSignature` on the Universal Profile which is the owner of the LSP11 address.
(If the signature is valid on this UP, we know that the EOA is allowed to interact with LSP11, therefore the EOA is validated and we can continue)

Now the recovery service should start his own verification method.
In our example of the TOTP. The Recovery Service generates and stores a private key for QR Code generation and verification and shows it to the user.

The user then gets prompted to verify his/her authentication method (in our Example the QR-Code)

:::tip Hint

It should be possible to make the verification again with the same LSP11 Address.
This is necessary if the process gets interrupted or will be executed on another devices.
:::

After a successful verification (the recovery service made sure he and the user now has all relevant information) the Recovery Service generates and stores a new private and public keypair in the backend.

An Example for the keypair generation you can see here:

```
const { privateToAddress } = require("ethereumjs-utils");
const { ethers } = require("ethers");
const crypto = require("crypto");
const pvtKey = crypto.randomBytes(32);
const pvtKeyString = pvtKey.toString("hex");
const signerAddress = ethers.utils.getAddress(
privateToAddress(pvtKey).toString("hex"));
console.log({ signerAddress, pvtKeyString });
```

:::danger

The pvtKeyString should never leave your backend and should be stored safe!

This key can later generate a ticket which lets the user vote for himself.
:::

Next return the public key to the recovery.social UI.

```
window.opener.postMessage({
    lsp11RecoveryService: {
        success: true,
        pubKeyString: 'xxxxx'
    }, "*" );
```

After posting the Message the Recovery Service window will be closed automatically. The validation of the public key will now happen in recovery.social UI.

![](./assets/recovery_service_process_onboarding.svg)

#### The following part is handled by the recovery.social UI

The user now has to add the recovery service as a guardian.
To do that the user has to call [`addRecoveryServiceGuardian`](./standards/lsp11socialrecovery/#addrecoveryserviceguardian) at his [LSP11 - Social Recovery Contract](./standards/lsp11socialrecovery.md) with the Recovery Service Contract Address and the public Key.

```
function addRecoveryServiceGuardian(address rsContractAddress, address publicKey) public virtual onlyOwner {
    require(!_guardiansRecoveryService.contains(rsContractAddress), "Provided address is already a Recovery Service guardian");

    LSP11RecoveryService lsp11RS = LSP11RecoveryService(rsContractAddress);
    lsp11RS.addLSP11(publicKey);
    _guardiansRecoveryService.add(rsContractAddress);
}
```

With this call the user will add the recovery service contract address as a guardian of his own [LSP11 - Social Recovery Contract](./standards/lsp11socialrecovery.md).

In the same call the [LSP11 - Social Recovery Contract](./standards/lsp11socialrecovery.md) will automatically call the [LSP11 - Recovery Service Contract](./standards/lsp11recoveryservice.md) and this contract will link the users [LSP11 - Social Recovery Address](./standards/lsp11socialrecovery.md) with the publicKey (and will save the current price to recover, to always make sure that the user will get the current price)

```
function addLSP11(address _publicKey) public {
    require(LSP11AddressPublicKey[msg.sender] == address(0x0), "Provided LSP11 address is already added");
    priceRecoverforAddress[msg.sender] = currentPricetoRecover;
    LSP11AddressPublicKey[msg.sender] = _publicKey;
}
```

## Recover Account Flow

For recovery of an Account the recovery.social UI redirects to this endpoint:

```
https://API_ENDPOINT/recover?LSP11ContractAddress={LSP11 - Social Recovery Contract Address of UP you want to recover}&newOwner={new owner}
```

In our Example

```
https://totp.recovery.social/recover?LSP11ContractAddress={LSP11 - Social Recovery Contract Address of UP you want to recover}&newOwner={new owner}
```

:::note

The Recovery Service should now show the user the newOwner Address (if UP with Name and profile image) that he can verify that the recovery service got the right address.

(We will implement this at or recovery service examples soon)
:::

Now the Recovery Service has to display the authentication method for the provided LSP11ContractAddress. In our example of the TOTP-Service the user gets asked for the OTP out of their app.

The Recovery Services now verifies the validity of the Authentication Method.
If everything is correct the Recovery Service will encrypt the new Owner Address with the stored private key to get a "ticket".

:::danger

The pvtKeyString should never leave your backend. Only generate this ticket in your backend.

:::

The code below demonstrates the generation of the ticket.

```
const hashBuffer = generateHashBuffer(
      ["address"],
      [newOwner]
    );

const ticket = createTicket(hashBuffer, signerPvtKey);

function generateHashBuffer(typesArray, pvtKeyString) {
    return keccak256(
        toBuffer(ethers.utils.defaultAbiCoder.encode(typesArray,
        valueArray))
    );
}

function createTicket(hash, signerPvtKey) {
    return ecsign(hash, signerPvtKey);
}

```

The ticket gets returned to the recovery.social UI via postMessage.
To access this you can call it via window.opener, because the UI opened the endpoint before.

```
window.opener.postMessage({
    lsp11RecoveryService: {
        success: true,
         data:{
            ticket: 'xxxx'
            }
        }
    }, "*" );
```


After posting the Message the Recovery Service window will be closed automatically.
The validation of the Ticket will now happen in recovery.social UI.

![](./assets/recovery_service_process_verify.svg)

#### The following part is handled by the recovery.social UI

The user now has to call [`voteToRecoverRecoveryService`](./standards/lsp11socialrecovery/#votetorecoverrecoveryservice) with the recovery service contract address, the recoveryprocessID and the ticket the recovery service generated.

```
function voteToRecoverRecoveryService(
    address rsContractAddress,
    bytes32 recoverProcessId,
    TicketLib.Ticket memory ticket
) public payable{
        require( _guardiansRecoveryService.contains(rsContractAddress), "rsContractAddress is not a Reconver Service Guardian");
        address _newOwner = msg.sender;

        LSP11RecoveryService lsp11RS = LSP11RecoveryService(rsContractAddress);
        lsp11RS.voteToRecoverWithTicket{value: msg.value}(recoverProcessId, _newOwner, ticket);
}
```

The function will check if the rsContractAddress is a guardian.

:::note

The user who calls this function has to be the address passed to the recovery service api earlier ('newOwner')

And if the recovery service has a price to recover, the amount of LXYt have to be added to the transaction.

:::

Now the contract will call the [LSP11 - Social Recovery Contracts](./standards/lsp11socialrecovery.md) function [`voteToRecoverWithTicket`](./standards/lsp11recoveryservice/#votetorecoverwithticket).

```
function voteToRecoverWithTicket(
    bytes32 recoverProcessId,
    address newOwner,
    TicketLib.Ticket memory ticket
) public payable {
    require(LSP11AddressPublicKey[msg.sender] != address(0x0), "Has to be called from LSP11 Contract");
    require((priceRecoverforAddress[msg.sender] == msg.value || currentPricetoRecover == msg.value), "Payment is not enough");

    bytes32 digest = keccak256(abi.encode(newOwner));

    require(
        _isVerifiedTicket(digest, ticket, LSP11AddressPublicKey[msg.sender]),
        "Invalid ticket"
    );

    LSP11BasicSocialRecovery LSP11 = LSP11BasicSocialRecovery(msg.sender);
    LSP11.voteToRecover(recoverProcessId, newOwner);
    }
```

The function will check first if there is a publicKey available for the [LSP11 - Recovery Service Contract](./standards/lsp11recoveryservice) which calls this function.

It will than check if the paid amount was enough.

After that the function checks if the ticket is valid.

```
function _isVerifiedTicket(
    bytes32 digest,
    TicketLib.Ticket memory ticket,
    address publicKey
) internal pure returns (bool) {
    address signer = ecrecover(digest, ticket.v, ticket.r, ticket.s);
    require(signer != address(0), "ECDSA: invalid signature");
    return signer == publicKey;
}
```

if the newOwner (the msg.sender from the previous function) and the privateKey which created the ticket are correct, the decoded ticket will be the publicKey.

Because the publicKey is stored in the contract we can now verify if the ticket is valid.

If the ticket is valid, the [`voteToRecoverWithTicket`](./standards/lsp11recoveryservice/#votetorecoverwithticket) function will call the `voteToRecover` function at our [LSP11 - Social Recovery Contracts](./standards/lsp11socialrecovery.md). Because the contract address is a guardian, the contract can vote for our newOwner.

## Copyright

Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
