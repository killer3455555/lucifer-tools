from flask import Flask, request, render_template_string
import requests

app = Flask(__name__)

HTML_PAGE = """
<!DOCTYPE html>
<html>
<head>
    <title>Messenger Group UID Fetcher</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body style="background-color:black; color:white;">
    <div class="container mt-5">
        <h1 class="text-center mb-4">📌 Messenger Group UID Fetcher</h1>
        <form method="POST" class="mb-4">
            <div class="mb-3">
                <label for="token" class="form-label">Enter Access Token:</label>
                <input type="text" class="form-control" id="token" name="token" required>
            </div>
            <button type="submit" class="btn btn-primary w-100">Fetch Groups</button>
        </form>

        {% if groups %}
        <h3>✅ Groups Found:</h3>
        <table class="table table-dark table-bordered mt-3">
            <thead>
                <tr>
                    <th>Group Name</th>
                    <th>Group UID</th>
                </tr>
            </thead>
            <tbody>
                {% for g in groups %}
                <tr>
                    <td>{{ g.name }}</td>
                    <td>{{ g.id }}</td>
                </tr>
                {% endfor %}
            </tbody>
        </table>
        {% endif %}
    </div>
</body>
</html>
"""

@app.route("/", methods=["GET", "POST"])
def index():
    groups = []
    if request.method == "POST":
        token = request.form.get("token")
        try:
            url = f"https://graph.facebook.com/v15.0/me/conversations?fields=id,name&access_token={token}"
            res = requests.get(url).json()

            if "data" in res:
                groups = res["data"]
            else:
                groups = [{"name": "❌ Error", "id": res.get("error", {}).get("message", "Invalid Token")}]
        except Exception as e:
            groups = [{"name": "❌ Exception", "id": str(e)}]

    return render_template_string(HTML_PAGE, groups=groups)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)