# FinOps Academy Frontend

A complete Next.js 14 frontend for the FinOps SaaS training platform. Features two course tiers (Ignite and Transformate), student dashboard, LMS learning interface, career support tools, and admin dashboard.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS 3.3
- **Language**: TypeScript
- **State Management**: React Context + Custom Hooks
- **Authentication**: AWS Cognito integration
- **Payments**: Razorpay integration
- **HTTP Client**: Axios

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Landing page
│   ├── globals.css              # Global styles
│   ├── auth/
│   │   ├── login/
│   │   ├── signup/
│   │   └── forgot-password/
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── courses/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       ├── page.tsx         # Course detail
│   │       └── learn/           # LMS pages
│   ├── career/
│   │   ├── page.tsx
│   │   ├── mock-interviews/
│   │   ├── resume/
│   │   ├── placements/
│   │   └── mentorship/
│   ├── services/
│   │   └── page.tsx
│   ├── payment/
│   │   ├── page.tsx
│   │   ├── success/
│   │   └── failure/
│   └── admin/
│       ├── layout.tsx
│       ├── page.tsx
│       ├── courses/
│       ├── leads/
│       ├── enrollments/
│       └── mentorship/
├── components/
│   ├── common/              # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Loading.tsx
│   │   └── Toast.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── dashboard/           # Dashboard components
│   │   ├── CourseCard.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── UpcomingSessions.tsx
│   │   └── StatsCards.tsx
│   ├── lms/                 # Learning Management System
│   │   ├── CoursePlayer.tsx
│   │   ├── LessonList.tsx
│   │   ├── TierBadge.tsx
│   │   └── TierGate.tsx
│   ├── career/
│   │   ├── MockInterviewScheduler.tsx
│   │   ├── ResumeUploader.tsx
│   │   ├── PlacementTracker.tsx
│   │   └── MentorBooking.tsx
│   ├── services/
│   │   ├── ServiceCard.tsx
│   │   └── LeadForm.tsx
│   └── admin/
│       ├── CourseForm.tsx
│       ├── LeadTable.tsx
│       ├── EnrollmentTable.tsx
│       └── LessonUploader.tsx
├── lib/
│   ├── api.ts              # API client configuration
│   ├── auth.ts             # Cognito auth helpers
│   ├── razorpay.ts         # Payment integration
│   ├── constants.ts        # App constants
│   └── theme.ts            # Design tokens
├── hooks/
│   ├── useAuth.ts
│   ├── useCourses.ts
│   └── useProgress.ts
├── store/
│   ├── AuthContext.tsx
│   └── CourseContext.tsx
├── styles/
│   └── theme.ts
└── types/
    └── [type definitions]
```

## Key Features

### Authentication
- Email/password signup and login
- Password reset flow
- Cognito integration for secure auth
- Protected routes for authenticated content
- Role-based access control (student, mentor, admin)

### Course Management
- Two tier options: Ignite and Transformate
- Structured modules and lessons
- Multiple content types: videos, labs, quizzes, readings
- Tier-specific content gating
- Progress tracking per lesson

### Learning Management System (LMS)
- Interactive course player
- Lesson sidebar with progress indicators
- Module organization
- Progress bars and completion tracking
- Tier gate for premium content

### Student Dashboard
- Enrolled courses overview
- Individual course progress
- Upcoming mentorship sessions
- Quick statistics
- Course recommendations

### Career Support (Transformate Tier)
- Mock interview scheduling
- Resume upload and review
- Placement tracking timeline
- Mentorship session booking
- Mentor directory with ratings

### Services & Lead Management
- Service offerings presentation
- Lead capture form
- Admin lead status tracking
- Service inquiry management

### Admin Dashboard
- Course management (CRUD)
- Student enrollment tracking
- Lead management
- Mentorship session coordination
- Analytics and statistics

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- AWS Cognito configured
- Razorpay account (for payments)

### Installation

```bash
# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Add your environment variables
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_COGNITO_REGION=us-east-1
NEXT_PUBLIC_COGNITO_CLIENT_ID=your_cognito_client_id
NEXT_PUBLIC_COGNITO_USER_POOL_ID=your_user_pool_id
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
```

### Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

### Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Component Architecture

### Common Components
- **Button**: Flexible button component with variants and states
- **Input**: Form input with error handling
- **Card**: Reusable card container
- **Modal**: Dialog component with backdrop
- **Loading**: Loading spinner and full-page loader
- **Toast**: Notification component

### Form Handling
All forms include:
- Client-side validation
- Error display
- Loading states
- Success feedback

### Responsive Design
- Mobile-first approach
- Tailwind CSS breakpoints
- Sidebar navigation on desktop
- Mobile hamburger menu
- Touch-friendly interfaces

## API Integration

The app uses Axios with interceptors for:
- Auth token injection
- Error handling
- 401 redirect on auth failure
- Request/response transformation

### API Endpoints

**Auth**
- `POST /auth/login`
- `POST /auth/signup`
- `POST /auth/logout`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

**Courses**
- `GET /courses`
- `GET /courses/:id`
- `GET /courses/enrolled`
- `POST /courses/:id/enroll`
- `GET /courses/:id/progress`
- `PATCH /courses/:id/progress`

**Admin**
- `POST /admin/courses`
- `PUT /admin/courses/:id`
- `DELETE /admin/courses/:id`
- `GET /admin/leads`
- `GET /admin/enrollments`
- `GET /admin/mentorship-sessions`

**Services**
- `POST /services/leads`

## State Management

### AuthContext
- User authentication state
- Login/signup functions
- Auth token management
- Role-based access

### CourseContext
- Courses catalog
- Enrolled courses
- Enrollment function
- Course loading state

### Hooks
- `useAuth()`: Authentication state and functions
- `useCourses()`: Course data and operations
- `useProgress()`: Lesson progress tracking

## Styling

### Design System
- Primary color: Indigo/Blue (`#5b7afc`)
- Secondary color: Slate gray
- Success: Green
- Warning: Yellow
- Error: Red

### Tailwind Configuration
- Custom color palette
- Extended spacing
- Custom animations
- Form styling plugin
- Responsive typography

## Authentication Flow

1. User signs up or logs in
2. Cognito authentication
3. Token stored in localStorage
4. Token sent with API requests
5. 401 redirects to login
6. Logout clears token and user data

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables for Production
- `NEXT_PUBLIC_API_URL`: Production API endpoint
- `NEXT_PUBLIC_COGNITO_*`: Cognito credentials
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`: Payment key

## Performance Optimizations

- Server-side rendering where applicable
- Image optimization
- Code splitting via dynamic imports
- Lazy loading of components
- Efficient state management
- Minimal re-renders

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Contributing

1. Create a feature branch
2. Implement changes with TypeScript
3. Test thoroughly
4. Submit PR with description

## License

Proprietary - FinOps Academy

## Support

For issues or questions, contact the development team.
