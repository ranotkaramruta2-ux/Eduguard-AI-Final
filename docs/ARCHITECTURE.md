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
│  │   (React.js)     │  │   (React.js)     │  │   (React.js)     │     │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘     │
│           │                     │                      │                │
│           └─────────────────────┴──────────────────────┘                │
│                                 │                                        │
│                         ┌───────▼───────┐                               │
│                         │  Socket.io    │                               │
│                         │  Connection   │                               │
│                         └───────┬───────┘                               │
└─────────────────────────────────┼─────────────────────────────────────┘
                                  │
                                  │ HTTPS/WSS
                                  │
┌─────────────────────────────────▼─────────────────────────────────────┐
│                         APPLICATION LAYER                              │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────┐     │
│  │                    Express.js Server                          │     │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐            │     │
│  │  │   Routes   │  │Controllers │  │ Middleware │            │     │
│  │  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘            │     │
│  │        │               │               │                     │     │
│  │        └───────────────┴───────────────┘                     │     │
│  │                        │                                      │     │
│  │        ┌───────────────▼───────────────┐                     │     │
│  │        │      Business Logic           │                     │     │
│  │        │  ┌──────────┐  ┌───────────┐ │                     │     │
│  │        │  │ Services │  │   Utils   │ │                     │     │
│  │        │  └──────────┘  └───────────┘ │                     │     │
│  │        └───────────────┬───────────────┘                     │     │
│  └────────────────────────┼─────────────────────────────────────┘     │
│                           │                                             │
│           ┌───────────────┼───────────────┐                            │
│           │               │               │                            │
│  ┌────────▼────────┐ ┌───▼───────┐ ┌────▼──────────┐                 │
│  │   Socket.io     │ │ Twilio    │ │  ML Service   │                 │
│  │   Real-time     │ │ SMS/WhatsApp││  (Python API) │                 │
│  │  Notifications  │ │   Gateway  │ │               │                 │
│  └─────────────────┘ └────────────┘ └───────────────┘                 │
│                                                                         │
└─────────────────────────────────────┬───────────────────────────────┘
                                      │
                                      │
┌─────────────────────────────────────▼───────────────────────────────┐
│                           DATA LAYER                                 │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                     MongoDB Database                          │   │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐ │   │
│  │  │ Users  │  │Students│  │Predictions│Counseling││Notifications│
│  │  │Collection│Collection│  │Collection│Collection││Collection││   │
│  │  └────────┘  └────────┘  └────────┘  └────────┘  └────────┘ │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Component Architecture

### 1. **Frontend Architecture (React)**

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/              # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   ├── layout/              # Layout components
│   │   │   ├── AppSidebar.tsx
│   │   │   ├── TopNavbar.tsx
│   │   │   └── DashboardLayout.tsx
│   │   └── features/            # Feature-specific components
│   │       ├── StudentCard.tsx
│   │       ├── RiskBadge.tsx
│   │       └── CounselingForm.tsx
│   ├── pages/
│   │   ├── teacher/             # Teacher-specific pages
│   │   ├── student/             # Student-specific pages
│   │   └── counselor/           # Counselor-specific pages
│   ├── contexts/                # React Context for state
│   │   ├── AuthContext.tsx
│   │   └── DataContext.tsx
│   ├── hooks/                   # Custom React hooks
│   ├── utils/                   # Utility functions
│   └── lib/                     # Third-party configurations
```

### 2. **Backend Architecture (Node.js + Express)**

```
backend/
├── src/
│   ├── controllers/             # Request handlers
│   │   ├── authController.js    → Handle authentication
│   │   ├── studentController.js → Handle student CRUD
│   │   ├── predictionController.js → Handle predictions
│   │   ├── counselingController.js → Handle counseling
│   │   └── notificationController.js → Handle notifications
│   ├── routes/                  # API route definitions
│   │   ├── authRoutes.js        → /api/auth/*
│   │   ├── studentRoutes.js     → /api/students/*
│   │   ├── predictionRoutes.js  → /api/predict/*
│   │   ├── counselingRoutes.js  → /api/counseling/*
│   │   └── notificationRoutes.js → /api/notifications/*
│   ├── models/                  # MongoDB schemas
│   │   ├── User.js
│   │   ├── Student.js
│   │   ├── Prediction.js
│   │   ├── Counseling.js
│   │   └── Notification.js
│   ├── services/                # Business logic services
│   │   ├── mlPredictionService.js  → ML API integration
│   │   ├── twilioService.js        → SMS/WhatsApp
│   │   └── csvUploadService.js     → CSV processing
│   ├── middleware/              # Custom middleware
│   │   ├── authMiddleware.js    → JWT verification
│   │   ├── roleMiddleware.js    → RBAC checks
│   │   └── errorHandler.js      → Error handling
│   ├── config/                  # Configuration files
│   │   ├── db.js                → MongoDB connection
│   │   └── twilio.js            → Twilio config
│   ├── utils/                   # Utility functions
│   │   ├── helpers.js           → Risk calculation
│   │   ├── logger.js            → Logging utility
│   │   └── csvParser.js         → CSV parsing
│   ├── app.js                   # Express app setup
│   └── server.js                # Server entry point
```

---

## 🔄 Request Flow

### 1. **Authentication Flow**

```
┌────────┐                                                      ┌────────┐
│ Client │                                                      │ Server │
└───┬────┘                                                      └───┬────┘
    │                                                               │
    │ 1. POST /api/auth/login                                      │
    │    { email, password }                                       │
    ├──────────────────────────────────────────────────────────────▶
    │                                                               │
    │                      2. Validate credentials                 │
    │                         - Check email exists                 │
    │                         - Compare password hash              │
    │                         - Check account active               │
    │                                                               │
    │                      3. Generate JWT token                   │
    │                         - Payload: { id, role }              │
    │                         - Sign with secret                   │
    │                         - Set expiration                     │
    │                                                               │
    │ 4. Return response                                           │
    │    { success, user, token }                                  │
    ◀──────────────────────────────────────────────────────────────┤
    │                                                               │
    │ 5. Store token in localStorage                               │
    │    Include in future requests:                               │
    │    Authorization: Bearer <token>                             │
    │                                                               │
```

### 2. **Prediction Workflow**

```
┌─────────┐        ┌─────────┐        ┌──────────┐        ┌──────────┐
│ Teacher │        │ Express │        │   ML     │        │ MongoDB  │
│ Client  │        │  Server │        │ Service  │        │ Database │
└────┬────┘        └────┬────┘        └────┬─────┘        └────┬─────┘
     │                  │                  │                    │
     │ 1. POST /api/predict/:studentId    │                    │
     ├─────────────────▶│                  │                    │
     │                  │                  │                    │
     │                  │ 2. Authenticate & Authorize           │
     │                  │    (JWT + Role Check)                 │
     │                  │                  │                    │
     │                  │ 3. Fetch student data                 │
     │                  ├────────────────────────────────────────▶
     │                  │                  │                    │
     │                  │◀────────────────────────────────────────┤
     │                  │ Student data     │                    │
     │                  │                  │                    │
     │                  │ 4. Call ML API   │                    │
     │                  ├─────────────────▶│                    │
     │                  │                  │ 5. Calculate risk  │
     │                  │                  │    score & level   │
     │                  │                  │                    │
     │                  │ 6. Return prediction                  │
     │                  │◀─────────────────┤                    │
     │                  │                  │                    │
     │                  │ 7. Update student record              │
     │                  ├────────────────────────────────────────▶
     │                  │                  │                    │
     │                  │ 8. Save prediction record             │
     │                  ├────────────────────────────────────────▶
     │                  │                  │                    │
     │                  │ 9. IF HIGH RISK:                      │
     │                  │    - Find counselor                   │
     │                  │    - Assign to student                │
     │                  │    - Create counseling record         │
     │                  │    - Send notifications               │
     │                  │                  │                    │
     │ 10. Return success response         │                    │
     │◀─────────────────┤                  │                    │
     │                  │                  │                    │
```

### 3. **Real-time Notification Flow**

```
┌────────────┐        ┌────────────┐        ┌──────────────┐
│   Client   │        │  Socket.io │        │   MongoDB    │
│ (Teacher)  │        │   Server   │        │   Database   │
└─────┬──────┘        └─────┬──────┘        └──────┬───────┘
      │                     │                       │
      │ 1. Connect to Socket.io                    │
      ├────────────────────▶│                       │
      │                     │                       │
      │ 2. Emit 'join' event with userId           │
      ├────────────────────▶│                       │
      │                     │ 3. Join user room     │
      │                     │    (user_<userId>)    │
      │                     │                       │
      │ 4. High-risk student detected              │
      │                     │                       │
      │                     │ 5. Save notification  │
      │                     ├──────────────────────▶│
      │                     │                       │
      │                     │ 6. Emit to user room  │
      │ 7. Receive notification                    │
      │◀────────────────────┤                       │
      │ { message, type, studentId }               │
      │                     │                       │
      │ 8. Display alert in UI                     │
      │                     │                       │
```

---

## 🗄️ Database Architecture

### Collection Relationships

```
┌──────────────┐
│    Users     │
│   (1 to N)   │
└──────┬───────┘
       │
       │ teacherId / counselorId / userId
       │
       ├──────────────────┬──────────────────┬──────────────────┐
       │                  │                  │                  │
       ▼                  ▼                  ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   Students   │   │ Predictions  │   │  Counseling  │   │Notifications │
└──────┬───────┘   └──────────────┘   └──────────────┘   └──────────────┘
       │
       │ studentId
       │
       └──────────────────┬──────────────────┐
                          │                  │
                          ▼                  ▼
                   ┌──────────────┐   ┌──────────────┐
                   │ Predictions  │   │  Counseling  │
                   └──────────────┘   └──────────────┘
```

### Indexes for Performance

```javascript
// Users Collection
users.createIndex({ email: 1 }, { unique: true });
users.createIndex({ role: 1 });

// Students Collection
students.createIndex({ rollNumber: 1 }, { unique: true });
students.createIndex({ teacherId: 1 });
students.createIndex({ counselorId: 1 });
students.createIndex({ riskLevel: 1 });

// Predictions Collection
predictions.createIndex({ studentId: 1 });
predictions.createIndex({ riskLevel: 1 });
predictions.createIndex({ predictionDate: -1 });

// Counseling Collection
counseling.createIndex({ studentId: 1 });
counseling.createIndex({ counselorId: 1 });
counseling.createIndex({ status: 1 });

// Notifications Collection
notifications.createIndex({ userId: 1, status: 1 });
notifications.createIndex({ createdAt: -1 });
notifications.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL
```

---

## 🔐 Security Architecture

### Multi-Layer Security

```
┌────────────────────────────────────────────────────────────────────┐
│                         Layer 1: Network                            │
│  • HTTPS/TLS encryption                                             │
│  • CORS policy enforcement                                          │
│  • Rate limiting (100 req/15 min)                                   │
└────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────────┐
│                      Layer 2: Authentication                        │
│  • JWT token validation                                             │
│  • Token expiration (30 days)                                       │
│  • Password hashing (bcrypt, 10 rounds)                             │
└────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────────┐
│                      Layer 3: Authorization                         │
│  • Role-based access control                                        │
│  • Resource ownership validation                                    │
│  • Permission checks per route                                      │
└────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────────┐
│                       Layer 4: Data Validation                      │
│  • Input sanitization                                               │
│  • Schema validation (Mongoose)                                     │
│  • File type validation (CSV only)                                  │
│  • Size limits (10 MB)                                              │
└────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────────┐
│                      Layer 5: Error Handling                        │
│  • Graceful error responses                                         │
│  • No sensitive data in errors                                      │
│  • Logging without credentials                                      │
└────────────────────────────────────────────────────────────────────┘
```

---

## 📡 API Architecture

### RESTful API Design

```
Base URL: https://eduguard-ai-1.onrender.com/api

Authentication: Bearer Token
Content-Type: application/json

┌─────────────────────────────────────────────────────────────────┐
│ Resource          │ Method │ Endpoint                          │
├───────────────────┼────────┼───────────────────────────────────┤
│ Authentication    │ POST   │ /api/auth/register                │
│                   │ POST   │ /api/auth/login                   │
│                   │ GET    │ /api/auth/me                      │
│                   │ POST   │ /api/auth/logout                  │
├───────────────────┼────────┼───────────────────────────────────┤
│ Students          │ POST   │ /api/students                     │
│                   │ GET    │ /api/students                     │
│                   │ GET    │ /api/students/:id                 │
│                   │ PUT    │ /api/students/:id                 │
│                   │ DELETE │ /api/students/:id                 │
│                   │ POST   │ /api/students/upload-csv          │
├───────────────────┼────────┼───────────────────────────────────┤
│ Predictions       │ POST   │ /api/predict/:studentId           │
│                   │ GET    │ /api/predictions                  │
│                   │ GET    │ /api/predictions/student/:id      │
├───────────────────┼────────┼───────────────────────────────────┤
│ Counseling        │ POST   │ /api/counseling/assign            │
│                   │ GET    │ /api/counseling/assigned          │
│                   │ GET    │ /api/counseling/student/:id       │
│                   │ POST   │ /api/counseling/notes             │
│                   │ PUT    │ /api/counseling/:id/status        │
├───────────────────┼────────┼───────────────────────────────────┤
│ Notifications     │ GET    │ /api/notifications                │
│                   │ GET    │ /api/notifications/unread-count   │
│                   │ PUT    │ /api/notifications/:id/read       │
│                   │ PUT    │ /api/notifications/read-all       │
│                   │ DELETE │ /api/notifications/:id            │
└───────────────────┴────────┴───────────────────────────────────┘
```

---

## 🚀 Deployment Architecture

### Production Deployment

```
┌─────────────────────────────────────────────────────────────────┐
│                         Load Balancer                            │
│                    (Nginx / Cloud LB)                            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │ Node.js  │    │ Node.js  │    │ Node.js  │
    │ Server 1 │    │ Server 2 │    │ Server 3 │
    │   PM2    │    │   PM2    │    │   PM2    │
    └────┬─────┘    └────┬─────┘    └────┬─────┘
         │               │               │
         └───────────────┼───────────────┘
                         │
                         ▼
              ┌──────────────────┐
              │  MongoDB Atlas   │
              │  Replica Set     │
              │  (3 nodes)       │
              └──────────────────┘

┌────────────────────────────────────────────────────────────┐
│                    External Services                        │
├────────────────────────────────────────────────────────────┤
│  • Twilio API (SMS/WhatsApp)                               │
│  • ML API (Python Flask/FastAPI)                           │
│  • Monitoring (New Relic, Datadog)                         │
│  • Logging (CloudWatch, Loggly)                            │
└────────────────────────────────────────────────────────────┘
```

---

## 🔧 Configuration Management

### Environment-Based Configuration

```
Development:
  • Local MongoDB
  • Debug logging
  • No rate limiting
  • CORS: *
  • ML fallback enabled

Staging:
  • Staging MongoDB
  • Info logging
  • Rate limiting: 500/15min
  • CORS: staging domain
  • ML API integration

Production:
  • MongoDB Atlas
  • Error logging only
  • Rate limiting: 100/15min
  • CORS: production domain
  • ML API with fallback
  • HTTPS enforced
  • Monitoring enabled
```

---

## 📊 Scalability Considerations

### Horizontal Scaling

```
Current: Single server deployment
Future: Multi-server with load balancing

Strategies:
1. Stateless API design (JWT tokens)
2. MongoDB connection pooling
3. Redis for session management
4. CDN for static assets
5. Microservices for ML (separate service)
6. Message queue for async tasks (Bull/RabbitMQ)
7. Caching layer (Redis/Memcached)
```

### Vertical Scaling

```
Server Resources:
- CPU: 2-4 cores (current) → 8-16 cores (peak)
- RAM: 4-8 GB (current) → 16-32 GB (peak)
- Storage: 50 GB SSD (current) → 500 GB SSD (peak)

Database:
- MongoDB: Shared cluster → Dedicated cluster
- Connections: 10-20 → 100-500
- Indexes: Optimized for queries
```

---

## 🔍 Monitoring & Logging

### Application Monitoring

```
Metrics to Track:
- API response times
- Request success/failure rates
- Database query performance
- Memory usage
- CPU utilization
- Error rates
- Active connections
- Prediction accuracy

Tools:
- PM2 monitoring
- MongoDB Atlas monitoring
- New Relic APM
- Datadog
- Custom logging (Winston)
```

---

**Architecture Version**: 1.0  
**Last Updated**: March 2026  
**Status**: Production Ready
