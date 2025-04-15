import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  FormControlLabel, 
  Checkbox, 
  Divider, 
  Paper,
  Grid,
  Container,
  Alert,
  CircularProgress
} from '@mui/material';

function TradeForm() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    accountId: '',
    instrument: 'XAUUSD', // Default to Gold
    entry_price: '',
    position_size: '',
    direction: 'long',
    stop_loss: '',
    take_profit: '',
    
    // Pre-trade analysis
    daily_trend: '',
    clean_range: false,
    volume_time: '',
    previous_session_volume: false,
    htf_setup: '',
    ltf_confirmation: '',
    pre_analysis_notes: '',
    
    // Post-trade analysis (will be filled later)
    exit_price: '',
    exit_date: '',
    result: '',
    post_analysis_notes: '',
    trade_rating: '3', // 1-5 rating
    emotions: '',
    lessons_learned: ''
  });
  
  useEffect(() => {
    // Fetch user's trading accounts
    const fetchAccounts = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      try {
        const res = await axios.get('http://localhost:5000/api/accounts', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setAccounts(res.data);
        if (res.data.length > 0) {
          setFormData(prev => ({ ...prev, accountId: res.data[0].account_id }));
        }
      } catch (error) {
        console.error('Error fetching accounts:', error);
        setError('Failed to load your trading accounts. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAccounts();
  }, []);
  
  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitLoading(true);
    
    const token = localStorage.getItem('token');
    
    try {
      const res = await axios.post('http://localhost:5000/api/trades', {
        accountId: formData.accountId,
        tradeData: {
          instrument: formData.instrument,
          entry_price: parseFloat(formData.entry_price),
          position_size: parseFloat(formData.position_size),
          direction: formData.direction,
          stop_loss: formData.stop_loss ? parseFloat(formData.stop_loss) : null,
          take_profit: formData.take_profit ? parseFloat(formData.take_profit) : null,
          
          // Pre-analysis data
          pre_analysis: JSON.stringify({
            daily_trend: formData.daily_trend,
            clean_range: formData.clean_range,
            volume_time: formData.volume_time,
            previous_session_volume: formData.previous_session_volume,
            htf_setup: formData.htf_setup,
            ltf_confirmation: formData.ltf_confirmation,
            notes: formData.pre_analysis_notes
          })
        }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('Trade created successfully!');
      // Reset form or redirect to trade list
      resetForm();
    } catch (error) {
      console.error('Error creating trade:', error);
      setError(error.response?.data?.message || 'Error creating trade. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };
  
  const resetForm = () => {
    setFormData({
      ...formData,
      instrument: 'XAUUSD',
      entry_price: '',
      position_size: '',
      direction: 'long',
      stop_loss: '',
      take_profit: '',
      daily_trend: '',
      clean_range: false,
      volume_time: '',
      previous_session_volume: false,
      htf_setup: '',
      ltf_confirmation: '',
      pre_analysis_notes: ''
    });
  };
  
  if (loading) {
    return <CircularProgress />;
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
                    <MenuItem key={account.account_id} value={account.account_id}>
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
                  name="daily_trend"
                  value={formData.daily_trend}
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
                  name="volume_time"
                  value={formData.volume_time}
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
                name="htf_setup"
                value={formData.htf_setup}
                onChange={handleChange}
                fullWidth
                placeholder="Describe your higher timeframe analysis..."
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Lower Timeframe Confirmation"
                name="ltf_confirmation"
                value={formData.ltf_confirmation}
                onChange={handleChange}
                fullWidth
                placeholder="Describe your entry trigger..."
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={formData.clean_range} 
                    onChange={handleChange}
                    name="clean_range"
                  />
                }
                label="Clean Price Range"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={formData.previous_session_volume} 
                    onChange={handleChange}
                    name="previous_session_volume"
                  />
                }
                label="Previous Session Volume"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Pre-Trade Analysis Notes"
                name="pre_analysis_notes"
                value={formData.pre_analysis_notes}
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
                  onClick={resetForm}
                  disabled={submitLoading}
                >
                  Reset Form
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={submitLoading}
                >
                  {submitLoading ? <CircularProgress size={24} /> : 'Enter Trade'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

export default TradeForm;