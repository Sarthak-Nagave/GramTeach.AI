import os
import firebase_admin
from firebase_admin import credentials
from .config import settings

# ---------------------------------------------------------
# READ PRIVATE KEY CORRECTLY (convert \n to real newlines)
# ---------------------------------------------------------
private_key = settings.FIREBASE_PRIVATE_KEY

if not private_key:
    raise Exception("Firebase private key missing in .env")

# Convert "\\n" → "\n"
private_key = private_key.replace("\\n", "\n")

cred_info = {
    "type": "service_account",
    "project_id": settings.FIREBASE_PROJECT_ID,
    "private_key_id": "dummy-key-id",
    "private_key": private_key,
    "client_email": settings.FIREBASE_CLIENT_EMAIL,
    "client_id": "dummy-client-id",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{settings.FIREBASE_CLIENT_EMAIL}"
}

# ---------------------------------------------------------
# INITIALIZE FIREBASE
# ---------------------------------------------------------
if not firebase_admin._apps:
    cred = credentials.Certificate(cred_info)
    firebase_admin.initialize_app(cred)
    print("[Firebase] Initialized successfully")
