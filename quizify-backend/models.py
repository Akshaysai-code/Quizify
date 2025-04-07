from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class MCQ(Base):
    __tablename__ = "mcq_questions"
    
    id = Column(Integer, primary_key=True, index=True)
    question = Column(String, nullable=False)
    option1 = Column(String, nullable=False)
    option2 = Column(String, nullable=False)
    option3 = Column(String, nullable=False)
    option4 = Column(String, nullable=False)
    answer = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
