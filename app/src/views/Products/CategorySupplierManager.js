import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Chip,
    Divider
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon
} from '@mui/icons-material';
import ApiService from '../../services/api';

const CategorySupplierManager = () => {
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Dialog states
    const [categoryDialog, setCategoryDialog] = useState({ open: false, value: '', editing: null });
    const [supplierDialog, setSupplierDialog] = useState({ open: false, value: '', editing: null });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [categoriesResponse, suppliersResponse] = await Promise.all([
                ApiService.request('/products/categories'),
                ApiService.request('/products/suppliers')
            ]);
            
            if (categoriesResponse.success) {
                setCategories(categoriesResponse.data.filter(cat => cat !== 'N/A'));
            }
            if (suppliersResponse.success) {
                setSuppliers(suppliersResponse.data.filter(sup => sup !== 'N/A'));
            }
        } catch (error) {
            setError('Failed to load categories and suppliers');
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async () => {
        if (!categoryDialog.value.trim()) return;
        
        try {
            // For now, we'll just add to local state since there's no backend endpoint
            // In a real implementation, you'd call an API endpoint
            const newCategory = categoryDialog.value.trim();
            if (!categories.includes(newCategory)) {
                setCategories([...categories, newCategory].sort());
                setSuccess('Category added successfully');
            } else {
                setError('Category already exists');
            }
            setCategoryDialog({ open: false, value: '', editing: null });
        } catch (error) {
            setError('Failed to add category');
        }
    };

    const handleAddSupplier = async () => {
        if (!supplierDialog.value.trim()) return;
        
        try {
            // For now, we'll just add to local state since there's no backend endpoint
            // In a real implementation, you'd call an API endpoint
            const newSupplier = supplierDialog.value.trim();
            if (!suppliers.includes(newSupplier)) {
                setSuppliers([...suppliers, newSupplier].sort());
                setSuccess('Supplier added successfully');
            } else {
                setError('Supplier already exists');
            }
            setSupplierDialog({ open: false, value: '', editing: null });
        } catch (error) {
            setError('Failed to add supplier');
        }
    };

    const handleDeleteCategory = async (category) => {
        try {
            // For now, we'll just remove from local state
            // In a real implementation, you'd call an API endpoint
            setCategories(categories.filter(cat => cat !== category));
            setSuccess('Category removed successfully');
        } catch (error) {
            setError('Failed to remove category');
        }
    };

    const handleDeleteSupplier = async (supplier) => {
        try {
            // For now, we'll just remove from local state
            // In a real implementation, you'd call an API endpoint
            setSuppliers(suppliers.filter(sup => sup !== supplier));
            setSuccess('Supplier removed successfully');
        } catch (error) {
            setError('Failed to remove supplier');
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Category & Supplier Management
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Manage product categories and suppliers for better organization
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}
            
            {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Categories Section */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">Categories</Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => setCategoryDialog({ open: true, value: '', editing: null })}
                                >
                                    Add Category
                                </Button>
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {categories.length} categories available
                            </Typography>
                            
                            <List>
                                {categories.map((category) => (
                                    <ListItem key={category} divider>
                                        <ListItemText primary={category} />
                                        <ListItemSecondaryAction>
                                            <IconButton
                                                edge="end"
                                                onClick={() => handleDeleteCategory(category)}
                                                color="error"
                                                size="small"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                                {categories.length === 0 && (
                                    <ListItem>
                                        <ListItemText 
                                            primary="No categories available" 
                                            secondary="Add your first category to get started"
                                        />
                                    </ListItem>
                                )}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Suppliers Section */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">Suppliers</Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={() => setSupplierDialog({ open: true, value: '', editing: null })}
                                >
                                    Add Supplier
                                </Button>
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {suppliers.length} suppliers available
                            </Typography>
                            
                            <List>
                                {suppliers.map((supplier) => (
                                    <ListItem key={supplier} divider>
                                        <ListItemText primary={supplier} />
                                        <ListItemSecondaryAction>
                                            <IconButton
                                                edge="end"
                                                onClick={() => handleDeleteSupplier(supplier)}
                                                color="error"
                                                size="small"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                                {suppliers.length === 0 && (
                                    <ListItem>
                                        <ListItemText 
                                            primary="No suppliers available" 
                                            secondary="Add your first supplier to get started"
                                        />
                                    </ListItem>
                                )}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Add Category Dialog */}
            <Dialog open={categoryDialog.open} onClose={() => setCategoryDialog({ open: false, value: '', editing: null })}>
                <DialogTitle>Add New Category</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Category Name"
                        fullWidth
                        variant="outlined"
                        value={categoryDialog.value}
                        onChange={(e) => setCategoryDialog({ ...categoryDialog, value: e.target.value })}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleAddCategory();
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCategoryDialog({ open: false, value: '', editing: null })}>
                        Cancel
                    </Button>
                    <Button onClick={handleAddCategory} variant="contained">
                        Add
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add Supplier Dialog */}
            <Dialog open={supplierDialog.open} onClose={() => setSupplierDialog({ open: false, value: '', editing: null })}>
                <DialogTitle>Add New Supplier</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Supplier Name"
                        fullWidth
                        variant="outlined"
                        value={supplierDialog.value}
                        onChange={(e) => setSupplierDialog({ ...supplierDialog, value: e.target.value })}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleAddSupplier();
                            }
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSupplierDialog({ open: false, value: '', editing: null })}>
                        Cancel
                    </Button>
                    <Button onClick={handleAddSupplier} variant="contained">
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CategorySupplierManager;