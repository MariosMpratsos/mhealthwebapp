import React from 'react'
import { Box } from '@mui/material'
import Sidebar from './Sidebar'

const Body = ({ children }) => {
    return (
        <Box sx={{ 
            display: 'flex', 
            minHeight: '100vh', 
            backgroundColor: '#fafafa',
            // 1. Σπρώχνουμε ΟΛΟ το σώμα της σελίδας 64px κάτω (όσο είναι το ύψος του Header)
            paddingTop: '64px' 
        }}>
            <Sidebar />

            <Box 
                component="main" 
                sx={{ 
                    flexGrow: 1, 
                    // 2. Δίνουμε έξτρα "αέρα" (paddingTop) εσωτερικά για να μην κολλάνε τα γράμματα!
                    pt: { xs: 4, lg: 5 }, 
                    px: { xs: 2, lg: 4 }, 
                    pb: 4,
                    boxSizing: 'border-box'
                }}
            >
                {children}
            </Box>
        </Box>
    )
}

export default Body
