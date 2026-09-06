import React, { useContext, useState } from 'react'
import { AppBar, Toolbar, Typography, Box, InputBase, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'; // 1. IMPORT ΤΟ NAVIGATE

// Εικονίδια
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

import AuthContext from '../context/AuthContext'

const Header = () => {
    const { logoutUser } = useContext(AuthContext)
    const [search, setSearch] = useState('')
    const navigate = useNavigate(); // 2. INITIALIZE ΤΟ NAVIGATE

    // 3. Η ΣΥΝΑΡΤΗΣΗ ΓΙΑ ΤΟ SEARCH
    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Αποφυγή refresh
            if (search.trim().length > 1) {
                console.log("Searching for:", search);
                navigate(`/search?q=${encodeURIComponent(search.trim())}`);
                setSearch(''); // Καθαρίζει τη μπάρα
            }
        }
    };

    return (
        <AppBar position="fixed" sx={{ zIndex: 1201, backgroundColor: '#ab47bc', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                
                {/* Logo / Title */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <FitnessCenterIcon sx={{ display: { xs: 'none', sm: 'block' }, fontSize: '28px', color: 'white' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', display: { xs: 'none', sm: 'block' }, letterSpacing: '1px' }}>
                        Fitness Tracker
                    </Typography>
                </Box>

                {/* Search Bar (Στη μέση) */}
                <Box 
                    component="form" // 4. ΤΟ ΚΑΝΟΥΜΕ FORM ΓΙΑ ΚΑΛΥΤΕΡΟ ENTER SUPPORT
                    onSubmit={(e) => e.preventDefault()}
                    sx={{
                        display: 'flex', 
                        alignItems: 'center', 
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.25)' },
                        borderRadius: '25px', 
                        padding: '4px 15px', 
                        width: { xs: '60%', md: '400px' },
                        transition: '0.3s'
                    }}
                >
                    <SearchIcon sx={{ color: 'white', mr: 1, opacity: 0.8 }} />
                    <InputBase
                        placeholder="Search workouts, supplements..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={handleSearch} // 5. ΠΡΟΣΘΗΚΗ ΤΟΥ EVENT HANDLER
                        sx={{ color: 'white', width: '100%', fontSize: '15px' }}
                    />
                </Box>

                {/* Logout Button */}
                <Button 
                    color="inherit" 
                    onClick={logoutUser} 
                    endIcon={<LogoutIcon />}
                    sx={{ 
                        textTransform: 'none', 
                        fontWeight: 'bold', 
                        borderRadius: '10px', 
                        padding: '6px 16px',
                        '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } 
                    }}
                >
                    Log Out
                </Button>
            </Toolbar>
        </AppBar>
    )
}

export default Header
