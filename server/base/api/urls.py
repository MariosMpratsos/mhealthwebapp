from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

# Κάνουμε import τις Views (Class-based και Functions)
from .views import (
    MyTokenObtainPairView, 
    GoogleLoginView, 
    GoogleStepsWeeklyView, 
    analyze_nutrition,
    predict_daily_plan   # Η συνάρτηση για το AI suggestion
)

urlpatterns = [
    # --- 1. ΒΑΣΙΚΕΣ ΔΙΑΔΡΟΜΕΣ ---
    path('', views.getRoutes, name="routes"),
    
    # --- 2. AUTHENTICATION & TOKENS ---
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('google-login/', GoogleLoginView.as_view(), name='google_login'),
    
    # --- 3. ΠΡΟΦΙΛ & GOOGLE FIT ---
    path('profile/', views.profilePage, name="profile"),
    path('google-steps-weekly/', GoogleStepsWeeklyView.as_view(), name='google_steps_weekly'),
    
    # --- 4. LOGGING (DATA ENTRY) ---
    path('weight/', views.weight, name="weight"),
    path('weight/<int:pk>/', views.modifyWeight, name="modify_weight"),
    
    path('cardio/', views.cardio, name="cardio"),
    path('cardio/<int:pk>/', views.modifyCardio, name="modify_cardio"),
    
    path('supplement/', views.supplement, name="supplement"),
    path('supplement/<int:pk>/', views.modifySupplement, name="modify_supplement"),
    
    # --- 5. NUTRITION & AI SCANNER ---
    # Η διαδρομή για το ανέβασμα της εικόνας (Gemini)
    path('analyze-nutrition/', analyze_nutrition, name='analyze_nutrition'), 
    
    # Το ιστορικό της διατροφής (Nutrition)
    path('nutrition-history/', views.get_nutrition_history, name='nutrition-history'),
    
    # Η διαδρομή για την πρόβλεψη του AI Διαιτολόγου
    path('predict-daily-plan/', predict_daily_plan, name='predict_daily_plan'),
    
    # --- 6. INFORMATION RETRIEVAL (SEARCH ENGINE) ---
    path('search/', views.search_view, name='search'),
    path('article/<int:pk>/', views.get_article, name='get_article'),
]
