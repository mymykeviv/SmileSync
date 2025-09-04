import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Grid,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Switch,
    FormControlLabel,
    Alert,
    CircularProgress,
    InputAdornment
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ApiService from '../../services/api';

const ProductForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        supplier: '',
        unitPrice: '',
        unitOfMeasure: 'each',
        currentStock: '',
        minimumStock: '',
        isActive: true
    });

    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const unitOptions = [
        'each', 'box', 'pack', 'bottle', 'tube', 'set', 'piece', 'ml', 'gram', 'kg'
    ];

    useEffect(() => {
        loadCategories();
        loadSuppliers();
        if (isEdit) {
            loadProduct();
        }
    }, [id, isEdit]);

    const loadCategories = async () => {
        try {
            const response = await ApiService.request('/products/categories');
            if (response.success) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const loadSuppliers = async () => {
        try {
            const response = await ApiService.request('/products/suppliers');
            if (response.success) {
                setSuppliers(response.data);
            }
        } catch (error) {
            console.error('Error loading suppliers:', error);
        }
    };

    const loadProduct = async () => {
        try {
            setLoading(true);
            const response = await ApiService.getProduct(id);
            if (response.success) {
                setFormData({
                    name: response.data.name || '',
                    description: response.data.description || '',
                    category: response.data.category || '',
                    supplier: response.data.supplier || '',
                    unitPrice: response.data.unitPrice || response.data.unit_price || '',
                    unitOfMeasure: response.data.unitOfMeasure || response.data.unit_of_measure || 'each',
                    currentStock: response.data.currentStock || response.data.current_stock || '',
                    minimumStock: response.data.minimumStock || response.data.minimum_stock || '',
                    isActive: response.data.isActive !== undefined ? response.data.isActive : (response.data.is_active !== undefined ? response.data.is_active : true)
                });
            }
        } catch (error) {
            setError('Failed to load product data');
            console.error('Error loading product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Required field validations
        if (!formData.name.trim()) {
            newErrors.name = 'Product name is required';
        } else if (formData.name.trim().length > 200) {
            newErrors.name = 'Product name must be less than 200 characters';
        }
        
        if (!formData.category.trim()) {
            newErrors.category = 'Category is required';
        } else if (formData.category.trim().length > 100) {
            newErrors.category = 'Category must be less than 100 characters';
        }
        
        if (!formData.supplier.trim()) {
            newErrors.supplier = 'Supplier is required';
        } else if (formData.supplier.trim().length > 200) {
            newErrors.supplier = 'Supplier must be less than 200 characters';
        }
        
        if (!formData.unitPrice) {
            newErrors.unitPrice = 'Unit price is required';
        } else {
            const price = parseFloat(formData.unitPrice);
            if (isNaN(price) || price <= 0) {
                newErrors.unitPrice = 'Unit price must be a positive number';
            } else if (price > 999999.99) {
                newErrors.unitPrice = 'Unit price cannot exceed ₹999,999.99';
            }
        }
        
        // Optional field validations
        if (formData.description && formData.description.length > 1000) {
            newErrors.description = 'Description must be less than 1000 characters';
        }
        
        if (formData.currentStock !== '' && formData.currentStock !== null) {
            const stock = parseInt(formData.currentStock);
            if (isNaN(stock) || stock < 0) {
                newErrors.currentStock = 'Current stock must be a non-negative number';
            } else if (stock > 999999) {
                newErrors.currentStock = 'Current stock cannot exceed 999,999';
            }
        }
        
        if (formData.minimumStock !== '' && formData.minimumStock !== null) {
            const minStock = parseInt(formData.minimumStock);
            if (isNaN(minStock) || minStock < 0) {
                newErrors.minimumStock = 'Minimum stock must be a non-negative number';
            } else if (minStock > 999999) {
                newErrors.minimumStock = 'Minimum stock cannot exceed 999,999';
            }
        }
        
        // Set all errors at once
        if (Object.keys(newErrors).length > 0) {
            setError('Please correct the errors in the form');
            // You might want to implement field-specific error display here
            return false;
        }
        
        setError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            
            const submitData = {
                ...formData,
                unitPrice: parseFloat(formData.unitPrice),
                currentStock: parseInt(formData.currentStock) || 0,
                minimumStock: parseInt(formData.minimumStock) || 0
            };

            let response;
            if (isEdit) {
                response = await ApiService.updateProduct(id, submitData);
      } else {
        response = await ApiService.createProduct(submitData);
            }

            if (response.success) {
                setSuccess(isEdit ? 'Product updated successfully!' : 'Product created successfully!');
                setTimeout(() => {
                    navigate('/products');
                }, 1500);
            } else {
                setError(response.message || 'Failed to save product');
            }
        } catch (error) {
            setError(error.message || 'Failed to save product. Please try again.');
            console.error('Error saving product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/products');
    };

    if (loading && isEdit) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
            <Typography variant="h4" gutterBottom>
                {isEdit ? 'Edit Product' : 'New Product'}
            </Typography>

            <Card>
                <CardContent>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}
                    
                    {success && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {success}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Product Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    variant="outlined"
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel>Category</InputLabel>
                                    <Select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        label="Category"
                                        required
                                    >
                                        <MenuItem value="N/A">N/A</MenuItem>
                                        {categories.map((category) => (
                                            <MenuItem key={category} value={category}>
                                                {category}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    multiline
                                    rows={3}
                                    variant="outlined"
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel>Supplier</InputLabel>
                                    <Select
                                        name="supplier"
                                        value={formData.supplier}
                                        onChange={handleInputChange}
                                        label="Supplier"
                                        required
                                    >
                                        <MenuItem value="N/A">N/A</MenuItem>
                                        {suppliers.map((supplier) => (
                                            <MenuItem key={supplier} value={supplier}>
                                                {supplier}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel>Unit of Measure</InputLabel>
                                    <Select
                                        name="unitOfMeasure"
                                        value={formData.unitOfMeasure}
                                        onChange={handleInputChange}
                                        label="Unit of Measure"
                                    >
                                        {unitOptions.map((unit) => (
                                            <MenuItem key={unit} value={unit}>
                                                {unit}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Unit Price"
                                    name="unitPrice"
                                    type="number"
                                    value={formData.unitPrice}
                                    onChange={handleInputChange}
                                    required
                                    variant="outlined"
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                        inputProps: { min: 0, step: 0.01 }
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Current Stock"
                                    name="currentStock"
                                    type="number"
                                    value={formData.currentStock}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                    InputProps={{
                                        inputProps: { min: 0 }
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Minimum Stock"
                                    name="minimumStock"
                                    type="number"
                                    value={formData.minimumStock}
                                    onChange={handleInputChange}
                                    variant="outlined"
                                    InputProps={{
                                        inputProps: { min: 0 }
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.isActive}
                                            onChange={handleInputChange}
                                            name="isActive"
                                            color="primary"
                                        />
                                    }
                                    label="Active"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                    <Button
                                        variant="outlined"
                                        onClick={handleCancel}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        disabled={loading}
                                        startIcon={loading ? <CircularProgress size={20} /> : null}
                                    >
                                        {loading ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
};

export default ProductForm;