terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region                      = var.aws_region
  access_key                  = var.aws_access_key
  secret_key                  = var.aws_secret_key
  
  # Allow connecting to LocalStack
  skip_credentials_validation = var.is_localstack
  skip_metadata_api_check     = var.is_localstack
  skip_requesting_account_id  = var.is_localstack
  
  # Bypass S3 virtual hosted-style bucket addressing for LocalStack
  s3_use_path_style           = var.is_localstack

  dynamic "endpoints" {
    for_each = var.is_localstack ? [1] : []
    content {
      s3 = var.aws_s3_endpoint
    }
  }
}
