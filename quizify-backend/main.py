from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from database import engine, SessionLocal
from models import Base, MCQ

from transformers import pipeline
from sentence_transformers import SentenceTransformer, util
import nltk
from nltk.tokenize import sent_tokenize
import random
import torch
from nltk.data import find

# Auto-download punkt tokenizer if missing
try:
    find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI()

# Enable CORS for frontend-backend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load models
t5_pipeline = pipeline("text2text-generation", model="t5-small")
sbert_model = SentenceTransformer("paraphrase-MiniLM-L6-v2")

# Request schema
class MCQRequest(BaseModel):
    text: str
    num_questions: int

@app.get("/")
def home():
    return {"message": "Welcome to Quizify API!"}

@app.post("/generate_mcq/")
async def generate_mcq(input_data: MCQRequest):
    text = input_data.text
    num_questions = input_data.num_questions

    sentences = sent_tokenize(text)
    if not sentences:
        raise HTTPException(status_code=400, detail="No valid sentences found in input.")

    mcq_list = []

    for i in range(min(num_questions, len(sentences))):
        try:
            # Generate question using T5
            input_text = f"generate question: {sentences[i]}"
            output = t5_pipeline(input_text, max_length=64, num_return_sequences=1)
            question = output[0]['generated_text'].strip()

            if not question.endswith("?"):
                question += "?"

            # Use the last word of the sentence as the answer
            answer = sentences[i].split()[-1].strip(".?!") if sentences[i] else "N/A"

            # Sentence embeddings
            all_embeddings = sbert_model.encode(sentences, convert_to_tensor=True)
            answer_embedding = sbert_model.encode(answer, convert_to_tensor=True)

            similarity = util.cos_sim(answer_embedding, all_embeddings)[0]
            top_k = min(len(sentences), 5)
            top_indices = torch.topk(similarity, k=top_k).indices.tolist()

            distractors = []
            for idx in top_indices:
                if sentences[idx] != sentences[i] and sentences[idx] not in distractors:
                    distractors.append(sentences[idx])
                if len(distractors) == 3:
                    break

            # Build options
            options = distractors + [answer]
            random.shuffle(options)

            while len(options) < 4:
                options.append("N/A")

            # ✅ Ensure exactly 4 options
            options = options[:4]

            # Save to DB
            db = SessionLocal()
            new_mcq = MCQ(
                question=question,
                option1=options[0],
                option2=options[1],
                option3=options[2],
                option4=options[3],
                answer=answer
            )
            try:
                db.add(new_mcq)
                db.commit()
            except Exception as e:
                db.rollback()
                print("❌ Database error:", e)
                raise HTTPException(status_code=500, detail=f"Database error: {e}")
            finally:
                db.close()

            # ✅ Add only if exactly 4 options
            if len(options) == 4:
                mcq_list.append({
                    "question": question,
                    "answer": answer,
                    "options": options,
                })

        except Exception as e:
            print(f"❌ Error at sentence {i+1}: {e}")
            continue

    if not mcq_list:
        raise HTTPException(status_code=500, detail="No MCQs could be generated from the input.")

    return {"mcqs": mcq_list}

@app.get("/get_mcqs/")
def get_all_mcqs():
    db = SessionLocal()
    mcqs = db.query(MCQ).all()
    db.close()
    return [
        {
            "question": mcq.question,
            "options": [mcq.option1, mcq.option2, mcq.option3, mcq.option4],
            "answer": mcq.answer
        }
        for mcq in mcqs
    ]
