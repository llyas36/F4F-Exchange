import os
from datetime import datetime, timezone
from flask import Flask, jsonify, redirect, url_for, session, request
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, current_user, login_required
from flask_cors import CORS
from authlib.integrations.flask_client import OAuth
from flask_session import Session
from requests.exceptions import HTTPError
import logging

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__)

app.secret_key = os.environ.get("FLASK_SECRET_KEY", "a_very_secret_and_long_random_key_for_dev_do_not_use_in_prod")
app.config['SECRET_KEY'] = app.secret_key

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///f4f.db')
logging.info(f"USING DB: {os.path.abspath(app.config['SQLALCHEMY_DATABASE_URI'].replace('sqlite:///', ''))}")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

TWITTER_CLIENT_ID = os.environ.get('TWITTER_CLIENT_ID', 'YOUR_TWITTER_CLIENT_ID')
TWITTER_CLIENT_SECRET = os.environ.get('TWITTER_CLIENT_SECRET', 'YOUR_TWITTER_CLIENT_SECRET')

app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = True
app.config['SESSION_USE_SIGNER'] = True
app.config['SESSION_FILE_DIR'] = './.flask_session_data'
if not os.path.exists(app.config['SESSION_FILE_DIR']):
    os.makedirs(app.config['SESSION_FILE_DIR'])

Session(app)

FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")
CORS(app, supports_credentials=True, origins=[FRONTEND_URL])

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.init_app(app)

login_manager.login_view = 'auth_twitter'

@login_manager.unauthorized_handler
def unauthorized():
    logging.warning("Unauthorized access attempt detected.")
    return jsonify({"error": "Unauthorized. Please log in."}), 401

oauth = OAuth(app)

# --- Define the token_updater function explicitly ---
def update_twitter_token(token_data):
    logging.debug(f"TOKEN_UPDATER: Function called with token_data type: {type(token_data)}, value: {token_data}")
    if isinstance(token_data, dict) and 'oauth_token' in token_data:
        session['twitter_oauth_token'] = token_data
        logging.debug(f"TOKEN_UPDATER: Stored token in session['twitter_oauth_token']. Session keys NOW: {list(session.keys())}")
        # Explicitly mark session as modified for Flask-Session
        session.modified = True
    else:
        logging.error(f"TOKEN_UPDATER: Invalid or missing token_data received: {token_data}")

# --- Register OAuth client with the new token_updater ---
oauth.register(
    name='twitter',
    client_id=TWITTER_CLIENT_ID,
    client_secret=TWITTER_CLIENT_SECRET,
    request_token_url='https://api.twitter.com/oauth/request_token',
    request_token_params=None,
    access_token_url='https://api.twitter.com/oauth/access_token',
    access_token_params=None,
    authorize_url='https://api.twitter.com/oauth/authenticate',
    api_base_url='https://api.twitter.com/1.1/',
    client_kwargs=None,
    token_updater=update_twitter_token # Use the named function
)

# --- Database Models (no change) ---
class User(db.Model, UserMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    twitter_id = db.Column(db.String(50), unique=True, nullable=False)
    username = db.Column(db.String(80), nullable=False)
    avatar_url = db.Column(db.String(200))
    joined_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f'<User @{self.username}>'

class FollowStatus(db.Model):
    __tablename__ = 'follow_status'
    id = db.Column(db.Integer, primary_key=True)
    follower_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    following_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    follower = db.relationship('User', foreign_keys=[follower_id], backref='following_relations')
    following = db.relationship('User', foreign_keys=[following_id], backref='follower_relations')

    __table_args__ = (db.UniqueConstraint('follower_id', 'following_id', name='_follower_following_uc'),)

    def __repr__(self):
        return f'<FollowStatus {self.follower.username} -> {self.following.username}>'

# --- Flask-Login User Loader (no change) ---
@login_manager.user_loader
def load_user(user_id):
    user = User.query.get(int(user_id))
    if user:
        logging.debug(f"LOADER: User {user.username} (ID: {user.id}) loaded from session. Session keys: {list(session.keys())}")
    else:
        logging.warning(f"LOADER: User with ID {user_id} not found during session load.")
    return user

# --- Authentication Routes ---
@app.route('/')
def index():
    return 'Backend is running.'

@app.route('/auth/twitter')
def auth_twitter():
    redirect_uri = url_for('auth_callback', _external=True)
    logging.info(f"Initiating Twitter OAuth with redirect URI: {redirect_uri}")
    return oauth.twitter.authorize_redirect(redirect_uri, force_login='true')

@app.route('/auth/callback')
def auth_callback():
    try:
        # Authlib automatically calls the configured token_updater
        # if a new access token is successfully obtained.
        token = oauth.twitter.authorize_access_token()

        if not token:
            logging.error("CALLBACK: Access token not found or access denied during OAuth callback.")
            return jsonify({"error": "Access token not found or access denied"}), 400

        # The token is now implicitly handled by update_twitter_token
        logging.debug(f"CALLBACK: Full session AFTER authorize_access_token call (should contain token via updater): {session}")

        resp = oauth.twitter.get('account/verify_credentials.json', params={'skip_status': True, 'include_entities': False})
        resp.raise_for_status()
        profile = resp.json()
        logging.info(f"CALLBACK: Successfully fetched Twitter profile for @{profile.get('screen_name')}")

        twitter_id = profile['id_str']
        user = User.query.filter_by(twitter_id=twitter_id).first()

        if not user:
            user = User(
                twitter_id=twitter_id,
                username=profile['screen_name'],
                avatar_url=profile.get('profile_image_url_https', '')
            )
            db.session.add(user)
            db.session.commit()
            logging.info(f"CALLBACK: New user created: @{user.username} (ID: {user.id})")
        else:
            user.username = profile['screen_name']
            user.avatar_url = profile.get('profile_image_url_https', '')
            db.session.commit()
            logging.info(f"CALLBACK: Existing user updated: @{user.username} (ID: {user.id})")

        login_user(user, remember=True)
        logging.info(f"CALLBACK: User @{user.username} (ID: {user.id}) logged in via Flask-Login.")
        logging.debug(f"CALLBACK: Final session state before redirect: {session}")

        return redirect(f'{FRONTEND_URL}/profile?user={user.username}')

    except HTTPError as e:
        error_details = e.response.text if e.response is not None else str(e)
        status_code = e.response.status_code if e.response is not None else 500
        logging.error(f"CALLBACK: Twitter API error during auth callback: {error_details}", exc_info=True)
        return jsonify({"error": "Twitter API authentication failed.", "details": error_details}), status_code
    except Exception as e:
        logging.error(f"CALLBACK: OAuth Callback Error: {e}", exc_info=True)
        return jsonify({"error": "Authentication failed.", "details": str(e)}), 500

@app.route('/logout')
@login_required
def logout():
    user_id = current_user.id
    logout_user()
    session.clear() # Clear entire session on logout
    logging.info(f"LOGOUT: User ID {user_id} logged out and session cleared.")
    logging.debug(f"LOGOUT: Session after clear: {session}")
    return redirect(FRONTEND_URL)

# --- API Endpoints (no change from previous step, but will now rely on the improved token handling) ---

@app.route('/api/me')
@login_required
def get_current_user():
    logging.info(f"API /api/me accessed by user ID: {current_user.id}")
    logging.debug(f"API ME: Session in /api/me: {session}")
    return jsonify({
        'id': current_user.id,
        'twitter_id': current_user.twitter_id,
        'username': current_user.username,
        'avatar_url': current_user.avatar_url,
        'joined_at': current_user.joined_at.isoformat()
    })

@app.route('/api/users')
@login_required
def get_all_users():
    logging.info(f"API /api/users accessed by user ID: {current_user.id}")
    logging.debug(f"API USERS: Session in /api/users: {session}")
    all_users = User.query.filter(User.id != current_user.id).all()
    users_data = []

    for user in all_users:
        is_followed = FollowStatus.query.filter_by(
            follower_id=current_user.id,
            following_id=user.id
        ).first() is not None

        follows_me = FollowStatus.query.filter_by(
            follower_id=user.id,
            following_id=current_user.id
        ).first() is not None

        mutual = is_followed and follows_me

        users_data.append({
            'id': user.id,
            'username': user.username,
            'avatar_url': user.avatar_url,
            'is_followed': is_followed,
            'follows_me': follows_me,
            'mutual': mutual
        })
    return jsonify(users_data)


@app.route('/api/follow', methods=['POST'])
@login_required
def toggle_follow():
    logging.info(f"API /api/follow accessed by user ID: {current_user.id}")
    logging.debug(f"API FOLLOW: Session in /api/follow before token check: {session}")

    if not oauth.twitter.token:
        # This error line is what we're trying to resolve
        logging.error(f"API FOLLOW: Authlib Twitter token not found in session for user ID: {current_user.id}. Session keys: {list(session.keys())}")
        return jsonify({
            'error': 'Authentication token for Twitter API missing. Please log out and log back in.'
        }), 401

    data = request.get_json()
    target_user_id = data.get('user_id')
    if not target_user_id:
        return jsonify({'error': 'Missing user_id for follow/unfollow action'}), 400

    if current_user.id == target_user_id:
        return jsonify({'error': 'Cannot follow/unfollow yourself'}), 400

    target_user = User.query.get(target_user_id)
    if not target_user:
        return jsonify({'error': 'Target user not found'}), 404

    follow_entry = FollowStatus.query.filter_by(
        follower_id=current_user.id,
        following_id=target_user_id
    ).first()

    action = "follow" if not follow_entry else "unfollow"
    
    message = ""
    status_code = 200
    action_status = ""

    try:
        if action == "follow":
            resp = oauth.twitter.post('friendships/create.json', params={'screen_name': target_user.username, 'follow': True})
            resp.raise_for_status()
            new_follow = FollowStatus(follower_id=current_user.id, following_id=target_user_id)
            db.session.add(new_follow)
            db.session.commit()
            message = f"Successfully followed @{target_user.username}"
            action_status = "followed"
            logging.info(f"API FOLLOW: User {current_user.username} followed {target_user.username} on Twitter.")
        else: # action == "unfollow"
            resp = oauth.twitter.post('friendships/destroy.json', params={'screen_name': target_user.username})
            resp.raise_for_status()
            db.session.delete(follow_entry)
            db.session.commit()
            message = f"Successfully unfollowed @{target_user.username}"
            action_status = "unfollowed"
            logging.info(f"API FOLLOW: User {current_user.username} unfollowed {target_user.username} on Twitter.")

        logging.info(f"API FOLLOW: Action successful for {target_user.username}. Current session keys: {list(session.keys())}")
        return jsonify({'message': message, 'status': action_status}), status_code

    except HTTPError as e:
        db.session.rollback()
        error_details = e.response.text if e.response is not None else str(e)
        status_code = e.response.status_code if e.response is not None else 500
        logging.error(f"API FOLLOW: Twitter API error during follow/unfollow for {target_user.username}: {error_details}", exc_info=True)
        return jsonify({
            'error': f'Failed to update follow status on Twitter.',
            'details': error_details
        }), status_code
    except Exception as e:
        db.session.rollback()
        logging.error(f"API FOLLOW: An unexpected error occurred during follow/unfollow for {target_user.username}: {e}", exc_info=True)
        return jsonify({'error': 'An unexpected error occurred.', 'details': str(e)}), 500

@app.route('/api/mutuals')
@login_required
def get_mutuals():
    logging.info(f"API /api/mutuals accessed by user ID: {current_user.id}")
    logging.debug(f"API MUTUALS: Session in /api/mutuals: {session}")

    following_ids = [fs.following_id for fs in current_user.following_relations]
    follower_ids = [fs.follower_id for fs in current_user.follower_relations]

    mutual_ids = set(following_ids) & set(follower_ids)

    mutual_users = User.query.filter(User.id.in_(mutual_ids)).all()

    mutuals_data = []
    for user in mutual_users:
        mutuals_data.append({
            'id': user.id,
            'username': user.username,
            'avatar_url': user.avatar_url,
        })
    return jsonify(mutuals_data)

# --- Database Initialization Command ---
@app.cli.command("init-db")
def init_db_command():
    with app.app_context():
        db.drop_all()
        db.create_all()
        logging.info("Initialized the database.")
    print("Database initialized.")

# --- Main Entry Point ---
if __name__ == '__main__':
    app.run(debug=True)