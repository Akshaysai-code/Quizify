from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class TextInput(BaseModel):
    text: str
    difficulty: str

@app.post("/generate_mcq/")
async def generate_mcq(input_data: TextInput):
    return {"message": f"Generating MCQ for: {input_data.text} with difficulty {input_data.difficulty}"}
