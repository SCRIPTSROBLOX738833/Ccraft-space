import os
import time
import logging
import re
import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

URL = 'https://auth.platorelay.com/a?d=jrNv68bhwh00AJvsBlhcS2NiD3Bawx3dDodLzaP5G7uqaii0TWAjdr5uIyFXHEiwqQ98LIYAyc5ld0wQEAkqaFZuuYDmjNRpK2HSel0Nv6HXIxmW6yBrykkKk1GzuiiseQlW4nWZNpPFe3xxH6141LiFf8CVkP2pQIB6UY0C9Mm2lQeBffkq6uoKIFWZ7tglzSGL8eDz06pn0s7oxbrsCJp5Fm4BNr5VLZC4VEticwjO3yJ8rLh0NFVK1Eb6d9B80heJBWdGaelgOoZ5e9HpXxL5Dln12fcVpQOcXenvdemQzc4qGQVUcE4kqvKm7WEOLglpedcuEkHvQaNIjdJXoYDS1h8eNaAIWrPwg3YTZWKefzpNX07qvIAK9IABJwllLFUGrgFHftbGb6r91lSa1ozttBTLpFt9Vfdw9akYOIE0l44immVVznlQe3rBl7zgi4O9VvmMxvlkzrPzcu90e7AvGCSAwLjJr7nk9cd6ChX3CWd5TgLzQAnv'

options = Options()
options.add_argument("--headless")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("--width=1280")
options.add_argument("--height=1024")

driver = webdriver.Chrome(options=options)
wait = WebDriverWait(driver, 15)
driver.get(URL)
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

logging.info('Starting navigation...')
for i in range(100):
    try:
        body_text = driver.find_element(By.TAG_NAME, 'body').text
        
        # إذا ظهر المفتاح
        key = re.search(r'FREE_\w+', body_text)
        if key:
            print(f"\n\n{'='*40}\nSUCCESS! KEY: {key.group(0)}\n{'='*40}\n\n")
            driver.save_screenshot('/home/ubuntu/final_success.png')
            driver.quit()
            exit()
            
        # إذا ظهر زر Continue
        cont_btns = driver.find_elements(By.XPATH, "//button[contains(text(),'Continue')]")
        if cont_btns:
            driver.execute_script("arguments[0].click();", cont_btns[0])
            logging.info(f"Clicked Continue (Step {i})")
            time.sleep(5)
            
        # إذا تم تحويلنا لـ lootlabs
        if 'lootlabs' in driver.current_url or 'loot-link' in driver.current_url:
            logging.info("Reached lootlabs, waiting for tasks...")
            # هنا يمكن إضافة منطق المهام إذا لزم الأمر، لكن الرابط قد يتخطاها
            time.sleep(10)
            
    except Exception as e:
        logging.warning(f"Error in loop: {e}")
    
    close_popups()
    time.sleep(2)

driver.save_screenshot('/home/ubuntu/final_state.png')
driver.quit()
EOF
