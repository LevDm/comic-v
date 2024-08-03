from pydantic import BaseModel, EmailStr

class Token(BaseModel):
    access_token: str
    expires_at: int
    refresh_token: str

class UserOutWithToken(BaseModel):
    user_id: str
    username: str
    email: EmailStr
    token: Token

class TokenData(BaseModel):
    email: str | None = None

class User(BaseModel):
    username: str
    email: str

class UserInDB(User):
    hashed_password: str

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserOut(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str