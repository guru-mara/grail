import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  CircularProgress,
  Alert,
  Chip,
  IconButton
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Assessment as AnalysisIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import tradeService from '../../services/tradeService';

function TradesList() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user's trades
    const fetchTrades = async () => {
      try {
        const data = await tradeService.getTrades();
        setTrades(data);
        setError('');
      } catch (error) {
        console.error('Error fetching trades:', error);
        setError('Failed to load trades. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrades();
  }, []);

  const handleAnalyze = (tradeId) => {
    navigate(`/trades/${tradeId}/analysis`);
  };

  const handleNewTrade = () => {
    navigate('/trades/new');
  };

  const handleDeleteTrade = async (tradeId) => {
    if (!window.confirm('Are you sure you want to delete this trade?')) {
      return;
    }
    
    try {
      await tradeService.deleteTrade(tradeId);
      
      // Remove trade from state
      setTrades(trades.filter(trade => trade.id !== tradeId));
    } catch (error) {
      console.error('Error deleting trade:', error);
      alert('Error deleting trade');
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
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            My Trades
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleNewTrade}
          >
            New Trade
          </Button>
        </Box>
        
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        
        {trades.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="textSecondary">
              No trades found
            </Typography>
            <Typography variant="body1" color="textSecondary" mt={1}>
              Start by adding your first trade
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Instrument</TableCell>
                  <TableCell>Direction</TableCell>
                  <TableCell>Entry Price</TableCell>
                  <TableCell>Exit Price</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Result</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {trades.map((trade) => {
                  // Calculate profit/loss if not available
                  let profitLoss = trade.result;
                  if (!profitLoss && trade.exit_price) {
                    const priceDiff = trade.direction === 'long' 
                      ? trade.exit_price - trade.entry_price 
                      : trade.entry_price - trade.exit_price;
                    profitLoss = priceDiff * trade.position_size;
                  }
                  
                  return (
                    <TableRow key={trade.id}>
                      <TableCell>{trade.instrument}</TableCell>
                      <TableCell>
                        <Chip 
                          label={trade.direction === 'long' ? 'BUY' : 'SELL'} 
                          color={trade.direction === 'long' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>${parseFloat(trade.entry_price).toFixed(2)}</TableCell>
                      <TableCell>
                        {trade.exit_price 
                          ? `$${parseFloat(trade.exit_price).toFixed(2)}` 
                          : '-'}
                      </TableCell>
                      <TableCell>{trade.position_size}</TableCell>
                      <TableCell>
                        {new Date(trade.entry_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {profitLoss 
                          ? <span style={{ 
                              color: profitLoss >= 0 ? 'green' : 'red', 
                              fontWeight: 'bold' 
                            }}>
                              {profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)}
                            </span> 
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={trade.status} 
                          color={trade.status === 'open' ? 'primary' : 'default'} 
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="primary"
                          onClick={() => handleAnalyze(trade.id)}
                          title="Analyze Trade"
                        >
                          <AnalysisIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteTrade(trade.id)}
                          title="Delete Trade"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
}

export default TradesList;