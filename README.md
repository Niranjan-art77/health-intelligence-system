# Nova Health AI — Backend

Node.js + Express + MongoDB + Socket.io backend for the Nova Health Hospital Intelligence Patient Portal.

## Setup

1. **Copy `.env.example` to `.env`** and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm run dev        # Development (with nodemon)
   npm start          # Production
   ```

## Environment Variables

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `PORT` | Server port (default: 8080) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CLIENT_URL` | Frontend URL for CORS |

## API Reference

| Endpoint | Description |
|---|---|
| `POST /api/auth/register` | Register new user |
| `POST /api/auth/login` | Login and get JWT token |
| `GET /api/patients/:id` | Get patient by user ID |
| `GET /api/patients/:id/vitals` | Get patient vitals history |
| `GET /api/patients/:id/timeline` | Get patient timeline |
| `GET /api/doctors` | List all doctors |
| `POST /api/doctors/:id/rate` | Rate a doctor |
| `GET /api/appointments/patient/:id` | Patient's appointments |
| `POST /api/appointments` | Book appointment |
| `GET /api/prescriptions/recent/:id` | Recent prescriptions |
| `POST /api/reports/upload` | Upload medical report |
| `GET /api/billing/patient/:id` | Patient billing |
| `POST /api/billing/pay/:id` | Pay a bill |
| `GET /api/notifications` | User notifications |
| `GET /api/messages/:roomId` | Get chat messages |
| `GET /api/beds` | List all beds |
| `GET /api/medications/patient/:id` | Medication reminders |
| `POST /api/symptoms/analyze` | AI symptom triage |
| `GET /api/ai/health-tip` | Daily health tip |
| `POST /api/ai/health-score` | AI health risk score |
| `POST /api/ai/chat` | AI chatbot |
| `POST /api/ai/diet-recommendations` | AI diet advice |
| `POST /api/ai/doctor-recommendation` | AI doctor finder |

## Deployment (Railway)

1. Push to GitHub
2. Connect Railway to this repo
3. Set all environment variables in Railway dashboard
4. Railway will auto-deploy using the `Procfile`
