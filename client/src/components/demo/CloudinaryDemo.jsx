/**
 * Cloudinary Demo Component
 * Test component for Cloudinary image upload functionality
 */

import React, { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  Stack,
  CircularProgress
} from '@mui/material'
import {
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material'
import ImageUpload from '../ui/ImageUpload'
import { testCloudinaryConfig } from '../../utils/testCloudinary'

const CloudinaryDemo = () => {
  const [testResults, setTestResults] = useState(null)
  const [uploadedImages, setUploadedImages] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const runTest = () => {
    setIsLoading(true)
    try {
      const results = testCloudinaryConfig()
      setTestResults(results)
    } catch (error) {
      console.error('Test failed:', error)
      setTestResults({ error: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 700 }}>
        Cloudinary Integration Demo
      </Typography>

      {/* Configuration Test */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Configuration Test
          </Typography>
          <Button
            variant="contained"
            onClick={runTest}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
            sx={{ mb: 2 }}
          >
            {isLoading ? 'Testing...' : 'Test Configuration'}
          </Button>
          
          {testResults && (
            <Box>
              {testResults.error ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  Test failed: {testResults.error}
                </Alert>
              ) : (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Configuration test passed!
                </Alert>
              )}
              
              <Typography variant="body2" component="pre" sx={{ 
                bgcolor: 'grey.100', 
                p: 2, 
                borderRadius: 1,
                overflow: 'auto',
                fontSize: '0.875rem'
              }}>
                {JSON.stringify(testResults, null, 2)}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Image Upload Test */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Image Upload Test
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Test the image upload functionality. Upload up to 3 images to see how it works.
          </Typography>
          
          <ImageUpload
            value={uploadedImages}
            onChange={setUploadedImages}
            multiple={true}
            maxFiles={3}
            folder="ecom-multirole/test"
            accept="image/*"
          />
          
          {uploadedImages.length > 0 && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Successfully uploaded {uploadedImages.length} image(s)!
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Setup Instructions
          </Typography>
          <Stack spacing={1}>
            <Typography variant="body2">
              1. Create a Cloudinary account at cloudinary.com
            </Typography>
            <Typography variant="body2">
              2. Create an unsigned upload preset named "ecom-multirole"
            </Typography>
            <Typography variant="body2">
              3. Add your API secret to the .env file as VITE_CLOUDINARY_API_SECRET
            </Typography>
            <Typography variant="body2">
              4. Restart the development server
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}

export default CloudinaryDemo





