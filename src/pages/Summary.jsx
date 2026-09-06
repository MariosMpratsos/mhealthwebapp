import React, { useEffect, useContext, useState } from 'react';
import { 
    Box, Typography, Grid, Paper, CircularProgress, Fade, Stack 
} from '@mui/material';
import { 
    BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, 
    CartesianGrid, Cell 
} from 'recharts';
import { IoFootsteps } from 'react-icons/io5';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import MedicationIcon from '@mui/icons-material/Medication';
import RestaurantIcon from '@mui/icons-material/Restaurant'; 
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'; 
import AuthContext from '../context/AuthContext';

const ActivityLogCard = ({ title, detail, time, color, icon: Icon }) => (
    <Paper elevation={0} sx={{ 
        p: 2, mb: 2, borderRadius: '16px', border: '1px solid #f0f0f0',
        borderLeft: `6px solid ${color}`, backgroundColor: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        transition: '0.3s', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.05)', transform: 'translateY(-2px)' }
    }}>
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
            <Box sx={{ 
                backgroundColor: `${color}15`, p: 1, borderRadius: '12px', mr: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <Icon sx={{ color: color, fontSize: '20px' }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#2c3e50', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {title}
                </Typography>
                <Typography variant="caption" sx={{ color: '#7f8c8d', display: 'block' }}>
                    {detail}
                </Typography>
            </Box>
        </Box>
        <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#bdc3c7', ml: 1, whiteSpace: 'nowrap' }}>
            {time}
        </Typography>
    </Paper>
);

const AiAdviceCard = ({ title, advice, color, icon: Icon }) => (
    <Paper elevation={0} sx={{ 
        p: 2, borderRadius: '16px', border: '1px solid #eee', 
        display: 'flex', alignItems: 'center', gap: 2, height: '100%' 
    }}>
        <Icon sx={{ color: color, fontSize: '30px' }} />
        <Box>
            <Typography variant="caption" sx={{ color: '#aaa', fontWeight: 'bold', textTransform: 'uppercase' }}>
                {title}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: '700', color: '#2c3e50' }}>
                {advice}
            </Typography>
        </Box>
    </Paper>
);

const Summary = () => {
    const { authTokens } = useContext(AuthContext);
    const [data, setData] = useState({ weights: [], cardio: [], supps: [], steps: [] });
    const [loading, setLoading] = useState(true);
    const [hasGoogleToken, setHasGoogleToken] = useState(false);
    
    const [aiCoach, setAiCoach] = useState({ meal: "Calculating...", supplement: "Calculating..." });
    const DAILY_STEP_GOAL = 10000;

    // Βοηθητική συνάρτηση για να ελέγχουμε αν ένα log είναι σημερινό
    const isToday = (dateString) => {
        const today = new Date().toISOString().split('T')[0];
        const logDate = new Date(dateString).toISOString().split('T')[0];
        return today === logDate;
    };

    useEffect(() => {
        const fetchSummaryData = async () => {
            const h = { 
                'Authorization': `Bearer ${authTokens?.access}`, 
                'Content-Type': 'application/json' 
            };
            
            try {
                const [resW, resC, resS] = await Promise.all([
                    fetch('http://127.0.0.1:8000/api/weight/', { headers: h }),
                    fetch('http://127.0.0.1:8000/api/cardio/', { headers: h }),
                    fetch('http://127.0.0.1:8000/api/supplement/', { headers: h })
                ]);
                const weights = await resW.json();
                const cardio = await resC.json();
                const supps = await resS.json();
                const gToken = localStorage.getItem('google_access_token');
                setHasGoogleToken(!!gToken);
                
                let stepsData = [];
                let currentSteps = 0;
                
                if (gToken) {
                    const resSteps = await fetch('http://127.0.0.1:8000/api/google-steps-weekly/', {
                        method: 'POST', 
                        headers: h, 
                        body: JSON.stringify({ "google_access_token": gToken })
                    });
                    
                    if (resSteps.ok) {
                        stepsData = await resSteps.json();
                        if (stepsData.length > 0) {
                            currentSteps = stepsData[stepsData.length - 1].steps;
                        }
                    }
                }
                setData({ weights, cardio, supps, steps: stepsData });
                
                try {
                    const aiRes = await fetch('http://127.0.0.1:8000/api/predict-daily-plan/', {
                        method: 'POST',
                        headers: h,
                        body: JSON.stringify({ steps: currentSteps })
                    });
                    
                    if (aiRes.ok) {
                        const aiData = await aiRes.json();
                        if (aiData.status === "success") {
                            setAiCoach({ 
                                meal: aiData.recommended_meal, 
                                supplement: aiData.smart_supplement 
                            });
                        }
                    }
                } catch (aiErr) {
                    console.error("AI Prediction Error:", aiErr);
                    setAiCoach({ meal: "Offline", supplement: "Offline" });
                }
            } catch (err) { 
                console.error("Dashboard fetch error:", err); 
            } finally { 
                setLoading(false); 
            }
        };
        if (authTokens) {
            fetchSummaryData();
        }
    }, [authTokens]);

    const todaySteps = data.steps.length > 0 ? data.steps[data.steps.length - 1].steps : 0;
    const progressPercent = Math.min((todaySteps / DAILY_STEP_GOAL) * 100, 100);

    // Φιλτράρισμα των supplements για να δείχνει μόνο τα σημερινά
    const todaySupps = data.supps.filter(s => isToday(s.created_at || s.date || new Date()));

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress size={60} sx={{ color: '#ab47bc' }} />
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', p: 3, boxSizing: 'border-box' }}>
            <Box sx={{ width: '100%', maxWidth: '1400px', mx: 'auto' }}>
                
                <Typography variant="h4" sx={{ mb: 4, fontWeight: '900', color: '#2c3e50' }}>
                    Activity Dashboard
                </Typography>

                <Fade in={true} timeout={1000}>
                    <Paper sx={{ p: 3, mb: 4, borderRadius: '24px', background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)', border: '1px solid #e0e0e0' }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                            <AutoAwesomeIcon sx={{ color: '#ab47bc' }} />
                            <Typography variant="h6" sx={{ fontWeight: '800' }}>AI Daily Strategy</Typography>
                        </Stack>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <AiAdviceCard title="Recommended Meal" advice={aiCoach.meal} color="#ff9100" icon={RestaurantIcon} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <AiAdviceCard title="Smart Supplement" advice={aiCoach.supplement} color="#ab47bc" icon={MedicationIcon} />
                            </Grid>
                        </Grid>
                    </Paper>
                </Fade>
                
                <Grid container spacing={4}>
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper sx={{ p: 4, borderRadius: '28px', height: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#fff' }}>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#7f8c8d' }}>Today's Goal</Typography>
                            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
                                <CircularProgress variant="determinate" value={progressPercent} size={200} thickness={4} sx={{ color: progressPercent >= 100 ? '#00e676' : '#ab47bc' }} />
                                <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                    <IoFootsteps size={45} color="#ab47bc" />
                                    <Typography variant="h3" sx={{ fontWeight: 'bold', mt: 1 }}>{todaySteps.toLocaleString()}</Typography>
                                    <Typography variant="caption" color="textSecondary">/ {DAILY_STEP_GOAL.toLocaleString()} steps</Typography>
                                </Box>
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: progressPercent >= 100 ? '#00c853' : '#777' }}>
                                {progressPercent >= 100 ? "Goal Smashed! 🚀" : `${(DAILY_STEP_GOAL - todaySteps).toLocaleString()} more to go`}
                            </Typography>
                        </Paper>
                    </Grid>

                    {/* SUPPLEMENTS LOG - Φιλτραρισμένο για σήμερα */}
                    <Grid item xs={12} sm={6} md={4}>
                        <Paper sx={{ p: 4, borderRadius: '28px', height: '420px', bgcolor: '#fff', display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#7f8c8d' }}>Today's Supplements 💊</Typography>
                                <Typography variant="body2" sx={{ color: '#aaa' }}>Daily intake check</Typography>
                            </Box>
                            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                                {todaySupps && todaySupps.length > 0 ? (
                                    todaySupps.map(log => (
                                        <ActivityLogCard key={log.id} title={log.name} detail={log.dosage || log.dossage} time="✓ Done" color="#ab47bc" icon={MedicationIcon} />
                                    ))
                                ) : (
                                    <Typography variant="body2" sx={{ color: '#aaa', textAlign: 'center', mt: 10 }}>No supplements logged today.</Typography>
                                )}
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 4, borderRadius: '28px', height: '420px', bgcolor: '#fff', display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#7f8c8d' }}>Weekly Progress</Typography>
                            {hasGoogleToken && data.steps.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.steps}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                                        <Tooltip cursor={{ fill: '#f5f5f5' }} />
                                        <Bar dataKey="steps" radius={[10, 10, 0, 0]} barSize={35}>
                                            {data.steps.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.steps >= DAILY_STEP_GOAL ? '#00e676' : '#ab47bc'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <Typography color="textSecondary" sx={{ textAlign: 'center', mt: 10 }}>Syncing Fitness Data...</Typography>
                            )}
                        </Paper>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h5" sx={{ mt: 6, mb: 4, fontWeight: 'bold', color: '#2c3e50' }}>Recent Activity</Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={4}>
                                <Typography variant="overline" sx={{ fontWeight: '900', color: '#ab47bc', letterSpacing: 1.2 }}>Latest Weights</Typography>
                                <Box sx={{ mt: 2 }}>
                                    {data.weights.length > 0 ? data.weights.slice(-3).reverse().map(w => (
                                        <ActivityLogCard key={w.id} title={w.workout_name || "Weight Session"} detail={`${w.weight}kg • ${w.reps} reps`} time="Logged" color="#ab47bc" icon={FitnessCenterIcon} />
                                    )) : <Typography variant="body2" color="#aaa">No logs found.</Typography>}
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="overline" sx={{ fontWeight: '900', color: '#ff1744', letterSpacing: 1.2 }}>Latest Cardio</Typography>
                                <Box sx={{ mt: 2 }}>
                                    {data.cardio.length > 0 ? data.cardio.slice(-3).reverse().map(c => (
                                        <ActivityLogCard key={c.id} title={c.activity_type || "Cardio"} detail={`${c.duration} mins • ${c.distance}km`} time="Logged" color="#ff1744" icon={DirectionsRunIcon} />
                                    )) : <Typography variant="body2" color="#aaa">No logs found.</Typography>}
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="overline" sx={{ fontWeight: '900', color: '#ff9100', letterSpacing: 1.2 }}>Recent Supplements History</Typography>
                                <Box sx={{ mt: 2 }}>
                                    {data.supps.length > 0 ? data.supps.slice(-3).reverse().map(log => (
                                        <ActivityLogCard key={log.id} title={log.name} detail={log.dosage || log.dossage} time="Logged" color="#ff9100" icon={MedicationIcon} />
                                    )) : <Typography variant="body2" color="#aaa">No logs found.</Typography>}
                                </Box>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default Summary;
