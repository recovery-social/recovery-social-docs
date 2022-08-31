---
lip: 11RS
title: LSP11 - Recovery Service
author:
discussions-to: https://discord.gg/E2rJPP4
status: Draft
type: LSP
created: 2021-2-14
requires: ERC725, LSP0, LSP2, LSP6
---

## Simple Summary

This standard describes a **recovery service** contract that can vote as an external service (Recovery Service Guardian) for a msg.sender at an [LSP11SocialRecovery](./lsp11socialrecovery.md) contract.

## Abstract

This standard allows recovery services to provide a service to Universal Profile users to have them as an external guardian.
The Recovery Service provides a method or multiple methods of Authentification for users.
Universal Profile Users can setup the Authentification method with the Recovery Service and add them as a Recovery Service Guardian in their [LSP11SocialRecovery](./lsp11socialrecovery.md).

The Recovery Service contract provides the most flexible and secure process, where the Recovery Service operator, if added as an guardian at the [LSP11SocialRecovery](./lsp11socialrecovery.md), can vote to one address in each recoverProcessId.

The operator itself is able to let the user sign a transaction with a ticket provided by the Recovery Service Operator to vote, therefore the user pays for the gas.

The operator is able to define a price which has to be paid for the recovery process. When choosing a Recovery Service as a Guardian you will always be able to get the price which was set at that time.

The operator is also able to make a vote by himself, but has to cover the gas fees himself.

## Motivation

Only having friends as guardians of the [LSP11SocialRecovery](./lsp11socialrecovery.md) can be limiting.

Users should be able to give trust to external operators to vote for an address if access to a Profile is lost.

The external operators act as a trustworthy Authority that the user trusts.

It is recommended to add different Recovery Services, to ensure decentralisation and risk diversification.

Recovery Services can offer all kinds of Authentication methods, you select which ones you trust.

Running a Recovery Service can be worthwhile.
The LSP11 - Recovery Service Contract allows operators to define a price, which has to be paid if the user wants the operator to vote for an address.
A Recovery Service could also offer a monthly subscription for storing the authentification data. [see here for more Information](./lsp11recoveryservice#recovery-service-business-model)

## Onboarding Recovery Service

First of all you have to find a Recovery Service you trust.
The Setup process on [recovery.social](https://recovery.social) will show you recommended recovery services.

However if you want add one, you need the contract address of the Recovery Service.

Call [`getApiEndpoint`](./lsp11recoveryservice#getapiendpoint) to get the Endpoint of the Recovery Service.

Lets say the endpoint is [totp.recovery.social](https://totp.recovery.social).

To onboard to this recovery service open the URL [totp.recovery.social/onboarding?LSP11ContractAddress=YOUR_LSP11_CONTRACT_ADDRESS](https://totp.recovery.social/onboarding?LSP11ContractAddress=YOUR_LSP11_CONTRACT_ADDRESS)

:::caution Only interact with Recovery Services you trust

If you add a Recovery Service as a Guardian you trust this external operator.

We recommend you only using suggested operators listed on [recovery.social](https://recovery.social)

If you want to get added to the list reach out to recoveryservice@recovery.social

:::

Follow the steps provided by the Recovery Service. They will first try to verify your connected wallet with a signature.
After that you will have to setup your recovery method for this service.

For example if they offer a 2FA with your mobile phone number, you will have to give them your phone address and verify it with a code they send you.

After you are verified the Recovery Service will give you a publicKey.
Call [`addRecoveryServiceGuardian`](./lsp11socialrecovery#addrecoveryserviceguardian) at your LSP11 - Social Recovery Contract with the publicKey and the LSP11 - Recovery Service Contract Address.

This will add the Recovery Service Contract Address as an Guardian and passes the publicKey to the LSP11 - Recovery Service of the recovery service to identify you later.

Recovery Services can charge you a fee if you want them to vote for an address. Before you add the Recovery Service as an Guardian, you can check the price by calling [`getCurrentPricetoRecover`](./lsp11recoveryservice#getcurrentpricetorecover)

![](./assets/onboarding_lsp11.svg)

## Recover access with Recovery Service (let recovery service vote)

First of all you have to get the LSP11 - Recovery Service Contract Address again.

You will find this address by calling [`getRecoveryServiceGuardians`](./lsp11socialrecovery#getrecoveryserviceguardians) at your [LSP11 - Social Recovery Contract](./lsp11socialrecovery.md).

After that get call [`getApiEndpoint`](./lsp11recoveryservice#getapiendpoint) at the LSP11 - Recovery Service Address.

Lets say the endpoint is [totp.recovery.social](https://totp.recovery.social).

To verify to this recovery service open the URL [totp.recovery.social/verify?LSP11ContractAddress=YOUR_LSP11_CONTRACT_ADDRESS?newOwner=YOU_NEW_ADDRESS](https://totp.recovery.social/verify?LSP11ContractAddress=YOUR_LSP11_CONTRACT_ADDRESS?newOwner=YOU_NEW_ADDRESS)

Follow the steps provided by the Recovery Service. Probably they will first verify you based on the information you gave them when you were onboarding yourself.

After you are verified the Recovery Service will give you a Ticket.

This Ticket is generated with your privateKey, which they have stored in their backend.
Call [`voteToRecoverRecoveryService`](./lsp11socialrecovery#voteToRecoverRecoveryService) at your [LSP11 - Social Recovery Contract](./lsp11socialrecovery.md) with the Ticket, the recoverProcessID and the LSP11- Recovery Service Contract Address.

This will call the LSP11 - Recovery Service Contract and verifies your Ticket.

:::caution Transaction by new Account

The Ticket is only valid if you call the contract with your new address (the one you were passing to the recovery service)

:::

The Recovery Service will now vote for your new address.

Recovery Services can charge you a fee.

Maybe now you have to pay a fee which you accepted when setting up the recovery service.

You can always get your price by calling [`getPriceforAddress`](./lsp11recoveryservice#getPriceforAddress).


:::tip Low price guarantee

If the Recovery Service lowers their price to recover (maybe because LYX got more expensive), you will always be able to pay the lowest price (your price or the current price)
:::

![](./assets/recover_lsp11.svg)

## Recovery Service Business Model

A Recovery Service can be completely free of charge, or charge you for using their service.

There are two options how Recovery Services can charge you:

1. Pay when you want to recover:

   The Recovery Service charges you when you want to recover. This works with a payable function in the contract. If you want the LSP11 - Recovery Service to vote you have to send some LYX from your new account.
   The price is defined when adding the Recovery Service. This means if the Recovery Service changes their price to recover some day, you will always be able to get the price you signed up for.


:::success Low Price guarantee

If the Recovery Service lowers their price to recover (maybe because LYX got more expensive), you will always be able to pay the lowest price (your price or the current price)
:::

2. Monthly Subscription Service:
  
  The Recovery Service charges you every Month for storing your authentification Data. If you want the Recovery Service to vote for a recover process the Recovery Service can do log in to their website and verify yourself. They can then call the LSP11 - Recovery Service Contract to vote for the address you want.

## Specification

ERC165 interface id: `0xcb81043c`

To make the setup and deployment process easier, the constructor takes following arguments:

**`constructor(string memory _recoveryServiceName, string memory _apiEndpoint, string memory _recoveryServiceImageUrl) `**

#### \_recoveryServiceName

the name of the recovery service

#### \_apiEndpoint

the apiEndpoint of the recovery service

#### \_recoveryServiceImageUrl

the image url of the recovery service logo

### Methods

#### getApiEndpoint

```solidity
function getApiEndpoint() public view returns (address)
```

Returns the apiEndpoint of the recovery service

#### getRecoveryServiceName

```solidity
function getRecoveryServiceName() public view returns (bool)
```

Returns the name of the recovery service

#### getRecoveryServiceImageUrl

```solidity
function getRecoveryServiceImageUrl() public view returns (bool)
```

Returns the image url of the recovery service logo

#### getBalance

```solidity
function getBalance() public view returns (bool)
```

Returns the balance of the contract

#### getCurrentPricetoRecover

```solidity
function getCurrentPricetoRecover() public view returns (bool)
```

Returns the current price which the user has to pay to get a vote from the contract

#### getPriceforAddress

```solidity
function getPriceforAddress(address _contracAddress) public view returns (bool)
```

Returns the price the user has to pay to make a vote at the LSP11 - Social Recovery Contract

_Parameters:_

- `_contracAddress`: the address to query.

#### addLSP11

```solidity
function addLSP11(address _publicKey) public
```

:::danger only call from [LSP11SocialRecovery](./lsp11socialrecovery.md)

This function should only be called from the [LSP11SocialRecovery](./lsp11socialrecovery.md) Contract.
:::

Adds the [LSP11SocialRecovery](./lsp11socialrecovery.md) Contract Address to the LSP11 - Recovery Service and saves the publicKey.

Saves the price to recover for the [LSP11SocialRecovery](./lsp11socialrecovery.md) Contract Address to ensure that price

_Parameters:_

- `_publicKey`: the publicKey created by the Recovery Service

#### changeLSP11

```solidity
function changeLSP11(address lsp11ContractAddress, address publicKey) public isAuthorizedOwner
```

Changes publicKey for an [LSP11SocialRecovery](./lsp11socialrecovery.md) Contract Address.

This function is for support reasons only.

SHOULD be called only by authorized owners.

_Parameters:_

- `lsp11ContractAddress`: the address of the lsp11 - social recovery
- `publicKey`: the publicKey created by the Recovery Service

#### voteToRecover

```solidity
function voteToRecover(address lsp11Address, bytes32 recoverProcessId, address newOwner) public virtual isAuthorizedOwner
```

LSP11 - Recovery Service Votes to [LSP11SocialRecovery](./lsp11socialrecovery.md) `lsp11Address` with `recoverProcessId` for `newOwner`

SHOULD be called only by authorized owners.

_Parameters:_

- `lsp11Address`: the address of the lsp11 - social recovery
- `recoverProcessId`: the recover Process Id in which the `newOwner` has been voted for.
- `newOwner`: the address for which the Recovery Service votes

#### voteToRecoverWithTicket

```solidity
function voteToRecover(bytes32 recoverProcessId, address newOwner, Ticket memory ticket) public payable
```

:::danger only call from [LSP11SocialRecovery](./lsp11socialrecovery.md)

This function should only be called from the [LSP11SocialRecovery](./lsp11socialrecovery.md) Contract.
:::

Checks if the `msg.sender` is a client of the recovery service.
Checks if payed amount is ether the `currentPricetoRecover` or the price made out when setting up (lowest price guarantee).

`newOwner` is the msg.sender who called the [LSP11SocialRecovery](./lsp11socialrecovery.md).

Checks if ticket is valid and votes calls [LSP11SocialRecovery](./lsp11socialrecovery.md) to vote for `newOwner`

_Parameters:_

- `recoverProcessId`: the recover Process Id in which the `newOwner` has been voted for.
- `newOwner`: the address for which the Recovery Service votes
- `ticket`: generated by the recovery service backend with the privateKey

#### toggleAuthorizedOwner

```solidity
function toggleAuthorizedOwner(address newAddress)
```

Adds or removes authorized owner

_Parameters:_

- `newAddress`: owner to toogle

#### changePricetoRecover

```solidity
function changePricetoRecover(uint _newPrice) public isAuthorizedOwner
```

Changes price to recover.
SHOULD be called only by authorized owners.

_Parameters:_

- `_newPrice`: new price to recover

#### changeApiEndpoint

```solidity
function changeApiEndpoint(string memory _apiEndpoint) public isAuthorizedOwner
```

Change API Endpoint
SHOULD be called only by authorized owners.

_Parameters:_

- `_apiEndpoint`: new API Endpoint Url

#### changeRecoveryServiceName

```solidity
function changeRecoveryServiceName(string memory _recoveryServiceName) public isAuthorizedOwner
```

Change Recovery Service Name
SHOULD be called only by authorized owners.

_Parameters:_

- `_recoveryServiceName`: new Recovery Service Name

#### changeRecoveryServiceImageUrl

```solidity
function changeRecoveryServiceImageUrl(string memory _recoveryServiceImageUrl) public isAuthorizedOwner
```

Change Recover Service Image Url
SHOULD be called only by authorized owners.

_Parameters:_

- `_recoveryServiceImageUrl`: new Image Url

#### withdrawFunds

```solidity
function withdrawFunds(address withdrawalAddress) public isAuthorizedOwner
```

Call to withdraw the funds from sent to the contract
SHOULD be called only by authorized owners.

_Parameters:_

- `withdrawalAddress`: address to withdraw funds to

#### getRecoverProcessesIds

```solidity
function getRecoverProcessesIds() public view returns (bytes32[] memory)
```

Returns all the recover processes ids that the guardians has voted in.

#### getGuardianVote

```solidity
function getGuardianVote(bytes32 recoverProcessId, address guardian) public view returns (address)
```

Returns the address for which the `guardian` (normal Guardian or Recovery Service Guardian) has voted in the provided recoverProcessId.

_Parameters:_

- `recoverProcessId`: the recover process id in which the guardian has voted.

- `guardian`: the address of the guardian who voted.

#### addGuardian

```solidity
function addGuardian(address newGuardian) public
```

Adds a new guardian.

SHOULD be called only by the owner.

_Parameters:_

- `newGuardian`: the address of the guardian to set.

#### addRecoveryServiceGuardian

```solidity
function addRecoveryServiceGuardian(address rsContractAddress, address publicKey) public
```

Adds a new Recovery Service guardian to LSP11 - Social Recovery.

Calls LSP11 - RecoveryService to add LSP11 - Social Recovery Address and `publicKey`

SHOULD be called only by the owner.

_Parameters:_

- `rsContractAddress`: the address of the LSP11 - Recovery Service to set.
- `publicKey`: the publicKey provided by the Recovery Service

#### removeGuardian

```solidity
function removeGuardian(address currentGuardian) public
```

Removes an existing guardian.

SHOULD be called only by the owner.

_Parameters:_

- `currentGuardian`: the address of the guardian to remove.

#### removeRecoveryServiceGuardian

```solidity
function removeRecoveryServiceGuardian(address rsAddress) public
```

Removes an existing Recovery Service guardian.

SHOULD be called only by the owner.

_Parameters:_

- `rsAddress`: the address of the LSP11 - Recovery Service to remove.

#### setThreshold

```solidity
function setThreshold(uint256 newThreshold) public
```

Sets the number of guardian votes required to recover the linked account.

The number should be greater than 0 and less than the guardians count.

SHOULD be called only by the owner.

_Parameters:_

- `newThreshold`: the number of guardian votes required to recover the linked account.

#### setSecret

```solidity
function setSecret(bytes32 newHash) public
```

Sets the hash of the plainSecret needed to recover the account after reaching the recoverThreshold.

:::danger Hash twice

Before passing the new secret hash it twice
:::

SHOULD be called only by the owner.

_Parameters:_

- `newHash`: the hash of the plainSecret.

#### voteToRecover

```solidity
function voteToRecover(bytes32 recoverProcessId, address addressToRecover) public
```

Votes to a `addressToRecover` address in a specific recoverProcessId.

Once the `addressToRecover` reach the recoverThreshold it will be able to call `recoverOwnership(..)` function and recover the linked account.

SHOULD be called only by the guardians.

_Parameters:_

- `recoverProcessId`: the recover Process Id in which the `addressToRecover` has been voted for.

- `addressToRecover`: the address to vote for in order to recover the linked account.

#### recoverOwnership

```solidity
function recoverOwnership(bytes32 recoverProcessId, bytes32 memory singleHashtSecret, bytes32 newHash) public
```

Recover the linked account by setting in All Permissions (combined) for the msg.sender after it reached the recoverThreshold and given the right plainSecret that produce the `secretHash`.

_Parameters:_

- `recoverProcessId`: the recover process id in which the `msg.sender` should have reached the threshold.

- `singleHashtSecret`: the onetime hasht secret that should produce the double hasht`secretHash` with _keccak256_ function.

- `newHash`: the new secret hash to set (double hasth with _keccak256_ function).

### Setup

In order to allow the social recovery contract to recover the linked account and add new permissions, this contract should have `ADDPERMISSIONS` and `CHANGEPERMISSIONS` set inside the **linked account** under this ERC725Y Data Key.

```json
{
  "name": "AddressPermissions:Permissions:<address>",
  "key": "0x4b80742de2bf82acb3630000<address>",
  "keyType": "MappingWithGrouping",
  "valueType": "bytes32",
  "valueContent": "BitArray"
}
```

To be able to find the LSP11 - Social Recovery Contract add this schema with the address to ERC725Y Data Key of the Universal Profile.

```json
{
  "name": "LSP11SocialRecoveryTool",
  "key": "0x2eb498106de898d930b65f90e84d71a86f38fc841717868008dae09b648c365d",
  "keyType": "Singleton",
  "valueType": "address",
  "valueContent": "Address"
}
```

## Rationale

This standard was inspired by the current recovery process in some crypto wallets but this recovery process is a balance between a secret hash and guardians as friends and Recovery Services.

In this case, you can ensure that you're guardians can't act maliciously and would need a secret word to recover. The same goes for the secret word if it's exposed, only addresses who reached the guardiansThreshold can recover using it.

With the ability to add Recovery Services, you are able to get votes and recover by yourself, if you don't have enough friends you want to tell about your Web3 identity.
All the Recovery Services need to use the LSP11 - Recovery Service Standard to make a vote.

A recoverProcessId is also created to ensure flexibility when recovering, so if guardians didn't reach consensus in a recoverProcessId, they can switch to another one.

## Implementation

https://github.com/recovery-social/recovery-social
https://github.com/recovery-social/recovery-service-passkey
https://github.com/recovery-social/recovery-service-totp
An implementation can be found in the [lukso-network/lsp-smart-contracts](https://github.com/lukso-network/lsp-smart-contracts/pull/114) repo.

## Copyright

Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).
