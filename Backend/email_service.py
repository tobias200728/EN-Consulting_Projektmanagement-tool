import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

# Lade Umgebungsvariablen aus .env Datei
load_dotenv()

# Gmail SMTP Konfiguration
GMAIL_USER = os.getenv("GMAIL_USER")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")

if not GMAIL_USER or not GMAIL_APP_PASSWORD:
    print("⚠️  WARNUNG: GMAIL_USER oder GMAIL_APP_PASSWORD nicht in .env gefunden!")

# LOGO URL
LOGO_URL = "https://static.wixstatic.com/media/e9960e_023a936f583c4a8babc2967a848265c2~mv2.png"


def send_password_reset_email(to_email: str, reset_code: str):
    """
    Sendet einen Password Reset Code per E-Mail via Gmail SMTP
    """
    
    msg = MIMEMultipart('alternative')
    msg['Subject'] = 'Passwort zurücksetzen - EN-Consulting'
    msg['From'] = f'EN-Consulting <{GMAIL_USER}>'
    msg['To'] = to_email
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            
            <div style="text-align: center; margin-bottom: 30px;">
                <img src="{LOGO_URL}" alt="EN-Consulting Logo" style="max-width: 250px; height: auto; display: block; margin: 0 auto;">
            </div>
            
            <h2 style="text-align: center; color: #0a0f33; margin-bottom: 20px;">Passwort zurücksetzen</h2>
            
            <p>Hallo,</p>
            
            <p>Du hast eine Anfrage zum Zurücksetzen deines Passworts gestellt. 
            Verwende den folgenden Code, um fortzufahren:</p>
            
            <div style="background-color: #2b5fff; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; letter-spacing: 8px; margin: 30px 0;">
                {reset_code}
            </div>
            
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <strong>⏱ Wichtig:</strong> Dieser Code ist nur 15 Minuten gültig.
            </div>
            
            <p>Wenn du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren. 
            Dein Passwort wird nicht geändert.</p>
            
            <div style="text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                <p>© 2025 EN-Consulting Project Management Tool</p>
                <p>Diese E-Mail wurde automatisch generiert. Bitte nicht antworten.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    msg.attach(MIMEText(html_content, 'html'))
    
    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
            server.sendmail(GMAIL_USER, to_email, msg.as_string())
        
        print(f"✅ E-Mail erfolgreich gesendet an {to_email}")
        return True
        
    except Exception as e:
        print(f"❌ Fehler beim E-Mail-Versand: {str(e)}")
        print(f"\n{'='*60}")
        print(f"PASSWORD RESET CODE für {to_email}")
        print(f"Code: {reset_code}")
        print(f"Gültig für 15 Minuten")
        print(f"{'='*60}\n")
        return False