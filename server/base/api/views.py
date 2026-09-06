import os
import io
import re
import datetime
from pathlib import Path

import requests
import numpy as np
from PIL import Image
from dotenv import load_dotenv

from django.conf import settings
from django.shortcuts import render
from django.contrib import messages
from django.views.decorators.csrf import csrf_exempt

from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.decorators import (
    api_view,
    permission_classes,
    authentication_classes,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from sklearn.tree import DecisionTreeClassifier, export_text

# Google Gemini
from google import genai
from google.genai import types

# Project imports
from base.models import (
    Article,
    Nutrition,
    User,
    Weight,
    Cardio,
    Supplement,
)

from base.search_engine import perform_search

from .serializers import (
    UserSerializer,
    WeightSerializer,
    CardioSerializer,
    SupplementSerializer,
)

from base.forms import (
    UserCreateForm,
    UserUpdateForm,
    WeightForm,
    CardioForm,
    SupplementForm,
)

# --- ΔΙΑΧΕΙΡΙΣΗ ENV & API KEY ---
BASE_DIR = Path(__file__).resolve().parents[3]
ENV_PATH = BASE_DIR / ".env"

print("DEBUG - ENV PATH:", ENV_PATH)
print("DEBUG - ENV EXISTS:", ENV_PATH.exists())

load_dotenv(dotenv_path=ENV_PATH, override=True)
MY_API_KEY = os.getenv("GOOGLE_API_KEY")

print("DEBUG - READ KEY:", bool(MY_API_KEY))

if not MY_API_KEY:
    raise ValueError(f"Το GOOGLE_API_KEY δεν βρέθηκε στο .env: {ENV_PATH}")

os.environ.pop("GOOGLE_APPLICATION_CREDENTIALS", None)
client = genai.Client(api_key=MY_API_KEY)


# --- JWT CUSTOMIZATION ---
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        return token

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

# --- GOOGLE AUTHENTICATION ---
class GoogleLoginView(APIView):
    def post(self, request):
        access_token = request.data.get('access_token')
        google_response = requests.get(
            'https://www.googleapis.com/oauth2/v3/userinfo',
            params={'access_token': access_token}
        )

        if google_response.status_code != 200:
            return Response({'error': 'Invalid Google Token'}, status=status.HTTP_400_BAD_REQUEST)

        user_data = google_response.json()
        email = user_data['email']

        user = User.objects.filter(email=email).first()

        if not user:
            user = User.objects.create(
                username=email, 
                email=email,
                first_name=user_data.get('given_name', ''),
                last_name=user_data.get('family_name', '')
            )

        refresh = RefreshToken.for_user(user)
        refresh['email'] = user.email 

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })

# --- GOOGLE FIT STEPS VIEW ---
class GoogleStepsWeeklyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        google_access_token = request.data.get('google_access_token')
        
        if not google_access_token:
            return Response({'error': 'Google Access Token is required'}, status=status.HTTP_400_BAD_REQUEST)

        now = datetime.datetime.now()
        start = (now - datetime.timedelta(days=6)).replace(hour=0, minute=0, second=0, microsecond=0)
        
        start_time_ms = int(start.timestamp() * 1000)
        end_time_ms = int(now.timestamp() * 1000)

        url = "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate"
        headers = {
            "Authorization": f"Bearer {google_access_token}",
            "Content-Type": "application/json",
        }
        
        payload = {
            "aggregateBy": [{"dataTypeName": "com.google.step_count.delta"}],
            "bucketByTime": { "durationMillis": 86400000 },
            "startTimeMillis": start_time_ms,
            "endTimeMillis": end_time_ms
        }

        try:
            response = requests.post(url, json=payload, headers=headers)
            if response.status_code != 200:
                return Response({'error': 'Google API Error', 'details': response.json()}, status=response.status_code)
            
            data = response.json()
            output = []
            
            if 'bucket' in data:
                for b in data['bucket']:
                    ts = int(b['startTimeMillis']) / 1000
                    day = datetime.datetime.fromtimestamp(ts).strftime('%a')
                    try:
                        steps = b['dataset'][0]['point'][0]['value'][0]['intVal']
                    except (KeyError, IndexError):
                        steps = 0 
                    output.append({"day": day, "steps": steps})

            return Response(output, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# --- GENERAL ROUTES ---
@api_view(['GET'])
def getRoutes(request):
    routes = [
        '/api/token',
        '/api/token/refresh',
        '/api/google-login/',
        '/api/google-steps-weekly/', 
        '/api/weight',
        '/api/cardio',
        '/api/supplement',
        '/api/analyze-nutrition/',
    ]
    return Response(routes)

# --- USER PROFILE ---
@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def profilePage(request):
    user = request.user
    if request.method == 'POST':
        form = UserUpdateForm(data=request.data, instance=user)
        if form.is_valid():
            formo = form.save(commit=False)
            formo.email = formo.email.lower()
            formo.save()
            return Response(UserSerializer(formo).data)
    serializer = UserSerializer(user)
    return Response(serializer.data)

# --- WEIGHT VIEWS ---
@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def weight(request):
    user = request.user
    if request.method == "POST":
        form = WeightForm(request.data)
        if form.is_valid():
            weighto = form.save(commit=False)
            weighto.user = user
            weighto.save()
            return Response(WeightSerializer(weighto).data)
    
    weights = user.weight_set.all().order_by('date')
    serializer = WeightSerializer(weights, many=True)
    return Response(serializer.data)

@api_view(['PUT','DELETE'])
@permission_classes([IsAuthenticated])
def modifyWeight(request, pk):
    try:
        weight_item = request.user.weight_set.get(id=pk)
    except Weight.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        weight_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    serializer = WeightSerializer(instance=weight_item, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- CARDIO VIEWS ---
@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def cardio(request):
    user = request.user
    if request.method == "POST":
        form = CardioForm(request.data)
        if form.is_valid():
            cardioo = form.save(commit=False)
            cardioo.user = user
            cardioo.save()
            return Response(CardioSerializer(cardioo).data)
    
    cardios = user.cardio_set.all().order_by('date')
    serializer = CardioSerializer(cardios, many=True)
    return Response(serializer.data)

@api_view(['PUT','DELETE'])
@permission_classes([IsAuthenticated])
def modifyCardio(request, pk):
    try:
        cardio_item = request.user.cardio_set.get(id=pk)
    except Cardio.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        cardio_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    serializer = CardioSerializer(instance=cardio_item, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- SUPPLEMENT VIEWS ---
@api_view(['GET','POST'])
@permission_classes([IsAuthenticated])
def supplement(request):
    user = request.user
    if request.method == "POST":
        form = SupplementForm(request.data)
        if form.is_valid():
            supplemento = form.save(commit=False)
            supplemento.user = user
            supplemento.save()
            return Response(SupplementSerializer(supplemento).data)
    
    supplements = user.supplement_set.all().order_by('date')
    serializer = SupplementSerializer(supplements, many=True)
    return Response(serializer.data)

@api_view(['PUT','DELETE'])
@permission_classes([IsAuthenticated])
def modifySupplement(request, pk):
    try:
        supp_item = request.user.supplement_set.get(id=pk)
    except Supplement.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        supp_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    serializer = SupplementSerializer(instance=supp_item, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@csrf_exempt
@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def analyze_nutrition(request):
    print("\n--- ΝΕΟ REQUEST ΓΙΑ ΑΝΑΛΥΣΗ ΕΙΚΟΝΑΣ ---")
    
    try:
        image_file = request.FILES.get('image')
        if not image_file:
            return Response({"error": "No image uploaded"}, status=400)

        image_file.seek(0)
        img = Image.open(io.BytesIO(image_file.read()))
        img.load()

        model_name = 'gemini-3.6-flash'

        prompt = """
Act as a professional nutritionist. Analyze EVERY food item visible in this image.
1. Identify the main protein, all side dishes (like potatoes, rice, bread), and vegetables.
2. Estimate the portion size for each component separately.
3. Calculate the TOTAL nutritional values by summing up every single item on the plate.
4. If you see a potato, bread, or starchy vegetable, ensure the 'Carbs' field is NOT zero.

Respond STRICTLY in the following format. Do not use markdown.

Description: [Write a friendly, detailed description of the whole plate here]
Food Type: [Name of the entire meal, e.g., Ribeye Steak with Baked Potato and Veggies]
Portion Weight: [Total sum of weight] g
Calories: [Total sum] kcal
Protein: [Total sum] g
Carbs: [Total sum] g
Fats: [Total sum] g
"""

        response = client.models.generate_content(
            model=model_name,
            contents=[prompt, img]
        )
        
        full_text = response.text
        print(f"Η ΑΠΑΝΤΗΣΗ ΤΟΥ AI:\n{full_text}")

        def get_number(pattern, text):
            match = re.search(pattern, text, re.IGNORECASE)
            return int(match.group(1)) if match else 0
            
        def get_text_field(pattern, text):
            match = re.search(pattern, text, re.IGNORECASE)
            return match.group(1).strip() if match else "Άγνωστο"

        food_type = get_text_field(r'Food Type:\s*(.*?)(?:\n|$)', full_text)
        weight = get_number(r'Portion Weight.*?(\d+)', full_text)
        
        calories = get_number(r'Calories.*?(\d+)', full_text)
        protein = get_number(r'Protein.*?(\d+)', full_text)
        carbs = get_number(r'Carbs.*?(\d+)', full_text)
        fats = get_number(r'Fats.*?(\d+)', full_text)

        desc_match = re.search(r'Description:(.*?)(Food Type|Calories|$)', full_text, re.IGNORECASE | re.DOTALL)
        ai_text = desc_match.group(1).strip() if desc_match else full_text

        macros = {
            "food_type": food_type,
            "weight": weight,
            "calories": calories,
            "protein": protein,
            "carbs": carbs,
            "fats": fats
        }

        new_entry = Nutrition.objects.create(
            user=request.user,
            name=food_type if food_type != "Άγνωστο" else "Meal Scan",
            calories=calories,
            protein=float(protein),
            carbs=float(carbs),
            fats=float(fats),
            ai_analysis=ai_text
        )

        return Response({
            "status": "success",
            "ai_analysis": ai_text,
            "data": macros,
            "meal_id": new_entry.id
        })

    except Exception as e:
        print(f"ΚΡΙΣΙΜΟ ΣΦΑΛΜΑ: {str(e)}")
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_view(request):
    query = request.GET.get('q', '')
    if len(query) < 2:
        return Response([])
    
    results = perform_search(query)
    return Response(results)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_article(request, pk):
    try:
        article = Article.objects.get(pk=pk)
        return Response({
            "title": article.title,
            "content": article.content,
            "category": article.category
        })
    except Article.DoesNotExist:
        return Response({"error": "Article not found"}, status=404)
        
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def predict_daily_plan(request):
    try:
        steps = int(request.data.get('steps', 0))

        menu = {
            0: ["Salad with Tuna", "Multivitamin"],
            1: ["Chicken & Rice Bowl", "Omega-3"],
            2: ["Beef Pasta", "Magnesium"],
            3: ["Large Steak & Potatoes", "BCAA"],
            4: ["Double Chicken & Pasta", "ZMA & Magnesium"]
        }

        X_train = np.array([[0], [4000], [9000], [14000], [20000]])
        y_train = np.array([0, 1, 2, 3, 4])

        clf = DecisionTreeClassifier().fit(X_train, y_train)
        prediction_id = int(clf.predict([[steps]])[0])
        res = menu[prediction_id]

        rules = export_text(clf, feature_names=['steps'])
        print("\n--- AI DECISION TREE RULES (PRO VERSION) ---")
        print(rules)

        return Response({
            "status": "success",
            "recommended_meal": res[0],
            "smart_supplement": res[1],
            "debug_class": prediction_id 
        })
    except Exception as e:
        print(f"Error: {str(e)}")
        return Response({"status": "error", "message": str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_nutrition_history(request):
    history = Nutrition.objects.filter(user=request.user).order_by('-date')
    
    data = []
    for item in history:
        data.append({
            "id": item.id,
            "name": item.name,
            "calories": item.calories,
            "protein": item.protein,
            "carbs": item.carbs,
            "fats": item.fats,
            "ai_analysis": item.ai_analysis,
            "date": str(item.date)
        })
    return Response(data)
