import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as efs from 'aws-cdk-lib/aws-efs';

export class MinecraftServerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC
    const vpc = new ec2.Vpc(this, 'minecraft-vpc', {
      maxAzs: 2,
      natGateways: 1,
    });

    // EFS
    const fileSystem = new efs.FileSystem(this, 'minecraft-efs', {
      vpc,
    });

    // ECSクラスター
    const cluster = new ecs.Cluster(this, 'minecraft-cluster', {
      vpc,
    });

    // タスク定義
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'minecraft-taskdef', {
      memoryLimitMiB: 2048,
      cpu: 512,
    });

    // コンテナ定義
    const container = taskDefinition.addContainer('minecraft-container', {
      image: ecs.ContainerImage.fromRegistry('haruc/minecraft-server'), // DockerHubのイメージを指定
      memoryLimitMiB: 2048,
      cpu: 512,
      logging: new ecs.AwsLogDriver({
        streamPrefix: 'minecraft',
      }),
      portMappings: [
        {
          containerPort: 25565,
          protocol: ecs.Protocol.TCP
        },
      ]
    });

    // EFSボリュームをコンテナにマウント
    container.addMountPoints({
      readOnly: false,
      containerPath: '/mnt/var',
      sourceVolume: 'minecraft-volume',
    });

    // EFSボリュームをタスク定義に追加
    taskDefinition.addVolume({
      name: 'minecraft-volume',
      efsVolumeConfiguration: {
        fileSystemId: fileSystem.fileSystemId,
      },
    });

    const service = new ecs.FargateService(this, 'minecraft-service', {
      cluster,
      taskDefinition,
      desiredCount: 1,
      assignPublicIp: true,
    });

    // セキュリティグループ
    const securityGroup = new ec2.SecurityGroup(this, 'SecurityGroup', {
      vpc: vpc,
      securityGroupName: 'ecs-sg'
    });
    
    securityGroup.addIngressRule(
      ec2.Peer.ipv4('0.0.0.0/0'),
      ec2.Port.tcp(25565)
  );

    // セキュリティグループからのアクセスを許可
    fileSystem.connections.allowDefaultPortFrom(service);
  }
}
