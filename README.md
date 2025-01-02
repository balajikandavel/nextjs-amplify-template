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
nvm install 18.19.0 && nvm use 18.19.0 && export ARTIFACTORY_EMAIL=Balaji.Kandavel@coxautoinc.com && export ARTIFACTORY_TOKEN=YmFsYWppLmthbmRhdmVsQGNveGF1dG9pbmMuY29tOkFLQ3A4azhpTTdKY2ZDR2J2bXNmdGZuU3p4TWQ0RUQ2QlNMcVhreFp3RlhadW9QZnRBUjU1d1hpeHhRUldYeDhqRWpnenJGWGs= && yarn install
```

Then run the development server:
```bash
yarn dev
```

## Deployment to AWS Amplify

1. Go to AWS Amplify Console (https://console.aws.amazon.com/amplify)

2. Click "New App" > "Host Web App"

3. Choose your Git provider:
   - Connect your repository
   - Select the branch you want to deploy

4. Configure build settings:
   - The `amplify.yml` file in your repository will be automatically detected
   - Add the following environment variables:
     ```
     NEXT_PUBLIC_USER_POOL_ID=<Your Cognito User Pool ID>
     NEXT_PUBLIC_USER_POOL_CLIENT_ID=<Your Cognito User Pool Client ID>
     ```
   - If you don't have a Cognito User Pool yet, you can create one in the AWS Console:
     - Go to Amazon Cognito
     - Create a new User Pool
     - Enable email sign-in
     - Create an app client
     - Copy the User Pool ID and Client ID

5. Click "Save and deploy"

Your app will be deployed and available at the URL provided by AWS Amplify.

## Environment Variables

The following environment variables are required:

- `NEXT_PUBLIC_USER_POOL_ID`: Cognito User Pool ID
- `NEXT_PUBLIC_USER_POOL_CLIENT_ID`: Cognito User Pool Client ID

You can set these in the AWS Amplify Console under App settings > Environment variables.

