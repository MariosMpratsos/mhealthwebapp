import React from 'react'
import { IoFootstepsOutline } from 'react-icons/io5'
import { CiDumbbell } from 'react-icons/ci'
import { BiRun } from 'react-icons/bi'
import { CgPill } from 'react-icons/cg'
import { Box, Typography } from '@mui/material'

import styles from './styles/Summary.module.css'

const SummaryLog = ({ workoutLog, type }) => {

    // 1. Βάρη (Weight)
    if (type === 'weight') {
        return (
            <Box className={styles['workout-log']}>
                <CiDumbbell size={25} className={styles.icon} />
                <Box className={styles['content-container-log']}>
                    <Typography><span>Date: </span>{workoutLog.date}</Typography>
                    <Typography><span>Workout: </span>{workoutLog.name}</Typography>
                    <Typography className={styles.numbers}>Reps: {workoutLog.reps} | Sets: {workoutLog.sets}</Typography>
                </Box>
            </Box>
        )
    }

    // 2. Αερόβιο (Cardio)
    if (type === 'cardio') {
        return (
            <Box className={styles['workout-log']}>
                <BiRun size={25} className={styles.icon} />
                <Box className={`${styles['content-container-log']} ${styles.secondary}`}>
                    <Typography><span>Date: </span>{workoutLog.date}</Typography>
                    <Typography><span>Workout: </span>{workoutLog.name}</Typography>
                    <Typography><span>Duration: </span>{workoutLog.duration}</Typography>
                </Box>
            </Box>
        )
    }

    // 3. Συμπληρώματα (Supplement)
    if (type === 'supplement') {
        return (
            <Box className={styles['workout-log']}>
                <CgPill size={25} className={styles.icon} />
                <Box className={`${styles['content-container-log']} ${styles.secondary}`}>
                    <Typography><span>Date: </span>{workoutLog.date}</Typography>
                    <Typography><span>Supplement: </span>{workoutLog.name}</Typography>
                    <Typography><span>Dosage: </span>{workoutLog.dossage}</Typography>
                </Box>
            </Box>
        )
    }

    // 4. Βήματα (Steps)
    if (type === 'steps') {
        return (
            <Box className={styles['workout-log']}>
                <IoFootstepsOutline size={25} className={styles.icon} color="#00ff88" />
                <Box className={`${styles['content-container-log']} ${styles.secondary}`}>
                    <Typography><span>Day: </span>{workoutLog.day}</Typography>
                    <Typography><span>Steps: </span>{workoutLog.steps?.toLocaleString()}</Typography>
                </Box>
            </Box>
        )
    }

    return null
}

export default SummaryLog
