from http.server import BaseHTTPRequestHandler, HTTPServer
from dotenv import load_dotenv
from os.path import join, dirname
import os

load_dotenv(verbose=True)
load_dotenv(join(dirname(__file__), ".env"))


class MyHTTPRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.end_headers()
        self.wfile.write(b"Hello World")

    def do_POST(self):
        pass


server = HTTPServer(("", int(os.environ.get("EXTENSION_PORT"))), MyHTTPRequestHandler)
server.serve_forever()
