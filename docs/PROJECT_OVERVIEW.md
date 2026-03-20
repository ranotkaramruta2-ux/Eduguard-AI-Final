# 📊 Project Overview

## AI-Based Student Dropout Prediction and Counseling System

### 🎯 Project Goal

Create an intelligent system that helps educational institutions identify students at risk of dropping out and automatically connects them with the right type of counselor for timely, targeted intervention.

---

## 🌟 Vision

To reduce student dropout rates through early detection across academic, financial, behavioural, and medical dimensions — with data-driven insights and proactive, expertise-matched counseling.

---

## 🎓 Problem Statement

Educational institutions face challenges in:
- **Early identification** of at-risk students across multiple risk dimensions
- **Manual monitoring** of academic, financial, behavioural, and medical factors
- **Delayed intervention** for struggling students
- **Mismatched counseling** — assigning the wrong type of counselor to a student's actual problem
- **Communication gaps** between teachers, students, and counselors

---

## 💡 Solution

An automated system that:

1. **Collects** rich student data across four risk dimensions (academic, financial, behavioural, medical)
2. **Predicts** dropout risk using a weighted multi-factor scoring engine
3. **Categorises** the dominant risk type and recommends the appropriate counselor expertise
4. **Auto-assigns** the best-matched counselor from the available pool
5. **Notifies** all stakeholders in real-time with context-aware messages
6. **Tracks** counseling progress and outcomes

---

## 🏆 Key Benefits

### For Educational Institutions
- ✅ Reduce dropout rates with earlier, more accurate detection
- ✅ Smarter counselor allocation by expertise match
- ✅ Data-driven decision making across four risk dimensions
- ✅ Efficient resource allocation
- ✅ Better student outcomes

### For Teachers
- ✅ Rich student profiles covering academic, financial, behavioural, and medical data
- ✅ Automated risk assessment with categorised factor breakdown
- ✅ Counselor type recommendation shown after each analysis
- ✅ Bulk CSV upload with all new fields supported
- ✅ Real-time notifications with risk context

### For Students
- ✅ Timely support matched to their actual problem type
- ✅ Personalised counseling (academic / financial / behavioural / medical)
- ✅ Transparent communication
- ✅ Better academic guidance

### For Counselors
- ✅ Assigned students that match their area of expertise
- ✅ Complete multi-dimensional student risk profiles
- ✅ Session management tools
- ✅ Progress documentation

---

## 🔍 How It Works

### Step 1: Data Collection
Teachers add student information across four dimensions:

**Academic**
- Attendance percentage
- Internal marks
- Assignment completion rate
- Previous failures
- Engagement score

**Financial**
- Family income
- Travel distance
- Scholarship status (none / partial / full)
- Part-time job status
- Number of dependents

**Behavioural**
- Disciplinary actions count
- Social media usage (hours/day)
- Extracurricular participation

**Medical**
- Chronic illness flag
- Mental health concern flag
- Days missed due to medical reasons

### Step 2: Risk Scoring
The system calculates a weighted risk score (0–100) across all four dimensions:
- Academic indicators: up to 55 points
- Financial indicators: up to 20 points
- Behavioural indicators: up to 15 points
- Medical indicators: up to 10 points

### Step 3: Risk Classification & Counselor Type
Students are categorised into:
- **HIGH RISK** (Score ≥ 70): Immediate intervention needed
- **MEDIUM RISK** (Score 40–69): Monitoring required
- **LOW RISK** (Score < 40): On track

The dominant risk category determines the recommended counselor type:
- `academic` — marks, assignments, failures
- `financial` — income, travel, dependents, part-time job
- `behavioral` — disciplinary issues, engagement, social media
- `medical` — chronic illness, mental health, medical absences
- `general` — no dominant category

### Step 4: Automatic Intervention
For high-risk students:
- Best-matched counselor is automatically assigned (by expertise)
- All stakeholders are notified with risk context
- Counseling record is created with factor summary
- Follow-up is scheduled

### Step 5: Counseling & Monitoring
- Counselor reviews full multi-dimensional student profile
- Initial session is scheduled
- Progress notes are documented
- Status is updated (Pending → In Progress → Resolved)

---

## 📈 System Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Teacher Dashboard                            │
│                                                                  │
│  1. Add Students (4-section form: Academic / Financial /        │
│     Behavioural / Medical)                                       │
│  2. Upload CSV Dataset (all new fields supported)               │
│  3. View Student List with risk factor tags                     │
│  4. Run Dropout Prediction                                       │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                  ML Prediction Engine                            │
│                                                                  │
│  • Analyses all 19 student data fields                          │
│  • Calculates weighted risk score (0–100)                       │
│  • Determines risk level (Low / Medium / High)                  │
│  • Generates categorised risk factors                           │
│  • Determines dominant counselor type                           │
│  • Generates recommendation                                     │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│              High-Risk Detection (Score ≥ 70)                    │
│                                                                  │
│  IF HIGH RISK DETECTED:                                          │
│    → Find counselor matching student's counselorType            │
│    → Fallback: general counselor → any available                │
│    → Create Counseling Record with factor summary               │
│    → Send context-aware Notifications                           │
│    → Update Student Status                                      │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│              Multi-Channel Notifications                         │
│                                                                  │
│  Teacher:   "High-risk: John Doe (85). Primary: financial.      │
│              Counselor Jane [financial] assigned."              │
│  Counselor: "New student: John Doe. Key concerns: Low income,  │
│              Part-time job."                                     │
│  Student:   "Counselor Jane has been assigned to you."          │
│                                                                  │
│  Channels: Socket.io (Real-time) + SMS (Twilio)                 │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Counseling Dashboard                           │
│                                                                  │
│  • View Assigned Students with risk profiles                    │
│  • Review categorised risk factor breakdown                     │
│  • Add Counseling Notes                                         │
│  • Update Status (Pending → In Progress → Resolved)             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎭 User Roles & Permissions

### Teacher
| Permission | Description |
|------------|-------------|
| Add Students | 4-section form with academic, financial, behavioural, medical data |
| Upload CSV | Bulk upload with all 19 fields |
| View Students | See all students with risk factor tags and counselor type |
| Run Predictions | Execute ML model — see categorised breakdown + counselor type |
| Assign Counselor | Manually assign with expertise match indicator |
| View Analytics | Dashboard with risk distribution chart |
| Receive Notifications | Context-aware alerts for high-risk students |

### Student
| Permission | Description |
|------------|-------------|
| View Profile | See personal academic data |
| View Risk Status | See dropout risk score and level |
| View Counselor | See assigned counselor details |
| View Counseling History | Access all counseling notes |
| Receive Notifications | Get updates about counseling |

### Counselor
| Permission | Description |
|------------|-------------|
| Register with Expertise | Choose specialisation: academic / financial / behavioral / medical / general |
| View Assigned Students | See students matched to their expertise |
| View Risk Profiles | Access full multi-dimensional student risk breakdown |
| Add Notes | Document counseling sessions |
| Update Status | Change counseling status |
| Receive Notifications | Get alerts with student risk context |

---

## 📊 Database Schema Overview

```
┌──────────────────┐        ┌──────────────────────────────────┐
│      Users       │        │            Students              │
├──────────────────┤        ├──────────────────────────────────┤
│ _id              │◀───┐   │ _id                              │
│ name             │    │   │ name, rollNumber, email, phone   │
│ email            │    └───│ teacherId                        │
│ password         │        │ userId, counselorId              │
│ role             │    ┌───│ counselingStatus                 │
│ phoneNumber      │    │   │ — Academic —                     │
│ expertise        │    │   │ attendancePercentage             │
│ isActive         │    │   │ internalMarks                    │
└──────────────────┘    │   │ assignmentCompletion             │
                        │   │ previousFailures                 │
                        │   │ engagementScore                  │
                        │   │ — Financial —                    │
                        │   │ familyIncome, travelDistance     │
                        │   │ scholarshipStatus                │
                        │   │ partTimeJob                      │
                        │   │ numberOfDependents               │
                        │   │ — Behavioural —                  │
                        │   │ disciplinaryActions              │
                        │   │ socialMediaHours                 │
                        │   │ extracurricularParticipation     │
                        │   │ — Medical —                      │
                        │   │ hasChronicIllness                │
                        │   │ mentalHealthConcern              │
                        │   │ missedDueMedical                 │
                        │   │ — Prediction —                   │
                        │   │ riskScore, riskLevel             │
                        │   │ riskFactors[], counselorType     │
                        │   │ recommendation                   │
                        │   └──────────────────────────────────┘
                        │
                        │   ┌──────────────────┐   ┌──────────────────┐
                        │   │   Predictions    │   │   Counseling     │
                        │   ├──────────────────┤   ├──────────────────┤
                        │   │ studentId        │   │ studentId        │
                        │   │ riskScore        │   │ counselorId      │
                        │   │ riskLevel        │   │ status           │
                        │   │ riskFactors[]    │   │ notes[]          │
                        │   │ counselorType    │   │ sessionCount     │
                        │   │ recommendation   │   │ assignedDate     │
                        │   │ inputData        │   │ resolvedDate     │
                        │   │ predictedBy      │   └──────────────────┘
                        │   └──────────────────┘
                        │
                        │   ┌──────────────────┐
                        └───│  Notifications   │
                            ├──────────────────┤
                            │ userId           │
                            │ message          │
                            │ type             │
                            │ status           │
                            │ priority         │
                            └──────────────────┘
```

---

## 📱 Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **UI Library**: Shadcn UI + Radix UI
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Routing**: React Router v6
- **HTTP Client**: Fetch API
- **Real-time**: Socket.io Client
- **Charts**: Recharts

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB 6+
- **ODM**: Mongoose
- **Authentication**: JWT + bcryptjs
- **Real-time**: Socket.io
- **File Upload**: Multer
- **SMS**: Twilio API
- **CSV Parsing**: csv-parser
- **HTTP Client**: Axios

### Machine Learning
- **Language**: Python
- **Model**: XGBoost (student_xgboost_model.pkl)
- **API**: Flask / FastAPI (external service)
- **Fallback**: Internal weighted scoring engine (no external dependency)
- **Features**: 19 fields across academic, financial, behavioural, medical dimensions

---

## 🎨 Features in Detail

### 1. Multi-Dimensional Student Profiling
- 4-section add/edit form: Academic, Financial, Behavioural, Medical
- 19 data fields total (up from 7)
- Boolean fields use toggle switches
- Scholarship status dropdown (none / partial / full)

### 2. Categorised Risk Analysis
- Weighted scoring across all four dimensions
- Risk factors grouped and labelled by category: `[Academic]`, `[Financial]`, `[Behavioral]`, `[Medical]`
- Dominant category determines `counselorType`
- Shown as colour-coded breakdown in Run Prediction page

### 3. Expertise-Matched Auto-Assignment
- Counselors register with a declared expertise
- On high-risk detection: system finds counselor matching `counselorType`
- Fallback chain: matching expertise → general → any available
- Manual assign dialog shows expertise badges and "✓ match" indicator

### 4. CSV Bulk Upload
- All 19 fields supported
- Booleans: `true/false`, `yes/1`
- Scholarship: `none/partial/full`
- Only `name` and `rollNumber` are required; all others default to 0/false

### 5. Real-time Notifications
- Context-aware messages include risk score, primary concern, and counselor expertise
- Persistent in database with read/unread tracking
- Socket.io for instant delivery

### 6. Counseling Management
- Session tracking with notes
- Status workflow: Pending → In Progress → Resolved
- Initial note auto-populated with risk factors summary

---

## 📈 Future Enhancements

### Phase 2
- [ ] Advanced analytics dashboard with dimension-level charts
- [ ] Predictive trends visualization
- [ ] Email notification support
- [ ] Parent portal integration
- [ ] Mobile app (React Native)

### Phase 3
- [ ] AI-powered counseling recommendations per risk type
- [ ] Chatbot for student support
- [ ] Integration with LMS systems
- [ ] Multi-language support

### Phase 4
- [ ] Intervention effectiveness tracking
- [ ] Video counseling integration
- [ ] Calendar and scheduling system

---

## 🎯 Success Metrics

| KPI | Target |
|-----|--------|
| Dropout Rate Reduction | 20–30% in first year |
| Early Detection Rate | 90%+ of at-risk students identified |
| Counselor Match Accuracy | 80%+ correct expertise assignment |
| Intervention Timeliness | Counselor assigned within 24 hours |
| Counseling Completion Rate | 80%+ of assigned students complete counseling |

---

**Last Updated**: March 2026
**Version**: 2.0.0
**Status**: Production Ready
