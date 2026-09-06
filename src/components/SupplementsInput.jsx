import React, { useState, useContext } from 'react'
import { Box, TextField, Button, Paper, Stack } from '@mui/material'
import AuthContext from '../context/AuthContext'
import AddIcon from '@mui/icons-material/Add';
import MedicationIcon from '@mui/icons-material/Medication';

const SupplementsInput = ({ setTotalSupplements }) => {
    const { authTokens } = useContext(AuthContext)
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [dossage, setDossage] = useState('')
    const [supplement, setSupplement] = useState('')

    const onSubmitHandler = async (e) => {
        e.preventDefault()

        const response = await fetch('http://127.0.0.1:8000/api/supplement/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + String(authTokens?.access)
            },
            body: JSON.stringify({
                'date': date,
                'name': supplement,
                'dossage': dossage,
            })
        })

        if (response.status === 200 || response.status === 201) {
            console.log('Supplement Submitted!')
            setSupplement('')
            setDossage('')
            
            const getLog = async () => {
                const response = await fetch('http://127.0.0.1:8000/api/supplement/', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + String(authTokens?.access)
                    }
                })
                const data = await response.json()
                setTotalSupplements(data)
            }
            getLog()
        }
    }

    return (
        <Paper 
            elevation={0} 
            sx={{ 
                p: 3, 
                mb: 4, 
                backgroundColor: '#f8f9fa', 
                borderRadius: 3,
                border: '1px solid #e0e0e0',
                width: '100%' /* Εξασφαλίζει ότι το γκρι πλαίσιο πιάνει όλο τον χώρο */
            }}
        >
            <Box component="form" onSubmit={onSubmitHandler} sx={{ width: '100%' }}>
                <Stack 
                    direction={{ xs: 'column', md: 'row' }} 
                    spacing={2} 
                    alignItems="center"
                    sx={{ width: '100%' }} /* Λέει στα στοιχεία να απλώσουν μέχρι τις άκρες */
                >
                    <TextField
                        label="Date"
                        type="date"
                        size="small"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ width: { xs: '100%', md: '200px' }, backgroundColor: 'white' }}
                    />

                    <TextField
                        label="Supplement Name"
                        placeholder="e.g. Creatine"
                        size="small"
                        required
                        value={supplement}
                        onChange={(e) => setSupplement(e.target.value)}
                        InputProps={{
                            startAdornment: <MedicationIcon sx={{ color: 'action.active', mr: 1 }} />,
                        }}
                        /* Το flexGrow: 1 είναι η μαγεία! Τεντώνει το μεσαίο πεδίο για να γεμίσει το κενό */
                        sx={{ flexGrow: 1, width: { xs: '100%', md: 'auto' }, backgroundColor: 'white' }}
                    />

                    <TextField
                        label="Dosage"
                        placeholder="e.g. 5g"
                        size="small"
                        required
                        value={dossage}
                        onChange={(e) => setDossage(e.target.value)}
                        /* Το μεγαλώσαμε στα 180px για να μην κόβει το κείμενο */
                        sx={{ width: { xs: '100%', md: '180px' }, backgroundColor: 'white' }}
                    />

                    <Button 
                        variant="contained" 
                        type="submit"
                        color="secondary"
                        startIcon={<AddIcon />}
                        sx={{ 
                            height: '40px', 
                            px: 4,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 10px rgba(156, 39, 176, 0.3)',
                            width: { xs: '100%', md: 'auto' },
                            backgroundColor: '#ab47bc',
                            '&:hover': { backgroundColor: '#9c27b0' }
                        }}
                    >
                        Add
                    </Button>
                </Stack>
            </Box>
        </Paper>
    )
}

export default SupplementsInput
