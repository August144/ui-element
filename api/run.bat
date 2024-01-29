@echo off
echo Starting installation...
call npm i
call python -m pip install -r requirements.txt
echo Installation completed.

echo Starting services...
start "" npm run start
start "" python -m flask run
echo Services started.
