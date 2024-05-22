from flask import Flask, request, jsonify
from transformers import DPRContextEncoder, DPRReaderTokenizer, DPRReader
import torch

app = Flask(__name__)

# Load DPR model and tokenizer
context_encoder = DPRContextEncoder.from_pretrained("facebook/dpr-ctx_encoder-single-nq-base")
tokenizer = DPRReaderTokenizer.from_pretrained("facebook/dpr-reader-single-nq-base")
reader = DPRReader.from_pretrained("facebook/dpr-reader-single-nq-base")

@app.route('/answer', methods=['POST'])
def answer_question():
    data = request.json
    text = data.get('text')
    query = data.get('query')

    if not text or not query:
        return jsonify({'error': 'Context or question not provided'}), 400

    # Encode context and question
    inputs = tokenizer(query, text, return_tensors="pt")

    # Get DPR embeddings for the context
    with torch.no_grad():
        context_embeddings = context_encoder(**inputs).pooler_output

    # Get top-k passages
    outputs = reader(query, text, return_dict=True)
    start_logits = outputs.start_logits
    end_logits = outputs.end_logits

    # Select the best answer span
    start_index = torch.argmax(start_logits)
    end_index = torch.argmax(end_logits)
    result = tokenizer.decode(inputs["input_ids"][0][start_index:end_index+1])

    return jsonify({'result': result})

if __name__ == '__main__':
    app.run(debug=True)
