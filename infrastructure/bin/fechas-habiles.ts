#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { FechasHabilesStack } from '../lib/fechas-habiles-stack';

const app = new cdk.App();

new FechasHabilesStack(app, 'FechasHabilesStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  description: 'API de Fechas Hábiles en Colombia - AWS Lambda deployment'
});