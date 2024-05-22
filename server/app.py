from flask import Flask, request, jsonify
from transformers import pipeline

app = Flask(__name__)
# Use a pre-trained model from Hugging Face
nlp = pipeline("question-answering", model="distilbert-base-uncased-distilled-squad")

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    text = data['text']
    query = data['query']
    
    # Use the question-answering pipeline to find the answer
    result = nlp(question=query, context=text)
    
    return jsonify({'result': result['answer']})

if __name__ == '__main__':
    app.run(debug=True)
