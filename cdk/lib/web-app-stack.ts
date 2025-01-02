import * as cdk from 'aws-cdk-lib';
import * as amplify from '@aws-cdk/aws-amplify-alpha';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cr from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';

export class WebAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

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

    // Create a custom resource to trigger initial deployment
    const triggerDeployment = new cr.AwsCustomResource(this, 'TriggerDeployment', {
      onCreate: {
        service: 'Amplify',
        action: 'startJob',
        parameters: {
          appId: amplifyApp.appId,
          branchName: main.branchName,
          jobType: 'RELEASE',
          jobReason: 'Initial deployment via CDK'
        },
        physicalResourceId: cr.PhysicalResourceId.of('InitialDeployment')
      },
      policy: cr.AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['amplify:StartJob'],
          resources: [`arn:aws:amplify:${this.region}:${this.account}:apps/${amplifyApp.appId}/branches/${main.branchName}/*`]
        })
      ])
    });

    // Ensure deployment trigger happens after branch is created
    triggerDeployment.node.addDependency(main);

    // Add a custom resource to trigger build
    const triggerBuild = new cr.AwsCustomResource(this, 'TriggerBuild', {
      onCreate: {
        service: 'Amplify',
        action: 'startJob',
        parameters: {
          appId: amplifyApp.appId,
          branchName: 'main',
          jobType: 'RELEASE'
        },
        physicalResourceId: cr.PhysicalResourceId.of('BuildTrigger')
      },
      policy: cr.AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['amplify:StartJob'],
          resources: [`arn:aws:amplify:${this.region}:${this.account}:apps/${amplifyApp.appId}/branches/main/*`]
        })
      ])
    });

    // Ensure build trigger happens after branch creation
    triggerBuild.node.addDependency(main);

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