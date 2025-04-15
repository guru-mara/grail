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
  Divider, 
  Paper,
  Grid,
  Container,
  Alert,
  CircularProgress,
  Rating
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

function TradeAnalysis() {
  const { tradeId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [trade, setTrade] = useState(null);
  
  const [formData, setFormData] = useState({
    exit_price: '',
    exit_date: new Date().toISOString().split('T')[0], // Default to today
    result: '',
    post_analysis_notes: '',
    trade_rating: 3,
    emotions: '',
    lessons_learned: ''
  });
  
  // Fetch trade data
  useEffect(() => {
    const fetchTrade = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      try {
        const res = await axios.get(`http://localhost:5000/api/trades/${tradeId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setTrade(res.data);
        
        // Check if trade has post analysis already
        if (res.data.exit_price) {
          // Pre-fill the form with existing data
          setFormData({
            exit_price: res.data.exit_price || '',
            exit_date: res.data.exit_date ? new Date(res.data.exit_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            result: res.data.result || '',
            post_analysis_notes: '',
            trade_rating: 3,
            emotions: '',
            lessons_learned: ''
          });
          
          // If there's already post analysis data
          if (res.data.post_analysis) {
            try {
              const postAnalysis = JSON.parse(res.data.post_analysis);
              setFormData(prev => ({
                ...prev,
                post_analysis_notes: postAnalysis.notes || '',
                trade_rating: postAnalysis.rating || 3,
                emotions: postAnalysis.emotions || '',
                lessons_learned: postAnalysis.lessons_learned || ''
              }));
            } catch (err) {
              console.error('Error parsing post analysis JSON:', err);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching trade:', error);
        setError('Failed to load trade data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (tradeId) {
      fetchTrade();
    }
  }, [tradeId]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleRatingChange = (event, newValue) => {
    setFormData({ ...formData, trade_rating: newValue });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitLoading(true);
    
    const token = localStorage.getItem('token');
    
    try {
      // Calculate the result (profit/loss)
      let calculatedResult = 0;
      if (formData.exit_price && trade.entry_price) {
        const exitPrice = parseFloat(formData.exit_price);
        const entryPrice = parseFloat(trade.entry_price);
        const positionSize = parseFloat(trade.position_size);
        
        if (trade.direction === 'long') {
          calculatedResult = (exitPrice - entryPrice) * positionSize;
        } else {
          calculatedResult = (entryPrice - exitPrice) * positionSize;
        }
      }
      
      const res = await axios.patch(`http://localhost:5000/api/trades/${tradeId}/close`, {
        exit_price: parseFloat(formData.exit_price),
        exit_date: formData.exit_date,
        result: formData.result ? parseFloat(formData.result) : calculatedResult,
        post_analysis: JSON.stringify({
          notes: formData.post_analysis_notes,
          rating: formData.trade_rating,
          emotions: formData.emotions,
          lessons_learned: formData.lessons_learned
        })
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('Trade analysis updated successfully!');
      setTimeout(() => {
        navigate('/trades'); // Redirect to trade list after 2 seconds
      }, 2000);
    } catch (error) {
      console.error('Error updating trade:', error);
      setError(error.response?.data?.message || 'Error updating trade. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }
  
  if (!trade) {
    return (
      <Container>
        <Alert severity="error">Trade not found</Alert>
      </Container>
    );
  }
  
  // Parse pre-analysis data if it exists
  let preAnalysis = {};
  try {
    if (trade.pre_analysis) {
      preAnalysis = JSON.parse(trade.pre_analysis);
    }
  } catch (err) {
    console.error('Error parsing pre-analysis JSON:', err);
  }
  
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Trade Analysis
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        
        <Box mb={4}>
          <Typography variant="h5" component="h2" gutterBottom>
            Trade Summary
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">
                <strong>Instrument:</strong> {trade.instrument}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Direction:</strong> {trade.direction === 'long' ? 'Buy (Long)' : 'Sell (Short)'}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Entry Price:</strong> ${trade.entry_price}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Position Size:</strong> {trade.position_size}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">
                <strong>Stop Loss:</strong> ${trade.stop_loss || 'Not set'}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Take Profit:</strong> ${trade.take_profit || 'Not set'}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Entry Date:</strong> {new Date(trade.entry_date).toLocaleDateString()}
              </Typography>
              <Typography variant="subtitle1">
                <strong>Status:</strong> {trade.status}
              </Typography>
            </Grid>
          </Grid>
        </Box>
        
        {/* Pre-analysis summary */}
        {preAnalysis && Object.keys(preAnalysis).length > 0 && (
          <Box mb={4}>
            <Typography variant="h5" component="h2" gutterBottom>
              Pre-Trade Analysis Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                {preAnalysis.daily_trend && (
                  <Typography variant="body1">
                    <strong>Daily Trend:</strong> {preAnalysis.daily_trend}
                  </Typography>
                )}
                {preAnalysis.volume_time && (
                  <Typography variant="body1">
                    <strong>Volume Time:</strong> {preAnalysis.volume_time}
                  </Typography>
                )}
                {preAnalysis.clean_range !== undefined && (
                  <Typography variant="body1">
                    <strong>Clean Range:</strong> {preAnalysis.clean_range ? 'Yes' : 'No'}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                {preAnalysis.htf_setup && (
                  <Typography variant="body1">
                    <strong>HTF Setup:</strong> {preAnalysis.htf_setup}
                  </Typography>
                )}
                {preAnalysis.ltf_confirmation && (
                  <Typography variant="body1">
                    <strong>LTF Confirmation:</strong> {preAnalysis.ltf_confirmation}
                  </Typography>
                )}
                {preAnalysis.previous_session_volume !== undefined && (
                  <Typography variant="body1">
                    <strong>Previous Session Volume:</strong> {preAnalysis.previous_session_volume ? 'Yes' : 'No'}
                  </Typography>
                )}
              </Grid>
              {preAnalysis.notes && (
                <Grid item xs={12}>
                  <Typography variant="body1">
                    <strong>Notes:</strong>
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                    <Typography variant="body2">
                      {preAnalysis.notes}
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Box>
        )}
        
        {/* Post-analysis form */}
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h5" component="h2" gutterBottom>
            Post-Trade Analysis
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Exit Price"
                name="exit_price"
                value={formData.exit_price}
                onChange={handleChange}
                type="number"
                inputProps={{ step: "0.01" }}
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                label="Exit Date"
                name="exit_date"
                type="date"
                value={formData.exit_date}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography component="legend">Trade Rating</Typography>
              <Rating
                name="trade_rating"
                value={formData.trade_rating}
                onChange={handleRatingChange}
                size="large"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Emotions During Trade"
                name="emotions"
                value={formData.emotions}
                onChange={handleChange}
                fullWidth
                placeholder="What emotions did you experience during this trade? Fear, greed, confidence, etc."
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Post-Trade Analysis"
                name="post_analysis_notes"
                value={formData.post_analysis_notes}
                onChange={handleChange}
                multiline
                rows={4}
                fullWidth
                placeholder="Analyze what happened during the trade, why you exited, and whether your plan was executed properly..."
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Lessons Learned"
                name="lessons_learned"
                value={formData.lessons_learned}
                onChange={handleChange}
                multiline
                rows={3}
                fullWidth
                placeholder="What did you learn from this trade? What would you do differently next time?"
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" mt={2}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/trades')}
                  disabled={submitLoading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={submitLoading}
                >
                  {submitLoading ? <CircularProgress size={24} /> : 'Save Analysis'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

export default TradeAnalysis;