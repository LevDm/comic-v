from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.database import models
from src.database.db import engine
from src.kandinskyAPI.kandinsky_router import kandinskyRouter
from src.user.user_router import userRouter
from src.gigachatAPI.gigaChat_router import GigaChatRouter
from src.auth.auth_routes import authRouter


app = FastAPI(title='ComicV API',
              description='API for the operation of the comic book generation service based on GigaChat and Kandinsky', version='0.1')
models.Base.metadata.create_all(bind=engine)

origins = [
    "https://664e6ab1cf07a44ab006897b--cheerful-puppy-d61e5f.netlify.app/",
    "https://664e6ab1cf07a44ab006897b--cheerful-puppy-d61e5f.netlify.app",
    "https://cheerful-puppy-d61e5f.netlify.app/",
    "https://master--cheerful-puppy-d61e5f.netlify.app/",
    "https://cheerful-puppy-d61e5f.netlify.app",
    "https://master--cheerful-puppy-d61e5f.netlify.app",
    "http://localhost:3000",
    "localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(authRouter)
app.include_router(GigaChatRouter)
app.include_router(kandinskyRouter)
app.include_router(userRouter)
