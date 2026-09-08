# mHealth Web Application

An AI-driven **health and physical activity tracking platform** designed to support user autonomy in mobile health.

The application integrates **machine learning**, **large language models**, **information retrieval**, and **fitness data** to provide personalized health and physical activity support.

## Core Features

### Google Authentication

Secure user authentication using:

* **Google OAuth 2.0**
* **Google Authentication Client**
* OAuth-based login and account management

---

### Information Retrieval

The application includes a built-in search and retrieval engine using **Whoosh**.

Whoosh is used for querying and indexing information such as:

* Health data
* Activity logs
* System records
* Application-generated information

---

### AI Image Scanning

The application integrates **Large Language Models (LLMs)** and APIs such as the **Google Gemini API** to analyze health-related images.

Potential use cases include:

* Food and dietary label analysis
* Nutritional information extraction
* Image-based health information processing
* AI-assisted interpretation of visual data

---

### Benchmarking and Diagnostics

The project includes benchmarking and diagnostic utilities such as:

```text
bench
```

These utilities can be used to evaluate:

* System performance
* API response times
* Model performance
* Processing times
* System behavior under different workloads

---

### Activity Tracking

The application synchronizes with fitness and activity data streams to provide physical activity monitoring and support.

The architecture is designed to keep the activity-tracking components relatively decoupled from the rest of the application.

---

## Technologies

* **Python**
* **Django**
* **Django REST Framework**
* **Google OAuth 2.0**
* **Google Gemini API**
* **Whoosh**
* **Machine Learning**
* **Large Language Models**
* **SQLite / Django Database**
* **HTML5**
* **CSS3**
* **JavaScript**

---

## Prerequisites

Make sure the following are installed before starting the project:

* **Python 3.8+**
* **pip**
* **Git**
* **Google Cloud Console account**

Check your Python installation:

```bash
python3 --version
```

Check pip:

```bash
pip3 --version
```

---

## Local Development Setup

### 1. Clone the Repository

Clone the project from GitHub:

```bash
git clone https://github.com/MariosMpratsos/mhealthwebapp.git
```

Navigate into the project directory:

```bash
cd mhealthwebapp
```

---

### 2. Create a Virtual Environment

It is recommended to use a Python virtual environment to isolate the project's dependencies from the system Python installation.

#### Linux / macOS

Create the virtual environment:

```bash
python3 -m venv venv
```

Activate it:

```bash
source venv/bin/activate
```

After activation, your terminal should indicate that the `venv` environment is active.

#### Windows

Create the virtual environment:

```powershell
python -m venv venv
```

Activate it:

```powershell
venv\Scripts\activate
```

---

### 3. Install Dependencies

With the virtual environment activated, install the required Python packages:

```bash
pip install -r requirements.txt
```

This installs the dependencies specified in:

```text
requirements.txt
```

---

## Google Authentication Configuration

The application uses **Google OAuth 2.0** for authentication and requires credentials from the **Google Cloud Console**.

### 4. Create Google OAuth Credentials

Go to the Google Cloud Console and:

1. Select or create a Google Cloud project.
2. Navigate to **APIs & Services**.
3. Open **Credentials**.
4. Select **Create Credentials**.
5. Choose **OAuth client ID**.
6. Select **Web application** as the application type.
7. Configure the required redirect URIs.
8. Generate the OAuth credentials.

For local development, an example redirect URI is:

```text
http://127.0.0.1:8000/accounts/google/login/callback/
```

You will receive:

```text
Client ID
Client Secret
```

---

### 5. Configure Google Credentials

Add your credentials to the Django configuration or environment variables, depending on how the project is configured.

Example:

```python
GOOGLE_OAUTH_CLIENT_ID = "paste_your_client_id_here"

GOOGLE_OAUTH_CLIENT_SECRET = "paste_your_client_secret_here"
```

> **Security Note:** Never commit real API keys, OAuth client secrets, passwords, or other credentials to GitHub.

It is recommended to use environment variables for sensitive configuration.

Example:

```text
GOOGLE_OAUTH_CLIENT_ID=your_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_client_secret
GEMINI_API_KEY=your_api_key
```

---

## AI API Configuration

The AI image-scanning functionality requires the appropriate LLM API credentials.

For example, if the project uses the Google Gemini API, configure the corresponding API key in the project's environment configuration.

Example:

```text
GEMINI_API_KEY=your_gemini_api_key
```

Make sure the required API is enabled in the corresponding Google Cloud project.

---

## Database Setup

### 6. Create Database Migrations

Generate Django migrations:

```bash
python manage.py makemigrations
```

Then apply the migrations:

```bash
python manage.py migrate
```

This creates and updates the database structure required by the Django application.

---

## Run the Application

### 7. Start the Development Server

Run:

```bash
python manage.py runserver
```

The Django development server will start at:

```text
http://127.0.0.1:8000/
```

Open the address in your web browser:

```text
http://127.0.0.1:8000/
```

---

## Development Workflow

The typical development workflow is:

```text
Clone Repository
       │
       ▼
Create Virtual Environment
       │
       ▼
Activate venv
       │
       ▼
Install Dependencies
       │
       ▼
Configure API Credentials
       │
       ▼
Run Database Migrations
       │
       ▼
Start Django Server
       │
       ▼
http://127.0.0.1:8000/
```

---

## Django Commands

### Create Migrations

```bash
python manage.py makemigrations
```

### Apply Migrations

```bash
python manage.py migrate
```

### Start Development Server

```bash
python manage.py runserver
```

### Create a Superuser

If administrator access is required:

```bash
python manage.py createsuperuser
```

### Open Django Shell

```bash
python manage.py shell
```

---

## Project Structure

A typical Django project structure may look like:

```text
mhealthwebapp/
├── manage.py
├── requirements.txt
├── venv/
│
├── project/
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
│
├── apps/
│   └── ...
│
├── templates/
│   └── ...
│
├── static/
│   └── ...
│
└── media/
    └── ...
```

The exact structure may vary depending on the Django applications included in the project.

---

## AI and Information Retrieval Architecture

The application combines several components:

```text
                         ┌──────────────────┐
                         │      User        │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │  Django Web App  │
                         └────────┬─────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
              ▼                   ▼                   ▼
       ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
       │   Google    │     │   Whoosh    │     │    Gemini   │
       │    OAuth    │     │ Information │     │     API     │
       │             │     │  Retrieval  │     │             │
       └─────────────┘     └─────────────┘     └─────────────┘
                                  │                   │
                                  ▼                   ▼
                           Health / Activity    Image Analysis
                               Data
```

---

## Benchmarking

The project includes benchmarking utilities for evaluating system performance.

For example:

```bash
python bench.py
```

Depending on the implementation, benchmarks can be used to measure:

* API response time
* Search performance
* AI model response time
* Image processing time
* Overall system performance

---

## Security Considerations

Because the application handles authentication and potentially sensitive health-related information, proper security configuration is important.

Recommended practices include:

* Store secrets in environment variables.
* Do not commit API keys to Git.
* Do not commit OAuth client secrets.
* Use HTTPS in production.
* Configure secure Django settings for production.
* Set an appropriate `SECRET_KEY`.
* Configure `ALLOWED_HOSTS`.
* Disable Django `DEBUG` mode in production.
* Use secure cookies and appropriate CSRF protection.
* Properly configure OAuth redirect URIs.

For example:

```text
DEBUG=False
```

should be used in a production deployment.

---

## Key Features

* **Google OAuth 2.0 authentication**
* **Django-based web application**
* **Health and activity tracking**
* **Whoosh information retrieval**
* **AI-powered image analysis**
* **Google Gemini API integration**
* **Machine learning support**
* **Benchmarking utilities**
* **Fitness data synchronization**
* **Virtual environment support**
* **Django database migrations**

---

## License

This project is intended for educational, research, and development purposes.
