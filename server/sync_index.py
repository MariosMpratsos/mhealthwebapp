import os
import django


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fitnessServer.settings')
django.setup()

#αλλάζουμε το api σε base
from base.models import Nutrition, Weight
from base.search_engine import update_index

def sync_all():
    print(" Ξεκινάει ο συγχρονισμός Whoosh Index...")
    
    # 1. Indexing για τα Γεύματα
    meals = Nutrition.objects.all()
    print(f" Βρέθηκαν {meals.count()} γεύματα.")
    for item in meals:
        content = f"Calories: {item.calories} Protein: {item.protein} Carbs: {item.carbs} Fats: {item.fats}"
        update_index(item.id, 'meal', item.name, content)
        print(f" Indexed Meal: {item.name}")

    # 2. Indexing για τις Ασκήσεις (Weight)
    workouts = Weight.objects.all()
    print(f" Βρέθηκαν {workouts.count()} ασκήσεις.")
    for item in workouts:
        content = f"Workout with {item.sets} sets and {item.reps} reps"
        update_index(item.id, 'exercise', item.name, content)
        print(f" Indexed Exercise: {item.name}")
        
    print(f"\n  ΤΕΛΟΣ! Ο κατάλογος Whoosh ενημερώθηκε.")

if __name__ == "__main__":
    sync_all()
