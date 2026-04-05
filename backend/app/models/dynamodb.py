"""DynamoDB models and operations."""

from typing import List, Dict, Any, Optional
import boto3
from botocore.exceptions import ClientError
from app.config import settings
from app.utils.helpers import generate_uuid, get_current_timestamp


class DynamoDBTable:
    """Wrapper class for DynamoDB table operations."""

    def __init__(self, table_name: str):
        """Initialize DynamoDB table wrapper.

        Args:
            table_name: Name of the DynamoDB table.
        """
        self.dynamodb = boto3.resource(
            "dynamodb",
            region_name=settings.aws_region,
            aws_access_key_id=settings.aws_access_key_id,
            aws_secret_access_key=settings.aws_secret_access_key,
        )
        self.table = self.dynamodb.Table(table_name)
        self.table_name = table_name

    def put_item(self, item: Dict[str, Any]) -> bool:
        """Put item into table.

        Args:
            item: Item to put.

        Returns:
            bool: True if successful.

        Raises:
            ClientError: If DynamoDB operation fails.
        """
        try:
            self.table.put_item(Item=item)
            return True
        except ClientError as e:
            raise Exception(f"Failed to put item in {self.table_name}: {str(e)}")

    def get_item(self, key: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Get item from table by key.

        Args:
            key: Primary key of the item.

        Returns:
            dict: Item if found, None otherwise.

        Raises:
            ClientError: If DynamoDB operation fails.
        """
        try:
            response = self.table.get_item(Key=key)
            return response.get("Item")
        except ClientError as e:
            raise Exception(f"Failed to get item from {self.table_name}: {str(e)}")

    def update_item(
        self,
        key: Dict[str, Any],
        update_expression: str,
        expression_attribute_values: Dict[str, Any],
        expression_attribute_names: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        """Update item in table.

        Args:
            key: Primary key of the item.
            update_expression: DynamoDB update expression.
            expression_attribute_values: Values for expression.
            expression_attribute_names: Names for expression.

        Returns:
            dict: Updated item.

        Raises:
            ClientError: If DynamoDB operation fails.
        """
        try:
            kwargs = {
                "Key": key,
                "UpdateExpression": update_expression,
                "ExpressionAttributeValues": expression_attribute_values,
                "ReturnValues": "ALL_NEW",
            }
            if expression_attribute_names:
                kwargs["ExpressionAttributeNames"] = expression_attribute_names

            response = self.table.update_item(**kwargs)
            return response.get("Attributes", {})
        except ClientError as e:
            raise Exception(f"Failed to update item in {self.table_name}: {str(e)}")

    def delete_item(self, key: Dict[str, Any]) -> bool:
        """Delete item from table.

        Args:
            key: Primary key of the item.

        Returns:
            bool: True if successful.

        Raises:
            ClientError: If DynamoDB operation fails.
        """
        try:
            self.table.delete_item(Key=key)
            return True
        except ClientError as e:
            raise Exception(f"Failed to delete item from {self.table_name}: {str(e)}")

    def scan(
        self,
        filter_expression: Optional[Any] = None,
        expression_attribute_values: Optional[Dict[str, Any]] = None,
    ) -> List[Dict[str, Any]]:
        """Scan table with optional filter.

        Args:
            filter_expression: Filter expression.
            expression_attribute_values: Values for expression.

        Returns:
            list: Items matching the scan.

        Raises:
            ClientError: If DynamoDB operation fails.
        """
        try:
            kwargs = {}
            if filter_expression:
                kwargs["FilterExpression"] = filter_expression
            if expression_attribute_values:
                kwargs["ExpressionAttributeValues"] = expression_attribute_values

            items = []
            response = self.table.scan(**kwargs)
            items.extend(response.get("Items", []))

            while "LastEvaluatedKey" in response:
                kwargs["ExclusiveStartKey"] = response["LastEvaluatedKey"]
                response = self.table.scan(**kwargs)
                items.extend(response.get("Items", []))

            return items
        except ClientError as e:
            raise Exception(f"Failed to scan {self.table_name}: {str(e)}")

    def query(
        self,
        key_condition_expression: Any,
        expression_attribute_values: Dict[str, Any],
        expression_attribute_names: Optional[Dict[str, str]] = None,
        index_name: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Query table with key condition.

        Args:
            key_condition_expression: Key condition expression.
            expression_attribute_values: Values for expression.
            expression_attribute_names: Names for expression.
            index_name: Optional GSI name.

        Returns:
            list: Items matching the query.

        Raises:
            ClientError: If DynamoDB operation fails.
        """
        try:
            kwargs = {
                "KeyConditionExpression": key_condition_expression,
                "ExpressionAttributeValues": expression_attribute_values,
            }
            if expression_attribute_names:
                kwargs["ExpressionAttributeNames"] = expression_attribute_names
            if index_name:
                kwargs["IndexName"] = index_name

            items = []
            response = self.table.query(**kwargs)
            items.extend(response.get("Items", []))

            while "LastEvaluatedKey" in response:
                kwargs["ExclusiveStartKey"] = response["LastEvaluatedKey"]
                response = self.table.query(**kwargs)
                items.extend(response.get("Items", []))

            return items
        except ClientError as e:
            raise Exception(f"Failed to query {self.table_name}: {str(e)}")

    def batch_get_items(self, keys: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Batch get items from table.

        Args:
            keys: List of primary keys.

        Returns:
            list: Items found.

        Raises:
            ClientError: If DynamoDB operation fails.
        """
        try:
            items = []
            for key in keys:
                item = self.get_item(key)
                if item:
                    items.append(item)
            return items
        except ClientError as e:
            raise Exception(
                f"Failed to batch get items from {self.table_name}: {str(e)}"
            )

    def batch_write_items(self, items: List[Dict[str, Any]]) -> bool:
        """Batch write items to table.

        Args:
            items: List of items to write.

        Returns:
            bool: True if successful.

        Raises:
            ClientError: If DynamoDB operation fails.
        """
        try:
            with self.table.batch_writer(
                batch_size=25,
                overwrite_by_pkeys=["pk", "sk"],
            ) as batch:
                for item in items:
                    batch.put_item(Item=item)
            return True
        except ClientError as e:
            raise Exception(
                f"Failed to batch write items to {self.table_name}: {str(e)}"
            )


class CoursesTable(DynamoDBTable):
    """Wrapper for courses table."""

    def __init__(self):
        """Initialize courses table."""
        super().__init__(settings.dynamodb_courses_table)

    def create_course(
        self,
        name: str,
        description: str,
        category: str,
        difficulty: str,
        instructor_id: str,
    ) -> Dict[str, Any]:
        """Create new course.

        Args:
            name: Course name.
            description: Course description.
            category: Course category.
            difficulty: Difficulty level.
            instructor_id: Instructor ID.

        Returns:
            dict: Created course.
        """
        course_id = generate_uuid()
        course = {
            "pk": f"COURSE#{course_id}",
            "sk": "METADATA",
            "course_id": course_id,
            "name": name,
            "description": description,
            "category": category,
            "difficulty": difficulty,
            "instructor_id": instructor_id,
            "created_at": get_current_timestamp(),
            "updated_at": get_current_timestamp(),
            "status": "active",
        }
        self.put_item(course)
        return course

    def get_course(self, course_id: str) -> Optional[Dict[str, Any]]:
        """Get course by ID.

        Args:
            course_id: Course ID.

        Returns:
            dict: Course if found, None otherwise.
        """
        return self.get_item({"pk": f"COURSE#{course_id}", "sk": "METADATA"})

    def list_courses(self) -> List[Dict[str, Any]]:
        """List all courses.

        Returns:
            list: All courses.
        """
        from boto3.dynamodb.conditions import Key

        results = []
        response = self.table.scan()
        for item in response.get("Items", []):
            if item.get("sk") == "METADATA":
                results.append(item)

        while "LastEvaluatedKey" in response:
            response = self.table.scan(ExclusiveStartKey=response["LastEvaluatedKey"])
            for item in response.get("Items", []):
                if item.get("sk") == "METADATA":
                    results.append(item)

        return results

    def add_tier(
        self,
        course_id: str,
        tier_name: str,
        price_usd: float,
        price_inr: float,
    ) -> Dict[str, Any]:
        """Add tier to course.

        Args:
            course_id: Course ID.
            tier_name: Tier name.
            price_usd: Price in USD.
            price_inr: Price in INR.

        Returns:
            dict: Tier data.
        """
        tier = {
            "pk": f"COURSE#{course_id}",
            "sk": f"TIER#{tier_name}",
            "tier_name": tier_name,
            "price_usd": price_usd,
            "price_inr": price_inr,
            "created_at": get_current_timestamp(),
        }
        self.put_item(tier)
        return tier

    def get_tiers(self, course_id: str) -> List[Dict[str, Any]]:
        """Get all tiers for a course.

        Args:
            course_id: Course ID.

        Returns:
            list: Course tiers.
        """
        from boto3.dynamodb.conditions import Key

        response = self.table.query(
            KeyConditionExpression=Key("pk").eq(f"COURSE#{course_id}")
            & Key("sk").begins_with("TIER#")
        )
        return response.get("Items", [])

    def add_module(
        self,
        course_id: str,
        module_name: str,
        description: str,
        order: int,
    ) -> Dict[str, Any]:
        """Add module to course.

        Args:
            course_id: Course ID.
            module_name: Module name.
            description: Module description.
            order: Module order.

        Returns:
            dict: Module data.
        """
        module_id = generate_uuid()
        module = {
            "pk": f"COURSE#{course_id}",
            "sk": f"MODULE#{module_id}",
            "module_id": module_id,
            "module_name": module_name,
            "description": description,
            "order": order,
            "created_at": get_current_timestamp(),
        }
        self.put_item(module)
        return module

    def get_modules(self, course_id: str) -> List[Dict[str, Any]]:
        """Get all modules for a course.

        Args:
            course_id: Course ID.

        Returns:
            list: Course modules.
        """
        from boto3.dynamodb.conditions import Key

        response = self.table.query(
            KeyConditionExpression=Key("pk").eq(f"COURSE#{course_id}")
            & Key("sk").begins_with("MODULE#")
        )
        modules = response.get("Items", [])
        return sorted(modules, key=lambda x: x.get("order", 0))


class EnrollmentsTable(DynamoDBTable):
    """Wrapper for enrollments table."""

    def __init__(self):
        """Initialize enrollments table."""
        super().__init__(settings.dynamodb_enrollments_table)

    def create_enrollment(
        self,
        user_id: str,
        course_id: str,
        tier_name: str,
    ) -> Dict[str, Any]:
        """Create enrollment.

        Args:
            user_id: User ID.
            course_id: Course ID.
            tier_name: Tier name.

        Returns:
            dict: Enrollment.
        """
        enrollment_id = generate_uuid()
        enrollment = {
            "pk": f"USER#{user_id}",
            "sk": f"ENROLLMENT#{course_id}",
            "enrollment_id": enrollment_id,
            "user_id": user_id,
            "course_id": course_id,
            "tier_name": tier_name,
            "status": "active",
            "enrolled_at": get_current_timestamp(),
            "updated_at": get_current_timestamp(),
        }
        self.put_item(enrollment)
        return enrollment

    def get_enrollment(
        self,
        user_id: str,
        course_id: str,
    ) -> Optional[Dict[str, Any]]:
        """Get enrollment.

        Args:
            user_id: User ID.
            course_id: Course ID.

        Returns:
            dict: Enrollment if found, None otherwise.
        """
        return self.get_item({"pk": f"USER#{user_id}", "sk": f"ENROLLMENT#{course_id}"})

    def get_user_enrollments(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all enrollments for a user.

        Args:
            user_id: User ID.

        Returns:
            list: User enrollments.
        """
        from boto3.dynamodb.conditions import Key

        response = self.table.query(
            KeyConditionExpression=Key("pk").eq(f"USER#{user_id}")
            & Key("sk").begins_with("ENROLLMENT#")
        )
        return response.get("Items", [])


class ProgressTable(DynamoDBTable):
    """Wrapper for progress table."""

    def __init__(self):
        """Initialize progress table."""
        super().__init__(settings.dynamodb_progress_table)

    def mark_lesson_complete(
        self,
        user_id: str,
        lesson_id: str,
        time_spent_minutes: int,
    ) -> Dict[str, Any]:
        """Mark lesson as complete.

        Args:
            user_id: User ID.
            lesson_id: Lesson ID.
            time_spent_minutes: Time spent in minutes.

        Returns:
            dict: Progress entry.
        """
        progress = {
            "pk": f"USER#{user_id}",
            "sk": f"LESSON#{lesson_id}",
            "user_id": user_id,
            "lesson_id": lesson_id,
            "completed_at": get_current_timestamp(),
            "time_spent_minutes": time_spent_minutes,
            "status": "completed",
        }
        self.put_item(progress)
        return progress

    def get_lesson_progress(
        self,
        user_id: str,
        lesson_id: str,
    ) -> Optional[Dict[str, Any]]:
        """Get lesson progress.

        Args:
            user_id: User ID.
            lesson_id: Lesson ID.

        Returns:
            dict: Progress if found, None otherwise.
        """
        return self.get_item({"pk": f"USER#{user_id}", "sk": f"LESSON#{lesson_id}"})

    def get_course_progress(
        self,
        user_id: str,
        course_id: str,
    ) -> List[Dict[str, Any]]:
        """Get all progress for a course.

        Args:
            user_id: User ID.
            course_id: Course ID.

        Returns:
            list: Course progress.
        """
        from boto3.dynamodb.conditions import Key

        response = self.table.query(
            KeyConditionExpression=Key("pk").eq(f"USER#{user_id}")
            & Key("sk").begins_with("LESSON#")
        )
        return response.get("Items", [])


class UsersTable(DynamoDBTable):
    """Wrapper for users table."""

    def __init__(self):
        """Initialize users table."""
        super().__init__(settings.dynamodb_users_table)

    def create_user(
        self,
        user_id: str,
        email: str,
        name: str,
        role: str = "student",
    ) -> Dict[str, Any]:
        """Create new user.

        Args:
            user_id: User ID from Cognito.
            email: User email.
            name: User name.
            role: User role (student/admin/client).

        Returns:
            dict: Created user.
        """
        user = {
            "pk": f"USER#{user_id}",
            "sk": "PROFILE",
            "user_id": user_id,
            "email": email,
            "name": name,
            "role": role,
            "status": "active",
            "created_at": get_current_timestamp(),
            "updated_at": get_current_timestamp(),
        }
        self.put_item(user)
        return user

    def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID.

        Args:
            user_id: User ID.

        Returns:
            dict: User if found, None otherwise.
        """
        return self.get_item({"pk": f"USER#{user_id}", "sk": "PROFILE"})

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email using GSI.

        Args:
            email: User email.

        Returns:
            dict: User if found, None otherwise.
        """
        from boto3.dynamodb.conditions import Key

        response = self.table.query(
            IndexName="email-index",
            KeyConditionExpression=Key("email").eq(email),
        )
        items = response.get("Items", [])
        return items[0] if items else None

    def update_user(
        self,
        user_id: str,
        updates: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Update user profile.

        Args:
            user_id: User ID.
            updates: Fields to update.

        Returns:
            dict: Updated user.
        """
        update_parts = []
        values = {}
        names = {}

        for idx, (key, value) in enumerate(updates.items()):
            attr_name = f"#attr{idx}"
            attr_val = f":val{idx}"
            update_parts.append(f"{attr_name} = {attr_val}")
            values[attr_val] = value
            names[attr_name] = key

        update_parts.append("#updated = :ts")
        values[":ts"] = get_current_timestamp()
        names["#updated"] = "updated_at"

        return self.update_item(
            key={"pk": f"USER#{user_id}", "sk": "PROFILE"},
            update_expression="SET " + ", ".join(update_parts),
            expression_attribute_values=values,
            expression_attribute_names=names,
        )

    def list_users(self, role: Optional[str] = None) -> List[Dict[str, Any]]:
        """List all users, optionally filtered by role.

        Args:
            role: Optional role filter.

        Returns:
            list: Users.
        """
        items = self.scan()
        users = [item for item in items if item.get("sk") == "PROFILE"]
        if role:
            users = [u for u in users if u.get("role") == role]
        return users


class PaymentsTable(DynamoDBTable):
    """Wrapper for payments table."""

    def __init__(self):
        """Initialize payments table."""
        super().__init__(settings.dynamodb_payments_table)

    def create_payment(
        self,
        user_id: str,
        course_id: str,
        tier_name: str,
        amount: float,
        currency: str,
        razorpay_order_id: str,
    ) -> Dict[str, Any]:
        """Create payment record.

        Args:
            user_id: User ID.
            course_id: Course ID.
            tier_name: Tier name.
            amount: Payment amount.
            currency: Currency code.
            razorpay_order_id: Razorpay order ID.

        Returns:
            dict: Payment record.
        """
        payment_id = generate_uuid()
        payment = {
            "pk": f"PAYMENT#{payment_id}",
            "sk": f"USER#{user_id}",
            "payment_id": payment_id,
            "user_id": user_id,
            "course_id": course_id,
            "tier_name": tier_name,
            "amount": str(amount),
            "currency": currency,
            "razorpay_order_id": razorpay_order_id,
            "status": "created",
            "created_at": get_current_timestamp(),
            "updated_at": get_current_timestamp(),
        }
        self.put_item(payment)
        return payment

    def get_payment(self, payment_id: str) -> Optional[Dict[str, Any]]:
        """Get payment by ID.

        Args:
            payment_id: Payment ID.

        Returns:
            dict: Payment if found, None otherwise.
        """
        items = self.scan()
        for item in items:
            if item.get("payment_id") == payment_id:
                return item
        return None

    def get_payment_by_order_id(
        self, razorpay_order_id: str
    ) -> Optional[Dict[str, Any]]:
        """Get payment by Razorpay order ID.

        Args:
            razorpay_order_id: Razorpay order ID.

        Returns:
            dict: Payment if found, None otherwise.
        """
        items = self.scan()
        for item in items:
            if item.get("razorpay_order_id") == razorpay_order_id:
                return item
        return None

    def update_payment_status(
        self,
        payment_id: str,
        user_id: str,
        status: str,
        razorpay_payment_id: Optional[str] = None,
        razorpay_signature: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Update payment status.

        Args:
            payment_id: Payment ID.
            user_id: User ID.
            status: New status.
            razorpay_payment_id: Razorpay payment ID.
            razorpay_signature: Razorpay signature.

        Returns:
            dict: Updated payment.
        """
        update_expr = "SET #status = :status, #updated = :ts"
        values = {
            ":status": status,
            ":ts": get_current_timestamp(),
        }
        names = {
            "#status": "status",
            "#updated": "updated_at",
        }

        if razorpay_payment_id:
            update_expr += ", razorpay_payment_id = :rpid"
            values[":rpid"] = razorpay_payment_id

        if razorpay_signature:
            update_expr += ", razorpay_signature = :rsig"
            values[":rsig"] = razorpay_signature

        return self.update_item(
            key={"pk": f"PAYMENT#{payment_id}", "sk": f"USER#{user_id}"},
            update_expression=update_expr,
            expression_attribute_values=values,
            expression_attribute_names=names,
        )

    def get_user_payments(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all payments for a user.

        Args:
            user_id: User ID.

        Returns:
            list: User payments.
        """
        items = self.scan()
        return [item for item in items if item.get("sk") == f"USER#{user_id}"]


class MentorshipSessionsTable(DynamoDBTable):
    """Wrapper for mentorship sessions table."""

    def __init__(self):
        """Initialize mentorship sessions table."""
        super().__init__(settings.dynamodb_mentorship_table)

    def create_session(
        self,
        user_id: str,
        course_id: str,
        session_type: str,
        scheduled_time: str,
        notes: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Create mentorship session.

        Args:
            user_id: Student user ID.
            course_id: Course ID.
            session_type: Type (mock_interview/mentorship/placement).
            scheduled_time: ISO 8601 timestamp.
            notes: Optional notes.

        Returns:
            dict: Created session.
        """
        session_id = generate_uuid()
        session = {
            "pk": f"SESSION#{session_id}",
            "sk": f"USER#{user_id}",
            "session_id": session_id,
            "user_id": user_id,
            "course_id": course_id,
            "session_type": session_type,
            "scheduled_time": scheduled_time,
            "status": "scheduled",
            "mentor_id": None,
            "notes": notes or "",
            "created_at": get_current_timestamp(),
            "updated_at": get_current_timestamp(),
        }
        self.put_item(session)
        return session

    def get_session(self, session_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get session by ID.

        Args:
            session_id: Session ID.
            user_id: User ID.

        Returns:
            dict: Session if found, None otherwise.
        """
        return self.get_item({"pk": f"SESSION#{session_id}", "sk": f"USER#{user_id}"})

    def get_user_sessions(
        self,
        user_id: str,
        session_type: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Get all sessions for a user.

        Args:
            user_id: User ID.
            session_type: Optional type filter.

        Returns:
            list: User sessions.
        """
        items = self.scan()
        sessions = [item for item in items if item.get("sk") == f"USER#{user_id}"]
        if session_type:
            sessions = [s for s in sessions if s.get("session_type") == session_type]
        return sorted(sessions, key=lambda x: x.get("scheduled_time", ""), reverse=True)

    def assign_mentor(
        self,
        session_id: str,
        user_id: str,
        mentor_id: str,
    ) -> Dict[str, Any]:
        """Assign mentor to session.

        Args:
            session_id: Session ID.
            user_id: Student user ID.
            mentor_id: Mentor user ID.

        Returns:
            dict: Updated session.
        """
        return self.update_item(
            key={"pk": f"SESSION#{session_id}", "sk": f"USER#{user_id}"},
            update_expression="SET mentor_id = :mid, #status = :status, #updated = :ts",
            expression_attribute_values={
                ":mid": mentor_id,
                ":status": "mentor_assigned",
                ":ts": get_current_timestamp(),
            },
            expression_attribute_names={
                "#status": "status",
                "#updated": "updated_at",
            },
        )

    def update_session_status(
        self,
        session_id: str,
        user_id: str,
        status: str,
    ) -> Dict[str, Any]:
        """Update session status.

        Args:
            session_id: Session ID.
            user_id: User ID.
            status: New status.

        Returns:
            dict: Updated session.
        """
        return self.update_item(
            key={"pk": f"SESSION#{session_id}", "sk": f"USER#{user_id}"},
            update_expression="SET #status = :status, #updated = :ts",
            expression_attribute_values={
                ":status": status,
                ":ts": get_current_timestamp(),
            },
            expression_attribute_names={
                "#status": "status",
                "#updated": "updated_at",
            },
        )

    def get_all_sessions(
        self,
        session_type: Optional[str] = None,
        status: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Get all sessions (admin).

        Args:
            session_type: Optional type filter.
            status: Optional status filter.

        Returns:
            list: All sessions.
        """
        items = self.scan()
        sessions = [item for item in items if item.get("session_id")]
        if session_type:
            sessions = [s for s in sessions if s.get("session_type") == session_type]
        if status:
            sessions = [s for s in sessions if s.get("status") == status]
        return sorted(sessions, key=lambda x: x.get("scheduled_time", ""), reverse=True)

    def get_mentor_sessions(self, mentor_id: str) -> List[Dict[str, Any]]:
        """Get sessions assigned to a mentor.

        Args:
            mentor_id: Mentor ID.

        Returns:
            list: Mentor's sessions.
        """
        items = self.scan()
        return [item for item in items if item.get("mentor_id") == mentor_id]


class ServiceLeadsTable(DynamoDBTable):
    """Wrapper for service leads table."""

    def __init__(self):
        """Initialize service leads table."""
        super().__init__(settings.dynamodb_leads_table)

    def create_lead(
        self,
        name: str,
        email: str,
        company: str,
        cloud_spend: str,
        requirement: str,
        phone: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Create service lead.

        Args:
            name: Contact name.
            email: Contact email.
            company: Company name.
            cloud_spend: Monthly cloud spend.
            requirement: Requirements description.
            phone: Optional phone number.

        Returns:
            dict: Created lead.
        """
        lead_id = generate_uuid()
        lead = {
            "pk": f"LEAD#{lead_id}",
            "sk": "METADATA",
            "lead_id": lead_id,
            "name": name,
            "email": email,
            "company": company,
            "cloud_spend": cloud_spend,
            "requirement": requirement,
            "phone": phone or "",
            "status": "new",
            "created_at": get_current_timestamp(),
            "updated_at": get_current_timestamp(),
        }
        self.put_item(lead)
        return lead

    def get_lead(self, lead_id: str) -> Optional[Dict[str, Any]]:
        """Get lead by ID.

        Args:
            lead_id: Lead ID.

        Returns:
            dict: Lead if found, None otherwise.
        """
        return self.get_item({"pk": f"LEAD#{lead_id}", "sk": "METADATA"})

    def list_leads(
        self,
        status: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """List all leads.

        Args:
            status: Optional status filter.

        Returns:
            list: Leads.
        """
        items = self.scan()
        leads = [item for item in items if item.get("sk") == "METADATA"]
        if status:
            leads = [l for l in leads if l.get("status") == status]
        return sorted(leads, key=lambda x: x.get("created_at", ""), reverse=True)

    def update_lead_status(
        self,
        lead_id: str,
        status: str,
        notes: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Update lead status.

        Args:
            lead_id: Lead ID.
            status: New status (new/contacted/qualified/proposal/closed_won/closed_lost).
            notes: Optional notes.

        Returns:
            dict: Updated lead.
        """
        update_expr = "SET #status = :status, #updated = :ts"
        values = {
            ":status": status,
            ":ts": get_current_timestamp(),
        }
        names = {
            "#status": "status",
            "#updated": "updated_at",
        }

        if notes:
            update_expr += ", notes = :notes"
            values[":notes"] = notes

        return self.update_item(
            key={"pk": f"LEAD#{lead_id}", "sk": "METADATA"},
            update_expression=update_expr,
            expression_attribute_values=values,
            expression_attribute_names=names,
        )


class LessonsTable(DynamoDBTable):
    """Wrapper for lessons table."""

    def __init__(self):
        """Initialize lessons table."""
        super().__init__(
            settings.dynamodb_lessons_table
            if hasattr(settings, "dynamodb_lessons_table")
            else "finops-saas-lessons"
        )

    def create_lesson(
        self,
        module_id: str,
        title: str,
        lesson_type: str,
        content_url: str,
        duration_minutes: int,
        order: int,
        description: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Create lesson.

        Args:
            module_id: Module ID.
            title: Lesson title.
            lesson_type: Type (video/lab/mock_interview/placement_session).
            content_url: S3 key for content.
            duration_minutes: Duration in minutes.
            order: Lesson order.
            description: Optional description.

        Returns:
            dict: Created lesson.
        """
        lesson_id = generate_uuid()
        lesson = {
            "pk": f"MODULE#{module_id}",
            "sk": f"LESSON#{lesson_id}",
            "lesson_id": lesson_id,
            "module_id": module_id,
            "title": title,
            "lesson_type": lesson_type,
            "content_url": content_url,
            "duration_minutes": duration_minutes,
            "order": order,
            "description": description or "",
            "created_at": get_current_timestamp(),
            "updated_at": get_current_timestamp(),
        }
        self.put_item(lesson)
        return lesson

    def get_lesson(self, module_id: str, lesson_id: str) -> Optional[Dict[str, Any]]:
        """Get lesson by ID.

        Args:
            module_id: Module ID.
            lesson_id: Lesson ID.

        Returns:
            dict: Lesson if found, None otherwise.
        """
        return self.get_item({"pk": f"MODULE#{module_id}", "sk": f"LESSON#{lesson_id}"})

    def get_module_lessons(self, module_id: str) -> List[Dict[str, Any]]:
        """Get all lessons for a module.

        Args:
            module_id: Module ID.

        Returns:
            list: Module lessons ordered by position.
        """
        from boto3.dynamodb.conditions import Key

        response = self.table.query(
            KeyConditionExpression=Key("pk").eq(f"MODULE#{module_id}")
            & Key("sk").begins_with("LESSON#")
        )
        lessons = response.get("Items", [])
        return sorted(lessons, key=lambda x: x.get("order", 0))

    def get_lessons_by_type(
        self,
        module_id: str,
        lesson_type: str,
    ) -> List[Dict[str, Any]]:
        """Get lessons of a specific type within a module.

        Args:
            module_id: Module ID.
            lesson_type: Lesson type to filter.

        Returns:
            list: Filtered lessons.
        """
        lessons = self.get_module_lessons(module_id)
        return [l for l in lessons if l.get("lesson_type") == lesson_type]

    def update_lesson_content(
        self,
        module_id: str,
        lesson_id: str,
        content_url: str,
    ) -> Dict[str, Any]:
        """Update lesson content URL.

        Args:
            module_id: Module ID.
            lesson_id: Lesson ID.
            content_url: New content S3 key.

        Returns:
            dict: Updated lesson.
        """
        return self.update_item(
            key={"pk": f"MODULE#{module_id}", "sk": f"LESSON#{lesson_id}"},
            update_expression="SET content_url = :url, #updated = :ts",
            expression_attribute_values={
                ":url": content_url,
                ":ts": get_current_timestamp(),
            },
            expression_attribute_names={
                "#updated": "updated_at",
            },
        )
