import React, { useState, useEffect, useContext, useCallback } from 'react'
import { Typography, Box, Paper, Divider } from '@mui/material'
import AuthContext from '../context/AuthContext'
import Body from '../layout/Body'
import WorkoutInput from '../components/WorkoutInput'
import WorkoutLog from '../components/WorkoutLog'
import LoadingSpinner from '../components/LoadingSpinner'

const WeightTraining = () => {
    const { authTokens } = useContext(AuthContext)
    const [totalWorkouts, setTotalWorkouts] = useState(null)
    const [loading, setLoading] = useState(true)

    const getLog = useCallback(async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/weight/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + String(authTokens?.access)
                }
            })
            const data = await response.json()
            setTotalWorkouts(data)
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

    if (loading && totalWorkouts === null) {
        return <Body><Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}><LoadingSpinner /></Box></Body>
    }

    return (
        <Body>
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', pt: 6, px: 2, pb: 6 }}>
                <Paper sx={{ 
                    width: '100%', 
                    maxWidth: '1000px', 
                    borderRadius: 4, 
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)', 
                    p: { xs: 3, md: 5 }, 
                    backgroundColor: '#fff' 
                }}>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                        <Typography variant="h4" sx={{ 
                            fontWeight: 'bold', 
                            color: '#1a2027', 
                            borderBottom: '4px solid #ab47bc', 
                            pb: 1, 
                            display: 'inline-block' 
                        }}>
                            Weight Training Log
                        </Typography>
                    </Box>

                    <Box sx={{ mb: 5 }}>
                        <WorkoutInput setTotalWorkouts={setTotalWorkouts} />
                    </Box>

                    <Divider sx={{ mb: 4 }} />

                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#555', mb: 2, pl: 1 }}>
                        Training History
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {Array.isArray(totalWorkouts) && totalWorkouts.length > 0 ? (
                            totalWorkouts.map((log) => (
                                <WorkoutLog key={log.id} workoutLog={log} setTotalWorkouts={setTotalWorkouts} />
                            ))
                        ) : (
                            <Typography sx={{ textAlign: 'center', color: 'gray', py: 4 }}>
                                No logs found.
                            </Typography>
                        )}
                    </Box>
                </Paper>
            </Box>
        </Body>
    )
}

export default WeightTraining
