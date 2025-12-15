import resend
import os
from dotenv import load_dotenv

# Lade Umgebungsvariablen aus .env Datei
load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")

if not resend.api_key:
    print("⚠️  WARNUNG: RESEND_API_KEY nicht in .env gefunden!")

# DEVELOPMENT MODE
DEVELOPMENT_MODE = True  # ← Ändere auf False wenn Domain verifiziert
TEST_EMAIL = "tobias.enconsulting@gmail.com"

# LOGO URL - Dein echtes EN-Consulting Logo
LOGO_URL = "https://static.wixstatic.com/media/e9960e_023a936f583c4a8babc2967a848265c2~mv2.png"


def send_password_reset_email(to_email: str, reset_code: str):
    """
    Sendet einen Password Reset Code per E-Mail via Resend
    """
    original_email = to_email
    
    if DEVELOPMENT_MODE:
        to_email = TEST_EMAIL
        print(f"🔄 Development Mode: Email wird an {to_email} gesendet (Original: {original_email})")
    
    # Logo HTML mit URL
    logo_html = f'''
    <div style="text-align: center; margin-bottom: 30px;">
        <img src="{LOGO_URL}" alt="EN-Consulting Logo" style="max-width: 250px; height: auto; display: block; margin: 0 auto;">
    </div>
    '''
    
    try:
        params = {
            "from": "EN-Consulting <onboarding@resend.dev>",
            "to": [to_email],
            "subject": "Passwort zurücksetzen - EN-Consulting",
            "html": f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f5f5f5;
                    }}
                    .container {{
                        background-color: #ffffff;
                        border-radius: 10px;
                        padding: 30px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }}
                    .code-box {{
                        background-color: #2b5fff;
                        color: white;
                        font-size: 32px;
                        font-weight: bold;
                        text-align: center;
                        padding: 20px;
                        border-radius: 8px;
                        letter-spacing: 8px;
                        margin: 30px 0;
                    }}
                    .info {{
                        background-color: #fff3cd;
                        border-left: 4px solid #ffc107;
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 4px;
                    }}
                    .dev-mode {{
                        background-color: #e3f2fd;
                        border-left: 4px solid #2196f3;
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 4px;
                        font-size: 14px;
                    }}
                    .footer {{
                        text-align: center;
                        color: #666;
                        font-size: 12px;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #ddd;
                    }}
                    h2 {{
                        text-align: center;
                        color: #0a0f33;
                        margin-bottom: 20px;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    {logo_html}
                    
                    <h2>Passwort zurücksetzen</h2>
                    
                    <p>Hallo,</p>
                    
                    {f'<div class="dev-mode"><strong>📧 Test-Modus:</strong> Diese Email wurde ursprünglich für <strong>{original_email}</strong> angefordert.</div>' if DEVELOPMENT_MODE and original_email != to_email else ''}
                    
                    <p>Du hast eine Anfrage zum Zurücksetzen deines Passworts gestellt. 
                    Verwende den folgenden Code, um fortzufahren:</p>
                    
                    <div class="code-box">{reset_code}</div>
                    
                    <div class="info">
                        <strong>⏱ Wichtig:</strong> Dieser Code ist nur 15 Minuten gültig.
                    </div>
                    
                    <p>Wenn du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren. 
                    Dein Passwort wird nicht geändert.</p>
                    
                    <div class="footer">
                        <p>© 2025 EN-Consulting Project Management Tool</p>
                        <p>Diese E-Mail wurde automatisch generiert. Bitte nicht antworten.</p>
                    </div>
                </div>
            </body>
            </html>
            """,
        }
        
        email = resend.Emails.send(params)
        print(f"✅ E-Mail erfolgreich gesendet an {to_email}")
        print(f"   E-Mail ID: {email['id']}")
        return True
        
    except Exception as e:
        print(f"❌ Fehler beim E-Mail-Versand: {str(e)}")
        print(f"\n{'='*60}")
        print(f"PASSWORD RESET CODE für {original_email}")
        print(f"Code: {reset_code}")
        print(f"Gültig für 15 Minuten")
        print(f"{'='*60}\n")
        return False


def send_notification_email(to_email: str, subject: str, message: str):
    """
    Sendet eine allgemeine Benachrichtigungs-E-Mail
    """
    original_email = to_email
    
    if DEVELOPMENT_MODE:
        to_email = TEST_EMAIL
        print(f"🔄 Development Mode: Email wird an {to_email} gesendet (Original: {original_email})")
    
    # Logo HTML mit URL
    logo_html = f'''
    <div style="text-align: center; margin-bottom: 30px;">
        <img src="{LOGO_URL}" alt="EN-Consulting Logo" style="max-width: 250px; height: auto; display: block; margin: 0 auto;">
    </div>
    '''
    
    try:
        params = {
            "from": "EN-Consulting <onboarding@resend.dev>",
            "to": [to_email],
            "subject": subject,
            "html": f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body {{
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f5f5f5;
                    }}
                    .container {{
                        background-color: #ffffff;
                        border-radius: 10px;
                        padding: 30px;
                    }}
                    .dev-mode {{
                        background-color: #e3f2fd;
                        border-left: 4px solid #2196f3;
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 4px;
                        font-size: 14px;
                    }}
                    h2 {{
                        text-align: center;
                        color: #0a0f33;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    {logo_html}
                    
                    {f'<div class="dev-mode"><strong>📧 Test-Modus:</strong> Diese Email wurde ursprünglich für <strong>{original_email}</strong> angefordert.</div>' if DEVELOPMENT_MODE and original_email != to_email else ''}
                    
                    <h2>{subject}</h2>
                    <p>{message}</p>
                </div>
            </body>
            </html>
            """,
        }
        
        email = resend.Emails.send(params)
        print(f"✅ Benachrichtigung gesendet an {to_email}")
        return True
        
    except Exception as e:
        print(f"❌ Fehler beim E-Mail-Versand: {str(e)}")
        return False