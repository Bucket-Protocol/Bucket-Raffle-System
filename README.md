# Bucket Raffle System

Website: https://raffle.bucketprotocol.io

Demo Video: https://youtu.be/mcoCglvjsXI

![image](https://github.com/Bucket-Protocol/Bucket-Raffle-System/assets/43432631/32209d94-4908-4362-bb3f-942a44218e3e)

![image](https://github.com/Bucket-Protocol/Bucket-Raffle-System/assets/43432631/67e40ccb-fa6e-4d03-8b7e-578c408578f7)

## What it does
Users can conduct raffles directly on Sui using the Bucket Raffle System. The prize distribution will be done on the Sui Network when the random result is settled. The Bucket Raffle System allows you to raffle anything from Coin to NFT. Moreover, we are developing a joinable raffle that enables other users to participate raffle by paying the ticket fee specified by the host.



### Coin Raffle:
The host can raffle any amount of coin, such as Sui and USDC, with a given set of addresses. The host can enter a list of addresses and specify the winner amount and the prize value. Then, the prize will distribute equally to the lucky winners. For example, Alice collects 200 addresses from a marketing event and wants to send 1000 USDC to 5 lucky winners.


### NFT Raffle:
The host can raffle any NFT(s) with a given set of addresses. The host can enter a list of addresses and pick the target NFT(s). Then, the NFT(s) will randomly distribute to the lucky winner(s). For example, Bob collects 256 participant addresses from a Move Hackathon and wants to send 10 Special Edition Sui Frens to 10 lucky addresses.





## The problem it solves
We are Bucket Protocol, the biggest CDP on the Sui Network. We organized many giveaway events. For example, to celebrate our Mainnet launch at the end of June, we gave away 300 Sui to 5 lucky users from 375 participants who minted our Testnet NFT.



Nevertheless, we found that the existing raffle system in Web2 is not truly random and hard to verify. For example, a malicious host can repeat the raffle until the candidate he wishes appears in the winner list, then use that very result as the final result of the raffle. Who knows?



Sui Network uses Drand (Distributed Randomness Beacon) for generating random numbers. Therefore, we hope to be able to conduct the raffle on Sui Network using this random number from Dran and directly transfer the prize to the winners' addresses.

