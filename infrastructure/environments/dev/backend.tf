terraform {
  backend "s3" {
    bucket         = "cloudaip-saas-terraform-state"
    key            = "dev/terraform.tfstate"
    region         = "ap-south-1"
    encrypt        = true
    dynamodb_table = "cloudaip-terraform-locks"
  }
}
