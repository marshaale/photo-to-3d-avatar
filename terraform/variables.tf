variable aws_region {
  description = "The AWS region where the infrastructure will be deployed."
  type        = string
  default     = "ap-south-1"
}

variable s3_bucket_name {
  description = "The name of the S3 bucket to be created."
  type        = string
  default     = "photo-to-3d-avatar"
}

variable ami_id {
  description = "The ID of the AMI to be used for the EC2 instance."
  type        = string
  default     = "ami-0c7632fb77f35db43" # Unbuntu
}

variable key_pair_name {
  description = "The name of the key pair to be used for the EC2 instance."
  type        = string
}