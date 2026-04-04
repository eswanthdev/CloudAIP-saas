output "distribution_id" {
  value       = aws_cloudfront_distribution.frontend.id
  description = "ID of the CloudFront distribution"
}

output "distribution_arn" {
  value       = aws_cloudfront_distribution.frontend.arn
  description = "ARN of the CloudFront distribution"
}

output "distribution_domain_name" {
  value       = aws_cloudfront_distribution.frontend.domain_name
  description = "Domain name of the CloudFront distribution"
}

output "cache_policy_id" {
  value       = aws_cloudfront_cache_policy.optimized.id
  description = "ID of the CloudFront cache policy"
}
