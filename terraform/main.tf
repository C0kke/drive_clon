resource "aws_s3_bucket" "drive_bucket" {
  bucket        = var.bucket_name
  force_destroy = true # Allows deleting the bucket even if it contains files (great for testing)

  tags = {
    Name        = "Drive Clon Bucket"
    Environment = var.is_localstack ? "LocalStack" : "Production"
  }
}

# Optional: Disable Block Public Access if the user ever wants to expose files directly,
# but for safety we keep it active. Next.js accesses it using AWS credentials.
resource "aws_s3_bucket_public_access_block" "drive_bucket_public" {
  bucket = aws_s3_bucket.drive_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
