import React, { useState, useContext } from 'react'
import { Box, TextField, Button, InputAdornment } from '@mui/material'
import AuthContext from '../context/AuthContext'
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import AddIcon from '@mui/icons-material/Add';

const CardioInput = ({ setTotalCardio }) => {
    const { authTokens } = useContext(AuthContext)
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [name, setName] = useState('')
    
    // Εδώ ο χρήστης γράφει ΜΟΝΟ αριθμό (π.χ. 45)
    const [durationMinutes, setDurationMinutes] = useState('') 

    const onSubmitHandler = async (e) => {
        e.preventDefault()

        // --- ΜΕΤΑΤΡΟΠΗ ΓΙΑ ΤΟΝ DJANGO ---
        const totalMins = parseInt(durationMinutes, 10);
        if (isNaN(totalMins) || totalMins <= 0) {
            alert("Παρακαλώ βάλε έγκυρα λεπτά (π.χ. 30)!");
            return;
        }
        
        // Φτιάχνει το 00:45:00
        const hrs = Math.floor(totalMins / 60).toString().padStart(2, '0');
        const mins = (totalMins % 60).toString().padStart(2, '0');
        const formattedDuration = `${hrs}:${mins}:00`;

        const response = await fetch('http://127.0.0.1:8000/api/cardio/', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': 'Bearer ' + String(authTokens?.access) 
            },
            body: JSON.stringify({ 
                'date': date, 
                'name': name, 
                'duration': formattedDuration 
            })
        })

        if (response.ok) {
            setName(''); 
            setDurationMinutes(''); 
            
            const res = await fetch('http://127.0.0.1:8000/api/cardio/', {
                method: 'GET',
                headers: { 'Authorization': 'Bearer ' + String(authTokens?.access) }
            })
            const data = await res.json()
            
            if (typeof setTotalCardio === 'function') {
                setTotalCardio(data)
            }
        } else {
            alert("Υπήρξε πρόβλημα κατά την αποθήκευση.");
        }
    }

    return (
        // Το Box εδώ έχει ακριβώς το styling της φωτογραφίας!
        <Box 
            component="form" 
            onSubmit={onSubmitHandler} 
            sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' }, 
                gap: 2, 
                alignItems: 'center',
                backgroundColor: '#ffffff', // Λευκό background όπως στη φωτό
                p: 2, // Εσωτερικό κενό
                borderRadius: '8px', // Στρογγυλεμένες γωνίες
                border: '1px solid #e0e0e0', // Λεπτό γκρι περίγραμμα
                width: '100%',
                mb: 4 // Κενό από το από κάτω κομμάτι (History)
            }}
        >
            {/* ΠΕΔΙΟ: DATE */}
            <TextField 
                label="Date" 
                type="date" 
                size="small" 
                required 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                InputLabelProps={{ shrink: true }} 
                sx={{ width: { xs: '100%', md: '160px' } }} 
            />
            
            {/* ΠΕΔΙΟ: WORKOUT NAME */}
            <TextField 
                label="Workout" 
                placeholder="e.g. Running" 
                size="small" 
                required 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                InputProps={{ 
                    startAdornment: <DirectionsRunIcon sx={{ color: 'action.active', mr: 1 }} /> 
                }} 
                sx={{ flexGrow: 1 }} 
            />
            
            {/* ΠΕΔΙΟ: DURATION (Μόνο Αριθμοί) */}
            <TextField 
                label="Duration (min)" 
                type="number" // <--- Μόνο αριθμοί, τέλος το AM/PM
                placeholder="45"
                size="small" 
                required 
                value={durationMinutes} 
                onChange={(e) => setDurationMinutes(e.target.value)} 
                InputProps={{ 
                    endAdornment: <InputAdornment position="end">min</InputAdornment>,
                    inputProps: { min: 1, max: 300 }
                }}
                sx={{ width: { xs: '100%', md: '140px' } }} 
            />
            
            {/* ΚΟΥΜΠΙ: ADD */}
            <Button 
                variant="contained" 
                type="submit" 
                startIcon={<AddIcon />} 
                sx={{ 
                    height: '40px', 
                    px: 4, 
                    borderRadius: '8px', 
                    textTransform: 'none', 
                    fontWeight: 'bold', 
                    backgroundColor: '#ab47bc', 
                    '&:hover': { backgroundColor: '#8e24aa' },
                    whiteSpace: 'nowrap' // Για να μη σπάει το κουμπί σε δύο γραμμές
                }}
            >
                Add
            </Button>
        </Box>
    )
}

export default CardioInput
