import React, { useState, useEffect, useContext } from 'react'
import { Typography, Box, Paper } from '@mui/material'
import { MdInfoOutline } from 'react-icons/md' 
import AuthContext from '../context/AuthContext'

import Body from '../layout/Body'
import SupplementsInput from '../components/SupplementsInput'
import SupplementsLog from '../components/SupplementsLog'
import LoadingSpinner from '../components/LoadingSpinner'

const Supplements = () => {
    const { authTokens } = useContext(AuthContext)
    const [totalSupplements, setTotalSupplements] = useState(null)
    const [response, setResponse] = useState(null)

    useEffect(() => {
        const getLog = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/supplement/', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + String(authTokens?.access)
                    }
                })
                const data = await response.json()
                setResponse(response)
                setTotalSupplements(data)
            } catch (error) {
                console.error("Error fetching supplements:", error)
            }
        }

        if (authTokens) {
            getLog()
        }
    }, [authTokens])

    if (!totalSupplements?.length && response?.status !== 200) return (
        <Body>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <LoadingSpinner />
            </Box>
        </Body>
    )

    return (
        <Body>
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'flex-start', 
                width: '100%', 
                minHeight: '100vh', 
                pt: { xs: 4, md: 6 }, 
                px: 2,
                pb: 6
            }}>
                <Paper sx={{ 
                    width: '100%', 
                    maxWidth: '900px', 
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
                            My Supplements
                        </Typography>
                    </Box>

                    {/* MANUAL ENTRY */}
                    <Box sx={{ 
                        mb: 5, 
                        p: 3, 
                        backgroundColor: '#f9f9fc', 
                        borderRadius: 3, 
                        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.03)' 
                    }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#666', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MdInfoOutline /> Manual Entry
                        </Typography>
                        <SupplementsInput setTotalSupplements={setTotalSupplements} />
                    </Box>

                    {/* HISTORY LOG */}
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#555', mb: 2, pl: 1 }}>
                        History Log
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {totalSupplements?.length > 0 ? (
                            totalSupplements.map((supplementsLog) =>
                                <SupplementsLog
                                    key={supplementsLog.id}
                                    supplementsLog={supplementsLog}
                                    setTotalSupplements={setTotalSupplements}
                                />
                            )
                        ) : (
                            <Typography sx={{ textAlign: 'center', color: 'gray', py: 4 }}>
                                No supplements logged yet.
                            </Typography>
                        )}
                    </Box>
                    
                </Paper>
            </Box>
        </Body>
    )
}

export default Supplements
