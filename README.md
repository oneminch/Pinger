# Pinger (Workers)

Pinger is a small Node backend (I built for fun) whose purpose is to make scheduled requests to a certain database provider to keep it alive.

> This branch contains project code for deployment using Cloudflare Workers using a `scheduled` handler. It requires the environment variables listed in [.env](/.env.example).
>
> A different version of the app that can be deployed to AWS is on the [`aws`](https://github.com/oneminch/Pinger/tree/aws) branch.

## Run Locally

```
npx wrangler dev --test-scheduled

curl "http://localhost:8787/__scheduled?cron=*+*+*+*+*"
```

## Deploy

```
npx wrangler deploy
```
