# LMS  backend  project 

lms-backend
├── README.md           # This file
└── server/            # Backend API server     
    ├── package.json
    ├── server.js
    └── ...


 **Clone the repository**
   ```CMD
   git clone <your-repository-url>
   cd lms
   ```

2. **Backend Setup**
   ```CMD
   cd server
   npm install
   cp .env.example .env
   # Edit .env file with your configuration
   npm run dev
   ```

   The server will be running at `http://localhost:5016`

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **File Storage**: Cloudinary
- **Payment Gateway**: Razorpay
- **Email Service**: Nodemailer

## 🔌 API Endpoints

The backend provides RESTful APIs for:

- **User Management**: `/api/v1/user/*`
- **Course Management**: `/api/v1/courses/*`
- **Payment Processing**: `/api/v1/payments/*`
- **Miscellaneous**: `/api/v1/*`

## 🧪 Testing


2. **API Testing Tools**
   - [Postman](https://www.postman.com/)

### Available Scripts

**Backend (from `/server` directory):**
- `npm run dev` - Start development server with nodemon

## 🚨 Environment Configuration

Both client and server require environment variables. Example files are provided:

- `server/.env.example` - Backend environment variables

Make sure to copy these to `.env` files and configure them with your actual values.


## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🔗 Links

- [Backend Documentation](./server/README.md)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)
