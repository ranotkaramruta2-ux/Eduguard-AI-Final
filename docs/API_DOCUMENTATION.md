# 📡 API Documentation

## Student Dropout Prediction System API

**Base URL**: `https://eduguard-ai-1.onrender.com/api`
**Version**: 2.0.0
**Authentication**: JWT Bearer Token

---

## 🔑 Authentication

All endpoints except `/auth/register` and `/auth/login` require authentication.

```
Authorization: Bearer <your_jwt_token>
```

---

## 📋 API Endpoints

### Authentication Endpoints

#### POST `/auth/register`

Register a new user. When `role` is `counselor`, include `expertise` to enable smart student matching.

**Request Body:**
```json
{
  "name": "Dr. Jane Smith",
  "email": "jane@counselor.com",
  "password": "password123",
  "role": "counselor",
  "phoneNumber": "+911234567890",
  "expertise": "financial"
}
```

`role` values: `teacher` | `student` | `counselor`

`expertise` values (counselor only): `academic` | `financial` | `behavioral` | `medical` | `general`

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Dr. Jane Smith",
      "email": "jane@counselor.com",
      "role": "counselor"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### POST `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "name": "John Doe", "email": "john@example.com", "role": "teacher" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### GET `/auth/me`

Returns the currently authenticated user.

---

#### POST `/auth/logout`

Invalidates the current session.

---

#### GET `/auth/counselors`

Returns all active counselors including their `expertise` field. Used by teachers when assigning counselors.

**Response (200):**
```json
{
  "success": true,
  "count": 4,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "name": "Dr. Jane Smith",
      "email": "jane@counselor.com",
      "phoneNumber": "+911234567890",
      "role": "counselor",
      "expertise": "financial"
    }
  ]
}
```

---

### Student Endpoints

#### POST `/students`

Add a new student with full multi-dimensional data (Teacher only).

**Request Body:**
```json
{
  "name": "Alice Johnson",
  "rollNumber": "CS2024001",
  "email": "alice@student.com",
  "phoneNumber": "+911234567890",

  "attendancePercentage": 75,
  "internalMarks": 65,
  "assignmentCompletion": 80,
  "previousFailures": 0,
  "engagementScore": 70,

  "familyIncome": 45000,
  "travelDistance": 15,
  "scholarshipStatus": "partial",
  "partTimeJob": false,
  "numberOfDependents": 1,

  "disciplinaryActions": 0,
  "socialMediaHours": 3,
  "extracurricularParticipation": true,

  "hasChronicIllness": false,
  "mentalHealthConcern": false,
  "missedDueMedical": 0
}
```

**Field Reference:**

| Field | Type | Category | Required | Notes |
|-------|------|----------|----------|-------|
| name | String | Identity | ✅ | |
| rollNumber | String | Identity | ✅ | Auto-uppercased |
| email | String | Identity | ❌ | Creates student login if provided |
| phoneNumber | String | Identity | ❌ | |
| attendancePercentage | Number | Academic | ✅ | 0–100 |
| internalMarks | Number | Academic | ✅ | 0–100 |
| assignmentCompletion | Number | Academic | ✅ | 0–100 |
| previousFailures | Number | Academic | ✅ | Default: 0 |
| engagementScore | Number | Academic | ✅ | 0–100 |
| familyIncome | Number | Financial | ✅ | Annual, in ₹ |
| travelDistance | Number | Financial | ✅ | One-way km |
| scholarshipStatus | String | Financial | ❌ | `none`/`partial`/`full`, default: `none` |
| partTimeJob | Boolean | Financial | ❌ | Default: false |
| numberOfDependents | Number | Financial | ❌ | Default: 0 |
| disciplinaryActions | Number | Behavioural | ❌ | Default: 0 |
| socialMediaHours | Number | Behavioural | ❌ | Hours/day, default: 0 |
| extracurricularParticipation | Boolean | Behavioural | ❌ | Default: false |
| hasChronicIllness | Boolean | Medical | ❌ | Default: false |
| mentalHealthConcern | Boolean | Medical | ❌ | Default: false |
| missedDueMedical | Number | Medical | ❌ | Days, default: 0 |

---

#### GET `/students`

Returns students filtered by role:
- Teacher: all students they added + registered student users
- Counselor: only assigned students
- Student: own record only

---

#### GET `/students/:id`

Returns a single student by ID with all fields populated.

---

#### PUT `/students/:id`

Update any student field (Teacher only). Accepts partial updates.

---

#### DELETE `/students/:id`

Delete a student record (Teacher only).

---

#### POST `/students/upload-csv`

Bulk upload students via CSV (Teacher only).

**Headers:** `Content-Type: multipart/form-data`

**CSV Column Reference:**

```
Required:
  name, rollNumber

Academic (optional, default 0):
  attendancePercentage, internalMarks, assignmentCompletion,
  previousFailures, engagementScore

Financial (optional):
  familyIncome, travelDistance, scholarshipStatus (none/partial/full),
  partTimeJob (true/false/yes/1), numberOfDependents

Behavioural (optional):
  disciplinaryActions, socialMediaHours,
  extracurricularParticipation (true/false/yes/1)

Medical (optional):
  hasChronicIllness (true/false), mentalHealthConcern (true/false),
  missedDueMedical

Identity (optional):
  email, phoneNumber
```

**Example CSV row:**
```csv
name,rollNumber,attendancePercentage,internalMarks,assignmentCompletion,previousFailures,engagementScore,familyIncome,travelDistance,scholarshipStatus,partTimeJob,numberOfDependents,disciplinaryActions,socialMediaHours,extracurricularParticipation,hasChronicIllness,mentalHealthConcern,missedDueMedical
Alice Johnson,CS2024001,75,65,80,0,70,45000,15,partial,false,1,0,3,true,false,false,0
Bob Smith,CS2024002,40,30,35,2,25,80000,35,none,true,3,2,6,false,false,true,8
```

**Response (201):**
```json
{
  "success": true,
  "message": "15 students added successfully",
  "data": [...]
}
```

---

#### POST `/students/:id/score-history`

Add a term-based score snapshot for historical tracking.

**Request Body:**
```json
{
  "term": "Semester 1 2025",
  "attendancePercentage": 75,
  "internalMarks": 65,
  "assignmentCompletion": 80,
  "engagementScore": 70,
  "previousFailures": 0
}
```

---

#### GET `/students/:id/score-history`

Returns all score snapshots for a student, sorted newest first.

---

### Prediction Endpoints

#### POST `/predict/:studentId`

Run dropout prediction for a student (Teacher only). Uses all 19 fields for scoring.

**Response (200):**
```json
{
  "success": true,
  "message": "Prediction completed successfully",
  "data": {
    "student": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Alice Johnson",
      "rollNumber": "CS2024001",
      "riskScore": 72,
      "riskLevel": "high",
      "riskFactors": [
        "[Financial] Very low family income (below ₹1L)",
        "[Financial] Working part-time job (time conflict risk)",
        "[Academic] Poor attendance (below 70%)"
      ],
      "counselorType": "financial",
      "recommendation": "Immediate counseling intervention recommended..."
    },
    "prediction": {
      "riskScore": 72,
      "riskLevel": "high",
      "riskFactors": ["[Financial] Very low family income (below ₹1L)", "..."],
      "counselorType": "financial",
      "recommendation": "Immediate counseling intervention recommended...",
      "source": "fallback"
    }
  }
}
```

**`counselorType` values:** `academic` | `financial` | `behavioral` | `medical` | `general`

**`source` values:** `ml_api` (external Python model) | `fallback` (internal weighted engine)

**Auto-assignment on high risk:**
When `riskLevel` is `high`, the system automatically:
1. Finds a counselor whose `expertise` matches `counselorType`
2. Falls back to `general` expertise, then any available counselor
3. Creates a counseling record with risk factor summary
4. Sends notifications to teacher, counselor, and student

---

#### GET `/predict`

Get all prediction records made by the authenticated teacher (last 100).

**Response (200):**
```json
{
  "success": true,
  "count": 50,
  "data": [
    {
      "_id": "...",
      "studentId": { "name": "Alice Johnson", "rollNumber": "CS2024001" },
      "riskScore": 72,
      "riskLevel": "high",
      "riskFactors": ["[Financial] Very low family income (below ₹1L)"],
      "counselorType": "financial",
      "predictionDate": "2026-03-19T11:00:00.000Z",
      "predictedBy": { "name": "John Doe" }
    }
  ]
}
```

---

#### GET `/predict/student/:studentId`

Get all predictions for a specific student.

---

### Counseling Endpoints

#### POST `/counseling/assign`

Manually assign a counselor to a student (Teacher only).

**Request Body:**
```json
{
  "studentId": "507f1f77bcf86cd799439012",
  "counselorId": "507f1f77bcf86cd799439014"
}
```

---

#### GET `/counseling/assigned`

Get all students assigned to the authenticated counselor (Counselor only).

---

#### GET `/counseling/student/:studentId`

Get all counseling records for a student including notes.

---

#### POST `/counseling/notes`

Add a session note (Counselor only).

**Request Body:**
```json
{
  "counselingId": "507f1f77bcf86cd799439015",
  "note": "Follow-up session. Student exploring financial aid options."
}
```

---

#### PUT `/counseling/:id/status`

Update counseling status (Counselor only).

**Request Body:**
```json
{ "status": "in_progress" }
```

`status` values: `pending` | `in_progress` | `resolved`

---

### Notification Endpoints

#### GET `/notifications`

Get all notifications for the current user.

**Response (200):**
```json
{
  "success": true,
  "count": 10,
  "unreadCount": 3,
  "data": [
    {
      "_id": "...",
      "message": "High-risk student: Alice Johnson (72). Primary: financial. Counselor Dr. Jane [financial] assigned.",
      "type": "risk",
      "status": "unread",
      "priority": "high",
      "createdAt": "2026-03-19T11:00:00.000Z"
    }
  ]
}
```

---

#### GET `/notifications/unread-count`

Returns `{ "success": true, "count": 3 }`.

---

#### PUT `/notifications/:id/read`

Mark a single notification as read.

---

#### PUT `/notifications/read-all`

Mark all notifications as read.

---

#### DELETE `/notifications/:id`

Delete a notification.

---

## 🔒 Role-Based Access Control

| Endpoint | Teacher | Student | Counselor |
|----------|---------|---------|-----------|
| POST /students | ✅ | ❌ | ❌ |
| GET /students | ✅ (all own) | ✅ (own) | ✅ (assigned) |
| PUT /students/:id | ✅ | ❌ | ❌ |
| DELETE /students/:id | ✅ | ❌ | ❌ |
| POST /students/upload-csv | ✅ | ❌ | ❌ |
| POST /predict/:studentId | ✅ | ❌ | ❌ |
| GET /predict | ✅ | ❌ | ❌ |
| POST /counseling/assign | ✅ | ❌ | ❌ |
| GET /counseling/assigned | ❌ | ❌ | ✅ |
| POST /counseling/notes | ❌ | ❌ | ✅ |
| PUT /counseling/:id/status | ❌ | ❌ | ✅ |
| GET /notifications | ✅ | ✅ | ✅ |
| GET /auth/counselors | ✅ | ❌ | ❌ |

---

## ❌ Error Responses

| Code | Meaning | Example message |
|------|---------|-----------------|
| 400 | Bad Request | "Please provide all required student information" |
| 401 | Unauthorized | "Not authorized to access this route. Please login." |
| 403 | Forbidden | "User role 'student' is not authorized to access this route" |
| 404 | Not Found | "Student not found" |
| 500 | Server Error | "Error running prediction" |

---

## 🧪 Quick Test with cURL

```bash
# 1. Login
curl -X POST https://eduguard-ai-1.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@demo.com","password":"password"}'

# 2. Add student with all dimensions
curl -X POST https://eduguard-ai-1.onrender.com/api/students \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Bob Smith","rollNumber":"CS2024002",
    "attendancePercentage":40,"internalMarks":30,
    "assignmentCompletion":35,"previousFailures":2,"engagementScore":25,
    "familyIncome":80000,"travelDistance":35,
    "scholarshipStatus":"none","partTimeJob":true,"numberOfDependents":3,
    "disciplinaryActions":2,"socialMediaHours":6,"extracurricularParticipation":false,
    "hasChronicIllness":false,"mentalHealthConcern":true,"missedDueMedical":8
  }'

# 3. Run prediction
curl -X POST https://eduguard-ai-1.onrender.com/api/predict/<studentId> \
  -H "Authorization: Bearer <token>"
```

---

## 📝 Notes

- All timestamps are ISO 8601 (UTC)
- All IDs are MongoDB ObjectIds
- CSV uploads accept only `.csv` files, max 10 MB
- Rate limit: 100 requests per 15 minutes per IP
- ML API fallback is always available if external Python service is unreachable

---

**API Version**: 2.0.0
**Last Updated**: March 2026
