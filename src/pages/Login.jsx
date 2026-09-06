import React, { useContext } from 'react'
import { Box, Button, Typography, Paper } from '@mui/material'
import GoogleIcon from '@mui/icons-material/Google'
import { useGoogleLogin } from '@react-oauth/google'
import AuthContext from '../context/AuthContext'

const Login = () => {
    const { loginGoogleUser } = useContext(AuthContext)

    //  ΤΟ BACKEND LOGIC 
    const googleLogin = useGoogleLogin({
        onSuccess: tokenResponse => {
            console.log("Google Token Response:", tokenResponse)
            loginGoogleUser(tokenResponse)
        },
        onError: () => console.log('Login Failed'),
        scope: 'https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.location.read',
        prompt: 'consent',
        flow: 'implicit' 
    })

    return (
        <Box 
            // 1. Full screen για να φύγουν τα "λευκά στις γωνίες"
            sx={{ 
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                // 2. Το χρώμα που δένει με το υπόλοιπο app
                background: 'linear-gradient(135deg, #f6f2f9 0%, #e1bee7 100%)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: 0,
                padding: 0,
                zIndex: 2000
            }}
        >
            <Paper 
                elevation={10} 
                sx={{ 
                    p: 5, 
                    // 3. Στρογγυλεμένες γωνίες στην κάρτα
                    borderRadius: '32px', 
                    textAlign: 'center', 
                    maxWidth: 400, 
                    width: '90%',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                }}
            >
                <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: '#ab47bc' }}>
                    Fitness Tracker
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, color: '#5f6368' }}>
                    Connect your Google Fit to see your progress.
                </Typography>
                
                <Button 
                    variant='contained'
                    fullWidth
                    startIcon={<GoogleIcon />}
                    onClick={() => googleLogin()} 
                    sx={{ 
                        textTransform: 'none',
                        padding: '14px',
                        fontSize: '1rem',
                        // 4. Στρογγυλεμένες γωνίες στο κουμπί
                        borderRadius: '16px', 
                        backgroundColor: '#4285F4',
                        fontWeight: 'bold',
                        '&:hover': { backgroundColor: '#357ae8' }
                    }}
                >
                    Sign in with Google
                </Button>

                <Typography variant="caption" sx={{ display: 'block', mt: 3, color: '#999' }}>
                    Make sure to check the "Fitness Data" box in the Google popup!
                </Typography>
            </Paper>
        </Box>
    )
}

export default Login
