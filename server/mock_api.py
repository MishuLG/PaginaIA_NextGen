#!/usr/bin/env python3
"""
NextGen Full-Stack Dev Server (REST API + Static Web Server)
Listens on http://localhost:3000
Endpoints:
  GET    /              -> Sirve index.html (Plataforma NextGen)
  GET    /index.html    -> Sirve index.html
  GET    /users         -> Retorna colección de usuarios de db.json
  GET    /users/:id     -> Retorna usuario específico
  GET    /comments      -> Retorna colección de comentarios de db.json
  POST   /comments      -> Agrega nuevo comentario a db.json
  PATCH  /comments/:id  -> Actualiza comentario (likes, etc.)
  GET    /css/*, /js/*  -> Sirve estilos y scripts con MIME types correctos
Supports full CORS headers for seamless frontend interaction.
"""
import http.server
import json
import mimetypes
import os
import re
import sys
from urllib.parse import urlparse, unquote

PORT = 3000
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DB_FILE = os.path.join(ROOT_DIR, "db.json")

# Ensure proper MIME types are registered
mimetypes.init()
mimetypes.add_type("text/javascript", ".js")
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("application/json", ".json")
mimetypes.add_type("image/svg+xml", ".svg")

def load_db():
    try:
        with open(DB_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"[ERROR] No se pudo leer db.json: {e}")
        return {"users": [], "comments": []}

def save_db(data):
    try:
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"[ERROR] No se pudo guardar db.json: {e}")
        return False

class NextGenServerHandler(http.server.BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        if path.startswith("/api/"):
            path = path[4:]  # Alias /api/users -> /users, /api/comments -> /comments
        db = load_db()

        # 1. REST Endpoint: /users
        if path == "/users" or path == "/users/":
            self.send_response(200)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps(db.get("users", []), ensure_ascii=False).encode("utf-8"))
            return

        # 2. REST Endpoint: /users/:id
        user_match = re.match(r"^/users/([^/]+)$", path)
        if user_match:
            uid = user_match.group(1)
            user = next((u for u in db.get("users", []) if u.get("id") == uid or u.get("email") == uid), None)
            if user:
                self.send_response(200)
                self._send_cors_headers()
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps(user, ensure_ascii=False).encode("utf-8"))
            else:
                self.send_response(404)
                self._send_cors_headers()
                self.end_headers()
            return

        # 3. REST Endpoint: /comments
        if path == "/comments" or path == "/comments/":
            self.send_response(200)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps(db.get("comments", []), ensure_ascii=False).encode("utf-8"))
            return

        # 4. Static Web Page & Asset Serving (e.g., /, /index.html, /css/styles.css, /js/app.js)
        rel_path = path.lstrip("/")
        if rel_path == "" or rel_path == "index.html":
            file_path = os.path.join(ROOT_DIR, "index.html")
        else:
            safe_rel_path = os.path.normpath(unquote(rel_path)).replace("\\", "/")
            if safe_rel_path.startswith(".."):
                self.send_response(403)
                self.end_headers()
                return
            file_path = os.path.join(ROOT_DIR, safe_rel_path)

        if os.path.isfile(file_path):
            mime_type, _ = mimetypes.guess_type(file_path)
            if not mime_type:
                mime_type = "application/octet-stream"
            if mime_type.startswith("text/") or mime_type in ["application/javascript", "application/json"]:
                mime_type += "; charset=utf-8"

            try:
                with open(file_path, "rb") as f:
                    content = f.read()
                self.send_response(200)
                self._send_cors_headers()
                self.send_header("Content-Type", mime_type)
                self.send_header("Content-Length", str(len(content)))
                self.end_headers()
                self.wfile.write(content)
                return
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                return

        # 5. Not Found
        self.send_response(404)
        self._send_cors_headers()
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.end_headers()
        self.wfile.write(f"404 Not Found: {path}".encode("utf-8"))

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        if path.startswith("/api/"):
            path = path[4:]
        db = load_db()

        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length)

        try:
            body = json.loads(post_data.decode("utf-8"))
        except Exception:
            body = {}

        if path == "/comments" or path == "/comments/":
            import time
            if "id" not in body:
                body["id"] = f"cmt_{int(time.time() * 1000)}"
            if "likes" not in body:
                body["likes"] = 0
            if "createdAt" not in body:
                import datetime
                body["createdAt"] = datetime.datetime.utcnow().isoformat() + "Z"

            db.setdefault("comments", []).insert(0, body)
            save_db(db)

            self.send_response(201)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps(body, ensure_ascii=False).encode("utf-8"))
            return

        self.send_response(404)
        self._send_cors_headers()
        self.end_headers()

    def do_PATCH(self):
        parsed = urlparse(self.path)
        path = parsed.path
        if path.startswith("/api/"):
            path = path[4:]
        db = load_db()

        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length)
        try:
            body = json.loads(post_data.decode("utf-8"))
        except Exception:
            body = {}

        comment_match = re.match(r"^/comments/([^/]+)$", path)
        if comment_match:
            cid = comment_match.group(1)
            for c in db.get("comments", []):
                if c.get("id") == cid:
                    c.update(body)
                    save_db(db)
                    self.send_response(200)
                    self._send_cors_headers()
                    self.send_header("Content-Type", "application/json; charset=utf-8")
                    self.end_headers()
                    self.wfile.write(json.dumps(c, ensure_ascii=False).encode("utf-8"))
                    return
            self.send_response(404)
            self._send_cors_headers()
            self.end_headers()
            return

        self.send_response(404)
        self._send_cors_headers()
        self.end_headers()

if __name__ == "__main__":
    server_address = ("", PORT)
    httpd = http.server.HTTPServer(server_address, NextGenServerHandler)
    print("=" * 60)
    print(" 🚀 NextGen Full-Stack Server Running!")
    print(f" 🌐 Abre en tu navegador: http://localhost:{PORT}")
    print(f" 📡 REST Endpoints:       http://localhost:{PORT}/users")
    print(f"                          http://localhost:{PORT}/comments")
    print(f" 💾 Sincronizado con:     {DB_FILE}")
    print("=" * 60)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nDeteniendo servidor NextGen...")
        httpd.server_close()
