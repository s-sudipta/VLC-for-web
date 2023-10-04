@echo off
@REM cd C:\Users\souna\OneDrive\Desktop\videoplayer
start cmd /k npm start
timeout /t 5
start chrome "http://localhost:3000"


