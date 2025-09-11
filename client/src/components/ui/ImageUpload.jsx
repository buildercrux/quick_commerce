/**
 * Image Upload Component
 * Reusable component for uploading images to Cloudinary
 */

import React, { useState, useRef } from 'react'
import {
  Box,
  Button,
  Typography,
  Stack,
  IconButton,
  Alert,
  CircularProgress,
  Card,
  CardMedia,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  Close as CloseIcon,
  ZoomIn as ZoomInIcon
} from '@mui/icons-material'
import { uploadImage, uploadMultipleImages, deleteImage } from '../../config/cloudinary'

const ImageUpload = ({ 
  value = [], 
  onChange, 
  multiple = false, 
  maxFiles = 5, 
  folder = 'ecom-multirole',
  accept = 'image/*',
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [previewImage, setPreviewImage] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files)
    
    if (files.length === 0) return

    // Validate file count
    if (value.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed`)
      return
    }

    // Validate file types
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'))
    if (invalidFiles.length > 0) {
      setError('Please select only image files')
      return
    }

    // Validate file sizes (max 10MB per file)
    const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      setError('File size must be less than 10MB')
      return
    }

    setError('')
    setUploading(true)

    try {
      let uploadedImages
      
      if (multiple) {
        uploadedImages = await uploadMultipleImages(files, folder)
      } else {
        const result = await uploadImage(files[0], folder)
        uploadedImages = [{ ...result, isPrimary: true }]
      }

      const newImages = [...value, ...uploadedImages]
      onChange(newImages)
    } catch (error) {
      setError('Failed to upload images. Please try again.')
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = async (index) => {
    const imageToRemove = value[index]
    
    try {
      // Delete from Cloudinary
      if (imageToRemove.public_id) {
        await deleteImage(imageToRemove.public_id)
      }
      
      // Remove from local state
      const newImages = value.filter((_, i) => i !== index)
      onChange(newImages)
    } catch (error) {
      console.error('Error removing image:', error)
      // Still remove from local state even if Cloudinary deletion fails
      const newImages = value.filter((_, i) => i !== index)
      onChange(newImages)
    }
  }

  const handleSetPrimary = (index) => {
    const newImages = value.map((img, i) => ({
      ...img,
      isPrimary: i === index
    }))
    onChange(newImages)
  }

  const handlePreview = (image) => {
    setPreviewImage(image)
  }

  const handleClosePreview = () => {
    setPreviewImage(null)
  }

  return (
    <Box>
      {/* Upload Button */}
      <Button
        variant="outlined"
        startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || uploading || value.length >= maxFiles}
        sx={{ textTransform: 'none', mb: 2 }}
      >
        {uploading ? 'Uploading...' : `Upload ${multiple ? 'Images' : 'Image'}`}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        hidden
        multiple={multiple}
        accept={accept}
        onChange={handleFileSelect}
      />

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Uploaded Images */}
      {value.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Uploaded Images ({value.length}/{maxFiles})
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            {value.map((image, index) => (
              <Card key={index} sx={{ width: 120, position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="120"
                  image={image.url}
                  alt={`Upload ${index + 1}`}
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handlePreview(image)}
                />
                
                {/* Primary Badge */}
                {image.isPrimary && (
                  <Chip
                    label="Primary"
                    size="small"
                    color="primary"
                    sx={{
                      position: 'absolute',
                      top: 4,
                      left: 4,
                      fontSize: '0.7rem'
                    }}
                  />
                )}

                {/* Action Buttons */}
                <Box sx={{ position: 'absolute', top: 4, right: 4 }}>
                  <Stack direction="row" spacing={0.5}>
                    <IconButton
                      size="small"
                      onClick={() => handlePreview(image)}
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
                      onClick={() => handleRemoveImage(index)}
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

                {/* Set Primary Button */}
                {multiple && !image.isPrimary && (
                  <Button
                    size="small"
                    onClick={() => handleSetPrimary(index)}
                    sx={{
                      position: 'absolute',
                      bottom: 4,
                      left: 4,
                      right: 4,
                      fontSize: '0.7rem',
                      minWidth: 'auto'
                    }}
                  >
                    Set Primary
                  </Button>
                )}
              </Card>
            ))}
          </Stack>
        </Box>
      )}

      {/* Image Preview Dialog */}
      <Dialog
        open={!!previewImage}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Image Preview</Typography>
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
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain'
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {previewImage.public_id}
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default ImageUpload





