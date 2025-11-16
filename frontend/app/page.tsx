"use client";

import { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:8000";

export default function Home() {
  const [message, setMessage] = useState<string>("");
  const [apiMessage, setApiMessage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Fetch from root endpoint
    fetch(`${API_BASE_URL}/`)
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    // Fetch from hello endpoint
    fetch(`${API_BASE_URL}/api/hello?name=Magna Galactica`)
      .then((res) => res.json())
      .then((data) => setApiMessage(data.message))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-white mb-4 text-center">
            Magna Galactica
          </h1>
          <p className="text-xl text-purple-200 text-center mb-12">
            FastAPI + Next.js Full-Stack Application
          </p>

          <div className="grid gap-6 md:grid-cols-2 mb-12">
            {/* Backend Status Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Backend Status
              </h2>
              {loading ? (
                <p className="text-purple-200">Connecting to API...</p>
              ) : error ? (
                <div>
                  <p className="text-red-400 mb-2">❌ Error: {error}</p>
                  <p className="text-sm text-purple-300">
                    Make sure the FastAPI server is running on port 8000
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-green-400 mb-2">✅ Connected</p>
                  <p className="text-purple-200">{message}</p>
                </div>
              )}
            </div>

            {/* API Demo Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-purple-500/20">
              <h2 className="text-2xl font-semibold text-white mb-4">
                API Response
              </h2>
              {apiMessage ? (
                <p className="text-purple-200">{apiMessage}</p>
              ) : (
                <p className="text-purple-300">Loading...</p>
              )}
            </div>
          </div>

          {/* Quick Start Instructions */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 border border-purple-500/20">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Quick Start
            </h2>
            <div className="space-y-4 text-purple-200">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Backend (FastAPI):
                </h3>
                <code className="block bg-black/50 p-3 rounded text-sm">
                  cd backend<br />
                  python -m venv venv<br />
                  source venv/bin/activate<br />
                  pip install -r requirements.txt<br />
                  uvicorn main:app --reload
                </code>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Frontend (Next.js):
                </h3>
                <code className="block bg-black/50 p-3 rounded text-sm">
                  cd frontend<br />
                  npm run dev
                </code>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
