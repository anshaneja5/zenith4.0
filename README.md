# Nyaay.AI - Advanced Legal Assistance Platform

## Overview

Nyaay.AI is a cutting-edge legal assistance platform that combines blockchain technology, artificial intelligence, and modern web development to provide comprehensive legal services. The platform offers secure document management, AI-powered legal guidance, and community support in a user-friendly interface.

## Tech Stack

### Frontend

- React.js with Vite
- Material-UI (MUI) for UI components
- Tailwind CSS for styling
- React Router for navigation
- Context API for state management
- Web3.js for blockchain integration
- Speech-to-Text API integration
- Real-time chat interface


### Backend

- Node.js with Express.js
- MongoDB for database
- JWT for authentication
- Cloudinary for file storage
- Ethereum blockchain integration
- Google Gemini AI for legal assistance
- Google Cloud Speech-to-Text
- Twitter API integration
- Rate limiting and security middleware


### Blockchain

- Ethereum smart contracts
- Web3.js integration
- Evidence verification system
- Immutable document storage
- Transaction management
- Gas optimization


### AI \& ML

- Google Gemini AI integration
- Natural Language Processing
- Multi-language support
- Context-aware responses
- Legal document analysis
- Sentiment analysis
- Social media integration


## Features

### 1. Blockchain-Powered Evidence Management

- Immutable evidence storage on Ethereum blockchain
- Smart contract-based verification
- Hash-based document verification
- Timestamp verification
- Evidence integrity checks
- Blockchain transaction history


### 2. AI-Powered Legal Assistance

- Google Gemini AI integration
- Multi-language support (English, Hindi, Bengali, Tamil, Telugu, Marathi)
- Context-aware legal guidance
- Jurisdiction-specific advice
- Real-time chat interface
- Voice-to-text capabilities
- Social media context integration


### 3. Advanced Document Management

- Secure document upload and storage
- Blockchain-based verification
- Document versioning
- Multi-format support
- Cloud storage integration
- Document sharing capabilities
- Access control management


### 4. Smart Authentication System

- JWT-based authentication
- Role-based access control
- Session management
- Secure password handling
- Multi-factor authentication support
- OAuth integration


### 5. Community Features

- Legal forum with AI moderation
- Social media integration
- Knowledge sharing platform
- Community support system
- Real-time notifications
- User reputation system


### 6. Educational Resources

- AI-curated legal content
- Interactive learning modules
- Multi-language support
- Video and audio content
- Document templates
- Legal terminology database


## API Endpoints

### Authentication

- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login
- POST `/api/auth/logout` - User logout


### Blockchain

- POST `/api/blockchain/store` - Store evidence on blockchain
- GET `/api/blockchain/verify` - Verify evidence authenticity
- GET `/api/blockchain/history` - Get transaction history


### AI Services

- POST `/api/ai/chat` - AI legal assistance
- POST `/api/ai/speech-to-text` - Voice to text conversion
- GET `/api/ai/social-context` - Social media context


### Documents

- POST `/api/documents/upload` - Upload document
- GET `/api/documents/verify` - Verify document
- GET `/api/documents/history` - Document history


### Forum

- GET `/api/forum/posts` - Get forum posts
- POST `/api/forum/posts` - Create post
- POST `/api/forum/comments` - Add comment


## Smart Contract Features

### BlockchainEvidence.sol

- Evidence storage on blockchain
- Hash-based verification
- Timestamp recording
- Submitter tracking
- Event emission
- Gas optimization


## AI Integration

### Google Gemini AI

- Legal guidance generation
- Multi-language support
- Context awareness
- Jurisdiction-specific responses
- Document analysis
- Social media context integration


### Speech-to-Text

- Multi-language support
- Real-time conversion
- High accuracy
- Punctuation handling



## Security Features

- Blockchain-based verification
- JWT authentication
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- File upload restrictions
- Secure authentication
- Protected routes
- Error handling middleware


## Database Schema

### User

- username
- email
- password (hashed)
- role
- blockchainAddress
- createdAt
- updatedAt


### Evidence

- reportId
- fileId
- blockchainHash
- metadata
- timestamp
- submitter
- status


### Document

- filename
- url
- blockchainHash
- metadata
- owner
- accessControl
- version


### ChatSession

- userId
- title
- jurisdiction
- language
- messages
- createdAt
- updatedAt


## Environment Variables

### Frontend

- `VITE_API_URL` - Backend API URL
- `VITE_BLOCKCHAIN_PROVIDER` - Blockchain provider URL
- `VITE_CONTRACT_ADDRESS` - Smart contract address
- `VITE_CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `VITE_CLOUDINARY_UPLOAD_PRESET` - Cloudinary upload preset


### Backend

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `PORT` - Server port
- `BLOCKCHAIN_PROVIDER_URL` - Ethereum provider URL
- `CONTRACT_ADDRESS` - Smart contract address
- `ETHEREUM_ACCOUNT` - Ethereum account
- `ETHEREUM_PRIVATE_KEY` - Ethereum private key
- `GEMINI_API_KEY` - Google Gemini API key
- `TWITTER_API_KEY` - Twitter API key
- `TWITTER_API_SECRET` - Twitter API secret
- `GOOGLE_CLOUD_CREDENTIALS` - Google Cloud credentials


## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Ethereum node or provider
- Cloudinary account
- Google Cloud account
- Twitter API access
- npm or yarn


### Installation

1. Clone the repository
2. Install dependencies:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables:
    - Copy `.env.example` to `.env` in both frontend and backend directories
    - Fill in the required environment variables
4. Deploy smart contracts:

```bash
cd backend
npx hardhat deploy
```

5. Start the development servers:

```bash
# Start backend server
cd backend
npm run dev

# Start frontend server
cd frontend
npm run dev
```


## Deployment

The application can be deployed using:

- Frontend: Vercel, Netlify, or any static hosting service
- Backend: Heroku, DigitalOcean, or any Node.js hosting service
- Database: MongoDB Atlas
- Blockchain: Ethereum mainnet or testnet
- File Storage: Cloudinary
- AI Services: Google Cloud Platform


## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact the development team or create an issue in the repository.
