import os
from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv
import logging

# Load environment variables from a .env file
load_dotenv()

# Get the database credentials from environment variables
DATABASE_URL = os.getenv("DATABASE_URL")

# If DATABASE_URL is not found, raise an exception with a detailed message
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in environment variables. Please set it in the .env file.")

# Setup SQLAlchemy engine and session
engine = create_engine(DATABASE_URL, echo=True)  # echo=True logs SQL queries, set to False in production

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models, this is the parent class for all your models
Base = declarative_base()

# Optional metadata object, remove if not needed
metadata = MetaData()

# Dependency for getting the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Log an error if the database connection fails
try:
    # Test the database connection
    with engine.connect() as connection:
        logging.info("Database connection established successfully.")
except Exception as e:
    logging.error(f"Error connecting to the database: {e}")
    raise
