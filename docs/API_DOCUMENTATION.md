# 📡 API Documentation

## Student Dropout Prediction System API

**Base URL**: `https://eduguard-ai-1.onrender.com/api`  
**Version**: 1.0.0  
**Authentication**: JWT Bearer Token

---

## 🔑 Authentication

All endpoints except `/auth/register` and `/auth/login` require authentication.

Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📋 API Endpoints

### Authentication Endpoints

#### 1. Register User
**POST** `/auth/register`

Register a new user in the system.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "teacher",
  "phoneNumber": "+1234567890"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "teacher"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### 2. Login
**POST** `/auth/login`

Authenticate user and receive JWT token.

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
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "teacher"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

#### 3. Get Current User
**GET** `/auth/me`

Get currently authenticated user details.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "teacher",
    "phoneNumber": "+1234567890"
  }
}
```

---

### Student Endpoints

#### 1. Add Student
**POST** `/students`

Add a new student (Teacher only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Alice Johnson",
  "rollNumber": "CS2024001",
  "email": "alice@student.com",
  "phoneNumber": "+1234567890",
  "attendancePercentage": 75,
  "internalMarks": 65,
  "assignmentCompletion": 80,
  "familyIncome": 45000,
  "travelDistance": 15,
  "previousFailures": 0,
  "engagementScore": 70
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Student added successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Alice Johnson",
    "rollNumber": "CS2024001",
    "attendancePercentage": 75,
    "internalMarks": 65,
    "teacherId": "507f1f77bcf86cd799439011",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

#### 2. Get All Students
**GET** `/students`

Get all students (filtered by role).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- None (automatic filtering based on user role)

**Response (200):**
```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Alice Johnson",
      "rollNumber": "CS2024001",
      "attendancePercentage": 75,
      "riskScore": 30,
      "riskLevel": "low",
      "teacherId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

#### 3. Get Single Student
**GET** `/students/:id`

Get student by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Alice Johnson",
    "rollNumber": "CS2024001",
    "email": "alice@student.com",
    "phoneNumber": "+1234567890",
    "attendancePercentage": 75,
    "internalMarks": 65,
    "assignmentCompletion": 80,
    "familyIncome": 45000,
    "travelDistance": 15,
    "previousFailures": 0,
    "engagementScore": 70,
    "riskScore": 30,
    "riskLevel": "low",
    "recommendation": "Student is on track.",
    "teacherId": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe"
    }
  }
}
```

---

#### 4. Update Student
**PUT** `/students/:id`

Update student information (Teacher only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "attendancePercentage": 80,
  "internalMarks": 70,
  "engagementScore": 75
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Student updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Alice Johnson",
    "attendancePercentage": 80,
    "internalMarks": 70,
    "engagementScore": 75
  }
}
```

---

#### 5. Delete Student
**DELETE** `/students/:id`

Delete a student (Teacher only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Student deleted successfully"
}
```

---

#### 6. Upload CSV Dataset
**POST** `/students/upload-csv`

Bulk upload students via CSV (Teacher only).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
file: <csv_file>
```

**CSV Format:**
```csv
name,rollNumber,attendancePercentage,internalMarks,assignmentCompletion,familyIncome,travelDistance,previousFailures,engagementScore
Alice Johnson,CS2024001,75,65,80,45000,15,0,70
Bob Smith,CS2024002,45,35,30,25000,25,2,25
```

**Response (201):**
```json
{
  "success": true,
  "message": "15 students added successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Alice Johnson",
      "rollNumber": "CS2024001"
    }
  ]
}
```

---

### Prediction Endpoints

#### 1. Run Prediction
**POST** `/predict/:studentId`

Run dropout prediction for a student (Teacher only).

**Headers:**
```
Authorization: Bearer <token>
```

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
      "riskScore": 85,
      "riskLevel": "high",
      "recommendation": "Immediate counseling intervention recommended."
    },
    "prediction": {
      "riskScore": 85,
      "riskLevel": "high",
      "recommendation": "Immediate counseling intervention recommended.",
      "source": "ml_api"
    }
  }
}
```

---

#### 2. Get All Predictions
**GET** `/predictions`

Get all prediction records (Teacher only).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit`: Number of records (default: 100)

**Response (200):**
```json
{
  "success": true,
  "count": 50,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "studentId": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Alice Johnson",
        "rollNumber": "CS2024001"
      },
      "riskScore": 85,
      "riskLevel": "high",
      "predictionDate": "2024-01-15T11:00:00.000Z",
      "predictedBy": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "John Doe"
      }
    }
  ]
}
```

---

#### 3. Get Student Predictions
**GET** `/predictions/student/:studentId`

Get all predictions for a specific student.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "riskScore": 85,
      "riskLevel": "high",
      "predictionDate": "2024-01-15T11:00:00.000Z",
      "inputData": {
        "attendancePercentage": 45,
        "internalMarks": 35,
        "engagementScore": 25
      }
    }
  ]
}
```

---

### Counseling Endpoints

#### 1. Assign Counselor
**POST** `/counseling/assign`

Assign a counselor to a student (Teacher only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "studentId": "507f1f77bcf86cd799439012",
  "counselorId": "507f1f77bcf86cd799439014"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Counselor assigned successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "studentId": "507f1f77bcf86cd799439012",
    "counselorId": "507f1f77bcf86cd799439014",
    "status": "pending",
    "assignedDate": "2024-01-15T12:00:00.000Z"
  }
}
```

---

#### 2. Get Assigned Students
**GET** `/counseling/assigned`

Get all students assigned to counselor (Counselor only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "studentId": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Alice Johnson",
        "rollNumber": "CS2024001",
        "riskScore": 85,
        "riskLevel": "high"
      },
      "status": "in_progress",
      "sessionCount": 2,
      "lastSessionDate": "2024-01-14T10:00:00.000Z"
    }
  ]
}
```

---

#### 3. Get Student Counseling
**GET** `/counseling/student/:studentId`

Get counseling details for a student.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "studentId": {
        "name": "Alice Johnson",
        "rollNumber": "CS2024001"
      },
      "counselorId": {
        "name": "Dr. Emily Chen",
        "email": "emily@counselor.com"
      },
      "status": "in_progress",
      "notes": [
        {
          "_id": "507f1f77bcf86cd799439016",
          "content": "Initial session completed. Student expressing academic difficulties.",
          "addedBy": {
            "name": "Dr. Emily Chen",
            "role": "counselor"
          },
          "addedAt": "2024-01-10T14:00:00.000Z"
        }
      ],
      "sessionCount": 2
    }
  ]
}
```

---

#### 4. Add Counseling Note
**POST** `/counseling/notes`

Add a counseling session note (Counselor only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "counselingId": "507f1f77bcf86cd799439015",
  "note": "Follow-up session. Student showing improvement in attendance."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Note added successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "notes": [
      {
        "_id": "507f1f77bcf86cd799439017",
        "content": "Follow-up session. Student showing improvement.",
        "addedBy": {
          "name": "Dr. Emily Chen",
          "role": "counselor"
        },
        "addedAt": "2024-01-15T14:00:00.000Z"
      }
    ],
    "sessionCount": 3
  }
}
```

---

#### 5. Update Counseling Status
**PUT** `/counseling/:id/status`

Update counseling status (Counselor only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "resolved"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Status updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "status": "resolved",
    "resolvedDate": "2024-01-15T15:00:00.000Z"
  }
}
```

---

### Notification Endpoints

#### 1. Get Notifications
**GET** `/notifications`

Get all notifications for current user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status`: Filter by status (`unread` or `read`)
- `limit`: Number of records (default: 50)

**Response (200):**
```json
{
  "success": true,
  "count": 10,
  "unreadCount": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439018",
      "message": "High-risk student detected: Alice Johnson (Risk Score: 85)",
      "type": "risk",
      "status": "unread",
      "priority": "high",
      "relatedStudentId": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Alice Johnson",
        "rollNumber": "CS2024001"
      },
      "createdAt": "2024-01-15T11:00:00.000Z"
    }
  ]
}
```

---

#### 2. Get Unread Count
**GET** `/notifications/unread-count`

Get count of unread notifications.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "count": 3
}
```

---

#### 3. Mark as Read
**PUT** `/notifications/:id/read`

Mark a notification as read.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "_id": "507f1f77bcf86cd799439018",
    "status": "read"
  }
}
```

---

#### 4. Mark All as Read
**PUT** `/notifications/read-all`

Mark all notifications as read.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "5 notifications marked as read",
  "count": 5
}
```

---

#### 5. Delete Notification
**DELETE** `/notifications/:id`

Delete a notification.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

## 🔒 Authentication & Authorization

### JWT Token Structure

```json
{
  "id": "507f1f77bcf86cd799439011",
  "iat": 1642252800,
  "exp": 1644844800
}
```

### Role-Based Access

| Endpoint | Teacher | Student | Counselor |
|----------|---------|---------|-----------|
| POST /students | ✅ | ❌ | ❌ |
| GET /students | ✅ (all) | ✅ (own) | ✅ (assigned) |
| POST /predict/:id | ✅ | ❌ | ❌ |
| POST /counseling/assign | ✅ | ❌ | ❌ |
| GET /counseling/assigned | ❌ | ❌ | ✅ |
| POST /counseling/notes | ❌ | ❌ | ✅ |
| GET /notifications | ✅ | ✅ | ✅ |

---

## ❌ Error Responses

### Common Error Codes

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Please provide all required student information"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Not authorized to access this route. Please login."
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "User role 'student' is not authorized to access this route"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Student not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Error adding student",
  "error": "Database connection failed"
}
```

---

## 🧪 Testing with Postman/cURL

### Example: Login and Get Students

```bash
# 1. Login
curl -X POST https://eduguard-ai-1.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teacher@demo.com",
    "password": "password"
  }'

# Response will include token

# 2. Get Students
curl -X GET https://eduguard-ai-1.onrender.com/api/students \
  -H "Authorization: Bearer <your_token_here>"
```

---

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- All numeric IDs are MongoDB ObjectIds
- File uploads accept only CSV format
- Maximum file size: 10 MB
- Rate limit: 100 requests per 15 minutes per IP

---

**API Version**: 1.0.0  
**Last Updated**: March 2026
