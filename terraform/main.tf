# Main Terraform configuration file

data "aws_vpc" "default" {
  default = true
}

## S3 creation
resource "aws_s3_bucket" "photo_to_3d_avatar_bucket" {
  bucket = var.s3_bucket_name
  tags = {
    Name        = "photo-to-3d-avatar-bucket"
    Environment = "production"
  }
}

resource "aws_s3_bucket_public_access_block" "photo_to_3d_avatar_bucket_public_access_block" {
  bucket = aws_s3_bucket.photo_to_3d_avatar_bucket.id
  
  block_public_acls = true
  ignore_public_acls = true
  block_public_policy = true
  restrict_public_buckets = true
}

## Security group creation

resource "aws_security_group" "photo_to_3d_avatar_sg" {
  name        = "photo-to-3d-avatar-sg"
  description = "Security group for photo-to-3d-avatar application"
  vpc_id      = data.aws_vpc.default.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "photo-to-3d-avatar-sg"
    Environment = "production"
  }
}

resource "aws_vpc_security_group_ingress_rule" "allow_http" {
  security_group_id = aws_security_group.photo_to_3d_avatar_sg.id
  cidr_ipv4 = "0.0.0.0/0"
  ip_protocol = "tcp"
  from_port = 80
  to_port = 80
}

resource "aws_vpc_security_group_ingress_rule" "allow_https" {
  security_group_id = aws_security_group.photo_to_3d_avatar_sg.id
  cidr_ipv4 = "0.0.0.0/0"
  ip_protocol = "tcp"
  from_port = 443
  to_port = 443
}

resource "aws_vpc_security_group_ingress_rule" "allow_ssh" {
  security_group_id = aws_security_group.photo_to_3d_avatar_sg.id
  cidr_ipv4 = "0.0.0.0/0"
  ip_protocol = "tcp"
  from_port = 22
  to_port = 22
}

## EC2 instance creation

resource "aws_instance" "photo_to_3d_avatar_instance" {
  ami           = var.ami_id
  instance_type = "t2.micro"
  key_name      = var.key_pair_name
  vpc_security_group_ids  = [aws_security_group.photo_to_3d_avatar_sg.id]

  tags = {
    Name        = "photo-to-3d-avatar-instance"
    Environment = "production"
  }
}