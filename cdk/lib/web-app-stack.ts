import * as cdk from 'aws-cdk-lib';
import * as amplify from '@aws-cdk/aws-amplify-alpha';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as cr from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';

export class WebAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a custom resource to fetch the SSM parameter
    const getParameter = new cr.AwsCustomResource(this, 'GetOpenAIKey', {
      onCreate: {
        service: 'SSM',
        action: 'getParameter',
        parameters: {
          Name: '/next-app/openai-api-key',
          WithDecryption: true
        },
        physicalResourceId: cr.PhysicalResourceId.of('OpenAIKeyParameter')
      },
      policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
        resources: [
          `arn:aws:ssm:${this.region}:${this.account}:parameter/next-app/openai-api-key`
        ]
      })
    });

    // Create Amplify App
    const amplifyApp = new amplify.App(this, 'NextJsAmplifyApp', {
      appName: 'next-amplify-app',
      sourceCodeProvider: new amplify.GitHubSourceCodeProvider({
        owner: 'balajikandavel',
        repository: 'nextjs-amplify-template',
        oauthToken: cdk.SecretValue.secretsManager('github-token')
      }),
      buildSpec: codebuild.BuildSpec.fromObjectToYaml({
        version: 1,
        frontend: {
          phases: {
            preBuild: {
              commands: [
                'set -x',
                'export DEBUG=*',
                'yarn --version',
                'node --version',
                'pwd',
                'ls -la',
                'env | sort',
                'yarn install --frozen-lockfile --verbose',
                'yarn add encoding',
                'yarn list typescript @types/node',
                'ls -la node_modules/.bin/tsc || true'
              ]
            },
            build: {
              commands: [
                'set -x',
                'yarn build || { echo "Build failed with:"; cat .next/error.log; exit 1; }',
                'mkdir -p .next/standalone/.next/static',
                'cp -r .next/static/* .next/standalone/.next/static/ || true',
                'cp -r public/* .next/standalone/public/ || true',
                'cp package.json .next/standalone/',
                'cd .next/standalone',
                'yarn install --production --ignore-scripts'
              ]
            }
          },
          artifacts: {
            baseDirectory: '.next/standalone',
            files: ['**/*']
          },
          cache: {
            paths: [
              'node_modules/**/*',
              '.next/cache/**/*'
            ]
          }
        }
      }),
      platform: amplify.Platform.WEB_COMPUTE,
      environmentVariables: {
        NODE_ENV: 'production',
        PORT: '8080',
        DEBUG: '*',
        NODE_DEBUG: 'DEBUG',
        NEXT_DEBUG: 'true',
        NEXT_TELEMETRY_DEBUG: '1',
        VERBOSE: 'true'
      }
    });

    // Add branch with auto build enabled
    const main = amplifyApp.addBranch('main', {
      autoBuild: true,
      stage: 'PRODUCTION',
      environmentVariables: {
        NODE_ENV: 'production',
        PORT: '8080',
        DEBUG: '*',
        NODE_DEBUG: 'DEBUG',
        NEXT_DEBUG: 'true',
        NEXT_TELEMETRY_DEBUG: '1',
        VERBOSE: 'true',
        OPENAI_API_KEY: getParameter.getResponseField('Parameter.Value')
      }
    });

    // Output the App details
    new cdk.CfnOutput(this, 'AmplifyAppId', {
      value: amplifyApp.appId,
      description: 'Amplify App ID'
    });

    new cdk.CfnOutput(this, 'AmplifyAppURL', {
      value: `https://${main.branchName}.${amplifyApp.defaultDomain}`,
      description: 'Amplify App URL (available after deployment completes)'
    });

    new cdk.CfnOutput(this, 'AmplifyConsoleUrl', {
      value: `https://${cdk.Stack.of(this).region}.console.aws.amazon.com/amplify/home?region=${cdk.Stack.of(this).region}#/${amplifyApp.appId}`,
      description: 'Link to Amplify Console to monitor deployment'
    });
  }
} 