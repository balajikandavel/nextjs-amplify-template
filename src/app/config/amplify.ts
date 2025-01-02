import { Amplify } from 'aws-amplify';
import { type ResourcesConfig } from '@aws-amplify/core';

const amplifyConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID || '',
      userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID || '',
      signUpVerificationMethod: 'code',
      loginWith: {
        email: true,
        username: false,
        phone: false
      }
    }
  }
};

Amplify.configure(amplifyConfig); 