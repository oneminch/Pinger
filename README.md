# Pinger (AWS)

Pinger is a small Node backend (I built for fun) whose purpose is to make scheduled requests to a certain database provider to keep it alive.

> This branch contains project code for deployment using Docker and AWS Lambda. It also relies on AWS' EventBridge Scheduler feature to periodically execute on set intervals.
>
> A different version of the app that can be deployed to Cloudflare Workers is on the [`main`](https://github.com/oneminch/Pinger/tree/main) branch.

## Initial Setup

The snippets below are what I used to initially set up the Lambda function where I built the Docker image locally, uploaded it to ECR and create the Lambda function from the image.

I then automated the CI/CD process using GitHub Actions to automatically rebuild the image, upload it to ECR and update the Lambda function. [Go to the setup step](#cicd-using-github-actions).

### Create the Necessary Roles

```json
// lambda-trust-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

```bash
# Create Role for Lambda Execution
aws iam create-role \
    --role-name <Lambda-Role-Name> \
    --assume-role-policy-document file://lambda-trust-policy.json \
    --description <Lambda-Role-Description>
```

### Build, Tag, Push, Deploy

```bash
# Create ECR Repository
aws ecr create-repository --repository-name <repo-name> --region <aws-region>

# Get Temporary Auth Token for ECR & Authenticate Docker to Your ECR Repository
aws ecr get-login-password --region <aws-region> | docker login --username <username> --password-stdin <account-id>.dkr.ecr.<aws-region>.amazonaws.com

# Build Docker Image
docker build -t <image-name> .

# Tag Docker Image
docker tag <image-name>:<image-tag> <account-id>.dkr.ecr.<aws-region>.amazonaws.com/<repo-name>:<unique-image-tag>

# Push Docker Image to ECR
docker push <account-id>.dkr.ecr.<aws-region>.amazonaws.com/<repo-name>:<unique-image-tag>

# Create Lambda Function using Created Role & Uploaded Image
aws lambda create-function \
    --function-name <function-name> \
    --package-type Image \
    --code ImageUri=<account-id>.dkr.ecr.<aws-region>.amazonaws.com/<repo-name>:<unique-image-tag> \
    --role arn:aws:iam::<account-id>:role/<Lambda-Role-Name> \
    --environment Variables="{SUPABASE_PROJECT_URL=<supabase-project-url>,SUPABASE_PUBLIC_ANON_KEY=<supabase-anon-key>}" \
    --memory-size 512 \
    --timeout 30
```

## CI/CD Using GitHub Actions

The workflow for this step is located in [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

In IAM, create an OpenID Connect identity provider for GitHub, and define a trust policy that is scoped to the GitHub organization/user and repository.

```bash
aws iam create-open-id-connect-provider \
  --url "https://token.actions.githubusercontent.com" \
  --client-id-list "sts.amazonaws.com"
```

```json
// gh-actions-trust-policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<account-id>:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub": "repo:<repo-owner>/<repo-name>:ref:refs/heads/<repo-branch>"
        }
      }
    }
  ]
}
```

Create a Web Identity role with the necessary read/write permissions for ECR and Lambda, and with the defined trust policy to allow GitHub Actions to assume the role while executing workflows.

```bash
# Create Role for GitHub Actions to Assume
aws iam create-role \
  --role-name <GH-Role-Name> \
  --assume-role-policy-document file://gh-actions-trust-policy.json \
  --description <GH-Role-Description>
```

```json
// gh-actions-permissions.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetAuthorizationToken",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "lambda:UpdateFunctionCode",
        "lambda:GetFunctionConfiguration"
      ],
      "Resource": "arn:aws:lambda:<aws-region>:<account-id>:function:<function-name>"
    }
  ]
}
```

```bash
# Attach Permissions Policy
aws iam put-role-policy \
  --role-name <GH-Role-Name> \
  --policy-name <policy-name> \
  --policy-document file://gh-actions-permissions.json
```

This role name is what I added as a secret inside the GitHub repo as `AWS_ROLE_TO_ASSUME`, In addition to that, there are other AWS-related variables I added as secrets for the sake of organization: `AWS_ECR_REPO_NAME`, `AWS_LAMBDA_FUNCTION_NAME`, `AWS_REGION`.

These steps should take care the setup process for running this Express based app on AWS Lambda using Docker.

## EventBridge Scheduler Setup

From the AWS console, navigate to Amazon EventBridge and create a schedule with a target of AWS Lambda (Invoke). Pick your lambda function from the dropdown.
