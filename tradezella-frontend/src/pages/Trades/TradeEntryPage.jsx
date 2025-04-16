// src/pages/Trades/TradeEntryPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Divider, 
  Grid, 
  FormControlLabel, 
  Checkbox, 
  CircularProgress,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import accountService from '../../services/accountService';
import tradeService from '../../services/tradeService';

const TradeEntryPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    accountId: '',
    instrument: 'XAUUSD',
    entry_price: '',
    position_size: '',
    direction: 'long',
    stop_loss: '',
    take_profit: '',
    
    // Pre-analysis fields
    pre_analysis: {
      daily_trend: '',
      clean_range: false,
      volume_time: '',
      previous_session_volume: false,
      htf_setup: '',
      ltf_confirmation: '',
      notes: ''
    }
  });

  // Fetch trading accounts
  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true);
      try {
        const data = await accountService.getAccounts();
        setAccounts(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, accountId: data[0].id }));
        }
      } catch (err) {
        console.error("Error fetching accounts:", err);
        setError("Failed to load your trading accounts");
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('pre_')) {
      // Handle pre-analysis fields
      const fieldName = name.replace('pre_', '');
      setFormData(prev => ({
        ...prev,
        pre_analysis: {
          ...prev.pre_analysis,
          [fieldName]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      // Handle main trade fields
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      // Prepare data for API
      const tradeData = {
        instrument: formData.instrument,
        entry_price: parseFloat(formData.entry_price),
        position_size: parseFloat(formData.position_size),
        direction: formData.direction,
        stop_loss: formData.stop_loss ? parseFloat(formData.stop_loss) : null,
        take_profit: formData.take_profit ? parseFloat(formData.take_profit) : null,
        pre_analysis: formData.pre_analysis
      };

      await tradeService.createTrade(formData.accountId, tradeData);
      setSuccess('Trade created successfully!');
      
      // Reset
      await tradeService.createTrade(formData.accountId, tradeData);
      setSuccess('Trade created successfully!');
      
      // Reset form or navigate
      setTimeout(() => {
        navigate('/trades');
      }, 2000);
    } catch (err) {
      console.error("Error creating trade:", err);
      setError(err.message || "Failed to create trade. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          New Trade Entry
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Trade setup section */}
            <Grid item xs={12}>
              <Typography variant="h5" component="h2" gutterBottom>
                Trade Setup
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Trading Account</InputLabel>
                <Select
                  name="accountId"
                  value={formData.accountId}
                  onChange={handleChange}
                  label="Trading Account"
                  required
                >
                  {accounts.map(account => (
                    <MenuItem key={account.id} value={account.id}>
                      {account.account_name} (${account.current_balance})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Instrument</InputLabel>
                <Select
                  name="instrument"
                  value={formData.instrument}
                  onChange={handleChange}
                  label="Instrument"
                  required
                >
                  <MenuItem value="XAUUSD">Gold (XAUUSD)</MenuItem>
                  <MenuItem value="XAGUSD">Silver (XAGUSD)</MenuItem>
                  <MenuItem value="EURUSD">EUR/USD</MenuItem>
                  <MenuItem value="GBPUSD">GBP/USD</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Direction</InputLabel>
                <Select
                  name="direction"
                  value={formData.direction}
                  onChange={handleChange}
                  label="Direction"
                  required
                >
                  <MenuItem value="long">Long (Buy)</MenuItem>
                  <MenuItem value="short">Short (Sell)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Entry Price"
                name="entry_price"
                value={formData.entry_price}
                onChange={handleChange}
                type="number"
                inputProps={{ step: "0.01" }}
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                label="Position Size"
                name="position_size"
                value={formData.position_size}
                onChange={handleChange}
                type="number"
                inputProps={{ step: "0.01" }}
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                label="Stop Loss"
                name="stop_loss"
                value={formData.stop_loss}
                onChange={handleChange}
                type="number"
                inputProps={{ step: "0.01" }}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                label="Take Profit"
                name="take_profit"
                value={formData.take_profit}
                onChange={handleChange}
                type="number"
                inputProps={{ step: "0.01" }}
                fullWidth
              />
            </Grid>
            
            {/* Pre-trade analysis section */}
            <Grid item xs={12}>
              <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 2 }}>
                Pre-Trade Analysis
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Daily Trend</InputLabel>
                <Select
                  name="pre_daily_trend"
                  value={formData.pre_analysis.daily_trend}
                  onChange={handleChange}
                  label="Daily Trend"
                >
                  <MenuItem value="">Select</MenuItem>
                  <MenuItem value="uptrend">Uptrend</MenuItem>
                  <MenuItem value="downtrend">Downtrend</MenuItem>
                  <MenuItem value="sideways">Sideways</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Volume Time</InputLabel>
                <Select
                  name="pre_volume_time"
                  value={formData.pre_analysis.volume_time}
                  onChange={handleChange}
                  label="Volume Time"
                >
                  <MenuItem value="">Select</MenuItem>
                  <MenuItem value="London session">London Session</MenuItem>
                  <MenuItem value="NY session">NY Session</MenuItem>
                  <MenuItem value="Asian session">Asian Session</MenuItem>
                  <MenuItem value="London/NY overlap">London/NY Overlap</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Higher Timeframe Setup"
                name="pre_htf_setup"
                value={formData.pre_analysis.htf_setup}
                onChange={handleChange}
                fullWidth
                placeholder="Describe your higher timeframe analysis..."
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Lower Timeframe Confirmation"
                name="pre_ltf_confirmation"
                value={formData.pre_analysis.ltf_confirmation}
                onChange={handleChange}
                fullWidth
                placeholder="Describe your entry trigger..."
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={formData.pre_analysis.clean_range} 
                    onChange={handleChange}
                    name="pre_clean_range"
                  />
                }
                label="Clean Price Range"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={formData.pre_analysis.previous_session_volume} 
                    onChange={handleChange}
                    name="pre_previous_session_volume"
                  />
                }
                label="Previous Session Volume"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Pre-Trade Analysis Notes"
                name="pre_notes"
                value={formData.pre_analysis.notes}
                onChange={handleChange}
                multiline
                rows={4}
                fullWidth
                placeholder="Document your trading plan, rationale, and key observations before entering this trade..."
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" mt={2}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/trades')}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={submitting}
                >
                  {submitting ? <CircularProgress size={24} /> : 'Enter Trade'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default TradeEntryPage;