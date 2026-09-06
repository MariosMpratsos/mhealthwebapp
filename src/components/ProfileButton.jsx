import React, { useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Typography, Button, Avatar } from '@mui/material'
import AuthContext from '../context/AuthContext'
import DefaultUserPic from '../media/user.png'

const ProfileButton = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { user } = useContext(AuthContext)
    
    // Έλεγχος αν βρισκόμαστε στη σελίδα του προφίλ για το styling
    const isActive = location.pathname === '/profile'
    
    // Προτίμηση στο username, αν δεν υπάρχει email, αλλιώς 'Profile'
    const displayName = user ? (user.username || user.email) : 'Profile'

    return (
        <Button 
            onClick={() => navigate('/profile')} 
            sx={{ 
                width: '92%', 
                height: '65px', 
                backgroundColor: isActive ? '#ab47bc' : 'rgba(155, 89, 182, 0.1)', 
                display: { xs: 'none', lg: 'flex' }, 
                borderRadius: '12px', 
                mb: 2, 
                textTransform: 'none', 
                alignItems: 'center', 
                justifyContent: 'flex-start', 
                border: 'none', 
                px: 2,
                transition: '0.3s',
                '&:hover': { 
                    backgroundColor: isActive ? '#9c27b0' : 'rgba(155, 89, 182, 0.2)',
                    transform: 'translateY(-2px)'
                }
            }}
        >
            <Avatar 
                src={DefaultUserPic} 
                sx={{ 
                    width: 38, 
                    height: 38, 
                    mr: 2, 
                    border: '2px solid white',
                    backgroundColor: '#dbc3e4'
                }} 
            >
                {/* Fallback σε περίπτωση που η εικόνα δεν φορτώσει */}
                {user?.username?.charAt(0).toUpperCase()}
            </Avatar>
            
            <Typography sx={{ 
                fontSize: '13px', 
                color: isActive ? 'white' : '#1a2027', 
                fontWeight: '600',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '140px'
            }}>
                {displayName}
            </Typography>
        </Button>
    )
}

export default ProfileButton
