# The Back-end App

## System Requirements

- [Node.js 16+](https://nodejs.org/en/)
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- [Python 3](https://www.python.org/)
- awscli-local, run `pip install awscli-local` to install
- [Docker](https://docs.docker.com/get-docker/)

## Local Development

```
docker compose up
awslocal s3api create-bucket --bucket test
npm install
npm start
```

## AWS Deployment

Your fornt-end is deployed at https://your-domain.com and your back-end is deployed at https://api.your-domain.com

First, let's clone the repo and install dependencies:

```
git clone https://github.com/guoyunhe/aws-metro-api.git
cd aws-metro-api
npm install
```

Then lets generate SSL certificates

```
sudo certbot certonly -d api.your-domain.com
```

Create .env files for environment variables

```
cp .env.example .env
vi .env
```

Change the .env file as following

```ini
PORT=443
SSL_CERT=/etc/letsencrypt/live/api.your-domain.com/fullchain.pem
SSL_KEY=/etc/letsencrypt/live/api.your-domain.com/privkey.pem
CORS_ORIGIN=https://your-domain.com
MONGO_URL=mongodb://user:pass@cluster-name.cluster-id.us-east-1.docdb.amazonaws.com:27017/metro?replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=test
S3_SECRET_ACCESS_KEY=test
S3_BUCKET=test
```

```
sudo npm i -g pm2
sudo pm2 startup
sudo pm2 start bin/app
sudo pm2 save
sudo systemctl restart pm2-root
```
