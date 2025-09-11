/**
 * Banner Manager Component
 * Admin interface for managing banner carousel images
 */

import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material'
import BannerUpload from '../ui/BannerUpload'

const BannerManager = () => {
  const [banners, setBanners] = useState([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingBanner, setEditingBanner] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // Sample banners data - in real app, this would come from API
  const [bannerData, setBannerData] = useState([
    {
      id: 1,
      title: 'Big Billion Days Sale',
      subtitle: 'Up to 70% Off',
      description: 'Shop now and save big on your favorite products',
      image: null,
      link: '/products?category=electronics',
      buttonText: 'Shop Now',
      isActive: true,
      order: 1
    },
    {
      id: 2,
      title: 'Fashion Week',
      subtitle: 'New Arrivals',
      description: 'Discover the latest trends in fashion',
      image: null,
      link: '/products?category=fashion',
      buttonText: 'Explore',
      isActive: true,
      order: 2
    },
    {
      id: 3,
      title: 'Home & Living',
      subtitle: 'Transform Your Space',
      description: 'Beautiful furniture and home decor at amazing prices',
      image: null,
      link: '/products?category=home',
      buttonText: 'Shop Home',
      isActive: false,
      order: 3
    }
  ])

  const handleAddBanner = () => {
    setEditingBanner(null)
    setShowAddDialog(true)
  }

  const handleEditBanner = (banner) => {
    setEditingBanner(banner)
    setShowAddDialog(true)
  }

  const handleDeleteBanner = (bannerId) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      setBannerData(prev => prev.filter(banner => banner.id !== bannerId))
    }
  }

  const handleSaveBanner = (bannerData) => {
    if (editingBanner) {
      // Update existing banner
      setBannerData(prev => prev.map(banner => 
        banner.id === editingBanner.id ? { ...banner, ...bannerData } : banner
      ))
    } else {
      // Add new banner
      const newBanner = {
        ...bannerData,
        id: Date.now(), // Simple ID generation
        order: bannerData.length + 1
      }
      setBannerData(prev => [...prev, newBanner])
    }
    setShowAddDialog(false)
  }

  const handleToggleStatus = (bannerId) => {
    setBannerData(prev => prev.map(banner => 
      banner.id === bannerId ? { ...banner, isActive: !banner.isActive } : banner
    ))
  }

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            Banner Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage homepage banner carousel images and content
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddBanner}
          sx={{ textTransform: 'none' }}
        >
          Add New Banner
        </Button>
      </Stack>

      {/* Banners Grid */}
      <Grid container spacing={3}>
        {bannerData.map((banner) => (
          <Grid item xs={12} md={6} lg={4} key={banner.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={banner.image?.url || '/placeholder-banner.jpg'}
                alt={banner.title}
                sx={{ objectFit: 'cover' }}
              />
              
              <CardContent sx={{ flexGrow: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                    {banner.title}
                  </Typography>
                  <Chip
                    label={banner.isActive ? 'Active' : 'Inactive'}
                    color={banner.isActive ? 'success' : 'error'}
                    size="small"
                  />
                </Stack>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {banner.subtitle}
                </Typography>
                
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {banner.description}
                </Typography>
                
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip label={banner.buttonText} size="small" variant="outlined" />
                  <Chip label={`Order: ${banner.order}`} size="small" variant="outlined" />
                </Stack>
              </CardContent>
              
              <CardActions>
                <Button
                  size="small"
                  startIcon={<VisibilityIcon />}
                  onClick={() => window.open(banner.link, '_blank')}
                >
                  Preview
                </Button>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => handleEditBanner(banner)}
                >
                  Edit
                </Button>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteBanner(banner.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Banner Dialog */}
      <BannerFormDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        banner={editingBanner}
        onSave={handleSaveBanner}
      />
    </Box>
  )
}

// Banner Form Dialog Component
const BannerFormDialog = ({ open, onClose, banner, onSave }) => {
  const [formData, setFormData] = useState({
    title: banner?.title || '',
    subtitle: banner?.subtitle || '',
    description: banner?.description || '',
    link: banner?.link || '',
    buttonText: banner?.buttonText || '',
    isActive: banner?.isActive ?? true,
    image: banner?.image || null
  })

  const [errors, setErrors] = useState({})

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Basic validation
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.subtitle.trim()) newErrors.subtitle = 'Subtitle is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.link.trim()) newErrors.link = 'Link is required'
    if (!formData.buttonText.trim()) newErrors.buttonText = 'Button text is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSave(formData)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {banner ? 'Edit Banner' : 'Add New Banner'}
        </Typography>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Banner Title"
                value={formData.title}
                onChange={handleChange('title')}
                error={!!errors.title}
                helperText={errors.title}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Subtitle"
                value={formData.subtitle}
                onChange={handleChange('subtitle')}
                error={!!errors.subtitle}
                helperText={errors.subtitle}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Button Text"
                value={formData.buttonText}
                onChange={handleChange('buttonText')}
                error={!!errors.buttonText}
                helperText={errors.buttonText}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={handleChange('description')}
                multiline
                rows={3}
                error={!!errors.description}
                helperText={errors.description}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Link URL"
                value={formData.link}
                onChange={handleChange('link')}
                error={!!errors.link}
                helperText={errors.link}
                placeholder="/products?category=electronics"
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Banner Image
              </Typography>
              <BannerUpload
                value={formData.image}
                onChange={(image) => setFormData(prev => ({ ...prev, image }))}
                folder="ecom-multirole/banners"
                aspectRatio="16:9"
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained"
            sx={{ textTransform: 'none' }}
          >
            {banner ? 'Update Banner' : 'Create Banner'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default BannerManager





