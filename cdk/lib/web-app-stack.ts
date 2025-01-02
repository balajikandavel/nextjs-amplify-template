import * as cdk from 'aws-cdk-lib';
import * as amplify from '@aws-cdk/aws-amplify-alpha';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class WebAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create Amplify App
    const amplifyApp = new amplify.App(this, 'NextJsAmplifyApp', {
      appName: 'next-amplify-app',
      buildSpec: codebuild.BuildSpec.fromObjectToYaml({
        version: 1,
        frontend: {
          phases: {
            preBuild: {
              commands: [
                'export ARTIFACTORY_EMAIL=Balaji.Kandavel@coxautoinc.com',
                'export ARTIFACTORY_TOKEN=YmFsYWppLmthbmRhdmVsQGNveGF1dG9pbmMuY29tOkFLQ3A4azhpTTdKY2ZDR2J2bXNmdGZuU3p4TWQ0RUQ2QlNMcVhreFp3RlhadW9QZnRBUjU1d1hpeHhRUldYeDhqRWpnenJGWGs=',
                'yarn install --frozen-lockfile'
              ]
            },
            build: {
              commands: [
                'yarn build',
                'cp -r public/* .next/static/',
                'cp -r .next/static/* .next/standalone/.next/static/',
                'cp package.json .next/standalone/',
                'cd .next/standalone',
                'yarn install --production'
              ]
            }
          },
          artifacts: {
            baseDirectory: '.next/standalone',
            files: [
              '**/*'
            ]
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
        PORT: '8080'
      }
    });

    // Add branch with auto build enabled
    const main = amplifyApp.addBranch('main', {
      autoBuild: true,
      stage: 'PRODUCTION',
      environmentVariables: {
        NODE_ENV: 'production',
        PORT: '8080'
      }
    });

    // Create deployment role
    const deployRole = new iam.Role(this, 'AmplifyDeployRole', {
      assumedBy: new iam.ServicePrincipal('amplify.amazonaws.com'),
      description: 'Role for Amplify to deploy the application',
    });

    deployRole.addToPolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: ['*'],
      actions: [
        'amplify:StartJob',
        'amplify:StopJob',
        'amplify:StartDeployment',
        'amplify:StopDeployment'
      ]
    }));

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