output "bucket_id" {
  description = "The name of the bucket."
  value       = aws_s3_bucket.drive_bucket.id
}

output "bucket_arn" {
  description = "The ARN of the bucket."
  value       = aws_s3_bucket.drive_bucket.arn
}

output "bucket_name" {
  description = "The bucket name."
  value       = var.bucket_name
}
