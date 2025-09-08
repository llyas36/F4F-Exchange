from app import app, db

print("Using DB URI:", app.config['SQLALCHEMY_DATABASE_URI'])

with app.app_context():
    db.create_all()
    print("Tables created!")
