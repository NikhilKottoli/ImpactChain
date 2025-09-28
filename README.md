
the idea is that in this case what should happen is that
this is a web3 app which is going to have a dao and also some attestation proof and some dataset which will be stored on ipfs (pribably lighthouse akave or something else in this case here)
the app is for a social cause in this case wihch is going to be like users will post good campaigns and good work they did which is like 
- i fed dogs today
- i cleaned some river today etc
the next features is going to be that

A user will be able to create a compagin which is as simple as like i ama goign to clean some river and the people will ben like volunteers for the same in this case
so what should happen here in this case is that 
later there is a boolean value here which connects the paid bounty or not 
then people can rsvp here for the same with staking and rsvp 

later on once the bounty is decided then the main part is that person paying the bounty decides which are some wallet address which will work as dao and vote in the case for verifying if the pesron actually visited or not and then attestation needs to be stored properly

along with that the events cqaptures like i want to fill a pothole
i want to clean up a river
this whole can be put on filecoing or some ipfs layer

the first feature is going to be tha tin this case
- the user can create a social media post which is going to have basic features like the post, description 
then on this basis an nft will be vcreated and stored on chain, there is going to be some metadata also going to be stored with this in this case for the same
user and the user wallet and also goign to be the tweet the tweet photo
in this feature the people can like it or something and along with that what should happen is that in this case 
an extenral person can also come and cheer which is like paying the person in that particular tweet some amount just to show that they apprecitae

the second features the most important one 
- the person paying for the bounty decides some wallet addresses which are going to be acting as wallet address for voting if the pesron actually came or not with their private signatures (the idea is that so that the organization is not scammed for the same) then those people will be verified later on for the same 
- so the thing for this table is going to be campaig id and side by side all the people who have rsvped and then the dao will vote for the privately attested using their keys
- then once verified they will eligibly for that bounty 
- this can be done with foreign key logic simply for the same
- this attestation geneated with the private can be used as a proof of work to be stored on the ipfs layer for the same

the third features
- some of the campgaisn may contain some data like dirty rivers or dity potholes which can be classied according to the fatures and can be put as datasets later on
- this can be monitised for the govt for the same in this case

so the idea is help me fromalize this logic in depth
help me with the db tables and relationships
some depth functions for all 

the main contracts are for nft generation, dao and the attestation service is also important
we plan to have a paymaster setup for returning the stake amount properly 
help me draft this in depth


### 1. Social Media Posts Flow
- User creates post → NFT minted → Metadata stored on IPFS
- Other users can like or cheer (pay) posts


### 2. Campaign & Bounty Flow
- Creator creates campaign (with/without bounty)
- If bounty exists, funder assigns DAO voters
- Users RSVP with stake amount
- After event, DAO votes on attendance
- Verified attendees get bounty, stakes returned
- Unverified lose stake (goes to verified participants)

### 3. Attestation Flow
- DAO voters sign attendance verification
- Signatures create attestation proof
- Attestation stored on IPFS and referenced on-chain
- Used for reputation and future campaign eligibility

### 4. Dataset Monetization
- Campaign data (photos, measurements, locations) aggregated
- Cleaned and categorized into datasets
- Government/organizations purchase access
- Revenue shared with data contributors
