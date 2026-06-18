variable "aws_region" {
  description = "AWS Region"
  type        = string
  default     = "us-east-1"
}

variable "aws_access_key" {
  description = "AWS Access Key"
  type        = string
  default     = "test"
}

variable "aws_secret_key" {
  description = "AWS Secret Key"
  type        = string
  default     = "test"
}

variable "aws_s3_endpoint" {
  description = "Custom endpoint for S3 (used for LocalStack)"
  type        = string
  default     = "http://localhost:4566"
}

variable "is_localstack" {
  description = "Set to true if provisioning on LocalStack, false for real AWS"
  type        = bool
  default     = true
}

variable "bucket_name" {
  description = "The name of the S3 bucket"
  type        = string
  default     = "drive-clon-bucket"
}
