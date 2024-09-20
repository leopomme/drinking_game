# from flask import Flask, render_template, send_from_directory

# app = Flask(__name__, static_folder='static', template_folder='templates')

# # Route for the home page
# @app.route('/')
# def home():
#     return render_template('index.html')

# # Route to serve the manifest
# @app.route('/manifest.json')
# def manifest():
#     return send_from_directory('.', 'manifest.json')

# # Route to serve the service worker
# @app.route('/service-worker.js')
# def service_worker():
#     return send_from_directory('.', 'service-worker.js')

# if __name__ == '__main__':
#     app.run(debug=True)
