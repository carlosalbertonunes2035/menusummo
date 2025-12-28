@echo off
echo ===================================================
echo   DEPLOYING FIRESTORE RULES (SYNC)
echo ===================================================
echo.
echo Connecting to Firebase...
call firebase deploy --only firestore:rules
echo.
echo ===================================================
echo   Verifique se houve erro de permissao acima.
echo   Se sim, rode 'firebase login' antes.
echo ===================================================
pause
