from fastapi import FastAPI
from pydantic import BaseModel
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, MCQ  # Import your model


app = FastAPI()

DATABASE_URL = "postgresql://postgres:Akshay@localhost/quizify_db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

class TextInput(BaseModel):
    text: str
    difficulty: str

@app.post("/generate_mcq/")
async def generate_mcq(input_data: TextInput):
    return {"message": f"Generating MCQ for: {input_data.text} with difficulty {input_data.difficulty}"}
@app.get("/")
def read_root():
    return {"message": "Welcome to Quizify API!"}