output "videos_bucket_name" {
  value       = aws_s3_bucket.videos.id
  description = "Name of the videos bucket"
}

output "videos_bucket_arn" {
  value       = aws_s3_bucket.videos.arn
  description = "ARN of the videos bucket"
}

output "documents_bucket_name" {
  value       = aws_s3_bucket.documents.id
  description = "Name of the documents bucket"
}

output "documents_bucket_arn" {
  value       = aws_s3_bucket.documents.arn
  description = "ARN of the documents bucket"
}

output "frontend_bucket_name" {
  value       = aws_s3_bucket.frontend.id
  description = "Name of the frontend bucket"
}

output "frontend_bucket_arn" {
  value       = aws_s3_bucket.frontend.arn
  description = "ARN of the frontend bucket"
}

output "frontend_bucket_domain_name" {
  value       = aws_s3_bucket.frontend.bucket_regional_domain_name
  description = "Regional domain name of the frontend bucket"
}

output "cloudfront_oai_iam_arn" {
  value       = aws_cloudfront_origin_access_identity.frontend.iam_arn
  description = "IAM ARN of the CloudFront origin access identity"
}

output "cloudfront_oai_id" {
  value       = aws_cloudfront_origin_access_identity.frontend.id
  description = "ID of the CloudFront origin access identity"
}
