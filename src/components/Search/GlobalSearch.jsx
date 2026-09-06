import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, InputAdornment, Box } from '@mui/material';
import { MdSearch } from 'react-icons/md';

const GlobalSearch = () => {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); //  ΣΤΑΜΑΤΑΕΙ το default submit του browser
            
            if (query.trim().length > 1) {
                console.log("🚀 Navigating to search with query:", query); // Debug log
                navigate(`/search?q=${encodeURIComponent(query.trim())}`);
                setQuery(''); // Προαιρετικά: καθαρίζει τη μπάρα μετά το Enter
            }
        }
    };

    return (
        <Box sx={{ maxWidth: 500, mx: 'auto', mt: 2 }}>
            <TextField
                fullWidth
                placeholder="Search for protein, chest workouts, or fitness articles..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleSearch}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <MdSearch size={24} color="#ab47bc" />
                        </InputAdornment>
                    ),
                    sx: { borderRadius: '20px', bgcolor: '#f5f5f5' }
                }}
            />
        </Box>
    );
};

export default GlobalSearch;
