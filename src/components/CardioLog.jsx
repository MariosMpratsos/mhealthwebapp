import React, { useState, useContext } from 'react'
import { Box, Typography, IconButton, Paper, TextField, Stack, Divider, Button } from '@mui/material'
import AuthContext from '../context/AuthContext'
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const CardioLog = ({ cardioLog, setTotalCardio }) => {
    const { authTokens } = useContext(AuthContext)

    // Hooks πάντα πρώτα!
    const [date, setDate] = useState(cardioLog?.date || '')
    const [name, setName] = useState(cardioLog?.name || '')
    const [duration, setDuration] = useState(cardioLog?.duration || '')
    const [edit, setEdit] = useState(false)

    if (!cardioLog || !cardioLog.id) return null;

    const refreshLog = async () => {
        const response = await fetch('http://127.0.0.1:8000/api/cardio/', {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + String(authTokens?.access) }
        })
        const data = await response.json()
        setTotalCardio(data)
    }

    const deleteWorkout = async () => {
        if (window.confirm("Delete this entry?")) {
            const res = await fetch(`http://127.0.0.1:8000/api/cardio/${cardioLog.id}/`, {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer ' + String(authTokens?.access) }
            })
            if (res.ok) refreshLog()
        }
    }

    const editWorkout = async () => {
        const res = await fetch(`http://127.0.0.1:8000/api/cardio/${cardioLog.id}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + String(authTokens?.access) },
            body: JSON.stringify({ 'date': date, 'name': name, 'duration': duration })
        })
        if (res.ok) { refreshLog(); setEdit(false); }
    }

    if (edit) {
        return (
            <Paper elevation={2} sx={{ p: 2, mb: 2, borderRadius: 3, borderLeft: '6px solid #ab47bc' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                    <TextField label="Date" type="date" size="small" value={date} onChange={(e) => setDate(e.target.value)} InputLabelProps={{ shrink: true }} />
                    <TextField label="Workout" size="small" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
                    <TextField label="Duration" type="time" size="small" value={duration} onChange={(e) => setDuration(e.target.value)} InputLabelProps={{ shrink: true }} />
                    <Stack direction="row" spacing={1}>
                        <Button variant="contained" color="success" onClick={editWorkout}>Save</Button>
                        <Button variant="outlined" color="error" onClick={() => setEdit(false)}>Cancel</Button>
                    </Stack>
                </Stack>
            </Paper>
        )
    }

    return (
        <Paper elevation={1} sx={{ p: 2, mb: 1.5, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, md: 5 }, flexGrow: 1 }}>
                <Box><Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>DATE</Typography><Typography sx={{ fontWeight: 500 }}>{date}</Typography></Box>
                <Divider orientation="vertical" flexItem />
                <Box><Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>WORKOUT</Typography><Typography sx={{ fontSize: '1.1rem', color: '#ab47bc', fontWeight: 'bold' }}>{name}</Typography></Box>
                <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}><Typography variant="caption" color="textSecondary" sx={{ fontWeight: 'bold' }}>DURATION</Typography><Typography sx={{ fontWeight: 500 }}>{duration}</Typography></Box>
            </Box>
            <Box>
                <IconButton color="primary" onClick={() => setEdit(true)}><EditIcon /></IconButton>
                <IconButton color="error" onClick={deleteWorkout}><DeleteOutlineIcon /></IconButton>
            </Box>
        </Paper>
    )
}

export default CardioLog
