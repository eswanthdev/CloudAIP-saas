"""Certificate generation and management service."""
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from io import BytesIO
from datetime import datetime
from typing import Tuple, Optional
from app.utils.helpers import generate_uuid, get_current_timestamp


class CertificateService:
    """Service for generating certificates."""

    def __init__(self):
        """Initialize certificate service."""
        self.page_width, self.page_height = letter

    def generate_certificate_pdf(
        self,
        user_name: str,
        course_name: str,
        completion_date: Optional[str] = None,
        certificate_id: Optional[str] = None,
    ) -> Tuple[BytesIO, str]:
        """Generate a certificate PDF.

        Args:
            user_name: User's full name.
            course_name: Course name.
            completion_date: Date of completion.
            certificate_id: Certificate ID.

        Returns:
            tuple: (BytesIO object with PDF, certificate ID).
        """
        if not certificate_id:
            certificate_id = generate_uuid()

        if not completion_date:
            completion_date = datetime.now().strftime("%B %d, %Y")

        # Create PDF in memory
        pdf_buffer = BytesIO()
        doc = SimpleDocTemplate(
            pdf_buffer,
            pagesize=letter,
            topMargin=1 * inch,
            bottomMargin=1 * inch,
            leftMargin=1 * inch,
            rightMargin=1 * inch,
        )

        # Define styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            "Title",
            parent=styles["Heading1"],
            fontSize=36,
            textColor=(0, 102, 153),
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName="Helvetica-Bold",
        )

        subtitle_style = ParagraphStyle(
            "Subtitle",
            parent=styles["Normal"],
            fontSize=18,
            textColor=(64, 64, 64),
            spaceAfter=20,
            alignment=TA_CENTER,
        )

        body_style = ParagraphStyle(
            "Body",
            parent=styles["Normal"],
            fontSize=14,
            textColor=(64, 64, 64),
            spaceAfter=12,
            alignment=TA_CENTER,
        )

        signature_style = ParagraphStyle(
            "Signature",
            parent=styles["Normal"],
            fontSize=11,
            textColor=(64, 64, 64),
            alignment=TA_CENTER,
        )

        # Build content
        content = []

        # Title
        content.append(Paragraph("CERTIFICATE OF COMPLETION", title_style))
        content.append(Spacer(1, 0.3 * inch))

        # Subtitle
        content.append(Paragraph("FinOps Training Platform", subtitle_style))
        content.append(Spacer(1, 0.3 * inch))

        # Body text
        content.append(
            Paragraph(
                f"This is to certify that<br/><b>{user_name}</b><br/>",
                body_style,
            )
        )
        content.append(Spacer(1, 0.2 * inch))

        content.append(
            Paragraph(
                f"has successfully completed the course<br/><b>{course_name}</b>",
                body_style,
            )
        )
        content.append(Spacer(1, 0.3 * inch))

        # Date
        content.append(Paragraph(f"Completed on: {completion_date}", body_style))
        content.append(Spacer(1, 0.3 * inch))

        # Certificate ID
        content.append(
            Paragraph(f"Certificate ID: {certificate_id}", signature_style)
        )
        content.append(Spacer(1, 0.5 * inch))

        # Signature lines
        content.append(Spacer(1, 0.3 * inch))
        content.append(
            Paragraph("_______________________________", signature_style)
        )
        content.append(Paragraph("FinOps Training Team", signature_style))

        # Footer
        content.append(Spacer(1, 0.5 * inch))
        footer_style = ParagraphStyle(
            "Footer",
            parent=styles["Normal"],
            fontSize=9,
            textColor=(128, 128, 128),
            alignment=TA_CENTER,
        )
        content.append(
            Paragraph(
                "This certificate verifies the successful completion of the "
                "FinOps training course.",
                footer_style,
            )
        )

        # Build PDF
        doc.build(content)
        pdf_buffer.seek(0)

        return pdf_buffer, certificate_id

    def create_certificate_metadata(
        self,
        user_id: str,
        course_id: str,
        course_name: str,
        user_name: str,
        completion_date: str,
        certificate_id: Optional[str] = None,
    ) -> dict:
        """Create certificate metadata record.

        Args:
            user_id: User ID.
            course_id: Course ID.
            course_name: Course name.
            user_name: User's full name.
            completion_date: Completion date.
            certificate_id: Certificate ID.

        Returns:
            dict: Certificate metadata.
        """
        if not certificate_id:
            certificate_id = generate_uuid()

        return {
            "certificate_id": certificate_id,
            "user_id": user_id,
            "course_id": course_id,
            "course_name": course_name,
            "user_name": user_name,
            "completion_date": completion_date,
            "issued_date": get_current_timestamp(),
            "status": "active",
        }
