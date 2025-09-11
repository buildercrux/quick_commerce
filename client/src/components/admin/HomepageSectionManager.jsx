/**
 * Homepage Section Manager - Admin Component
 * Allows admins to manage homepage sections and their products
 */

import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  IconButton,
  Chip,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Tooltip,
  Badge,
  Stack,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  InputAdornment,
  Fab,
  Snackbar
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  KeyboardArrowUp as ArrowUpIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Inventory as PackageIcon,
  Settings as SettingsIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material'
import {
  fetchAllHomepageSections,
  createHomepageSection,
  updateHomepageSection,
  deleteHomepageSection,
  addProductToSection,
  removeProductFromSection,
  reorderSections,
  clearAdminSections
} from '../../features/homepageSections/homepageSectionSlice'
import { fetchAllProducts } from '../../features/products/productSlice'
import LoadingSpinner from '../ui/LoadingSpinner'

const HomepageSectionManager = () => {
  const dispatch = useDispatch()
  const { adminSections, adminLoading, adminError } = useSelector((state) => state.homepageSections)
  const { products, isLoading: productsLoading, error: productsError } = useSelector((state) => state.products)
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  
  
  const [isAddingSection, setIsAddingSection] = useState(false)
  const [editingSection, setEditingSection] = useState(null)
  const [selectedSection, setSelectedSection] = useState(null)
  const [showProductManager, setShowProductManager] = useState(false)

  useEffect(() => {
    // Only fetch data if user is authenticated and is admin
    if (isAuthenticated && user?.role === 'admin') {
      dispatch(fetchAllHomepageSections())
      dispatch(fetchAllProducts({ limit: 100 }))
    }
  }, [dispatch, isAuthenticated, user])



  const handleCreateSection = (sectionData) => {
    dispatch(createHomepageSection(sectionData))
    setIsAddingSection(false)
  }

  const handleUpdateSection = (sectionId, sectionData) => {
    dispatch(updateHomepageSection({ id: sectionId, sectionData }))
    setEditingSection(null)
  }

  const handleDeleteSection = (sectionId) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      dispatch(deleteHomepageSection(sectionId))
    }
  }

  const handleToggleVisibility = (section) => {
    dispatch(updateHomepageSection({
      id: section._id,
      sectionData: { ...section, isVisible: !section.isVisible }
    }))
  }

  const handleMoveSection = (sectionId, direction) => {
    const currentIndex = adminSections.findIndex(s => s._id === sectionId)
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    
    if (newIndex >= 0 && newIndex < adminSections.length) {
      const newSections = [...adminSections]
      const [movedSection] = newSections.splice(currentIndex, 1)
      newSections.splice(newIndex, 0, movedSection)
      
      const sectionOrders = newSections.map((section, index) => ({
        sectionId: section._id,
        order: index
      }))
      
      dispatch(reorderSections(sectionOrders))
    }
  }

  const handleAddProduct = (sectionId, productId) => {
    dispatch(addProductToSection({ sectionId, productId }))
  }

  const handleRemoveProduct = (sectionId, productId) => {
    dispatch(removeProductFromSection({ sectionId, productId }))
  }

  // Show loading if checking authentication or fetching data
  if (adminLoading || productsLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    )
  }

  // Show error if user is not admin
  if (isAuthenticated && user?.role !== 'admin') {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 text-lg font-semibold mb-2">
          Access Denied
        </div>
        <p className="text-gray-600">
          You don't have permission to access this page.
        </p>
      </div>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
        {/* Header Section */}
        <Card sx={{ mb: 4, boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
              <Box>
                <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
                  Homepage Sections Manager
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Create and manage dynamic sections for your homepage
                </Typography>
              </Box>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<SettingsIcon />}
                  onClick={() => dispatch(fetchAllHomepageSections())}
                  sx={{ textTransform: 'none' }}
                >
                  Refresh
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setIsAddingSection(true)}
                  sx={{ textTransform: 'none', px: 3 }}
                >
                  Add New Section
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Error Display */}
        {(adminError || productsError) && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              <IconButton
                color="inherit"
                size="small"
                onClick={() => {
                  dispatch(clearAdminSections())
                  if (productsError) {
                    dispatch(fetchAllProducts({ limit: 100 }))
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            }
          >
            {adminError || productsError}
          </Alert>
        )}

        {/* Sections Grid */}
        <Grid container spacing={3}>
          {adminSections && Array.isArray(adminSections)
            ? [...adminSections]
                .sort((a, b) => a.order - b.order)
                .map((section, index) => (
              <Grid item xs={12} md={6} lg={4} key={section._id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6
                    }
                  }}
                >
                  {/* Section Header */}
                  <CardHeader
                    sx={{
                      bgcolor: 'primary.50',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      pb: 2
                    }}
                    title={
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Stack direction="column" alignItems="center" spacing={0.5}>
                          <IconButton
                            size="small"
                            onClick={() => handleMoveSection(section._id, 'up')}
                            disabled={index === 0}
                            sx={{ p: 0.5 }}
                          >
                            <ArrowUpIcon fontSize="small" />
                          </IconButton>
                          <Chip 
                            label={section.order + 1} 
                            size="small" 
                            sx={{ minWidth: 24, height: 24 }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => handleMoveSection(section._id, 'down')}
                            disabled={index === (adminSections?.length || 0) - 1}
                            sx={{ p: 0.5 }}
                          >
                            <ArrowDownIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                        <Box>
                          <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                            {section.title}
                          </Typography>
                          <Chip
                            label={section.isVisible ? 'Visible' : 'Hidden'}
                            color={section.isVisible ? 'success' : 'error'}
                            size="small"
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      </Stack>
                    }
                  />

                  {/* Section Content */}
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                    >
                      {section.description}
                    </Typography>
                    
                    {/* Section Details */}
                    <Stack spacing={1} sx={{ mb: 2 }}>
                      <Stack direction="row" spacing={1}>
                        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 40 }}>
                          Type:
                        </Typography>
                        <Typography variant="caption" sx={{ textTransform: 'capitalize', fontWeight: 500 }}>
                          {section.type}
                        </Typography>
                      </Stack>
                      {section.type === 'category' && (
                        <Stack direction="row" spacing={1}>
                          <Typography variant="caption" color="text.secondary" sx={{ minWidth: 40 }}>
                            Category:
                          </Typography>
                          <Typography variant="caption" sx={{ textTransform: 'capitalize', fontWeight: 500 }}>
                            {section.category}
                          </Typography>
                        </Stack>
                      )}
                      <Stack direction="row" spacing={1}>
                        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 40 }}>
                          Max:
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 500 }}>
                          {section.maxProducts} products
                        </Typography>
                      </Stack>
                    </Stack>

                    {/* Products Preview */}
                    {section.products && section.products.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                          Products ({section.products.length})
                        </Typography>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {section.products.slice(0, 3).map(product => (
                            <Chip
                              key={product._id}
                              label={product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ fontSize: '0.75rem' }}
                            />
                          ))}
                          {section.products.length > 3 && (
                            <Chip
                              label={`+${section.products.length - 3} more`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.75rem' }}
                            />
                          )}
                        </Stack>
                      </Box>
                    )}

                    {/* Action Buttons */}
                    <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={1}>
                          <Tooltip title={section.isVisible ? 'Hide section' : 'Show section'}>
                            <IconButton
                              onClick={() => handleToggleVisibility(section._id, section.isVisible)}
                              color={section.isVisible ? 'error' : 'success'}
                              size="small"
                            >
                              {section.isVisible ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Manage products">
                            <IconButton
                              onClick={() => {
                                setSelectedSection(section)
                                setShowProductManager(true)
                              }}
                              color="primary"
                              size="small"
                            >
                              <PackageIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>

                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Edit section">
                            <IconButton
                              onClick={() => setEditingSection(section)}
                              color="warning"
                              size="small"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete section">
                            <IconButton
                              onClick={() => handleDeleteSection(section._id)}
                              color="error"
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              ))
            : (
              <Grid item xs={12}>
                <Card sx={{ textAlign: 'center', p: 6 }}>
                  <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: 'grey.100' }}>
                    <PackageIcon sx={{ fontSize: 32, color: 'grey.400' }} />
                  </Avatar>
                  <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                    No sections found
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Create your first homepage section to get started
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setIsAddingSection(true)}
                    size="large"
                    sx={{ textTransform: 'none' }}
                  >
                    Create First Section
                  </Button>
                </Card>
              </Grid>
            )}
        </Grid>

        {/* Add/Edit Section Modal */}
        <Dialog 
          open={isAddingSection || !!editingSection} 
          onClose={() => {
            setIsAddingSection(false)
            setEditingSection(null)
          }}
          maxWidth="sm"
          fullWidth
        >
          <SectionForm
            section={editingSection}
            onSave={editingSection ? 
              (data) => handleUpdateSection(editingSection._id, data) : 
              handleCreateSection
            }
            onCancel={() => {
              setIsAddingSection(false)
              setEditingSection(null)
            }}
          />
        </Dialog>

        {/* Product Manager Modal */}
        <Dialog 
          open={showProductManager && !!selectedSection} 
          onClose={() => {
            setShowProductManager(false)
            setSelectedSection(null)
          }}
          maxWidth="lg"
          fullWidth
        >
          <ProductManager
            sectionId={selectedSection?._id}
            products={products}
            onAddProduct={handleAddProduct}
            onRemoveProduct={handleRemoveProduct}
            onClose={() => {
              setShowProductManager(false)
              setSelectedSection(null)
            }}
          />
        </Dialog>
      </Box>
    </Box>
  )
}

// Section Form Component
const SectionForm = ({ section, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: section?.title || '',
    description: section?.description || '',
    type: section?.type || 'category',
    category: section?.category || '',
    maxProducts: section?.maxProducts || 6,
    isVisible: section?.isVisible !== undefined ? section.isVisible : true,
    order: section?.order || 0
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <>
      <DialogTitle>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
          {section ? 'Edit Section' : 'Add New Section'}
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Section Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              variant="outlined"
            />
            
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              variant="outlined"
            />
            
            <FormControl fullWidth>
              <InputLabel>Section Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                label="Section Type"
              >
                <MenuItem value="category">Category</MenuItem>
                <MenuItem value="featured">Featured Products</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
                <MenuItem value="banner">Banner</MenuItem>
              </Select>
            </FormControl>
            
            {formData.type === 'category' && (
              <TextField
                fullWidth
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., electronics, fashion"
                variant="outlined"
              />
            )}
            
            <TextField
              fullWidth
              label="Max Products"
              type="number"
              value={formData.maxProducts}
              onChange={(e) => setFormData({ ...formData, maxProducts: parseInt(e.target.value) })}
              inputProps={{ min: 1, max: 20 }}
              variant="outlined"
            />
            
            <TextField
              fullWidth
              label="Order"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
              inputProps={{ min: 0 }}
              variant="outlined"
            />
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                id="isVisible"
                checked={formData.isVisible}
                onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                style={{ marginRight: 8 }}
              />
              <label htmlFor="isVisible">
                <Typography variant="body2">
                  Visible on homepage
                </Typography>
              </label>
            </Box>
          </Stack>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onCancel} variant="outlined">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          startIcon={<SaveIcon />}
        >
          {section ? 'Update' : 'Add'} Section
        </Button>
      </DialogActions>
    </>
  )
}

// Product Manager Component
const ProductManager = ({ sectionId, products, onAddProduct, onRemoveProduct, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  
  // Get the current section from Redux state (always up-to-date)
  const { adminSections } = useSelector((state) => state.homepageSections)
  const section = adminSections.find(s => s._id === sectionId)

  // Early return if section not found
  if (!section) {
    return null
  }

  // Show loading if products are still being fetched
  if (!products || products.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  const sectionProductIds = section.products?.map(p => p._id) || []
  const availableProducts = (products || []).filter(product => 
    !sectionProductIds.includes(product._id) &&
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === '' || product.category === selectedCategory)
  )

  const categories = [...new Set((products || []).map(p => p.category))]

  return (
    <>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
              Manage Products
            </Typography>
            <Typography variant="body2" sx={{ color: 'primary.100' }}>
              {section.title}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Current Products */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Current Products
            </Typography>
            <Chip 
              label={`${section.products?.length || 0} products`} 
              color="primary" 
              size="small" 
            />
          </Stack>
          
          <Grid container spacing={2}>
            {section.products?.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product._id}>
                <Card variant="outlined" sx={{ p: 2, '&:hover': { bgcolor: 'grey.50' } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {product.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ₹{product.price?.toLocaleString()}
                      </Typography>
                    </Box>
                    <IconButton
                      onClick={() => onRemoveProduct(section._id, product._id)}
                      color="error"
                      size="small"
                    >
                      <CloseIcon />
                    </IconButton>
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Add Products */}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Add Products
            </Typography>
            <Chip 
              label={`${availableProducts.length} available`} 
              color="success" 
              size="small" 
            />
          </Stack>
          
          {/* Filters */}
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Search Products"
                placeholder="Type to search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Paper>

          {/* Available Products */}
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            <Grid container spacing={2}>
              {availableProducts.length > 0 ? (
                availableProducts.map((product) => (
                  <Grid item xs={12} sm={6} md={4} key={product._id}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        '&:hover': { 
                          boxShadow: 2,
                          borderColor: 'primary.main'
                        } 
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            {product.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                            ₹{product.price?.toLocaleString()}
                          </Typography>
                          <Chip 
                            label={product.category} 
                            size="small" 
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        </Box>
                        <IconButton
                          onClick={() => onAddProduct(section._id, product._id)}
                          color="primary"
                          disabled={section.products?.length >= section.maxProducts}
                        >
                          <AddIcon />
                        </IconButton>
                      </Stack>
                    </Card>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: 'grey.100' }}>
                      <PackageIcon sx={{ fontSize: 32, color: 'grey.400' }} />
                    </Avatar>
                    {products.length === 0 ? (
                      <>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          No products found
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Please add some products first.
                        </Typography>
                      </>
                    ) : searchTerm || selectedCategory ? (
                      <>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          No matching products
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Try adjusting your search criteria.
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          All products added
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          All available products are already in this section.
                        </Typography>
                      </>
                    )}
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        </Box>
      </DialogContent>
    </>
  )
}

export default HomepageSectionManager
