from transformers import T5Tokenizer, T5ForConditionalGeneration
from sentence_transformers import SentenceTransformer
import torch

# Initialize the models once when the server starts
try:
    t5_tokenizer = T5Tokenizer.from_pretrained('t5-base')
    t5_model = T5ForConditionalGeneration.from_pretrained('t5-base')
    sentence_model = SentenceTransformer('paraphrase-MiniLM-L6-v2')
except Exception as e:
    print(f"Error loading models: {e}")
    # Handle model loading failure gracefully (maybe fallback to some default)

# Function to generate questions using T5 model
def generate_question(text: str):
    try:
        input_text = f"generate question: {text}"
        inputs = t5_tokenizer(input_text, return_tensors="pt", max_length=512, truncation=True)
        outputs = t5_model.generate(inputs['input_ids'], max_length=50, num_beams=4, early_stopping=True)
        question = t5_tokenizer.decode(outputs[0], skip_special_tokens=True)
        return question
    except Exception as e:
        print(f"Error generating question: {e}")
        return None

# Function to generate distractors using Sentence-BERT
def generate_distractors(question: str):
    try:
        embeddings = sentence_model.encode([question])
        distractors = []
        # Using sentence transformer to generate distractors (similar but not identical)
        distractor_candidates = sentence_model.encode([f"{question} is incorrect", f"{question} is not right", f"{question} is false"])
        
        # Sorting distractors based on similarity (lower similarity score for more diversity)
        for candidate in distractor_candidates:
            similarity = torch.cosine_similarity(torch.tensor(embeddings), torch.tensor(candidate), dim=1).item()
            distractors.append((similarity, candidate))

        # Sorting by similarity (ascending order), and selecting top distractors
        distractors.sort(key=lambda x: x[0])  
        distractors = [d[1] for d in distractors[:3]]  # Take top 3 distractors
        return distractors
    except Exception as e:
        print(f"Error generating distractors: {e}")
        return [question]  # Fallback to the question itself

# This function can be connected to FastAPI to handle MCQ generation requests
def generate_mcqs(text: str, num_questions: int):
    try:
        mcqs = []
        for _ in range(num_questions):
            question = generate_question(text)
            if question:
                distractors = generate_distractors(question)
                mcqs.append({
                    'question': question,
                    'options': distractors
                })
        return mcqs
    except Exception as e:
        print(f"Error generating MCQs: {e}")
        return []
