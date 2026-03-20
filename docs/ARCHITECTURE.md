# 🏗️ System Architecture

## AI-Based Student Dropout Prediction and Counseling System

---

## 📐 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            CLIENT LAYER                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐     │
│  │  Teacher Portal  │  │  Student Portal  │  │ Counselor Portal │     │
│  │   (React + TS)   │  │   (React + TS)   │  │   (React + TS)   │     │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘     │
│           └─────────────────────┴──────────────────────┘                │
│                                 │                                        │
│                         ┌───────▼───────┐                               │
│                         │  Socket.io    │                               │
│                         │  Connection   │                               │
│                         └───────┬───────┘                               │
└─────────────────────────────────┼───────────────────────────────────────┘
                                  │ HTTPS / WSS
┌─────────────────────────────────▼───────────────────────────────────────┐
│                         APPLICATION LAYER                                │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────┐     │
│  │                    Express.js Server                            │     │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐  │     │
│  │  │   Routes   │  │Controllers │  │      Middleware         │  │     │
│  │  │ auth       │  │ auth       │  │ authMiddleware (JWT)    │  │     │
│  │  │ students   │  │ student    │  │ roleMiddleware (RBAC)   │  │     │
│  │  │ predict    │  │ prediction │  │ errorHandler            │  │     │
│  │  │ counseling │  │ counseling │  └────────────────────────┘  │     │
│  │  │ notify     │  │ notify     │                               │     │
│  │  │ behavioural│  │ behavioural│                               │     │
│  │  └────────────┘  └─────┬──────┘                               │     │
│  │                        │                                        │     │
│  │        ┌───────────────▼───────────────┐                       │     │
│  │        │         Services / Utils      │                       │     │
│  │        │  mlPredictionService.js       │                       │     │
│  │        │  csvUploadService.js          │                       │     │
│  │        │  twilioService.js             │                       │     │
│  │        │  helpers.js (risk engine)     │                       │     │
│  │        │  csvParser.js                 │                       │     │
│  │        └───────────────┬───────────────┘                       │     │
│  └────────────────────────┼────────────────────────────────────────┘     │
│                           │                                               │
│           ┌───────────────┼───────────────┐                              │
│           │               │               │                              │
│  ┌────────▼────────┐ ┌───▼───────┐ ┌────▼──────────┐                   │
│  │   Socket.io     │ │  Twilio   │ │  ML Service   │                   │
│  │   Real-time     │ │    SMS    │ │ (Python API)  │                   │
│  │  Notifications  │ │  Gateway  │ │  + Fallback   │                   │
│  └─────────────────┘ └───────────┘ └───────────────┘                   │
└─────────────────────────────────────┬─────────────────────────────────┘
                                      │
┌─────────────────────────────────────▼─────────────────────────────────┐
│                           DATA LAYER                                   │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                     MongoDB Database                             │  │
│  │  ┌────────┐  ┌──────────┐  ┌────────────┐  ┌────────────────┐  │  │
│  │  │ Users  │  │ Students │  │Predictions │  │   Counseling   │  │  │
│  │  │+expert.│  │+19 fields│  │+riskFactors│  │   +notes[]     │  │  │
│  │  └────────┘  └──────────┘  │+counselorT.│  └────────────────┘  │  │
│  │                             └────────────┘                       │  │
│  │  ┌──────────────────┐  ┌──────────────────┐                     │  │
│  │  │  Notifications   │  │BehaviouralFeedback│                    │  │
│  │  └──────────────────┘  └──────────────────┘                     │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Component Architecture

### Frontend (React + TypeScript)

```
src/
├── components/
│   ├── AppSidebar.tsx          # Role-aware navigation sidebar
│   ├── DashboardLayout.tsx     # Shared layout wrapper
│   ├── RiskBadge.tsx           # Colour-coded risk level badge
│   ├── StatCard.tsx            # Dashboard metric card
│   ├── TopNavbar.tsx           # Top navigation bar
│   ├── ProtectedRoute.tsx      # Auth + role guard
│   └── ui/                     # Shadcn UI primitives
│
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx    # Expertise selector for counselors
│   ├── teacher/
│   │   ├── TeacherDashboard.tsx        # Risk distribution + high-risk list with factors
│   │   ├── StudentListPage.tsx         # Table with risk factors, counselorType, assign dialog
│   │   ├── AddStudentPage.tsx          # 4-section form (Academic/Financial/Behavioural/Medical)
│   │   ├── RunPredictionPage.tsx       # Categorised factor breakdown + counselor type badge
│   │   ├── UploadDatasetPage.tsx       # CSV upload with updated format guide
│   │   ├── BehaviouralFeedbackPage.tsx
│   │   └── StudentScoreHistoryPage.tsx
│   ├── counselor/
│   │   ├── CounselorDashboard.tsx
│   │   ├── CounselingSessionPage.tsx
│   │   └── AssignedStudentsPage.tsx
│   └── student/
│       └── StudentDashboard.tsx
│
├── contexts/
│   ├── AuthContext.tsx          # register() accepts expertise param
│   └── DataContext.tsx          # mapStudent() maps all 19 fields + counselorType
│
├── lib/
│   └── api.ts                   # StudentData + PredictionResult include new fields
│
└── utils/
    └── constants.ts             # Student interface includes all new fields
```

### Backend (Node.js + Express)

```
backend/src/
├── controllers/
│   ├── authController.js        # register() accepts expertise; getCounselors() returns it
│   ├── studentController.js     # addStudent() handles all 19 fields; uploadCSV updated
│   ├── predictionController.js  # saves riskFactors + counselorType; smart auto-assign
│   ├── counselingController.js
│   ├── notificationController.js
│   └── behaviouralFeedbackController.js
│
├── models/
│   ├── User.js                  # + expertise: enum[academic,financial,behavioral,medical,general]
│   ├── Student.js               # + 9 new fields (financial/behavioural/medical) + counselorType
│   ├── Prediction.js            # + riskFactors[], counselorType
│   ├── Counseling.js
│   ├── Notification.js
│   └── BehaviouralFeedback.js
│
├── services/
│   ├── mlPredictionService.js   # passes all 19 fields; returns riskFactors + counselorType
│   ├── csvUploadService.js      # multer config
│   └── twilioService.js
│
├── utils/
│   ├── helpers.js               # calculateRiskScore() + getRiskFactors() (4-category engine)
│   ├── csvParser.js             # validateStudentCSV() handles all 19 fields + booleans
│   └── logger.js
│
├── middleware/
│   ├── authMiddleware.js
│   ├── roleMiddleware.js
│   └── errorHandler.js
│
├── config/
│   ├── db.js
│   └── twilio.js
│
├── routes/                      # Express routers
├── app.js
└── server.js
```

---

## 🔄 Key Flows

### Prediction & Auto-Assignment Flow

```
Teacher clicks "Analyze"
        │
        ▼
POST /api/predict/:studentId
        │
        ├─ Fetch student (all 19 fields)
        │
        ├─ mlPredictionService.getPrediction()
        │       ├─ Try external ML API (Python/XGBoost)
        │       │       └─ On failure → fallback
        │       └─ Fallback: calculateRiskScore() + getRiskFactors()
        │               ├─ Academic score  (max 55 pts)
        │               ├─ Financial score (max 20 pts)
        │               ├─ Behavioural score (max 15 pts)
        │               └─ Medical score   (max 10 pts)
        │
        ├─ Returns: { riskScore, riskLevel, riskFactors[], counselorType, recommendation }
        │
        ├─ Update Student: riskScore, riskLevel, riskFactors, counselorType, recommendation
        ├─ Save Prediction record
        │
        └─ IF riskLevel === 'high':
                ├─ Find counselor where expertise === counselorType
                ├─ Fallback: expertise === 'general'
                ├─ Fallback: any active counselor
                ├─ Assign counselor to student
                ├─ Create Counseling record (with factor summary in initial note)
                ├─ Create Notifications (teacher + counselor + student)
                ├─ Emit Socket.io events
                └─ Send SMS via Twilio
```

### Risk Scoring Engine (`helpers.js`)

```
getRiskFactors(studentData) returns:
  {
    factors: string[],        // e.g. ["[Financial] Very low family income", ...]
    counselorType: string,    // dominant category
    breakdown: {
      academic: string[],
      financial: string[],
      behavioral: string[],
      medical: string[]
    }
  }

Scoring weights:
  Academic  (55 pts max):
    attendance < 50%      → 20 pts
    attendance < 70%      → 12 pts
    attendance < 85%      →  5 pts
    marks < 40            → 15 pts
    marks < 60            →  8 pts
    marks < 75            →  3 pts
    assignment < 40%      → 10 pts
    assignment < 60%      →  5 pts
    failures ≥ 3          → 10 pts
    failures ≥ 1          →  5 pts
    engagement < 30       → 10 pts
    engagement < 50       →  6 pts
    engagement < 70       →  2 pts

  Financial (20 pts max):
    income < 1L           →  8 pts
    income < 2L           →  4 pts
    no scholarship + low income → 4 pts
    partTimeJob           →  4 pts
    dependents ≥ 3        →  4 pts
    dependents ≥ 1        →  2 pts
    travel > 30 km        →  3 pts
    travel > 15 km        →  1 pt

  Behavioural (15 pts max):
    disciplinary ≥ 3      →  8 pts
    disciplinary ≥ 1      →  4 pts
    socialMedia ≥ 6 hrs   →  5 pts
    socialMedia ≥ 4 hrs   →  2 pts
    no extracurricular    →  2 pts

  Medical (10 pts max):
    mentalHealthConcern   →  5 pts
    hasChronicIllness     →  3 pts
    missedMedical ≥ 10    →  5 pts
    missedMedical ≥ 5     →  3 pts
    missedMedical ≥ 2     →  1 pt

counselorType = category with highest weighted score
```

### CSV Upload Flow

```
Teacher uploads CSV
        │
        ▼
POST /api/students/upload-csv (multipart/form-data)
        │
        ├─ multer saves file to /uploads/
        ├─ parseCSVFile() → raw rows
        ├─ validateStudentCSV():
        │       ├─ Requires: name, rollNumber
        │       ├─ numOrZero() for all numeric fields
        │       ├─ toBool() for boolean fields (true/false/yes/1)
        │       └─ scholarshipStatus validation (none/partial/full)
        ├─ Student.insertMany() with teacherId
        ├─ cleanupFile()
        └─ Return count + data
```

---

## 🗄️ Data Models

### User
```javascript
{
  name, email, password (bcrypt),
  role: enum['teacher','student','counselor'],
  phoneNumber,
  expertise: enum['academic','financial','behavioral','medical','general'],
  isActive
}
```

### Student (19 data fields)
```javascript
{
  // Identity
  name, rollNumber, email, phoneNumber,
  teacherId, userId, counselorId, counselingStatus,

  // Academic
  attendancePercentage, internalMarks, assignmentCompletion,
  previousFailures, engagementScore,

  // Financial
  familyIncome, travelDistance,
  scholarshipStatus: enum['none','partial','full'],
  partTimeJob: Boolean,
  numberOfDependents,

  // Behavioural
  disciplinaryActions, socialMediaHours,
  extracurricularParticipation: Boolean,

  // Medical
  hasChronicIllness: Boolean,
  mentalHealthConcern: Boolean,
  missedDueMedical,

  // Prediction results
  riskScore, riskLevel: enum['low','medium','high'],
  riskFactors: [String],
  counselorType: enum['academic','financial','behavioral','medical','general'],
  recommendation,

  // History
  scoreHistory: [{ term, attendancePercentage, internalMarks, ... }]
}
```

### Prediction
```javascript
{
  studentId, predictedBy,
  riskScore, riskLevel,
  riskFactors: [String],
  counselorType: enum['academic','financial','behavioral','medical','general'],
  recommendation,
  inputData: { all 19 fields snapshot },
  predictionDate, modelVersion
}
```

### Counseling
```javascript
{
  studentId, counselorId,
  status: enum['pending','in_progress','resolved'],
  notes: [{ content, addedBy, addedAt }],
  sessionCount, assignedDate, resolvedDate, lastSessionDate
}
```

---

## 🔐 Security Architecture

```
Layer 1 — Network:      HTTPS/TLS, CORS, Rate limiting (100 req/15 min)
Layer 2 — Auth:         JWT validation, bcrypt (10 rounds), token expiry
Layer 3 — Authorization: RBAC per route, resource ownership checks
Layer 4 — Data:         Mongoose schema validation, CSV type/size checks
Layer 5 — Errors:       Graceful responses, no sensitive data leaked
```

---

## 📡 API Surface

```
/api/auth
  POST   /register          → accepts expertise for counselors
  POST   /login
  GET    /me
  POST   /logout
  GET    /counselors         → returns expertise field
  GET    /students

/api/students
  POST   /                  → all 19 fields
  GET    /
  GET    /:id
  PUT    /:id               → all 19 fields
  DELETE /:id
  POST   /upload-csv        → updated CSV parser
  POST   /:id/score-history
  GET    /:id/score-history

/api/predict
  POST   /:studentId        → returns riskFactors + counselorType
  GET    /
  GET    /student/:studentId

/api/counseling
  POST   /assign
  GET    /assigned
  GET    /student/:studentId
  POST   /notes
  PUT    /:id/status

/api/notifications
  GET    /
  GET    /unread-count
  PUT    /:id/read
  PUT    /read-all
  DELETE /:id

/api/behavioural-feedback
  POST   /
  GET    /student/:studentId
  PUT    /:id
  DELETE /:id
```

---

## 🚀 Deployment

```
Frontend:  Vite build → static hosting (Vercel / Netlify / S3+CloudFront)
Backend:   Node.js + PM2 → Render / Railway / EC2
Database:  MongoDB Atlas (replica set)
ML API:    Python Flask/FastAPI → separate service (optional)
           Fallback engine always active if ML API unreachable
```

---

**Architecture Version**: 2.0
**Last Updated**: March 2026
**Status**: Production Ready
