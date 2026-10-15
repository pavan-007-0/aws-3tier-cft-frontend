# AWS 3-Tier E-Commerce Frontend on Amazon EKS with Kubernetes YAML

[![Kubernetes](https://img.shields.io/badge/Workloads-Amazon%20EKS%20%7C%20Kubernetes-326CE5?logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![Angular](https://img.shields.io/badge/Frontend-Angular-DD0031?logo=angular&logoColor=white)](https://angular.dev/)
[![Docker](https://img.shields.io/badge/Container-Docker%20%2F%20Nginx-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![GitLab CI/CD](https://img.shields.io/badge/Delivery-GitLab%20CI%2FCD-FC6D26?logo=gitlab&logoColor=white)](https://docs.gitlab.com/ee/ci/)

Angular frontend for a containerized 3-tier e-commerce platform deployed to Amazon EKS behind an Application Load Balancer.

> **Authoring model:** The GitLab pipeline and Kubernetes workload manifests are written in YAML. The Angular application is compiled into a multi-stage Docker image, served by Nginx, published to Amazon ECR, and deployed with generated Kubernetes YAML. AWS CLI commands are used only by the CI job as runtime deployment steps.

## Architecture

```mermaid
flowchart LR
    User[Customer / Admin] --> ALB[Application Load Balancer]
    ALB --> Ingress[Kubernetes Ingress]
    Ingress --> Service[Frontend Service]
    Service --> App[Angular Deployment on Amazon EKS]
    App --> Nginx[Nginx runtime container]
    ECR[Amazon ECR image] --> App
    App --> API[Backend API Service]
    CI[GitLab CI YAML] --> Build[Node + Docker build]
    Build --> ECR
    CI --> Apply[Generated Kubernetes YAML + kubectl]
    Apply --> App
```

## What is authored in YAML

- `.gitlab-ci.yml` build, validation, ECR publishing, EKS access, and rollout stages
- Kubernetes Deployment, Service, and Ingress manifests generated for the frontend
- Environment-specific API URL and deployment values supplied through protected variables
- Dockerfile for the Node/Angular build and Nginx runtime image

## Features

- Angular storefront, product browsing, cart, checkout, registration, login, profile, wishlist, orders, and admin flows
- Server-side authentication and role checks; no client-side hardcoded credentials
- Multi-stage Docker build with Nginx runtime
- Kubernetes health probes and resource requests/limits
- ECR image publishing and EKS rollout verification
- Environment-based API URL configuration

## Delivery workflow

1. GitLab CI validates the frontend and container configuration.
2. The job obtains EKS access and builds the Angular/Nginx image.
3. The image is published to Amazon ECR.
4. Deployment values are rendered into Kubernetes YAML.
5. `kubectl apply` updates the EKS Deployment, Service, and Ingress.
6. Rollout status and the frontend ALB endpoint are checked.

## Technology keywords

`Kubernetes YAML` · `GitLab CI YAML` · `Amazon EKS` · `kubectl` · `Angular` · `TypeScript` · `Node.js` · `Docker` · `Nginx` · `Amazon ECR` · `AWS CLI in CI` · `Application Load Balancer`

## Local development

```bash
cd frontend-app/frontend-app
npm ci
npm start
```

The default local API URL is `/api`; configure a proxy or environment value for a separately hosted backend. Never put credentials in Angular environment files because they are bundled into the browser application.

## Related repositories

- [Kubernetes YAML backend](https://github.com/pavan-007-0/aws-3tier-cft-backend)
- [Terraform/HCL frontend](https://github.com/pavan-007-0/aws-3tier-terraform-frontend)
- [Terraform/HCL backend](https://github.com/pavan-007-0/aws-3tier-terraform-backend)
- ECS/CloudFormation repositories are documented separately under the `aws-3tier-cloudformation-ecs-*` naming convention.
