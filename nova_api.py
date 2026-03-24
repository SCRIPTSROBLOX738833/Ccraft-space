import requests
from bs4 import BeautifulSoup
import json, random, time
from flask import Flask, request, jsonify

# --- إعداد Flask ---
app = Flask(__name__)

# --- Firebase ---
FIREBASE_URL = "https://ccraft-space-scripts-default-rtdb.firebaseio.com/learning.json"

brain = {}
conversation_memory = []

# --- تحميل Brain من Firebase ---
def load_brain():
    global brain
    try:
        resp = requests.get(FIREBASE_URL)
        if resp.status_code == 200:
            data = resp.json()
            if data:
                for key in data:
                    q = data[key]["question"]
                    a = data[key]["answer"]
                    if q in brain:
                        brain[q].append(a)
                    else:
                        brain[q] = [a]
        print("Nova: Brain محمل من Firebase ✅")
    except Exception as e:
        print("Nova: خطأ في تحميل Brain:", e)

# --- تحميل save_chatgpt.json ---
def load_initial_questions():
    global brain
    try:
        with open("save_chatgpt.json", "r", encoding="utf-8") as f:
            data = json.load(f)
            for item in data:
                q = item["question"]
                a = item["answer"]
                if q in brain:
                    brain[q].append(a)
                else:
                    brain[q] = [a]
        print("Nova: تم تحميل الأسئلة الأولية من save_chatgpt ✅")
    except Exception as e:
        print("Nova: خطأ في تحميل save_chatgpt:", e)

# --- حفظ Brain على Firebase ---
def save_learning(question, answer):
    try:
        payload = {"question": question, "answer": answer}
        requests.post(FIREBASE_URL, json=payload)
        if question in brain:
            brain[question].append(answer)
        else:
            brain[question] = [answer]
    except Exception as e:
        print("Nova: خطأ في حفظ التعلم:", e)

# --- توليد سكربت Roblox Lua ---
def generate_lua_script(user_msg):
    details = user_msg.split()[1:]
    details_text = " ".join(details)
    lua_script = f"""-- سكربت Roblox Lua تلقائي
local Players = game:GetService("Players")
Players.PlayerAdded:Connect(function(player)
    print(player.Name .. " joined the game!")
    -- تفاصيل السكربت: {details_text}
end)
"""
    save_learning(user_msg, lua_script)
    return f"هذا سكربت Roblox Lua جاهز:\n{lua_script}"

# --- تعلم من مواقع موثوقة ---
def learn_from_website(url):
    print(f"Nova: بحاول اتعلم من {url} ... 😎")
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        res = requests.get(url, headers=headers, timeout=20)
        soup = BeautifulSoup(res.text, "html.parser")
        paragraphs = soup.find_all(["p","li","code","pre"])
        learned = 0
        for p in paragraphs:
            text = p.get_text().strip()
            if text:
                save_learning(text, text)
                learned += 1
        print(f"Nova: اتعلمت {learned} جمل تقريبية 😎")
    except Exception as e:
        print("Nova: خطأ في التعلم من الموقع:", e)

def learn_5_google(query_urls):
    print("Nova: دخلنا وضع تعلم 5 - البحث في الإنترنت والتعلم التلقائي 😎")
    for url in query_urls:
        try:
            learn_from_website(url)
            time.sleep(2)
        except KeyboardInterrupt:
            print("\nNova: تم إيقاف تعلم 5 👋")
            break

# --- توليد الردود الذكية ---
def generate_reply(user_msg):
    conversation_memory.append({"user": user_msg})
    user_msg_lower = user_msg.lower()
    if "اعمل سكربت" in user_msg_lower:
        return generate_lua_script(user_msg)
    if user_msg in brain:
        reply = random.choice(brain[user_msg])
    else:
        words = []
        for msg in conversation_memory[-5:]:
            if 'user' in msg:
                words.extend(msg['user'].split())
        if words:
            reply = f"Nova: فهمت إنك بتتكلم عن '{random.choice(words)}', وده ممكن يكون مهم!"
        else:
            reply = "Nova: معنديش معلومة دلوقتي، بس هتعلم عنها!"
        save_learning(user_msg, reply)
    conversation_memory.append({"ai": reply})
    return reply

# --- واجهة API ---
@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    user_msg = data.get("message", "")
    reply = generate_reply(user_msg)
    return jsonify({"reply": reply})

@app.route("/learn5", methods=["POST"])
def learn5():
    urls = request.json.get("urls", [])
    learn_5_google(urls)
    return jsonify({"status": "تم التعلم من المواقع!"})

# --- تشغيل Nova ---
if __name__ == "__main__":
    load_brain()
    load_initial_questions()
    print("Nova: أهلاً! أنا Nova الواعي جدًا Ultimate Pro v7 😎")
    app.run(host="0.0.0.0", port=5000)
