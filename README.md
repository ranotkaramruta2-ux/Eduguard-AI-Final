# 🎓 AI-Based Student Dropout Prediction and Counseling System - Backend

## 📋 Overview

A production-ready Node.js backend system designed to predict student dropout risk using machine learning and facilitate automated counselor assignment with real-time notifications.

## ✨ Key Features

### 1. **Dropout Risk Prediction**
- ML-powered risk assessment based on academic and behavioral data
- Automated high-risk student detection
- Historical prediction tracking

### 2. **Automated Counseling System**
- Automatic counselor assignment for high-risk students
- Counseling session management
- Progress tracking and status updates

### 3. **Multi-Channel Notifications**
- Real-time notifications via Socket.io
- SMS/WhatsApp alerts via Twilio
- In-app notification system

### 4. **Role-Based Access Control**
- **Teachers**: Add students, upload datasets, run predictions, assign counselors
- **Students**: View profile, risk status, counseling updates
- **Counselors**: Manage assigned students, add notes, update status

### 5. **Data Management**
- CSV bulk upload for student data
- RESTful API for CRUD operations
- MongoDB for scalable data storage

## 🏗️ Architecture

```
backend/
├── src/
│   ├── controllers/          # Request handlers
│   │   ├── authController.js
│   │   ├── studentController.js
│   │   ├── predictionController.js
│   │   ├── counselingController.js
│   │   └── notificationController.js
│   ├── routes/               # API routes
│   │   ├── authRoutes.js
│   │   ├── studentRoutes.js
│   │   ├── predictionRoutes.js
│   │   ├── counselingRoutes.js
│   │   └── notificationRoutes.js
│   ├── models/               # MongoDB schemas
│   │   ├── User.js
│   │   ├── Student.js
│   │   ├── Prediction.js
│   │   ├── Counseling.js
│   │   └── Notification.js
│   ├── services/             # Business logic
│   │   ├── mlPredictionService.js
│   │   ├── twilioService.js
│   │   └── csvUploadService.js
│   ├── middleware/           # Custom middleware
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   └── errorHandler.js
│   ├── config/               # Configuration
│   │   ├── db.js
│   │   └── twilio.js
│   ├── utils/                # Utilities
│   │   ├── helpers.js
│   │   ├── logger.js
│   │   └── csvParser.js
│   ├── uploads/              # File uploads
│   ├── app.js                # Express app setup
│   └── server.js             # Server entry point
├── .env.example              # Environment variables template
├── .gitignore
└── package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

### Installation

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB:**
   ```bash
   # Make sure MongoDB is running
   mongod
   ```

5. **Start the server:**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `https://eduguard-ai-1.onrender.com`

## 🔧 Environment Configuration

Create a `.env` file in the backend directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5001

# Database
MONGO_URI=mongodb://localhost:27017/student_dropout_prediction

# JWT
JWT_SECRET=your_secure_secret_key_here
JWT_EXPIRE=30d

# CORS
CORS_ORIGIN=http://localhost:5173

# Twilio (Optional)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# ML Model API
ML_API_URL=http://localhost:5000/predict
USE_FALLBACK_PREDICTION=true
```

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login user
GET    /api/auth/me          - Get current user
POST   /api/auth/logout      - Logout user
```

### Students
```
POST   /api/students                - Add student (Teacher)
GET    /api/students                - Get all students
GET    /api/students/:id            - Get student by ID
PUT    /api/students/:id            - Update student (Teacher)
DELETE /api/students/:id            - Delete student (Teacher)
POST   /api/students/upload-csv     - Bulk upload via CSV (Teacher)
```

### Predictions
```
POST   /api/predict/:studentId              - Run prediction (Teacher)
GET    /api/predictions                     - Get all predictions (Teacher)
GET    /api/predictions/student/:studentId  - Get student predictions
```

### Counseling
```
POST   /api/counseling/assign               - Assign counselor (Teacher)
GET    /api/counseling/assigned             - Get assigned students (Counselor)
GET    /api/counseling/student/:studentId   - Get counseling details
POST   /api/counseling/notes                - Add counseling note (Counselor)
PUT    /api/counseling/:id/status           - Update status (Counselor)
```

### Notifications
```
GET    /api/notifications                   - Get all notifications
GET    /api/notifications/unread-count      - Get unread count
PUT    /api/notifications/:id/read          - Mark as read
PUT    /api/notifications/read-all          - Mark all as read
DELETE /api/notifications/:id               - Delete notification
```

## 🔒 Authentication & Authorization

### JWT Authentication
All protected routes require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Role-Based Access Control

**Teacher Permissions:**
- Add/edit/delete students
- Upload CSV datasets
- Run dropout predictions
- Assign counselors
- View analytics

**Student Permissions:**
- View personal profile
- View risk status
- View assigned counselor
- View counseling history

**Counselor Permissions:**
- View assigned students
- Add counseling notes
- Update counseling status
- View student risk reports

## 📊 Data Models

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum ['teacher', 'student', 'counselor'],
  phoneNumber: String,
  isActive: Boolean
}
```

### Student Schema
```javascript
{
  name: String,
  rollNumber: String (unique),
  email: String,
  phoneNumber: String,
  attendancePercentage: Number (0-100),
  internalMarks: Number (0-100),
  assignmentCompletion: Number (0-100),
  familyIncome: Number,
  travelDistance: Number,
  previousFailures: Number,
  engagementScore: Number (0-100),
  riskScore: Number (0-100),
  riskLevel: Enum ['low', 'medium', 'high'],
  recommendation: String,
  teacherId: ObjectId (ref: User),
  userId: ObjectId (ref: User),
  counselorId: ObjectId (ref: User),
  counselingStatus: Enum ['pending', 'in_progress', 'resolved']
}
```

### Prediction Schema
```javascript
{
  studentId: ObjectId (ref: Student),
  riskScore: Number,
  riskLevel: String,
  recommendation: String,
  predictionDate: Date,
  inputData: Object,
  predictedBy: ObjectId (ref: User)
}
```

### Counseling Schema
```javascript
{
  studentId: ObjectId (ref: Student),
  counselorId: ObjectId (ref: User),
  status: Enum ['pending', 'in_progress', 'resolved'],
  notes: [{
    content: String,
    addedBy: ObjectId (ref: User),
    addedAt: Date
  }],
  sessionCount: Number,
  lastSessionDate: Date
}
```

### Notification Schema
```javascript
{
  userId: ObjectId (ref: User),
  message: String,
  type: Enum ['risk', 'counseling', 'update', 'system'],
  status: Enum ['unread', 'read'],
  priority: Enum ['low', 'medium', 'high'],
  relatedStudentId: ObjectId (ref: Student),
  relatedCounselingId: ObjectId (ref: Counseling)
}
```

## 🤖 Machine Learning Integration

### Fallback Prediction
The system includes a built-in fallback prediction algorithm:

```javascript
Risk Score Calculation:
- Attendance < 50%: +25 points
- Attendance 50-70%: +15 points
- Attendance 70-85%: +5 points
- Internal Marks < 40: +20 points
- Internal Marks 40-60: +10 points
- Internal Marks 60-75: +5 points
- Assignment Completion < 40%: +15 points
- Assignment Completion 40-60%: +8 points
- Previous Failures ≥ 3: +20 points
- Previous Failures ≥ 1: +10 points
- Engagement < 30: +20 points
- Engagement 30-50: +10 points
- Engagement 50-70: +5 points

Risk Levels:
- Score ≥ 70: HIGH RISK
- Score 40-69: MEDIUM RISK
- Score < 40: LOW RISK
```

### External ML API Integration
To integrate with a Python ML model API:

1. Set `ML_API_URL` in `.env`
2. Set `USE_FALLBACK_PREDICTION=false`
3. Ensure your ML API accepts POST requests with:
   ```json
   {
     "attendance": number,
     "marks": number,
     "assignmentCompletion": number,
     "familyIncome": number,
     "travelDistance": number,
     "failures": number,
     "engagementScore": number
   }
   ```
4. ML API should return:
   ```json
   {
     "risk_score": number,
     "risk_level": "low" | "medium" | "high"
   }
   ```

## 📱 Real-Time Notifications

### Socket.io Events

**Client-side connection:**
```javascript
import io from 'socket.io-client';

const socket = io('https://eduguard-ai-1.onrender.com');

// Join user-specific room
socket.emit('join', userId);

// Listen for notifications
socket.on('notification', (data) => {
  console.log('New notification:', data);
});
```

**Server-side events:**
- High-risk student detected
- Counselor assigned
- Counseling note added
- Status updates

## 📧 SMS/WhatsApp Notifications (Twilio)

### Setup Twilio
1. Create a Twilio account
2. Get your Account SID, Auth Token, and Phone Number
3. Add credentials to `.env`
4. Notifications will be sent automatically for:
   - High-risk student detection
   - Counselor assignment
   - Important updates

### SMS Message Templates

**High-Risk Alert (Student):**
```
Alert: You have been identified as a high-risk student (Risk Score: X). 
A counselor will be assigned to you soon.
```

**High-Risk Alert (Teacher):**
```
High-Risk Alert: Student [Name] has been identified with a risk score of X. 
Immediate attention required.
```

**Counselor Assignment:**
```
Good news! [Counselor Name] has been assigned as your counselor. 
They will contact you soon.
```

## 📤 CSV Upload Format

### Required Fields
```csv
name,rollNumber,attendancePercentage,internalMarks,assignmentCompletion,familyIncome,travelDistance,previousFailures,engagementScore
John Doe,CS2024001,85,75,90,50000,10,0,80
Jane Smith,CS2024002,45,35,30,20000,25,2,25
```

### Optional Fields
```csv
email,phoneNumber
john@example.com,+1234567890
jane@example.com,+0987654321
```

## 🛡️ Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Tokens**: Secure authentication
- **Role-Based Access**: Fine-grained permissions
- **Rate Limiting**: Protection against brute force
- **Helmet.js**: Security headers
- **Input Validation**: Schema validation
- **CORS**: Configurable cross-origin requests

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Check code quality
npm run lint
```

## 📈 Performance Optimization

- **Compression**: Gzip compression enabled
- **Database Indexing**: Optimized queries
- **Connection Pooling**: MongoDB connection management
- **Caching**: Ready for Redis integration
- **Rate Limiting**: API throttling

## 🐛 Error Handling

### Global Error Handler
All errors are caught and formatted consistently:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## 📝 Logging

### Log Levels
- **INFO**: General information
- **SUCCESS**: Successful operations
- **WARN**: Warnings
- **ERROR**: Errors
- **DEBUG**: Debug information (development only)

### Log Format
```
ℹ️  [INFO] 2024-01-15T10:30:00.000Z - User logged in: teacher@demo.com
✅ [SUCCESS] 2024-01-15T10:31:00.000Z - Student added: John Doe (CS2024001)
❌ [ERROR] 2024-01-15T10:32:00.000Z - Database connection error
```

## 🚀 Deployment

### Production Checklist

1. ✅ Set `NODE_ENV=production`
2. ✅ Use strong `JWT_SECRET`
3. ✅ Configure MongoDB Atlas or production database
4. ✅ Set up proper CORS origins
5. ✅ Configure Twilio for SMS
6. ✅ Set up ML API endpoint
7. ✅ Enable HTTPS
8. ✅ Configure environment variables
9. ✅ Set up monitoring and logging
10. ✅ Configure backups

### Deployment Platforms

**Recommended:**
- **Railway**: Easy Node.js deployment
- **Render**: Free tier available
- **Heroku**: Simple deployment
- **AWS EC2**: Full control
- **DigitalOcean**: Droplets

**Database:**
- **MongoDB Atlas**: Managed MongoDB
- **Self-hosted**: Docker or VM

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - Feel free to use this project for educational or commercial purposes.

## 🙋 Support

For issues or questions:
- Create an issue in the repository
- Contact the development team
- Check documentation

## 🔄 Version History

### v1.0.0 (Current)
- Initial release
- Complete MERN backend
- ML integration
- Real-time notifications
- Role-based access control
- CSV upload functionality


---


