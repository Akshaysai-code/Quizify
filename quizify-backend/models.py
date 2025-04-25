from sqlalchemy import Column, Integer, String
from database import Base

class MCQ(Base):
    __tablename__ = "mcq_questions"
    
    id = Column(Integer, primary_key=True, index=True)
    question = Column(String(512), nullable=False)  # Setting a maximum length for the question
    option1 = Column(String(256), nullable=False)  # Setting a max length for options
    option2 = Column(String(256), nullable=False)
    option3 = Column(String(256), nullable=False)
    option4 = Column(String(256), nullable=False)
    answer = Column(String(256), nullable=False)

    # Add an index to the question column if you plan to search by question frequently
    __table_args__ = (
        {'mysql_charset': 'utf8mb4'},  # For supporting emojis or special characters (optional)
    )
