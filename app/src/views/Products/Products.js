import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Fab,
  Menu,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  LocalPharmacy as ProductsIcon,
  ReportProblem as WarningIcon,
  TrendingDown as LowStockIcon,
  MedicalServices as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import ApiService from '../../services/api';

// API service methods for products using correct ApiService methods
const api = {
  getProducts: (params = {}) => {
    return ApiService.getProducts(params);
  },
  getProductCategories: () => {
    return ApiService.request('/products/categories');
  },
  getSuppliers: () => {
    return ApiService.request('/products/suppliers');
  },
  createProduct: (productData) => {
    return ApiService.createProduct(productData);
  },
  updateProduct: (id, productData) => {
    return ApiService.updateProduct(id, productData);
  },
  getProductById: (id) => {
    return ApiService.getProduct(id);
  },
  deleteProduct: (id) => {
    return ApiService.deleteProduct(id);
  },
  toggleProductStatus: (id) => {
    return ApiService.request(`/products/${id}/status`, { method: 'PATCH' });
  },
  updateProductStock: (id, stockData) => {
    return ApiService.request(`/products/${id}/stock`, { method: 'PATCH', body: stockData });
  }
};

function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0
  });
  
  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Dialog states
  const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null });
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const loadProducts = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        search: searchTerm,
        category: categoryFilter,
        supplier: supplierFilter,
        stock: stockFilter,
        status: statusFilter,
        limit: 10
      };
      
      const response = await api.getProducts(params);
      if (response.success) {
        setProducts(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.getProductCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadSuppliers = async () => {
    try {
      const response = await api.getSuppliers();
      if (response.success) {
        setSuppliers(response.data);
      }
    } catch (error) {
      console.error('Failed to load suppliers:', error);
    }
  };

  useEffect(() => {
    loadCategories();
    loadSuppliers();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [searchTerm, categoryFilter, supplierFilter, stockFilter, statusFilter]);

  const handlePageChange = (event, page) => {
    loadProducts(page);
  };

  const handleMenuOpen = (event, product) => {
    setAnchorEl(event.currentTarget);
    setSelectedProduct(product);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProduct(null);
  };

  const handleDeleteProduct = async () => {
    try {
      const response = await api.deleteProduct(deleteDialog.product.id);
      if (response.success) {
        setDeleteDialog({ open: false, product: null });
        loadProducts(pagination.currentPage);
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      const response = await api.toggleProductStatus(product.id);
      if (response.success) {
        loadProducts(pagination.currentPage);
      }
    } catch (error) {
      console.error('Failed to update product status:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const getStockStatus = (product) => {
    if (product.currentStock === 0) {
      return { label: 'Out of Stock', color: 'error', severity: 'error' };
    } else if (product.currentStock <= product.minimumStock) {
      return { label: 'Low Stock', color: 'warning', severity: 'warning' };
    }
    return { label: 'In Stock', color: 'success', severity: 'success' };
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setSupplierFilter('');
    setStockFilter('');
    setStatusFilter('');
  };

  const lowStockProducts = products.filter(p => p.currentStock <= p.minimumStock && p.currentStock > 0);
  const outOfStockProducts = products.filter(p => p.currentStock === 0);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Products
        </Typography>
        <Box>
          <IconButton onClick={() => loadProducts(pagination.currentPage)}>
            <RefreshIcon />
          </IconButton>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => navigate('/products/settings')}
            sx={{ ml: 1 }}
          >
            Manage Categories & Suppliers
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/products/new')}
            sx={{ ml: 1 }}
          >
            New Product
          </Button>
        </Box>
      </Box>

      {/* Stock Alerts */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <Box sx={{ mb: 3 }}>
          {outOfStockProducts.length > 0 && (
            <Alert severity="error" sx={{ mb: 1 }}>
              <Typography variant="body2">
                <strong>{outOfStockProducts.length}</strong> product(s) are out of stock
              </Typography>
            </Alert>
          )}
          {lowStockProducts.length > 0 && (
            <Alert severity="warning">
              <Typography variant="body2">
                <strong>{lowStockProducts.length}</strong> product(s) are running low on stock
              </Typography>
            </Alert>
          )}
        </Box>
      )}

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Search products..."
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
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Category"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Supplier</InputLabel>
                <Select
                  value={supplierFilter}
                  label="Supplier"
                  onChange={(e) => setSupplierFilter(e.target.value)}
                >
                  <MenuItem value="">All Suppliers</MenuItem>
                  {suppliers.map((supplier) => (
                    <MenuItem key={supplier} value={supplier}>
                      {supplier}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Stock Level</InputLabel>
                <Select
                  value={stockFilter}
                  label="Stock Level"
                  onChange={(e) => setStockFilter(e.target.value)}
                >
                  <MenuItem value="">All Levels</MenuItem>
                  <MenuItem value="in_stock">In Stock</MenuItem>
                  <MenuItem value="low_stock">Low Stock</MenuItem>
                  <MenuItem value="out_of_stock">Out of Stock</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={1}>
              <Button
                variant="outlined"
                onClick={clearFilters}
                disabled={!searchTerm && !categoryFilter && !supplierFilter && !stockFilter && !statusFilter}
                fullWidth
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Supplier</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => {
                const stockStatus = getStockStatus(product);
                return (
                  <TableRow key={product.id} hover>
                    <TableCell>
                      <Box>
                        <Typography
                          variant="body1"
                          fontWeight="medium"
                          sx={{ cursor: 'pointer', color: 'primary.main' }}
                          onClick={() => navigate(`/products/${product.id}`)}
                        >
                          {product.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {product.productCode}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {product.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={product.category}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {product.supplier}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" fontWeight="medium">
                        {formatPrice(product.unitPrice)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        per {product.unit}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {stockStatus.severity !== 'success' && (
                          <WarningIcon 
                            fontSize="small" 
                            color={stockStatus.color}
                          />
                        )}
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {product.currentStock} {product.unit}(s)
                          </Typography>
                          <Chip
                            label={stockStatus.label}
                            size="small"
                            color={stockStatus.color}
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={product.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={product.isActive ? 'success' : 'default'}
                        variant={product.isActive ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/products/${product.id}`)}
                          title="View Details"
                        >
                          <ViewIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/products/${product.id}/edit`)}
                          title="Edit"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, product)}
                          title="More Actions"
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Pagination
              count={pagination.totalPages}
              page={pagination.currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}
        
        {/* Empty State */}
        {products.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <ProductsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No products found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchTerm || categoryFilter || supplierFilter || stockFilter || statusFilter ? 'Try adjusting your search or filters' : 'Get started by adding your first product'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/products/new')}
            >
              Add Product
            </Button>
          </Box>
        )}
      </Card>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            navigate(`/products/${selectedProduct?.id}/restock`);
            handleMenuClose();
          }}
        >
          Update Stock
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleToggleStatus(selectedProduct);
            handleMenuClose();
          }}
        >
          {selectedProduct?.isActive ? 'Deactivate' : 'Activate'} Product
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigate(`/products/${selectedProduct?.id}/duplicate`);
            handleMenuClose();
          }}
        >
          Duplicate Product
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDeleteDialog({ open: true, product: selectedProduct });
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          Delete Product
        </MenuItem>
      </Menu>

      {/* Delete Product Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, product: null })}>
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Are you sure you want to delete "{deleteDialog.product?.name}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone. This product will be removed from all invoices and treatment plans.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, product: null })}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteProduct}
            color="error"
            variant="contained"
          >
            Delete Product
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add product"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => navigate('/products/new')}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}

export default Products;