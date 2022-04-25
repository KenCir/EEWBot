from http.server import BaseHTTPRequestHandler, HTTPServer
from dotenv import load_dotenv
from os.path import join, dirname
import os
from urllib.parse import urlparse
import json
from requests import post

load_dotenv(verbose=True)
load_dotenv(join(dirname(__file__), ".env"))


class KyoushinMonitorExtensionHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.end_headers()
        self.wfile.write(b"Hello World")

    def do_POST(self):
        parsed_path = urlparse(self.path)
        content_length = int(self.headers["content-length"])
        data = json.loads(self.rfile.read(content_length).decode("utf-8"))

        print(data)

        if data.get("type") == "eew":
            post(
                "http://localhost:{0}".format(os.environ.get("PORT")),
                json.dumps(
                    {
                        "report": data.get("report"),
                        "time": data.get("time"),
                        "epicenter": data.get("epicenter"),
                        "depth": data.get("depth"),
                        "magnitude": data.get("magnitude"),
                        "latitude": data.get("latitude"),
                        "longitude": data.get("longitude"),
                        "intensity": data.get("intensity"),
                    }
                ),
                headers={"Content-Type": "application/json"},
            )

        # 緊急地震速報取り消し
        elif data.get("type") == "pga_alert_cancel":
            post(
                "http://localhost:{0}".format(os.environ.get("PORT")),
                json.dumps(
                    {
                        "report": "cancel",
                    }
                ),
                headers={"Content-Type": "application/json"},
            )

        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.end_headers()
        self.wfile.write(b"Success!")


server = HTTPServer(
    ("", int(os.environ.get("EXTENSION_PORT"))), KyoushinMonitorExtensionHandler
)
server.serve_forever()
