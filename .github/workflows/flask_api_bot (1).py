from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import time
import re
import logging
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)

def run_bot(target_url):
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36")
    
    # إعدادات خاصة ببيئة Docker/Koyeb
    options.binary_location = os.environ.get("CHROME_BIN", "/usr/bin/chromium")
    service = Service(os.environ.get("CHROMEDRIVER_PATH", "/usr/bin/chromedriver"))

    driver = webdriver.Chrome(service=service, options=options)
    
    try:
        driver.get(target_url)
        main_tab = driver.window_handles[0]

        def close_popups():
            try:
                for h in driver.window_handles:
                    if h != main_tab:
                        driver.switch_to.window(h)
                        if 'auth.platorelay.com' not in driver.current_url:
                            driver.close()
                driver.switch_to.window(main_tab)
            except: pass

        # المرحلة 1: تخطي صفحة Continue
        for i in range(5):
            if 'lootlabs' in driver.current_url or 'loot-link' in driver.current_url: break
            try:
                cont_btns = driver.find_elements(By.XPATH, "//button[contains(text(),'Continue')]")
                if cont_btns:
                    driver.execute_script("arguments[0].click();", cont_btns[0])
                    time.sleep(3)
            except: pass
            close_popups()

        # المرحلة 2: التعامل مع المهام
        if 'lootlabs' in driver.current_url or 'loot-link' in driver.current_url:
            tasks = driver.execute_script("""
                return Array.from(document.querySelectorAll('[id]'))
                    .filter(el => /^[0-9]+$/.test(el.id) && el.innerText.includes('XP'))
                    .map(el => ({id: el.id, text: el.innerText}));
            """)
            
            max_wait = 0
            for t in tasks:
                m = re.search(r'(\d+)\s*(sec|s)', t['text'], re.IGNORECASE)
                if m: max_wait = max(max_wait, int(m.group(1)))
                try: driver.execute_script(f"document.getElementById('{t['id']}').click();")
                except: pass
                time.sleep(1)
                close_popups()
            
            time.sleep(max_wait + 5 if max_wait > 0 else 60)

            # الضغط على Claim Reward
            for attempt in range(10):
                try:
                    btn = driver.find_element(By.ID, 'unlockBtn')
                    if not btn.get_attribute('disabled'):
                        driver.execute_script("arguments[0].click();", btn)
                except:
                    try:
                        btn = driver.find_element(By.XPATH, "//*[contains(translate(text(), 'CLAIM REWARD', 'claim reward'), 'claim reward')]")
                        driver.execute_script("arguments[0].click();", btn)
                    except: pass
                
                time.sleep(4)
                if len(driver.window_handles) > 1: break
                close_popups()

        # المرحلة 3: استخراج المفتاح
        extracted_key = None
        for i in range(15):
            for h in driver.window_handles:
                driver.switch_to.window(h)
                if 'auth.platorelay.com' in driver.current_url and 'd=' not in driver.current_url:
                    try:
                        cont = driver.find_elements(By.XPATH, "//button[contains(text(),'Continue')]")
                        if cont: driver.execute_script("arguments[0].click();", cont[0])
                    except: pass
                    time.sleep(2)
                    
                    body_text = driver.find_element(By.TAG_NAME, 'body').text
                    match = re.search(r'FREE_\w+', body_text)
                    if match:
                        extracted_key = match.group(0)
                        break
            if extracted_key: break
            time.sleep(2)

        driver.quit()
        return extracted_key

    except Exception as e:
        if driver: driver.quit()
        return f"Error: {str(e)}"

@app.route('/api/bypass', methods=['POST', 'OPTIONS'])
def bypass():
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200
    data = request.json
    url = data.get('url')
    if not url: return jsonify({"success": False, "error": "URL is required"}), 400
    result = run_bot(url)
    if result and not result.startswith("Error"):
        return jsonify({"success": True, "key": result})
    else:
        return jsonify({"success": False, "error": result or "Failed to extract key"}), 500

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8000))
    app.run(host='0.0.0.0', port=port)
