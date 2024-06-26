import requests
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# Serve the React app
app.mount("/", StaticFiles(directory="../client/build", html=True), name="static")

# Authorization header
headers = {
    "Authorization": "Bearer rX8HOSkFCXR0Jy6DwA7Y9iSJL3a7gP65m2eazcW75AE7XGKS3LlqVXlFocloUgKc"
}

# Endpoint to fetch and return transaction data


@app.get("/api/transactions")
async def get_transactions():
    try:
        response = requests.get(
            "https://server.getsphere.com/tax_api/test_transactions", headers=headers)
        response.raise_for_status()  # Raise an exception for HTTP errors
        data = response.json()  # Parse JSON response
        return JSONResponse(content=data)
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=str(e))
