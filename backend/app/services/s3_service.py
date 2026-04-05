"""AWS S3 integration service."""

import boto3
from botocore.exceptions import ClientError
from app.config import settings
from typing import Optional, Tuple
import mimetypes


class S3Service:
    """Service for S3 operations."""

    def __init__(self):
        """Initialize S3 client."""
        self.s3_client = boto3.client(
            "s3",
            region_name=settings.s3_region,
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
        )

    def generate_presigned_url(
        self,
        bucket: str,
        key: str,
        expiration: int = 3600,
        operation: str = "get_object",
    ) -> str:
        """Generate a presigned URL for S3 object.

        Args:
            bucket: S3 bucket name.
            key: Object key.
            expiration: URL expiration time in seconds.
            operation: S3 operation (get_object, put_object).

        Returns:
            str: Presigned URL.

        Raises:
            Exception: If URL generation fails.
        """
        try:
            url = self.s3_client.generate_presigned_url(
                operation,
                Params={"Bucket": bucket, "Key": key},
                ExpiresIn=expiration,
            )
            return url
        except ClientError as e:
            raise Exception(f"Failed to generate presigned URL: {str(e)}")

    def generate_upload_url(
        self,
        bucket: str,
        key: str,
        content_type: str = "application/octet-stream",
        expiration: int = 3600,
    ) -> Tuple[str, dict]:
        """Generate presigned POST URL for file upload.

        Args:
            bucket: S3 bucket name.
            key: Object key.
            content_type: Content type.
            expiration: URL expiration time in seconds.

        Returns:
            tuple: (URL, form data).

        Raises:
            Exception: If URL generation fails.
        """
        try:
            response = self.s3_client.generate_presigned_post(
                Bucket=bucket,
                Key=key,
                Fields={"Content-Type": content_type},
                Conditions=[
                    ["content-length-range", 0, 1024 * 1024 * 100],  # 100MB max
                ],
                ExpiresIn=expiration,
            )
            return response["url"], response["fields"]
        except ClientError as e:
            raise Exception(f"Failed to generate upload URL: {str(e)}")

    def upload_file(
        self,
        bucket: str,
        key: str,
        file_path: str,
        content_type: Optional[str] = None,
        metadata: Optional[dict] = None,
    ) -> str:
        """Upload file to S3.

        Args:
            bucket: S3 bucket name.
            key: Object key.
            file_path: Local file path.
            content_type: Content type (auto-detected if None).
            metadata: Object metadata.

        Returns:
            str: S3 object URL.

        Raises:
            Exception: If upload fails.
        """
        try:
            if not content_type:
                content_type, _ = mimetypes.guess_type(file_path)
                if not content_type:
                    content_type = "application/octet-stream"

            extra_args = {"ContentType": content_type}
            if metadata:
                extra_args["Metadata"] = metadata

            self.s3_client.upload_file(
                file_path,
                bucket,
                key,
                ExtraArgs=extra_args,
            )

            return f"s3://{bucket}/{key}"

        except ClientError as e:
            raise Exception(f"Failed to upload file: {str(e)}")

    def download_file(
        self,
        bucket: str,
        key: str,
        file_path: str,
    ) -> bool:
        """Download file from S3.

        Args:
            bucket: S3 bucket name.
            key: Object key.
            file_path: Local file path to save to.

        Returns:
            bool: True if successful.

        Raises:
            Exception: If download fails.
        """
        try:
            self.s3_client.download_file(bucket, key, file_path)
            return True
        except ClientError as e:
            raise Exception(f"Failed to download file: {str(e)}")

    def delete_file(self, bucket: str, key: str) -> bool:
        """Delete file from S3.

        Args:
            bucket: S3 bucket name.
            key: Object key.

        Returns:
            bool: True if successful.

        Raises:
            Exception: If deletion fails.
        """
        try:
            self.s3_client.delete_object(Bucket=bucket, Key=key)
            return True
        except ClientError as e:
            raise Exception(f"Failed to delete file: {str(e)}")

    def get_object_metadata(self, bucket: str, key: str) -> dict:
        """Get object metadata from S3.

        Args:
            bucket: S3 bucket name.
            key: Object key.

        Returns:
            dict: Object metadata.

        Raises:
            Exception: If metadata fetch fails.
        """
        try:
            response = self.s3_client.head_object(Bucket=bucket, Key=key)
            return {
                "size": response.get("ContentLength"),
                "content_type": response.get("ContentType"),
                "last_modified": response.get("LastModified"),
                "etag": response.get("ETag"),
            }
        except ClientError as e:
            if e.response["Error"]["Code"] == "404":
                raise Exception("Object not found")
            raise Exception(f"Failed to get object metadata: {str(e)}")

    def list_objects(self, bucket: str, prefix: str = "") -> list:
        """List objects in S3 bucket with prefix.

        Args:
            bucket: S3 bucket name.
            prefix: Object key prefix.

        Returns:
            list: List of objects.

        Raises:
            Exception: If listing fails.
        """
        try:
            objects = []
            paginator = self.s3_client.get_paginator("list_objects_v2")
            pages = paginator.paginate(Bucket=bucket, Prefix=prefix)

            for page in pages:
                for obj in page.get("Contents", []):
                    objects.append(
                        {
                            "key": obj["Key"],
                            "size": obj["Size"],
                            "last_modified": obj["LastModified"].isoformat(),
                        }
                    )

            return objects

        except ClientError as e:
            raise Exception(f"Failed to list objects: {str(e)}")

    def copy_object(
        self,
        source_bucket: str,
        source_key: str,
        dest_bucket: str,
        dest_key: str,
    ) -> bool:
        """Copy object between S3 buckets.

        Args:
            source_bucket: Source bucket name.
            source_key: Source object key.
            dest_bucket: Destination bucket name.
            dest_key: Destination object key.

        Returns:
            bool: True if successful.

        Raises:
            Exception: If copy fails.
        """
        try:
            copy_source = {"Bucket": source_bucket, "Key": source_key}
            self.s3_client.copy_object(
                CopySource=copy_source,
                Bucket=dest_bucket,
                Key=dest_key,
            )
            return True
        except ClientError as e:
            raise Exception(f"Failed to copy object: {str(e)}")
