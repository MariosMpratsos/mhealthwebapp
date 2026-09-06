# mHealth Web Application

An AI-driven health and physical activity tracking platform. This application integrates machine learning, large language models, and search engine capabilities to support user autonomy in mobile health.

## Core Features

* **Google Authentication:** Secure user login using Google OAuth 2.0 and the Google Auth Client.
* **Information Retrieval:** Built-in search and retrieval engine (utilizing Whoosh) for querying health data, logs, and system records.
* **AI Image Scanning:** Integration with LLMs (such as the Google Gemini API) to scan, analyze, and process health-related images or dietary labels.
* **Benchmarking Functions:** Includes `bench` and other diagnostic utilities to test system performance, API response times, and model accuracy.
* **Activity Tracking:** Synchronizes with fitness data streams to provide a decoupled physical activity support system.

## Prerequisites

* Python 3.8+
* A Google Cloud Console account

## Local Development Setup

### 1. Clone the Repository

```bash
git clone [https://github.com/MariosMpratsos/mhealthwebapp.git](https://github.com/MariosMpratsos/mhealthwebapp.git)
cd mhealthwebapp

2. Create and Activate a Virtual Environment

It is highly recommended to run this project inside a virtual environment (venv) to isolate its dependencies.

For Linux/macOS:
Bash

python3 -m venv venv
source venv/bin/activate

For Windows:
Bash

python -m venv venv
venv\Scripts\activate

3. Install Dependencies

With your virtual environment activated, install the required packages:
Bash

pip install -r requirements.txt

4. Configure Google Authentication

To enable user login and API integrations, you must configure your credentials via the Google Cloud Console.

    Navigate to the Google Cloud Console.

    Select your project and go to APIs & Services > Credentials.

    Click Create Credentials > OAuth client ID.

    Set the application type to Web application.

    Add your authorized redirect URIs (e.g., http://127.0.0.1:8000/accounts/google/login/callback/).

    Generate and copy your Client ID and Client Secret.

Next, open your settings.py (or your environment variables file, if configured) and insert your credentials:
Python

# In settings.py
GOOGLE_OAUTH_CLIENT_ID = 'paste_your_client_id_here'
GOOGLE_OAUTH_CLIENT_SECRET = 'paste_your_client_secret_here'

# Note: Ensure you also add your LLM API keys for the AI image scanning features here.

5. Apply Database Migrations

Set up the local database structure before running the server:
Bash

python manage.py makemigrations
python manage.py migrate

6. Run the Application

Start the local development server:
Bash

python manage.py runserver

The web application will now be accessible at http://127.0.0.1:8000/.
