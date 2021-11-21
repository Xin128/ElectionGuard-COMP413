# How To Run this Demo

### Requirements

1. Surge
2. Ngrok 

### Steps

First, let us set up the back end that receive user's POST requests.

Backend first need to be started as a server locally.

```shell
 #In ElectionGuard-COMP413/demo/backend, just run...
 $ yarn install
 $ yarn start
```

After the server is working locally, showing `Listening on 3000` .

We use ngrok. It " exposes local servers behind NATs and firewalls to the public internet over secure tunnels." It makes our local server accessible by the surge hosted front end!

```shell
#Download appropriate ngrok program on your machine
#Connect to your account and 
#Fire it up
$ ./ngrok http 3000
```

Then, copied the output's https address: for example `Frowarding https://d8f9-128-42-114-225.ngrok.io -> http://localhost:3000`. We will need that to be set in front end. 

Next, let us set up the front end:

In the `ElectionGuard-COMP413/src/index.ts` change the `submitCiphertextBallot` function's first argument to the ngrok https address copied above. In this example, it is `"https://d8f9-128-42-114-225.ngrok.io" + "/receive/" +voterId `.

At the `ElectionGuard-COMP413`directory, run

```shell
$ yarn install
$ yarn esbuild-browser:dev
```

We have seted up the https address of server properly. Now, we will use [surge](https://surge.sh/) to host our frontend. 

```shell
$ npm install --global surge
# In ElectionGuard-COMP413/demo/frontend, just run…
$ surge
```

The CNAME file contains the domain name for surge to host the index.html page. By default, it is [comp413vote.surge.sh](comp413vote.surge.sh).

Now, users can submit their ballot through [comp413vote.surge.sh](comp413vote.surge.sh) and the result ciphertext ballots will be received by our local server and stored under `ElectionGuard-COMP413/public` folder. 