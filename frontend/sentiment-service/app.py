from flask import Flask, request, jsonify
from flask_cors import CORS
from textblob import TextBlob

app = Flask(__name__)
CORS(app)

# Urgent/frustration keywords that auto-escalate priority
URGENT_KEYWORDS = [
    "urgent", "emergency", "dangerous", "hazard", "risk", "death",
    "accident", "broken", "collapsed", "flooding", "sewage overflow",
    "fire", "electrocution", "injured", "fatal", "toxic", "contaminated",
    "unbearable", "desperate", "furious", "outraged", "disgusting",
    "pathetic", "horrible", "terrible", "worst", "nightmare", "unacceptable",
    "immediately", "asap", "right now", "critical"
]

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    text = data.get('text', '')

    if not text.strip():
        return jsonify({
            "sentiment": "neutral",
            "score": 0.0,
            "priority": "LOW",
            "urgencyDetected": False
        })

    blob = TextBlob(text)
    polarity = blob.sentiment.polarity  # -1.0 to 1.0

    # Check for urgent keywords
    lower_text = text.lower()
    urgency_detected = any(kw in lower_text for kw in URGENT_KEYWORDS)

    # Determine sentiment label
    if polarity < -0.3:
        sentiment = "negative"
    elif polarity > 0.3:
        sentiment = "positive"
    else:
        sentiment = "neutral"

    # Determine priority
    if urgency_detected or polarity < -0.5:
        priority = "HIGH"
    elif polarity < -0.2:
        priority = "MEDIUM"
    else:
        priority = "LOW"

    return jsonify({
        "sentiment": sentiment,
        "score": round(polarity, 3),
        "priority": priority,
        "urgencyDetected": urgency_detected
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "service": "civicpulse-sentiment"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
