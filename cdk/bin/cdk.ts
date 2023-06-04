#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MinecraftServerStack } from '../lib/cdk-stack';

const app = new cdk.App();
new MinecraftServerStack(app, 'minecraft-server-stack');
app.synth();
