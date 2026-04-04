"""Email and notification service."""
import boto3
from botocore.exceptions import ClientError
from app.config import settings
from typing import List, Dict, Any, Optional
import json


class NotificationService:
    """Service for sending notifications via SES."""

    def __init__(self):
        """Initialize SES client."""
        self.ses_client = boto3.client(
            "ses",
            region_name=settings.aws_region,
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
        )
        self.sender_email = settings.ses_sender_email

    def send_email(
        self,
        to_addresses: List[str],
        subject: str,
        body_text: str,
        body_html: Optional[str] = None,
        cc_addresses: Optional[List[str]] = None,
        bcc_addresses: Optional[List[str]] = None,
    ) -> str:
        """Send email via SES.

        Args:
            to_addresses: List of recipient email addresses.
            subject: Email subject.
            body_text: Plain text body.
            body_html: HTML body (optional).
            cc_addresses: List of CC addresses.
            bcc_addresses: List of BCC addresses.

        Returns:
            str: Message ID.

        Raises:
            Exception: If email sending fails.
        """
        try:
            destination = {"ToAddresses": to_addresses}

            if cc_addresses:
                destination["CcAddresses"] = cc_addresses

            if bcc_addresses:
                destination["BccAddresses"] = bcc_addresses

            message = {
                "Subject": {"Data": subject, "Charset": "UTF-8"},
                "Body": {"Text": {"Data": body_text, "Charset": "UTF-8"}},
            }

            if body_html:
                message["Body"]["Html"] = {"Data": body_html, "Charset": "UTF-8"}

            response = self.ses_client.send_email(
                Source=self.sender_email,
                Destination=destination,
                Message=message,
            )

            return response["MessageId"]

        except ClientError as e:
            raise Exception(f"Failed to send email: {str(e)}")

    def send_enrollment_confirmation(
        self,
        email: str,
        first_name: str,
        course_name: str,
        tier_name: str,
    ) -> str:
        """Send enrollment confirmation email.

        Args:
            email: Recipient email.
            first_name: User first name.
            course_name: Course name.
            tier_name: Enrollment tier.

        Returns:
            str: Message ID.
        """
        subject = f"Welcome to {course_name}!"
        body_text = f"""
Hi {first_name},

Thank you for enrolling in {course_name} ({tier_name} tier)!

You can now access all course materials from your dashboard.

Best regards,
FinOps Training Team
"""

        body_html = f"""
<html>
<body>
<h2>Welcome to {course_name}!</h2>
<p>Hi {first_name},</p>
<p>Thank you for enrolling in <strong>{course_name}</strong> ({tier_name} tier)!</p>
<p>You can now access all course materials from your dashboard.</p>
<p>Best regards,<br/>FinOps Training Team</p>
</body>
</html>
"""

        return self.send_email(
            to_addresses=[email],
            subject=subject,
            body_text=body_text,
            body_html=body_html,
        )

    def send_payment_confirmation(
        self,
        email: str,
        first_name: str,
        course_name: str,
        amount: float,
        currency: str,
    ) -> str:
        """Send payment confirmation email.

        Args:
            email: Recipient email.
            first_name: User first name.
            course_name: Course name.
            amount: Payment amount.
            currency: Currency code.

        Returns:
            str: Message ID.
        """
        subject = f"Payment Confirmation - {course_name}"
        body_text = f"""
Hi {first_name},

Thank you for your payment!

Course: {course_name}
Amount: {currency} {amount}

Your course access is now active.

Best regards,
FinOps Training Team
"""

        body_html = f"""
<html>
<body>
<h2>Payment Confirmation</h2>
<p>Hi {first_name},</p>
<p>Thank you for your payment!</p>
<table style="border-collapse: collapse;">
<tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Course:</strong></td><td style="border: 1px solid #ddd; padding: 8px;">{course_name}</td></tr>
<tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Amount:</strong></td><td style="border: 1px solid #ddd; padding: 8px;">{currency} {amount}</td></tr>
</table>
<p>Your course access is now active.</p>
<p>Best regards,<br/>FinOps Training Team</p>
</body>
</html>
"""

        return self.send_email(
            to_addresses=[email],
            subject=subject,
            body_text=body_text,
            body_html=body_html,
        )

    def send_certificate_notification(
        self,
        email: str,
        first_name: str,
        course_name: str,
        certificate_url: str,
    ) -> str:
        """Send certificate notification email.

        Args:
            email: Recipient email.
            first_name: User first name.
            course_name: Course name.
            certificate_url: Certificate download URL.

        Returns:
            str: Message ID.
        """
        subject = f"Certificate - {course_name}"
        body_text = f"""
Hi {first_name},

Congratulations on completing {course_name}!

Your certificate is ready. Download it here:
{certificate_url}

Best regards,
FinOps Training Team
"""

        body_html = f"""
<html>
<body>
<h2>Certificate Earned!</h2>
<p>Hi {first_name},</p>
<p>Congratulations on completing <strong>{course_name}</strong>!</p>
<p>Your certificate is ready. <a href="{certificate_url}">Download Certificate</a></p>
<p>Best regards,<br/>FinOps Training Team</p>
</body>
</html>
"""

        return self.send_email(
            to_addresses=[email],
            subject=subject,
            body_text=body_text,
            body_html=body_html,
        )

    def send_mentor_assignment(
        self,
        student_email: str,
        student_name: str,
        mentor_email: str,
        mentor_name: str,
        session_date: str,
        meeting_link: Optional[str] = None,
    ) -> str:
        """Send mentor assignment email to student.

        Args:
            student_email: Student email.
            student_name: Student name.
            mentor_email: Mentor email.
            mentor_name: Mentor name.
            session_date: Session date/time.
            meeting_link: Meeting link.

        Returns:
            str: Message ID.
        """
        subject = "Your Mentor Has Been Assigned!"
        body_text = f"""
Hi {student_name},

Your mentor has been assigned for the mentorship session!

Mentor: {mentor_name} ({mentor_email})
Session Date: {session_date}
Meeting Link: {meeting_link}

Please join the meeting at the scheduled time.

Best regards,
FinOps Training Team
"""

        body_html = f"""
<html>
<body>
<h2>Mentor Assigned!</h2>
<p>Hi {student_name},</p>
<p>Your mentor has been assigned for the mentorship session!</p>
<table style="border-collapse: collapse;">
<tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Mentor:</strong></td><td style="border: 1px solid #ddd; padding: 8px;">{mentor_name}</td></tr>
<tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Email:</strong></td><td style="border: 1px solid #ddd; padding: 8px;">{mentor_email}</td></tr>
<tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Session Date:</strong></td><td style="border: 1px solid #ddd; padding: 8px;">{session_date}</td></tr>
<tr><td style="border: 1px solid #ddd; padding: 8px;"><strong>Meeting Link:</strong></td><td style="border: 1px solid #ddd; padding: 8px;"><a href="{meeting_link}">{meeting_link}</a></td></tr>
</table>
<p>Please join the meeting at the scheduled time.</p>
<p>Best regards,<br/>FinOps Training Team</p>
</body>
</html>
"""

        return self.send_email(
            to_addresses=[student_email],
            subject=subject,
            body_text=body_text,
            body_html=body_html,
        )
