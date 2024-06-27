from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import requests
import os

app = FastAPI()

# Mount the React build directory
app.mount("/static", StaticFiles(directory="client/build/static"), name="static")


@app.get("/api/transactions")
async def get_transactions():
    url = "https://server.getsphere.com/tax_api/test_transactions"
    headers = {
        "Authorization": "Bearer rX8HOSkFCXR0Jy6DwA7Y9iSJL3a7gP65m2eazcW75AE7XGKS3LlqVXlFocloUgKc"
    }
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()
    return {"error": "Failed to fetch transactions"}


@app.get("/{full_path:path}")
async def serve(full_path: str):
    return FileResponse(os.path.join('client/build', 'index.html'))
