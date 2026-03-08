from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth_routes, data_routes, prediction_routes, technician_routes

app = FastAPI(
    title="TANFINET Enterprise Fiber Risk Platform",
    description="ML-powered predictive maintenance with real-time NASA environmental intelligence.",
    version="2.0.0"
)

# ── Middleware ─────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    from services.state_service import initialize_state, start_simulation
    import asyncio
    initialize_state()
    asyncio.create_task(start_simulation())

# ── Router Mounting ────────────────────────────────────────────────────────
app.include_router(auth_routes.router)
app.include_router(data_routes.router)
app.include_router(prediction_routes.router)
app.include_router(technician_routes.router)

@app.get("/")
async def health_check():
    return {
        "status": "online", 
        "version": "2.0.0",
        "service": "TANFINET Core API"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
