import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Paper, Divider } from '@mui/material';
import { MdArrowBack } from 'react-icons/md';
import AuthContext from '../context/AuthContext';
import Body from '../layout/Body';

const ArticlePage = () => {
    const { id } = useParams();
    const { authTokens } = useContext(AuthContext);
    const [article, setArticle] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchArticle = async () => {
            const response = await fetch(`http://127.0.0.1:8000/api/article/${id}/`, {
                method: 'GET',
                headers: { 'Authorization': 'Bearer ' + String(authTokens.access) }
            });
            const data = await response.json();
            setArticle(data);
        };
        fetchArticle();
    }, [id, authTokens]);

    if (!article) return <Body><Typography>Loading article...</Typography></Body>;

    return (
        <Body>
            <Container maxWidth="md" sx={{ py: 5 }}>
                <Button startIcon={<MdArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 3 }}>
                    Back to Search
                </Button>
                <Paper sx={{ p: { xs: 3, md: 6 }, borderRadius: 4, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                    <Typography variant="overline" color="secondary" sx={{ fontWeight: 'bold' }}>
                        {article.category}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, color: '#2c3e50' }}>
                        {article.title}
                    </Typography>
                    <Divider sx={{ mb: 4 }} />
                    {/* Εδώ εμφανίζεται το κείμενο του .txt αρχείου */}
                    <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-line', fontSize: '1.1rem' }}>
                        {article.content}
                    </Typography>
                </Paper>
            </Container>
        </Body>
    );
};

export default ArticlePage;
