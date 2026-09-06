import React, { useState, useEffect, memo, useContext } from 'react';
import { 
    Box, Typography, Paper, Button, Grid, Card, CardContent, 
    CircularProgress, Divider, Chip, Avatar, Fade 
} from '@mui/material';
import { 
    MdRestaurant, MdOutlineCameraAlt, MdAutoAwesome, 
    MdHistory, MdAssessment 
} from 'react-icons/md';

// Context για τα Tokens
import AuthContext from '../context/AuthContext'; 
import Body from '../layout/Body';

const Nutrition = memo(() => {
    const { authTokens } = useContext(AuthContext);

    // --- STATES ΓΙΑ ΤΟ SCANNER ---
    const [previewUrl, setPreviewUrl] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiResultText, setAiResultText] = useState(""); 
    
    // ---   STATES ΓΙΑ DATA & HISTORY (ΤΩΡΑ ΜΟΝΙΜΟ) ---
    const [meals, setMeals] = useState([]); 
    const [lastScanMacros, setLastScanMacros] = useState(null);

    // ===  ️ ΒΗΜΑ 1: ΦΟΡΤΩΣΗ ΙΣΤΟΡΙΚΟΥ ΜΕ ΤΟ ΠΟΥ ΑΝΟΙΓΕΙ Η ΣΕΛΙΔΑ ===
    useEffect(() => {
        const fetchHistory = async () => {
            if (!authTokens?.access) return;
            try {
                // ΠΡΟΣΟΧΗ: Το URL πρέπει να είναι αυτό που έβαλες στο Django urls.py
                const response = await fetch('http://127.0.0.1:8000/api/nutrition-history/', {
                    method: 'GET',
                    headers: { 
                        'Authorization': 'Bearer ' + String(authTokens.access),
                        'Content-Type': 'application/json'
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setMeals(data); // Εδώ γεμίζει η λίστα με τα αποθηκευμένα γεύματα της βάσης
                }
            } catch (error) {
                console.error("Fetch History Error:", error);
            }
        };

        fetchHistory();
    }, [authTokens]);

    // Καθαρισμός μνήμης για το Preview URL
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    // Επιλογή αρχείου
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setAiResultText(""); 
            setLastScanMacros(null);
        }
    };

    // Κλήση στο Gemini API & Αποθήκευση
    const handleAnalyzeClick = async () => {
        if (!imageFile || !authTokens?.access) return;

        setIsAnalyzing(true);
        const formData = new FormData();
        formData.append('image', imageFile);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/analyze-nutrition/', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + String(authTokens.access) },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                
                // 1. Εμφάνιση του κειμένου ανάλυσης
                setAiResultText(data.ai_analysis); 
                
                // 2. Εμφάνιση των Macros
                setLastScanMacros(data.data);

                // 3.   UPDATE HISTORY: Προσθήκη του νέου γεύματος (που ήδη σώθηκε στο Django)
                const newMeal = {
                    id: data.meal_id, // Το ID που μας έστειλε το Django
                    name: data.data.food_type !== "Άγνωστο" && data.data.food_type ? data.data.food_type : "New Meal",
                    calories: data.data.calories,
                    protein: data.data.protein,
                    carbs: data.data.carbs,
                    fats: data.data.fats,
                    date: new Date().toISOString().split('T')[0]
                };
                setMeals(prev => [newMeal, ...prev]); // Ενημέρωση λίστας χωρίς refresh

            } else {
                setAiResultText("  Σφάλμα κατά την ανάλυση. Δοκιμάστε άλλη φωτό.");
            }
        } catch (error) {
            setAiResultText("  Αποτυχία σύνδεσης με τον διακομιστή.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Helper: Μετατροπή **text** σε Bold
    const renderFormattedText = (text) => {
        return text.split('\n').map((line, i) => (
            <Typography key={i} variant="body2" sx={{ mb: 1, color: '#34495e', lineHeight: 1.6 }}>
                {line.split('**').map((part, j) => j % 2 === 1 ? <b key={j} style={{color: '#ab47bc'}}>{part}</b> : part)}
            </Typography>
        ));
    };

    return (
        <Body>
            <Box sx={{ maxWidth: '1100px', mx: 'auto', pb: 8, pt: 12 }}>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 5, gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#ab47bc', width: 56, height: 56, boxShadow: '0 4px 12px rgba(171, 71, 188, 0.4)' }}>
                        <MdRestaurant size={30} />
                    </Avatar>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: '#2c3e50' }}>Nutrition AI</Typography>
                        <Typography variant="body2" color="textSecondary">Analyze meals and track macros permanently</Typography>
                    </Box>
                </Box>

                <Grid container spacing={4}>
                    {/* ΑΡΙΣΤΕΡΑ: SCANNER */}
                    <Grid item xs={12} md={5}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: '28px', border: '2px dashed #ab47bc', bgcolor: '#fdfbff', textAlign: 'center' }}>
                            {!previewUrl ? (
                                <Box sx={{ py: 4 }}>
                                    <MdOutlineCameraAlt size={64} color="#ab47bc" style={{ opacity: 0.2, marginBottom: '20px' }} />
                                    <input accept="image/*" id="icon-button-file" type="file" style={{ display: 'none' }} onChange={handleImageChange} />
                                    <label htmlFor="icon-button-file">
                                        <Button variant="contained" component="span" sx={{ borderRadius: '12px', bgcolor: '#ab47bc', px: 4, py: 1.5, textTransform: 'none', fontWeight: 'bold' }}>
                                            Upload Meal Photo
                                        </Button>
                                    </label>
                                </Box>
                            ) : (
                                <Box>
                                    <img src={previewUrl} alt="Meal" style={{ width: '100%', borderRadius: '20px', marginBottom: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                        <Button onClick={() => setPreviewUrl(null)} variant="outlined" sx={{ borderRadius: '10px', textTransform: 'none' }}>Change</Button>
                                        <Button onClick={handleAnalyzeClick} disabled={isAnalyzing} variant="contained" sx={{ borderRadius: '10px', bgcolor: '#ab47bc', textTransform: 'none' }}>
                                            {isAnalyzing ? <CircularProgress size={24} color="inherit" /> : "Run AI Scan"}
                                        </Button>
                                    </Box>
                                </Box>
                            )}
                        </Paper>
                    </Grid>

                    {/* ΔΕΞΙΑ: RESULTS */}
                    <Grid item xs={12} md={7}>
                        <Card elevation={0} sx={{ borderRadius: '28px', border: '1px solid #f0f0f0', minHeight: '400px' }}>
                            <CardContent sx={{ p: 4 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <MdAutoAwesome color="#ab47bc" /> AI Analysis Breakdown
                                </Typography>

                                {lastScanMacros && (
                                    <Fade in={true}>
                                        <Box sx={{ mb: 4, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                                            {lastScanMacros.food_type && lastScanMacros.food_type !== "Άγνωστο" && (
                                                <Chip label={`🍽️ ${lastScanMacros.food_type}`} sx={{ fontWeight: 'bold', bgcolor: '#e0e0e0', color: '#333' }} />
                                            )}
                                            {lastScanMacros.weight > 0 && (
                                                <Chip label={`⚖️ ${lastScanMacros.weight}g`} sx={{ fontWeight: 'bold', bgcolor: '#e0e0e0', color: '#333' }} />
                                            )}
                                            <Chip icon={<MdAssessment color="white" />} label={`${lastScanMacros.calories} kcal`} sx={{ bgcolor: '#ab47bc', color: 'white', fontWeight: 'bold', p: 1 }} />
                                            <Chip label={`Protein: ${lastScanMacros.protein}g`} variant="outlined" sx={{ fontWeight: 'bold', color: '#1976d2' }} />
                                            <Chip label={`Carbs: ${lastScanMacros.carbs}g`} variant="outlined" sx={{ fontWeight: 'bold', color: '#2e7d32' }} />
                                            <Chip label={`Fats: ${lastScanMacros.fats}g`} variant="outlined" sx={{ fontWeight: 'bold', color: '#ed6c02' }} />
                                        </Box>
                                    </Fade>
                                )}

                                <Divider sx={{ mb: 3 }} />

                                <Box sx={{ maxHeight: '400px', overflowY: 'auto', pr: 1 }}>
                                    {isAnalyzing ? (
                                        <Box sx={{ textAlign: 'center', mt: 10 }}>
                                            <CircularProgress size={50} sx={{ color: '#ab47bc' }} />
                                            <Typography sx={{ mt: 2 }} color="textSecondary">Gemini is analyzing your nutrients...</Typography>
                                        </Box>
                                    ) : aiResultText ? (
                                        renderFormattedText(aiResultText)
                                    ) : (
                                        <Typography color="textSecondary" sx={{ fontStyle: 'italic', textAlign: 'center', mt: 10 }}>
                                            Upload a photo to see the magic of AI Nutrition.
                                        </Typography>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* ΚΑΤΩ: ΤΟ ΜΟΝΙΜΟ ΙΣΤΟΡΙΚΟ */}
                    <Grid item xs={12}>
                        <Box sx={{ mt: 6, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <MdHistory size={32} color="#555" />
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>Your Saved Meal History</Typography>
                        </Box>
                        
                        <Grid container spacing={2}>
                            {meals.length > 0 ? meals.map((meal, index) => (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                    <Paper sx={{ p: 3, borderRadius: '20px', transition: '0.3s', '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 12px 24px rgba(0,0,0,0.05)' } }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{meal.name}</Typography>
                                            <Chip label={meal.date} size="small" variant="outlined" />
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Typography variant="h6" color="secondary" sx={{ fontWeight: '900' }}>{meal.calories} kcal</Typography>
                                        </Box>
                                        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="caption">P: {meal.protein}g</Typography>
                                            <Typography variant="caption">C: {meal.carbs}g</Typography>
                                            <Typography variant="caption">F: {meal.fats}g</Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                            )) : (
                                <Typography sx={{ ml: 2 }} color="textSecondary">No saved meals yet. Start scanning!</Typography>
                            )}
                        </Grid>
                    </Grid>
                </Grid>
            </Box>
        </Body>
    );
});

export default Nutrition;
