---
lip: 11
title: LSP11 - Social Recovery
author: 
discussions-to: https://discord.gg/E2rJPP4
status: Draft
type: LSP
created: 2021-2-14
requires: ERC725, LSP0, LSP2, LSP6
---






## Simple Summary
This standard describes a **basic social recovery** contract that can recover access to [ERC725](https://github.com/ERC725Alliance/ERC725/blob/develop/docs/ERC-725.md) contracts through the [LSP6-KeyManager](https://docs.lukso.tech/standards/universal-profile/lsp6-key-manager). This standard was suggested by the LUKSO Team and slightly changed.

## Abstract
This standard allows recovering access to ERC725 contracts such as tokens, NFTs, and Universal Profiles by adding a new address to control them through the Key Manager after a recovery process.

The social recovery contract provides the most flexible and secure process, where the guardians, set originally by the owner, can vote to one address in each recoverProcessId. The address willing to recover can choose a recoverProcessId where he reached the guardiansThreshold and after successfully providing the right secret word, that produces the hash already set by the owner, he will be granted the owner permissions in the account recovered and a new hash will be set and all previous recoverProcessId will be invalidated.

## Motivation
Any Key could be lost or leaked due to a certain accident, so it's not advised to rely on one singular key to control ERC725 contracts through the Key Manager and a social recovery contract is needed in this case.

In the case above, the user can simply reach out to his guardians and ask them to vote for a certain address. 
There are many possible choices for whom to select as a guardian. The three most common choices are:

- Other devices (or paper mnemonics) owned by the wallet holder themselves
- Friends and family members (EOAs or Universal Profiles)
- Recovery Services (Services provided by companies, who vote for the new owner if verifed through their service. Can for example be social logins, TOTP Authentification, Video Calls, biometric authentification...)

## Specification

ERC165 interface id: `0xcb81043b`

To make the setup and deployment process easier, the constructor takes following arguments:

**`constructor(address _account, bytes32 secret, uint256 threshold , address[] memory guardians)`**

#### _address
the address of linked account to recover. (Your UP-Address)

#### secret
Sets the hash of the plainSecret needed to recover the account after reaching the recoverThreshold.

:::danger Hash twice

Before passing the new secret hash it twice. 

Thats a proposal we make to the LSP11. 
If you setup a secret as a user, you probably use a day to day password and not a really heavy one like your private key.
If you want to recover your profile with another account you have to enter the secret. And this secret was plain. So everyone would be able to see the secret.

You will have to define a new one, so your LSP11 is not in danger, but maybe you used that password somewhere else.

Thats why we hash the password twice when setting it up, and hasing once when recovering.

:::

#### threshold
Sets the number of guardian votes required to recover the linked account.

The number must be greater than 0 and less than the guardians count.

#### guardians
List of new guardians.


Every contract that supports the LSP11SocialRecovery SHOULD implement:


### Methods

#### account

```solidity
function account() public view returns (address)
```

Returns the address of the linked account to recover.


#### isGuardian

```solidity
function isGuardian(address _address) public view returns (bool)
```

Returns _true_ if the provided address is a guardian, _false_ otherwise.

_Parameters:_

- `_address`: the address to query.

#### isRecoveryServiceGuardian

```solidity
function isRecoveryServiceGuardian(address _address) public view returns (bool)
```

Returns _true_ if the provided address is a Recovery Service guardian, _false_ otherwise.

_Parameters:_

- `_address`: the address to query.


#### getGuardians

```solidity
function getGuardians() public view returns (address[] memory)
```

Returns the array of guardian addresses set.


#### getRecoveryServiceGuardians

```solidity
function getRecoveryServiceGuardians() public view returns (address[] memory)
```

Returns the array of Recovery Service guardian addresses set.



#### getGuardiansThreshold

```solidity
function getGuardiansThreshold() public view returns (uint256)
```

Returns the minimum number of guardian votes needed for an address to recover the linked account.


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

Thats a proposal we make to the LSP11. 
If you setup a secret as a user, you probably use a day to day password and not a really heavy one like your private key.
If you want to recover your profile with another account you have to enter the secret. And this secret was plain. So everyone would be able to see the secret.

You will have to define a new one, so your LSP11 is not in danger, but maybe you used that password somewhere else.

Thats why we hash the password twice when setting it up, and hasing once when recovering.
:::

SHOULD be called only by the owner.
<!-- todo @nico should oder can? -->

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


#### voteToRecoverRecoveryService

```solidity
function voteToRecoverRecoveryService(address rsContractAddress, bytes32 recoverProcessId, TicketLib.Ticket memory ticket) public payable
```



:::danger only call from UP or EOA you want to vote for

This function passes the sender address to the LSP11 - Recovery Service to vote for the sender address.
:::


Checks if `rsContractAddress` is a guardian.

The address you vote for is the `msg.sender`
Calls LSP11 - Recovery Service with `recoverProcessId`, `_newOwner_` and `ticket`


_Parameters:_

- `rsContractAddress`: contract address of the LSP11 Recovery Service
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
<!-- todo @nico was ist hasht? heisst das nicht hashed? -->
- `newHash`: the new secret hash to set (double hasth with _keccak256_ function).


### Setup

Two steps are needed to setup the LSP11 

![](./assets/deploy_lsp11.svg)

1. Deploy the contract
2. Pass following informations to the ERC725Y 

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
    "name": "LSP11SocialRecoveryAddress",
    "key": "0xd5dde05f38c08c2b04d7a7b92d0b3705a31ccb653c44c061e41f5169c6ddba03",
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

BLABLABL
An implementation can be found in the [lukso-network/lsp-smart-contracts](https://github.com/lukso-network/lsp-smart-contracts/pull/114) repo.



## Copyright
Copyright and related rights waived via [CC0](https://creativecommons.org/publicdomain/zero/1.0/).