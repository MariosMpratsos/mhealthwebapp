import React, { useState, useEffect, useContext } from 'react';
import { Box, Paper, Typography, Divider } from '@mui/material';
import DefaultUserPic from '../media/user.png';
import AuthContext from '../context/AuthContext';
import Body from '../layout/Body';

const Profile = () => {
    const { authTokens } = useContext(AuthContext);
    const [profile, setProfile] = useState({
        first_name: '',
        last_name: '',
        email: ''
    });

    const getProfileDetails = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/profile/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + String(authTokens?.access)
                },
            });
            const data = await response.json();

            let fName = data.first_name;
            let lName = data.last_name;

            // Αν δεν υπάρχει όνομα, το φτιάχνει από το email
            if (!fName || !lName) {
                const namePart = data.email.split('@')[0];
                const parts = namePart.split('.');
                
                fName = fName || (parts[0].charAt(0).toUpperCase() + parts[0].slice(1));
                lName = lName || (parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : '');
            }

            setProfile({
                first_name: fName,
                last_name: lName,
                email: data.email
            });
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    useEffect(() => {
        getProfileDetails();
    }, []);

    return (
        <Body>
            {/* Εξωτερικό Box: Απλώνει σε όλο τον κενό χώρο και κεντράρει */}
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',     
                width: '100%',
                minWidth: { md: '80vw' }, /* Τεντώνει τον χώρο στα δεξιά του μενού */
                height: '100%',
                minHeight: '85vh',
                p: 2
            }}>
                
                {/* Η Κάρτα του Προφίλ - Μεγάλη και στη μέση */}
                <Paper sx={{ 
                    p: { xs: 3, md: 5 }, 
                    borderRadius: 4, 
                    width: '100%',        
                    maxWidth: '600px',   /* Μέγιστο πλάτος για να μην γίνει τεράστια */
                    minWidth: '350px',   /* Ελάχιστο πλάτος για να μην ζουληχτεί */
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    backgroundColor: '#fff'
                }}>
                    
                    {/* Εικονίδιο Χρήστη */}
                    <Box sx={{ 
                        height: 100, 
                        width: 100, 
                        backgroundColor: '#f3e5f5', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        mb: 2,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}>
                        <Box component='img' src={DefaultUserPic} sx={{ height: '50px' }} />
                    </Box>
                    
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1a2027', mb: 1 }}>
                        My Profile
                    </Typography>

                    <Divider sx={{ width: '100%', mb: 4, mt: 1 }} />

                    {/* Στοιχεία Χρήστη */}
                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0', pb: 1 }}>
                            <Typography color="textSecondary" sx={{ fontWeight: 'bold' }}>First Name:</Typography>
                            <Typography sx={{ fontWeight: 500, textAlign: 'right' }}>{profile.first_name || '—'}</Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0', pb: 1 }}>
                            <Typography color="textSecondary" sx={{ fontWeight: 'bold' }}>Last Name:</Typography>
                            <Typography sx={{ fontWeight: 500, textAlign: 'right' }}>{profile.last_name || '—'}</Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0', pb: 1 }}>
                            <Typography color="textSecondary" sx={{ fontWeight: 'bold' }}>Email:</Typography>
                            <Typography sx={{ fontWeight: 500, wordBreak: 'break-all', textAlign: 'right', pl: 2 }}>{profile.email}</Typography>
                        </Box>
                        
                    </Box>
                </Paper>
            </Box>
        </Body>
    );
};

export default Profile;
