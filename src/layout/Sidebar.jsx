import React, { useContext } from 'react';
import { Box, Stack, Divider } from '@mui/material';
import AuthContext from '../context/AuthContext';

// Imports εικονιδίων από react-icons (Αφαιρέθηκε το MdMap)
import { MdOutlineSummarize, MdRestaurant } from 'react-icons/md';
import { CiDumbbell } from 'react-icons/ci';
import { BiRun } from 'react-icons/bi';
import { CgPill } from 'react-icons/cg';

// Εισαγωγή των βοηθητικών components
import SidebarButton from '../components/SidebarButton'; 
import ProfileButton from '../components/ProfileButton';

const Sidebar = () => {
    const { user } = useContext(AuthContext);

    // Αν δεν υπάρχει συνδεδεμένος χρήστης, το Sidebar δεν εμφανίζεται
    if (!user) return null;

    return (
        <Box 
            sx={{ 
                width: '260px', 
                position: 'fixed', 
                left: 0,
                top: '64px', 
                bottom: 0, 
                backgroundColor: '#f6f2f9', 
                borderRight: '1px solid #e1bee7', 
                display: { xs: 'none', lg: 'flex' }, 
                flexDirection: 'column',
                paddingY: 2,
                zIndex: 1000
            }}
        >
            {/* ΚΥΡΙΩΣ ΜΕΝΟΥ ΠΛΟΗΓΗΣΗΣ */}
            <Box sx={{ flexGrow: 1, px: 1.5 }}>
                <Stack spacing={1}>
                    <SidebarButton 
                        icon={<MdOutlineSummarize size={25} />} 
                        text='Summary' 
                        value='summary' 
                    />
                    <SidebarButton 
                        icon={<CiDumbbell size={25} />} 
                        text='Weights' 
                        value='weights' 
                    />
                    <SidebarButton 
                        icon={<BiRun size={25} />} 
                        text='Cardio' 
                        value='cardio' 
                    />
                    <SidebarButton 
                        icon={<CgPill size={23} />} 
                        text='Supplements' 
                        value='supplements' 
                    />
                    <SidebarButton 
                        icon={<MdRestaurant size={25} />} 
                        text='Nutrition' 
                        value='nutrition' 
                    />
                </Stack>
            </Box>

            {/* ΚΑΤΩ ΜΕΡΟΣ: ΠΡΟΦΙΛ ΧΡΗΣΤΗ */}
            <Box sx={{ px: 2, pb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <Divider sx={{ width: '100%', mb: 2, borderColor: '#e1bee7' }} />
                <ProfileButton />
            </Box>
        </Box>
    );
};

export default Sidebar;
