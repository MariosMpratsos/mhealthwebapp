import React, { useState, useEffect, useContext } from 'react'
import AuthContext from '../context/AuthContext'
import { Box, Button, TextField, Paper, Typography, Avatar, Stack } from '@mui/material'
import DefaultUserPic from '../media/user.png'
import Body from '../layout/Body'

const ProfileForm = ({ firstName, lastName, email, setEdit, getProfileDetails }) => {
    const { authTokens } = useContext(AuthContext)
    const [newFirst, setNewFirst] = useState(firstName)
    const [newLast, setNewLast] = useState(lastName)
    const [newMail, setNewMail] = useState(email)

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        await fetch('http://127.0.0.1:8000/api/profile/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + String(authTokens?.access)
            },
            body: JSON.stringify({
                'first_name': newFirst,
                'last_name': newLast,
                'email': newMail,
            })
        })
        alert('Changes Saved!  ')
        setEdit(false)
        getProfileDetails()
    }

    useEffect(() => {
        setNewFirst(firstName)
        setNewLast(lastName)
        setNewMail(email)
    }, [firstName, lastName, email])

    return (
        <Body>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', p: 2 }}>
                <Paper sx={{ p: 4, width: '100%', maxWidth: '500px', borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
                    <form onSubmit={onSubmitHandler}>
                        <Stack spacing={3} alignItems="center">
                            <Box sx={{ position: 'relative' }}>
                                <Avatar 
                                    src={DefaultUserPic} 
                                    sx={{ width: 100, height: 100, border: '4px solid #f3e5f5', backgroundColor: '#dbc3e4' }} 
                                />
                            </Box>
                            
                            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>Edit Profile</Typography>

                            <TextField 
                                fullWidth label="First Name" variant="outlined" 
                                value={newFirst} onChange={(e) => setNewFirst(e.target.value)} 
                            />
                            
                            <TextField 
                                fullWidth label="Last Name" variant="outlined" 
                                value={newLast} onChange={(e) => setNewLast(e.target.value)} 
                            />
                            
                            <TextField 
                                fullWidth label="Email Address" variant="outlined" type="email"
                                value={newMail} onChange={(e) => setNewMail(e.target.value)} 
                            />

                            <Box sx={{ display: 'flex', gap: 2, width: '100%', pt: 2 }}>
                                <Button 
                                    fullWidth variant="contained" type="submit"
                                    sx={{ backgroundColor: '#ab47bc', borderRadius: 2, py: 1.5, fontWeight: 'bold', '&:hover': { backgroundColor: '#9c27b0' } }}
                                >
                                    Confirm
                                </Button>
                                <Button 
                                    fullWidth variant="outlined" onClick={() => setEdit(false)}
                                    sx={{ borderRadius: 2, color: '#666', borderColor: '#ccc' }}
                                >
                                    Cancel
                                </Button>
                            </Box>
                        </Stack>
                    </form>
                </Paper>
            </Box>
        </Body>
    )
}

export default ProfileForm
