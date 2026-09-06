import React, { useState, useEffect, useContext, useCallback } from 'react'
import { Typography, Box, Paper, Divider } from '@mui/material'
import AuthContext from '../context/AuthContext'
import Body from '../layout/Body'
import CardioInput from '../components/CardioInput'
import CardioLog from '../components/CardioLog'
import LoadingSpinner from '../components/LoadingSpinner'

const Cardio = () => {
    const { authTokens } = useContext(AuthContext)
    const [totalCardio, setTotalCardio] = useState(null)
    const [loading, setLoading] = useState(true)

    const getLog = useCallback(async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/cardio/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + String(authTokens?.access)
                }
            })
            const data = await response.json()
            setTotalCardio(data)
        } catch (error) {
            console.error("Fetch error:", error)
        } finally {
            setLoading(false)
        }
    }, [authTokens])

    useEffect(() => {
        if (authTokens) {
            getLog()
        }
    }, [getLog, authTokens])

    if (loading && totalCardio === null) {
        return <Body><Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}><LoadingSpinner /></Box></Body>
    }

    return (
        <Body>
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', pt: 6, px: 2, pb: 6 }}>
                <Paper sx={{ width: '100%', maxWidth: '900px', borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', p: { xs: 3, md: 5 }, backgroundColor: '#fff' }}>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a2027', borderBottom: '4px solid #0288d1', pb: 1, display: 'inline-block' }}>
                            Cardio Sessions
                        </Typography>
                    </Box>

                    <Box sx={{ mb: 5 }}>
                        <CardioInput setTotalCardio={setTotalCardio} />
                    </Box>

                    <Divider sx={{ mb: 4 }} />

                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#555', mb: 2, pl: 1 }}>
                        Activity History
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {Array.isArray(totalCardio) && totalCardio.length > 0 ? (
                            totalCardio.map((log) => (
                                <CardioLog key={log.id} cardioLog={log} setTotalCardio={setTotalCardio} />
                            ))
                        ) : (
                            <Typography sx={{ textAlign: 'center', color: 'gray', py: 4 }}>No sessions found.</Typography>
                        )}
                    </Box>
                </Paper>
            </Box>
        </Body>
    )
}

export default Cardio
