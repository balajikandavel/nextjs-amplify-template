# Next.js Amplify App

This is a Next.js application with AWS Amplify integration for authentication and hosting.

## Technologies used
- React with Next.js 14 App Router
- TailwindCSS
- AWS Amplify for authentication and hosting
- AWS Cognito for user management

## Local Development
Use below command when running yarn:
```bash
nvm install 18.19.0 && nvm use 18.19.0 && yarn install
```

Then run the development server:
```bash
yarn dev
```

## Deployment to AWS Amplify

### Prerequisites

1. Configure GitHub App in AWS Console:
   - Go to AWS Amplify Console
   - Click on "Settings" > "GitHub Apps Configuration"
   - Click "Install GitHub App" and follow the prompts
   - Grant access to your repository

### Deployment Steps

1. Deploy the CDK stack:
   ```bash
   yarn cdk deploy
   ```

2. The deployment will create:
   - An Amplify app connected to your GitHub repository
   - A main branch configured for automatic deployments
   - Build and deployment configurations

3. Monitor the deployment:
   - Go to AWS Amplify Console (link provided in CDK output)
   - Check the build logs for any issues
   - Once complete, your app will be available at the provided URL

### Environment Variables

The following environment variables are required:

- `NEXT_PUBLIC_USER_POOL_ID`: Cognito User Pool ID
- `NEXT_PUBLIC_USER_POOL_CLIENT_ID`: Cognito User Pool Client ID

You can set these in the AWS Amplify Console under App settings > Environment variables.

