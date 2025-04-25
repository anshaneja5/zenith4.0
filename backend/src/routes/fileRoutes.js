import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import File from '../models/File.js';
import Report from '../models/Report.js';
import blockchainService from '../services/blockchainService.js';
import crypto from 'crypto';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Allow only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

// Upload image with blockchain verification
router.post('/upload/:reportId', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Get file hash from request or calculate it server-side for double verification
    const clientFileHash = req.body.fileHash;
    
    // Server-side hash calculation for verification
    const fileBuffer = req.file.buffer;
    const serverFileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    
    // Verify hash matches what client sent
    if (clientFileHash && clientFileHash !== serverFileHash) {
      return res.status(400).json({ message: 'File integrity check failed' });
    }
    
    // Use server calculated hash for security
    const fileHash = serverFileHash;

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    // Create file record in database with transaction status
    const file = new File({
      filename: req.file.originalname,
      url: result.secure_url,
      publicId: result.public_id,
      reportId: req.params.reportId,
      fileHash: fileHash,
      blockchainVerification: {
        verified: false,
        status: 'pending', // Add status field to track transaction state
        timestamp: new Date()
      }
    });

    await file.save();

    // Update the report's files array
    await Report.findByIdAndUpdate(
      req.params.reportId,
      { $push: { files: file._id } },
      { new: true }
    );

    // Store hash on blockchain (async operation)
    const metadata = {
      timestamp: new Date().toISOString(),
      reportId: req.params.reportId,
      filename: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size
    };

    // Store on blockchain and update database with transaction details
    blockchainService.storeEvidenceHash(
      req.params.reportId,
      file._id.toString(),
      fileHash,
      metadata
    ).then(async (blockchainReceipt) => {
      try {
        console.log("Blockchain receipt received:", blockchainReceipt);
        // Update file with blockchain verification data
        const updatedFile = await File.findByIdAndUpdate(file._id, {
          'blockchainVerification.transactionHash': blockchainReceipt.transactionHash,
          'blockchainVerification.blockNumber': Number(blockchainReceipt.blockNumber),
          'blockchainVerification.timestamp': new Date(),
          'blockchainVerification.verified': true,
          'blockchainVerification.status': 'confirmed'
        }, { new: true });
        console.log("File updated with blockchain verification:", updatedFile.blockchainVerification);
      } catch (dbError) {
        console.error('Error updating file with blockchain data:', dbError);
      }
    }).catch(error => {
      console.error('Blockchain storage error:', error);
      // Update status to failed
      File.findByIdAndUpdate(file._id, {
        'blockchainVerification.status': 'failed',
        'blockchainVerification.error': error.message
      }).catch(err => console.error('Error updating file status:', err));
    });

    res.status(201).json({
      message: 'Image uploaded successfully',
      file: {
        id: file._id,
        url: file.url,
        filename: file.filename,
        fileHash: fileHash
      }
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Error uploading image' });
  }
});

// Enhanced verification endpoint to support polling
// Enhanced verification endpoint to support polling
// Enhanced verification endpoint to support polling
router.get('/verify/:fileId', async (req, res) => {
  try {
    console.log(`Verifying file: ${req.params.fileId}`);
    const file = await File.findById(req.params.fileId);
    if (!file) {
      console.log(`File not found: ${req.params.fileId}`);
      return res.status(404).json({ message: 'File not found' });
    }

    console.log(`File blockchain verification status: ${file.blockchainVerification?.status || 'unknown'}`);
    console.log(`File hash: ${file.fileHash}`);

    // Always check with blockchain regardless of database status
    try {
      // Verify with blockchain
      const blockchainVerification = await blockchainService.verifyEvidence(file.fileHash);
      
      // Check if the hash exists on the blockchain
      if (blockchainVerification && blockchainVerification.exists) {
        // Check if the returned reportId matches this file's reportId
        const blockchainReportId = blockchainVerification.reportId;
        const fileReportId = file.reportId.toString();
        
        console.log(`Blockchain reportId: ${blockchainReportId}, File reportId: ${fileReportId}`);
        
        // If reportIds match, verification is successful
        if (blockchainReportId === fileReportId) {
          // Update database if needed
          if (!file.blockchainVerification?.verified) {
            await File.findByIdAndUpdate(file._id, {
              'blockchainVerification.transactionHash': blockchainVerification.transactionHash || file.blockchainVerification?.transactionHash,
              'blockchainVerification.blockNumber': BigInt(blockchainVerification.blockNumber || 0),
              'blockchainVerification.timestamp': new Date(),
              'blockchainVerification.verified': true,
              'blockchainVerification.status': 'confirmed'
            });
          }
          
          // Return success response
          const response = {
            verified: true,
            file: {
              id: file._id,
              filename: file.filename,
              fileHash: file.fileHash,
              uploadedAt: file.createdAt,
              blockchainData: {
                transactionHash: blockchainVerification.transactionHash || file.blockchainVerification?.transactionHash,
                blockNumber: blockchainVerification.blockNumber || file.blockchainVerification?.blockNumber,
                timestamp: file.blockchainVerification?.timestamp || new Date()
              }
            },
            blockchainVerification
          };
          
          return res.json(JSON.parse(JSON.stringify(response, (key, value) => 
            typeof value === 'bigint' ? value.toString() : value
          )));
        } else {
          // Hash exists but for a different report - tampering detected
          console.log('Verification failed: Hash exists but for different report');
          return res.json({
            verified: false,
            error: 'File hash verification failed - possible tampering detected',
            file: {
              id: file._id,
              filename: file.filename,
              fileHash: file.fileHash
            }
          });
        }
      } else {
        // Hash doesn't exist on blockchain
        console.log('Verification failed: Hash not found on blockchain');
        
        if (file.blockchainVerification?.status === 'pending') {
          return res.json({
            verified: false,
            pending: true,
            message: 'Blockchain verification in progress',
            file: {
              id: file._id,
              filename: file.filename,
              fileHash: file.fileHash
            }
          });
        } else {
          return res.json({
            verified: false,
            message: 'File hash not found on blockchain',
            file: {
              id: file._id,
              filename: file.filename,
              fileHash: file.fileHash
            }
          });
        }
      }
    } catch (error) {
      console.error('Error during blockchain verification:', error);
      
      // If we can't verify with blockchain but have local verification data
      if (file.blockchainVerification?.verified) {
        return res.json({
          verified: true,
          file: {
            id: file._id,
            filename: file.filename,
            fileHash: file.fileHash,
            uploadedAt: file.createdAt,
            blockchainData: {
              transactionHash: file.blockchainVerification.transactionHash,
              blockNumber: file.blockchainVerification.blockNumber,
              timestamp: file.blockchainVerification.timestamp
            }
          },
          blockchainVerificationError: 'Could not verify with blockchain directly'
        });
      } else {
        return res.json({
          verified: false,
          error: 'Error connecting to blockchain',
          file: {
            id: file._id,
            filename: file.filename,
            fileHash: file.fileHash
          }
        });
      }
    }
  } catch (error) {
    console.error('Error verifying file:', error);
    res.status(500).json({ message: 'Error verifying file' });
  }
});



// Add a manual verification endpoint for retrying failed verifications
router.post('/verify-manual/:fileId', async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    if (!file.fileHash) {
      return res.status(400).json({ message: 'File has no hash to verify' });
    }
    
    // Update status to pending
    await File.findByIdAndUpdate(file._id, {
      'blockchainVerification.status': 'pending',
      'blockchainVerification.error': null
    });
    
    // Try to store on blockchain again
    const metadata = {
      timestamp: new Date().toISOString(),
      reportId: file.reportId.toString(),
      filename: file.filename
    };
    
    const blockchainReceipt = await blockchainService.storeEvidenceHash(
      file.reportId.toString(),
      file._id.toString(),
      file.fileHash,
      metadata
    );
    
    await File.findByIdAndUpdate(file._id, {
      'blockchainVerification.transactionHash': blockchainReceipt.transactionHash,
      'blockchainVerification.blockNumber': BigInt(blockchainReceipt.blockNumber),
      'blockchainVerification.timestamp': new Date(),
      'blockchainVerification.verified': true,
      'blockchainVerification.status': 'confirmed'
    });
    
    res.json({ 
      success: true, 
      message: 'File verification manually triggered',
      transactionHash: blockchainReceipt.transactionHash
    });
  } catch (error) {
    console.error('Error in manual verification:', error);
    
    // Update status to failed
    try {
      await File.findByIdAndUpdate(req.params.fileId, {
        'blockchainVerification.status': 'failed',
        'blockchainVerification.error': error.message
      });
    } catch (dbError) {
      console.error('Error updating file status:', dbError);
    }
    
    res.status(500).json({ message: 'Error in manual verification' });
  }
});

// Add a verification status endpoint for checking transaction status
router.get('/verification-status/:fileId', async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    return res.json({
      fileId: file._id,
      status: file.blockchainVerification?.status || 'unknown',
      verified: file.blockchainVerification?.verified || false,
      transactionHash: file.blockchainVerification?.transactionHash,
      blockNumber: file.blockchainVerification?.blockNumber,
      timestamp: file.blockchainVerification?.timestamp,
      error: file.blockchainVerification?.error
    });
  } catch (error) {
    console.error('Error fetching verification status:', error);
    res.status(500).json({ message: 'Error fetching verification status' });
  }
});

export default router;
