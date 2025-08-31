import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  MedicalServices as ServicesIcon,
  Inventory as ProductsIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Services from '../Services/Services';
import Products from '../Products/Products';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`catalog-tabpanel-${index}`}
      aria-labelledby={`catalog-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `catalog-tab-${index}`,
    'aria-controls': `catalog-tabpanel-${index}`,
  };
}

function Catalog() {
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Catalog Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/services/new')}
            disabled={tabValue !== 0}
          >
            Add Service
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/products/new')}
            disabled={tabValue !== 1}
          >
            Add Product
          </Button>
        </Box>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ServicesIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6">Services</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Manage your dental services, procedures, and treatments offered to patients.
              </Typography>
              <Button
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => setTabValue(0)}
              >
                Manage Services
              </Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ProductsIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6">Products</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Manage your inventory of dental supplies, materials, and equipment.
              </Typography>
              <Button
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => setTabValue(1)}
              >
                Manage Products
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="catalog tabs">
            <Tab
              icon={<ServicesIcon />}
              label="Services"
              iconPosition="start"
              {...a11yProps(0)}
            />
            <Tab
              icon={<ProductsIcon />}
              label="Products"
              iconPosition="start"
              {...a11yProps(1)}
            />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Services />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Products />
        </TabPanel>
      </Paper>
    </Box>
  );
}

export default Catalog;