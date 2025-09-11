/**
 * Banner Upload Component
 * Specialized component for uploading banner images
 */

import React, { useState } from 'react'
import {
  Box,
  Button,
  Typography,
  Card,
  CardMedia,
  IconButton,
  Alert,
  CircularProgress,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  ZoomIn as ZoomInIcon,
  Close as CloseIcon,
  Image as ImageIcon
} from '@mui/icons-material'
import { uploadImage, deleteImage } from '../../config/cloudinary'

const BannerUpload = ({ 
  value = null, 
  onChange, 
  folder = 'ecom-multirole/banners',
  disabled = false,
  aspectRatio = '16:9'
}) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [previewImage, setPreviewImage] = useState(null)

  const handleFileSelect = async (event) => {
    const file = event.target.files[0]
    
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    setError('')
    setUploading(true)

    try {
      const result = await uploadImage(file, folder)
      onChange(result)
    } catch (error) {
      setError('Failed to upload image. Please try again.')
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = async () => {
    if (!value) return

    try {
      // Delete from Cloudinary
      if (value.public_id) {
        await deleteImage(value.public_id)
      }
      
      // Remove from local state
      onChange(null)
    } catch (error) {
      console.error('Error removing image:', error)
      // Still remove from local state even if Cloudinary deletion fails
      onChange(null)
    }
  }

  const handlePreview = () => {
    if (value) {
      setPreviewImage(value)
    }
  }

  const handleClosePreview = () => {
    setPreviewImage(null)
  }

  const getAspectRatioStyle = () => {
    switch (aspectRatio) {
      case '16:9':
        return { aspectRatio: '16/9' }
      case '4:3':
        return { aspectRatio: '4/3' }
      case '1:1':
        return { aspectRatio: '1/1' }
      case '21:9':
        return { aspectRatio: '21/9' }
      default:
        return { aspectRatio: '16/9' }
    }
  }

  return (
    <Box>
      {/* Upload Button */}
      <Button
        variant="outlined"
        startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
        onClick={() => document.getElementById('banner-upload').click()}
        disabled={disabled || uploading}
        sx={{ textTransform: 'none', mb: 2 }}
      >
        {uploading ? 'Uploading...' : 'Upload Banner Image'}
      </Button>

      <input
        id="banner-upload"
        type="file"
        hidden
        accept="image/*"
        onChange={handleFileSelect}
      />

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Uploaded Image */}
      {value && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Banner Image
          </Typography>
          <Card sx={{ maxWidth: 400, position: 'relative' }}>
            <CardMedia
              component="img"
              image={value.url}
              alt="Banner"
              sx={{
                ...getAspectRatioStyle(),
                cursor: 'pointer'
              }}
              onClick={handlePreview}
            />
            
            {/* Action Buttons */}
            <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
              <Stack direction="row" spacing={0.5}>
                <IconButton
                  size="small"
                  onClick={handlePreview}
                  sx={{ 
                    bgcolor: 'rgba(0,0,0,0.5)', 
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                  }}
                >
                  <ZoomInIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={handleRemoveImage}
                  sx={{ 
                    bgcolor: 'rgba(0,0,0,0.5)', 
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Box>
          </Card>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Click to preview • {value.width} × {value.height}px
          </Typography>
        </Box>
      )}

      {/* No Image State */}
      {!value && !uploading && (
        <Card 
          sx={{ 
            maxWidth: 400, 
            border: '2px dashed',
            borderColor: 'grey.300',
            ...getAspectRatioStyle(),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'grey.50'
          }}
        >
          <Stack alignItems="center" spacing={1}>
            <ImageIcon sx={{ fontSize: 48, color: 'grey.400' }} />
            <Typography variant="body2" color="text.secondary">
              No banner image uploaded
            </Typography>
          </Stack>
        </Card>
      )}

      {/* Image Preview Dialog */}
      <Dialog
        open={!!previewImage}
        onClose={handleClosePreview}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Banner Preview</Typography>
            <IconButton onClick={handleClosePreview}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {previewImage && (
            <Box sx={{ textAlign: 'center' }}>
              <img
                src={previewImage.url}
                alt="Banner Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain'
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {previewImage.public_id} • {previewImage.width} × {previewImage.height}px
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default BannerUpload





