import requests
import urllib.parse
import json
import re
import time

session = requests.Session()

def extract_tokens_from_html(html):
    try:
        # 1. Extract 'l' (stored in 'ps' variable with backticks)
        token_l = re.search(r"var ps\s*=\s*`([^`]*)`", html).group(1)
        
        # 2. Extract 'id_pestanya' (with backticks)
        id_pestanya = re.search(r"window\.id_pestanya\s*=\s*`([^`]*)`", html).group(1)
        
        # 3. Construct 'miid'
        # Inmovilla uses: numagencia.idusuario.timestamp_numagencia
        # Based on your file: Agency 7447, User 205424
        # We simulate the timestamp format seen in your raw_body: 2026022-15_24_57
        timestamp = time.strftime("%Y%j-%H_%M_%S")
        miid = f"7447.205424.{timestamp}.022152457_7447" 

        return {
            "l": token_l,
            "id_pestanya": id_pestanya,
            "miid": miid
        }
    except Exception as e:
        print(f"Extraction failed: {e}")
        return None

def run_automated_search(city_id):
    # --- 1. LOGIN ---
    login_url = "https://crm.inmovilla.com/new/app/admin/comprueba.php"
    login_payload = {
        "user": "GAMMA",
        "ps": "Ga123456*",
        "claveofi": "crminmovilla",
        "idioma": "2",
        "isMobile": "1"
    }
    session.post(login_url, data=login_payload, headers={"Referer": "https://crm.inmovilla.com/login/en"})

    # --- 2. GET TOKENS ---
    panel_response = session.get("https://crm.inmovilla.com/panel/")
    tokens = extract_tokens_from_html(panel_response.text)
    print(f"API token: {tokens}")
    
    if not tokens:
        return "Failed to extract tokens."

    # --- 3. CONSTRUCT SEARCH ---
    search_url = "https://crm.inmovilla.com/new/app/api/v1/paginacion/"
    
    paramjson_struct = {
        "general": {
            "info": {
                # This 'tag' tells the engine to filter by this specific Location ID
                "lostags": f"ofertas.key_loca;:;lista;:;lista;:;{city_id};:;", 
                "numvistas": 1,
                "ventana": "cofe",
                "data": "oferesultados"
            },
            "param": {
                "soloRefSearch": "1",
                "noSoloRefSearch": "0",
                "tiporev": "0",
                "verValoraPropietarios": 1,
                # In your Action A/B logs, key_loca is used here when checkboxes are active
                "key_loca": str(city_id), 
                "fechaalta": "1",
                "fechaact": "0",
                "fechaexclualta": "1",
                "fechaexclubaja": "0"
            },
            "filtro": "",
            "campo": {
                "ofertas.patio": {"valor": "0"},
                "ofertas.salida_humos": {"valor": "0"}
            }
        },
        "oferesultados": {
            "info": {
                "ficha": "cofe",
                "data": "oferesultados",
                "posicion": 0,
                "paginacion": "50", 
                "jsonvista": "1"
            },
            "ordentipo": "desc",
            "orden": False
        }
    }

    payload = {
        "paramjson": json.dumps(paramjson_struct, separators=(',', ':')),
        "soyajax": "1",
        "miid": tokens['miid'],
        "l": tokens['l'],
        "id_pestanya": tokens['id_pestanya'],
        "verValoraPropietarios": "1"
    }

    # --- 4. EXECUTE ---
    response = session.post(search_url, data=payload, headers={"x-requested-with": "XMLHttpRequest"})
    return response.json()

# Run for Madrid (5280)
results = run_automated_search(721699)
with open("results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)
print("Results saved to results.json")