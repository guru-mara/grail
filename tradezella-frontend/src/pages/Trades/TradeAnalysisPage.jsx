import React, { useState, useEffect } from 'react';
import { 
 Container, 
 Paper, 
 Typography, 
 Box, 
 TextField, 
 Button, 
 Divider, 
 Grid, 
 CircularProgress,
 Alert,
 Rating,
 Chip
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import tradeService from '../../services/tradeService';

const TradeAnalysisPage = () => {
 const { tradeId } = useParams();
 const navigate = useNavigate();
 const [trade, setTrade] = useState(null);
 const [loading, setLoading] = useState(true);
 const [submitting, setSubmitting] = useState(false);
 const [error, setError] = useState('');
 const [success, setSuccess] = useState('');

 const [formData, setFormData] = useState({
   exit_price: '',
   exit_date: new Date().toISOString().split('T')[0],
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
       
       // Initialize form with existing data if available
       if (data.exit_price) {
         setFormData(prev => ({
           ...prev,
           exit_price: data.exit_price,
           exit_date: data.exit_date ? new Date(data.exit_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
           result: data.result || ''
         }));
       }
       
       // Parse post-analysis if it exists
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
           console.error('Error parsing post analysis:', err);
         }
       }
     } catch (err) {
       console.error('Error fetching trade:', err);
       setError('Failed to load trade details');
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
   setSubmitting(true);

   try {
     // Calculate result if not provided
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

     // Prepare data for API
     const closeData = {
       exit_price: parseFloat(formData.exit_price),
       exit_date: formData.exit_date,
       result: parseFloat(calculatedResult),
       post_analysis: formData.post_analysis
     };

     await tradeService.closeTrade(tradeId, closeData);
     setSuccess('Trade analysis saved successfully!');
     
     // Redirect after successful submission
     setTimeout(() => {
       navigate('/trades');
     }, 2000);
   } catch (err) {
     console.error('Error updating trade:', err);
     setError(err.message || 'Failed to save trade analysis');
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

 if (!trade) {
   return (
     <Container>
       <Alert severity="error">Trade not found</Alert>
     </Container>
   );
 }

 // Try to parse pre-analysis
 let preAnalysis = {};
 try {
   if (trade.pre_analysis) {
     preAnalysis = JSON.parse(trade.pre_analysis);
   }
 } catch (err) {
   console.error('Error parsing pre-analysis:', err);
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
               <strong>Status:</strong> <Chip 
                 label={trade.status} 
                 color={trade.status === 'open' ? 'primary' : 'default'} 
                 size="small"
               />
             </Typography>
           </Grid>
         </Grid>
       </Box>
       
       {/* Pre-analysis summary */}
       {preAnalysis && Object.keys(preAnalysis).length > 0 && (
         <Box mb={4}>
           <Typography variant="h5" component="h2" gutterBottom>
             Pre-Trade Analysis
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
               name="post_rating"
               value={formData.post_analysis.rating}
               onChange={handleRatingChange}
               size="large"
             />
           </Grid>
           
           <Grid item xs={12}>
             <TextField
               label="Emotions During Trade"
               name="post_emotions"
               value={formData.post_analysis.emotions}
               onChange={handleChange}
               fullWidth
               placeholder="What emotions did you experience during this trade? Fear, greed, confidence, etc."
             />
           </Grid>
           
           <Grid item xs={12}>
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
           
           <Grid item xs={12}>
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
                 {submitting ? <CircularProgress size={24} /> : 'Save Analysis'}
               </Button>
             </Box>
           </Grid>
         </Grid>
       </Box>
     </Paper>
   </Container>
 );
};

export default TradeAnalysisPage;