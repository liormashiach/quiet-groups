import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv(".env.local")

SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("VITE_SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# קטלוג מקיף של מוצרי בסיס ומוצרים מיוחדים (כולל טיב טעם והשוואת מחירים בין רשתות)
RICH_PRODUCTS_DATA = [
    # חלב ומוצרי חלב
    {"barcode": "7290000012341", "product_name": "חלב 3% תנובה 1 ליטר", "chain_name": "שופרסל", "price": 7.11},
    {"barcode": "7290000012341", "product_name": "חלב 3% תנובה 1 ליטר", "chain_name": "רמי לוי", "price": 6.80},
    {"barcode": "7290000012341", "product_name": "חלב 3% תנובה 1 ליטר", "chain_name": "טיב טעם", "price": 7.50},
    {"barcode": "7290000012342", "product_name": "חלב 3% טרה 1 ליטר", "chain_name": "יוחננוף", "price": 6.90},
    {"barcode": "7290000012342", "product_name": "חלב 3% טרה 1 ליטר", "chain_name": "שופרסל", "price": 7.11},

    # לחם ומאפים
    {"barcode": "7290011122233", "product_name": "לחם פרוס אחיד", "chain_name": "שופרסל", "price": 5.12},
    {"barcode": "7290011122233", "product_name": "לחם פרוס אחיד", "chain_name": "רמי לוי", "price": 4.90},
    {"barcode": "7290011122234", "product_name": "לחם קל שיפון", "chain_name": "שופרסל", "price": 8.50},

    # ביצים וגבינות
    {"barcode": "7290022233344", "product_name": "ביצים L (מארז 30)", "chain_name": "שופרסל", "price": 32.90},
    {"barcode": "7290022233344", "product_name": "ביצים L (מארז 30)", "chain_name": "רמי לוי", "price": 29.90},
    {"barcode": "7290022233344", "product_name": "ביצים L (מארז 30)", "chain_name": "טיב טעם", "price": 34.00},
    {"barcode": "7290055566677", "product_name": "קוטג 5% תנובה", "chain_name": "שופרסל", "price": 6.82},
    {"barcode": "7290055566677", "product_name": "קוטג 5% תנובה", "chain_name": "רמי לוי", "price": 5.90},

    # פסטה ואורז (מה שחיפשת קודם!)
    {"barcode": "7290066677788", "product_name": "פסטה פוזילי אסם 500 גרם", "chain_name": "שופרסל", "price": 5.90},
    {"barcode": "7290066677788", "product_name": "פסטה פוזילי אסם 500 גרם", "chain_name": "רמי לוי", "price": 4.90},
    {"barcode": "7290066677788", "product_name": "פסטה פוזילי אסם 500 גרם", "chain_name": "טיב טעם", "price": 6.20},
    {"barcode": "7290077788899", "product_name": "אורז בסמטי סגולה 1 ק״ג", "chain_name": "שופרסל", "price": 12.90},
    {"barcode": "7290077788899", "product_name": "אורז בסמטי סגולה 1 ק״ג", "chain_name": "רמי לוי", "price": 10.90},

    # מוצרים מיוחדים ולא כשרים (טיב טעם / קשת)
    {"barcode": "7290033344455", "product_name": "שרימפס קפוא נקודות טיב טעם", "chain_name": "טיב טעם", "price": 49.90},
    {"barcode": "7290033344455", "product_name": "שרימפס קפוא נקודות טיב טעם", "chain_name": "שופרסל", "price": 55.00},
    {"barcode": "7290044455566", "product_name": "נתחי חזיר טרי (ארגנטינה)", "chain_name": "טיב טעם", "price": 69.90},
    {"barcode": "7290044455567", "product_name": "נקניק בייקון מעושן", "chain_name": "טיב טעם", "price": 24.90},

    # ירקות ופירות
    {"barcode": "7290088899911", "product_name": "עגבניות שרי (מארז)", "chain_name": "שופרסל", "price": 9.90},
    {"barcode": "7290088899911", "product_name": "עגבניות שרי (מארז)", "chain_name": "רמי לוי", "price": 7.90},
    {"barcode": "7290088899922", "product_name": "מלפפון טרי (קילו)", "chain_name": "רמי לוי", "price": 4.90},
    {"barcode": "7290088899922", "product_name": "מלפפון טרי (קילו)", "chain_name": "שופרסל", "price": 6.50},

    # פארם וניקיון
    {"barcode": "7290099900011", "product_name": "נייר טואלט לילי (32 גלילים)", "chain_name": "שופרסל", "price": 34.90},
    {"barcode": "7290099900011", "product_name": "נייר טואלט לילי (32 גלילים)", "chain_name": "רמי לוי", "price": 29.90},
]

def run_sync():
    print("מעלה את קטלוג המוצרים המעודכן ל-Supabase...")
    try:
        response = supabase.table("product_prices").upsert(
            RICH_PRODUCTS_DATA, 
            on_conflict="barcode,chain_name"
        ).execute()
        
        print(f"הסנכרון הושלם בהצלחה! עודכנו {len(RICH_PRODUCTS_DATA)} פריטים בטבלה.")
    except Exception as e:
        print(f"שגיאה בעדכון הנתונים: {e}")

if __name__ == "__main__":
    run_sync()