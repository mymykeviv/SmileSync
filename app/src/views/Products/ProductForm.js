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
        unit_price: '',
        unit_of_measure: 'each',
        current_stock: '',
        minimum_stock: '',
        is_active: true
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
            const response = await ApiService.get('/products/categories');
            if (response.success) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const loadSuppliers = async () => {
        try {
            const response = await ApiService.get('/products/suppliers');
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
            const response = await ApiService.get(`/products/${id}`);
            if (response.success) {
                setFormData({
                    name: response.data.name || '',
                    description: response.data.description || '',
                    category: response.data.category || '',
                    supplier: response.data.supplier || '',
                    unit_price: response.data.unit_price || '',
                    unit_of_measure: response.data.unit_of_measure || 'each',
                    current_stock: response.data.current_stock || '',
                    minimum_stock: response.data.minimum_stock || '',
                    is_active: response.data.is_active !== undefined ? response.data.is_active : true
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
        if (!formData.name.trim()) {
            setError('Product name is required');
            return false;
        }
        if (!formData.category.trim()) {
            setError('Category is required');
            return false;
        }
        if (!formData.supplier.trim()) {
            setError('Supplier is required');
            return false;
        }
        if (!formData.unit_price || parseFloat(formData.unit_price) <= 0) {
            setError('Valid unit price is required');
            return false;
        }
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
                unit_price: parseFloat(formData.unit_price),
                current_stock: parseInt(formData.current_stock) || 0,
                minimum_stock: parseInt(formData.minimum_stock) || 0
            };

            let response;
            if (isEdit) {
                response = await ApiService.put(`/products/${id}`, submitData);
            } else {
                response = await ApiService.post('/products', submitData);
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
            setError('Failed to save product. Please try again.');
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
                                        name="unit_of_measure"
                                        value={formData.unit_of_measure}
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
                                    name="unit_price"
                                    type="number"
                                    value={formData.unit_price}
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
                                    name="current_stock"
                                    type="number"
                                    value={formData.current_stock}
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
                                    name="minimum_stock"
                                    type="number"
                                    value={formData.minimum_stock}
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
                                            checked={formData.is_active}
                                            onChange={handleInputChange}
                                            name="is_active"
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