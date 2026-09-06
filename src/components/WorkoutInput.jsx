import React, { useState, useContext } from 'react'
import { Box, TextField, Button, Paper, Stack } from '@mui/material'
import AuthContext from '../context/AuthContext'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AddIcon from '@mui/icons-material/Add';

const WorkoutInput = ({ setTotalWorkouts }) => {
    const { authTokens } = useContext(AuthContext)
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [workout, setWorkout] = useState('')
    const [reps, setReps] = useState('')
    const [sets, setSets] = useState('')

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        const response = await fetch('http://127.0.0.1:8000/api/weight/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + String(authTokens?.access) },
            body: JSON.stringify({ 'date': date, 'name': workout, 'reps': reps, 'sets': sets })
        })

        if (response.ok) {
            setWorkout(''); setReps(''); setSets('');
            const res = await fetch('http://127.0.0.1:8000/api/weight/', {
                method: 'GET',
                headers: { 'Authorization': 'Bearer ' + String(authTokens?.access) }
            })
            const data = await res.json()
            setTotalWorkouts(data)
        }
    }

    return (
        <Paper elevation={0} sx={{ p: 3, backgroundColor: '#f8f9fa', borderRadius: 3, border: '1px solid #e0e0e0', width: '100%' }}>
            <Box component="form" onSubmit={onSubmitHandler} sx={{ width: '100%' }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" sx={{ width: '100%' }}>
                    <TextField label="Date" type="date" size="small" required value={date} onChange={(e) => setDate(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ width: { xs: '100%', md: '180px' }, backgroundColor: 'white' }} />
                    
                    <TextField label="Exercise" placeholder="e.g. Bench Press" size="small" required value={workout} onChange={(e) => setWorkout(e.target.value)} sx={{ flexGrow: 1, backgroundColor: 'white' }} 
                        InputProps={{ startAdornment: <FitnessCenterIcon sx={{ color: 'action.active', mr: 1 }} /> }} 
                    />
                    
                    <TextField label="Reps" type="number" size="small" required value={reps} onChange={(e) => setReps(e.target.value)} sx={{ width: { xs: '100%', md: '100px' }, backgroundColor: 'white' }} />
                    
                    <TextField label="Sets" type="number" size="small" required value={sets} onChange={(e) => setSets(e.target.value)} sx={{ width: { xs: '100%', md: '100px' }, backgroundColor: 'white' }} />
                    
                    <Button variant="contained" type="submit" color="secondary" startIcon={<AddIcon />} sx={{ height: '40px', px: 3, borderRadius: 2, textTransform: 'none', fontWeight: 'bold', backgroundColor: '#ab47bc' }}>
                        Add
                    </Button>
                </Stack>
            </Box>
        </Paper>
    )
}

export default WorkoutInput
