import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Typography, Button, Box } from '@mui/material'

const SidebarButton = ({ value, text, icon }) => {
    const navigate = useNavigate()
    const location = useLocation()
    
    const isActive = location.pathname === `/${value}`

    return (
        <Button 
            onClick={() => navigate(`/${value}`)}
            sx={{
                width: { xs: '100%', lg: '92%' },
                height: '55px',
                // Ενεργό: Μωβ. Ανενεργό: Διάφανο
                backgroundColor: isActive ? '#ab47bc' : 'transparent',
                // ΕΝΕΡΓΟ: Λευκό κείμενο. ΑΝΕΝΕΡΓΟ: Σκούρο γκρι για να διαβάζεται!
                color: isActive ? 'white' : '#4a4a4a',
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                margin: '4px auto',
                padding: '0 20px',
                borderRadius: '12px',
                textTransform: 'none',
                border: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                    backgroundColor: isActive ? '#9c27b0' : 'rgba(171, 71, 188, 0.1)',
                    color: isActive ? 'white' : '#ab47bc',
                    transform: 'translateX(5px)'
                }
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <Box 
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '24px',
                        // Εικονίδιο: Λευκό αν είναι ενεργό, έντονο μωβ αν είναι ανενεργό
                        color: isActive ? 'white' : '#8e44ad'
                    }}
                >
                    {icon}
                </Box>
                <Typography 
                    sx={{ 
                        fontSize: { xs: '14px', md: '15px' },
                        fontWeight: isActive ? '600' : '500',
                        letterSpacing: '0.3px'
                    }}
                >
                    {text}
                </Typography>
            </Box>
        </Button>
    )
}

export default SidebarButton
