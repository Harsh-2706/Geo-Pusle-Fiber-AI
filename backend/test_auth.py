from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

if __name__ == "__main__":
    p = "admin123"
    h = get_password_hash(p)
    print(f"Password: {p}")
    print(f"Hash: {h}")
    v = verify_password(p, h)
    print(f"Verify: {v}")
    
    # Test long password
    try:
        long_p = "a" * 73
        lh = get_password_hash(long_p)
        print("Long password hash success")
    except Exception as e:
        print(f"Long password hash error: {e}")
