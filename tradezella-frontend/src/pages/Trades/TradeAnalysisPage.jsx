import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Divider, 
  Paper,
  Grid,
  Container,
  Alert,
  CircularProgress,
  Rating,
  Chip
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import tradeService from '../../services/tradeService';

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
    post_analysis: {
      notes: '',
      rating: 3,
      emotions: '',
      lessons_learned: ''
    }
  });
  
  // Fetch trade data
  useEffect(() => {
    const fetchTrade = async () => {
      setLoading(true);
      
      try {
        const data = await tradeService.getTradeById(tradeId);
        setTrade(data);
        
        // Check if trade has post analysis already
        if (data.exit_price) {
          // Pre-fill the form with existing data
          setFormData({
            exit_price: data.exit_price || '',
            exit_date: data.exit_date ? new Date(data.exit_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            result: data.result || '',
            post_analysis: {
              notes: '',
              rating: 3,
              emotions: '',
              lessons_learned: ''
            }
          });
          
          // If there's already post analysis data
          if (data.post_analysis) {
            try {
              const postAnalysis = JSON.parse(data.post_analysis);
              setFormData(prev => ({
                ...prev,
                post_analysis: {
                  notes: postAnalysis.notes || '',
                  rating: postAnalysis.rating || 3,
                  emotions: postAnalysis.emotions || '',
                  lessons_learned: postAnalysis.lessons_learned || ''
                }
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
    
    if (name.startsWith('post_')) {
      // Handle post-analysis fields
      const fieldName = name.replace('post_', '');
      setFormData(prev => ({
        ...prev,
        post_analysis: {
          ...prev.post_analysis,
          [fieldName]: value
        }
      }));
    } else {
      // Handle main fields
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleRatingChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      post_analysis: {
        ...prev.post_analysis,
        rating: newValue
      }
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitLoading(true);
    
    try {
      // Calculate the result (profit/loss)
      let calculatedResult = formData.result;
      if (!calculatedResult && formData.exit_price && trade) {
        const exitPrice = parseFloat(formData.exit_price);
        const entryPrice = parseFloat(trade.entry_price);
        const positionSize = parseFloat(trade.position_size);
        
        if (trade.direction === 'long') {
          calculatedResult = (exitPrice - entryPrice) * positionSize;
        } else {
          calculatedResult = (entryPrice - exitPrice) * positionSize;
        }
      }
      
      await tradeService.closeTrade(tradeId, {
        exit_price: parseFloat(formData.exit_price),
        exit_date: formData.exit_date,
        result: parseFloat(calculatedResult || 0),
        post_analysis: formData.post_analysis
      });
      
      setSuccess('Trade analysis updated successfully!');
      setTimeout(() => {
        navigate('/trades'); // Redirect to trade list after 2 seconds
      }, 2000);
    } catch (error) {
      console.error('Error updating trade:', error);
      setError(error.message || 'Error updating trade. Please try again.');
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
            <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
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
            <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
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
              <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
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
              <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
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
                <Grid sx={{ gridColumn: 'span 12' }}>
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
            <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
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
            
            <Grid sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
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
            
            <Grid sx={{ gridColumn: 'span 12' }}>
              <Typography component="legend">Trade Rating</Typography>
              <Rating
                name="trade_rating"
                value={formData.post_analysis.rating}
                onChange={handleRatingChange}
                size="large"
              />
            </Grid>
            
            <Grid sx={{ gridColumn: 'span 12' }}>
              <TextField
                label="Emotions During Trade"
                name="post_emotions"
                value={formData.post_analysis.emotions}
                onChange={handleChange}
                fullWidth
                placeholder="What emotions did you experience during this trade? Fear, greed, confidence, etc."
              />
            </Grid>
            
            <Grid sx={{ gridColumn: 'span 12' }}>
              <TextField
                label="Post-Trade Analysis"
                name="post_notes"
                value={formData.post_analysis.notes}
                onChange={handleChange}
                multiline
                rows={4}
                fullWidth
                placeholder="Analyze what happened during the trade, why you exited, and whether your plan was executed properly..."
                required
              />
            </Grid>
            
            <Grid sx={{ gridColumn: 'span 12' }}>
              <TextField
                label="Lessons Learned"
                name="post_lessons_learned"
                value={formData.post_analysis.lessons_learned}
                onChange={handleChange}
                multiline
                rows={3}
                fullWidth
                placeholder="What did you learn from this trade? What would you do differently next time?"
                required
              />
            </Grid>
            
            <Grid sx={{ gridColumn: 'span 12' }}>
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