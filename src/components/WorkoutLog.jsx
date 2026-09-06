import React, { useState, useContext } from 'react'
import { Box, Typography, IconButton, Paper, TextField, Stack, Divider, Button } from '@mui/material'
import AuthContext from '../context/AuthContext'
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const WorkoutLog = ({ workoutLog, setTotalWorkouts }) => {
    const { authTokens } = useContext(AuthContext)

    // Hooks πάντα στην αρχή
    const [date, setDate] = useState(workoutLog?.date || '')
    const [name, setName] = useState(workoutLog?.name || '')
    const [reps, setReps] = useState(workoutLog?.reps || '')
    const [sets, setSets] = useState(workoutLog?.sets || '')
    const [edit, setEdit] = useState(false)

    if (!workoutLog || !workoutLog.id) return null;

    const refreshLog = async () => {
        const response = await fetch('http://127.0.0.1:8000/api/weight/', {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + String(authTokens?.access) }
        })
        const data = await response.json()
        setTotalWorkouts(data)
    }

    const deleteWorkout = async () => {
        if (window.confirm("Delete this workout?")) {
            const res = await fetch(`http://127.0.0.1:8000/api/weight/${workoutLog.id}/`, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + String(authTokens?.access) }
            })
            if (res.ok) refreshLog()
        }
    }

    const editWorkout = async () => {
        const res = await fetch(`http://127.0.0.1:8000/api/weight/${workoutLog.id}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + String(authTokens?.access) },
            body: JSON.stringify({ 'date': date, 'name': name, 'reps': reps, 'sets': sets })
        })
        if (res.ok) { refreshLog(); setEdit(false); }
    }

    if (edit) {
        return (
            <Paper elevation={2} sx={{ p: 2, mb: 2, borderRadius: 3, borderLeft: '6px solid #ab47bc' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                    <TextField label="Date" type="date" size="small" value={date} onChange={(e) => setDate(e.target.value)} InputLabelProps={{ shrink: true }} />
                    <TextField label="Exercise" size="small" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
                    <TextField label="Reps" type="number" size="small" value={reps} onChange={(e) => setReps(e.target.value)} sx={{ width: '100px' }} />
                    <TextField label="Sets" type="number" size="small" value={sets} onChange={(e) => setSets(e.target.value)} sx={{ width: '100px' }} />
                    <Stack direction="row" spacing={1}>
                        <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={editWorkout}>Save</Button>
                        <Button variant="outlined" color="error" startIcon={<CancelIcon />} onClick={() => setEdit(false)}>Cancel</Button>
                    </Stack>
                </Stack>
            </Paper>
        )
    }

    return (
        <Paper elevation={1} sx={{ 
            p: 2, mb: 1.5, borderRadius: 3, 
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            transition: '0.3s', '&:hover': { boxShadow: 4 }
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, md: 4 }, flexGrow: 1 }}>
                <Box sx={{ minWidth: '100px' }}>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>DATE</Typography>
                    <Typography sx={{ fontWeight: 500 }}>{date}</Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>EXERCISE</Typography>
                    <Typography sx={{ fontSize: '1.1rem', color: '#ab47bc', fontWeight: 'bold' }}>{name}</Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box sx={{ textAlign: 'center', minWidth: '60px' }}>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>REPS</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{reps}</Typography>
                </Box>
                <Box sx={{ textAlign: 'center', minWidth: '60px' }}>
                    <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>SETS</Typography>
                    <Typography sx={{ fontWeight: 600 }}>{sets}</Typography>
                </Box>
            </Box>
            <Box sx={{ ml: 2 }}>
                <IconButton color="primary" onClick={() => setEdit(true)}><EditIcon /></IconButton>
                <IconButton color="error" onClick={deleteWorkout}><DeleteOutlineIcon /></IconButton>
            </Box>
        </Paper>
    )
}

export default WorkoutLog
