@echo off
echo Starting RootWise FastAPI Backend...
cd ..\backend
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate.bat
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
pause
