# init_db.py
from app.db.db import Base, engine
from app.model.models import User, PeerMessage, Group, GroupUser, GroupMessage

print("⏳ Creando tablas en la base de datos...")
Base.metadata.create_all(bind=engine)
print("✅ Tablas creadas correctamente.")