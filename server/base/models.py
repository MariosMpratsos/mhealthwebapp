from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import post_save # <-- ΑΠΑΡΑΙΤΗΤΟ ΓΙΑ IR
from django.dispatch import receiver          # <-- ΑΠΑΡΑΙΤΗΤΟ ΓΙΑ IR

class User(AbstractUser):
    groups = None
    user_permissions = None
    username = models.CharField(max_length=40, default='')
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

class Weight(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    name = models.CharField(max_length=200)
    reps = models.IntegerField()
    sets = models.IntegerField()

    class Meta:
        ordering = ['-date', '-name']

class Cardio(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    name = models.CharField(max_length=200)
    duration = models.DurationField()

    class Meta:
        ordering = ['-date', 'name']

class Supplement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    name = models.CharField(max_length=200)
    dossage = models.IntegerField()

    class Meta:
        ordering = ['-date', 'name']

class StepCount(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    steps = models.IntegerField()
    date = models.DateField()

    def __str__(self):
        return f"{self.user.email} - {self.steps} steps"

#  ️ ΤΟ ΜΟΝΤΕΛΟ ΓΙΑ ΤΟΝ AI NUTRITION SCANNER  
class Nutrition(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField(auto_now_add=True)
    name = models.CharField(max_length=255)
    calories = models.IntegerField(default=0)
    protein = models.FloatField(default=0.0)
    carbs = models.FloatField(default=0.0)
    fats = models.FloatField(default=0.0)
    ai_analysis = models.TextField(blank=True, null=True) # Εδώ σώζουμε το κείμενο του Gemini

    class Meta:
        ordering = ['-date']

# ==========================================
#   --- WHOOSH IR SIGNALS --- 🔍
# ==========================================

@receiver(post_save, sender=Nutrition)
def index_nutrition_on_save(sender, instance, **kwargs):
    """Κάθε φορά που σώζεται ένα γεύμα, ενημερώνεται ο Search Index"""
    try:
        from .search_engine import update_index
        content = f"Calories: {instance.calories} Protein: {instance.protein} Carbs: {instance.carbs} Fats: {instance.fats}"
        update_index(instance.id, 'meal', instance.name, content)
    except Exception as e:
        print(f"Whoosh Index Error: {e}")

@receiver(post_save, sender=Weight)
def index_weight_on_save(sender, instance, **kwargs):
    """Κάθε φορά που σώζεται μια άσκηση, γίνεται αναζητήσιμη"""
    try:
        from .search_engine import update_index
        content = f"Exercise with {instance.sets} sets and {instance.reps} reps"
        update_index(instance.id, 'exercise', instance.name, content)
    except Exception as e:
        print(f"Whoosh Index Error: {e}")
        
        
class Article(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    category = models.CharField(max_length=100, default="Fitness Tips")
    author = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.title

# Signal για να γίνεται αυτόματα Index κάθε νέο άρθρο
@receiver(post_save, sender=Article)
def index_article_on_save(sender, instance, **kwargs):
    try:
        from .search_engine import update_index
        update_index(instance.id, 'article', instance.title, instance.content)
    except Exception as e:
        print(f"Whoosh Article Index Error: {e}")
