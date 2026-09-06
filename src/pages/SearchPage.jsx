import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // 1. Προσθήκη useNavigate
import { Container, Typography, Box, Card, CardContent, Chip, Grid, CircularProgress } from '@mui/material';
import { MdLeaderboard, MdRestaurant, MdFitnessCenter, MdArticle } from 'react-icons/md';
import AuthContext from '../context/AuthContext';
import Body from '../layout/Body';

const SearchPage = () => {
    const { authTokens } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate(); // 2. Αρχικοποίηση navigate
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    const query = new URLSearchParams(location.search).get('q');

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/search/?q=${query}`, {
                    method: 'GET',
                    headers: { 'Authorization': 'Bearer ' + String(authTokens.access) }
                });
                const data = await response.json();
                setResults(data);
            } catch (error) {
                console.error("Search Error:", error);
            } finally {
                setLoading(false);
            }
        };

        if (query) fetchResults();
    }, [query, authTokens]);

    return (
        <Body>
            <Container maxWidth="md" sx={{ py: 5 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
                    Search Results for: <span style={{ color: '#ab47bc' }}>"{query}"</span>
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
                    Ranked by BM25 Relevance Algorithm
                </Typography>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>
                ) : (
                    <Grid container spacing={2}>
                        {results.map((item, index) => (
                            <Grid item xs={12} key={index}>
                                {/* 3. Προσθήκη onClick και Pointer Cursor στην κάρτα */}
                                <Card 
                                    onClick={() => item.type === 'article' && navigate(`/article/${item.id}`)}
                                    sx={{ 
                                        borderRadius: 4, 
                                        border: '1px solid #eee', 
                                        transition: '0.3s', 
                                        cursor: item.type === 'article' ? 'pointer' : 'default', // Μόνο τα άρθρα δείχνουν χεράκι
                                        '&:hover': { 
                                            borderColor: '#ab47bc', 
                                            transform: item.type === 'article' ? 'translateY(-2px)' : 'none',
                                            boxShadow: item.type === 'article' ? '0 4px 20px rgba(0,0,0,0.1)' : 'none'
                                        } 
                                    }}
                                >
                                    <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            {item.type === 'meal' && <MdRestaurant size={30} color="#4caf50" />}
                                            {item.type === 'exercise' && <MdFitnessCenter size={30} color="#2196f3" />}
                                            {item.type === 'article' && <MdArticle size={30} color="#ff9800" />}
                                            
                                            <Box>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{item.name}</Typography>
                                                <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                                    {item.type} {item.type === 'article' && "• Click to read"}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Chip 
                                            label={`Relevance: ${item.score}`} 
                                            icon={<MdLeaderboard color="white" />}
                                            sx={{ bgcolor: '#ab47bc', color: 'white', fontWeight: 'bold' }} 
                                        />
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </Body>
    );
};

export default SearchPage;
