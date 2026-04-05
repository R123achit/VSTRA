# Quick Start: AI Search Integration

## 🚀 What's New?

Your Vstra website now has **AI-Powered Semantic Search**! Users can search for products using natural language like "blue cotton saree for women" instead of exact product names.

## ⚡ Quick Start (3 Steps)

### Option 1: Use the Batch Script (Windows)

Double-click `start-with-ai.bat` - it will start both servers automatically!

### Option 2: Manual Start

**Step 1: Start Python API**
```bash
cd Data
python api_fastapi.py
```

**Step 2: Start Next.js (in a new terminal)**
```bash
npm run dev
```

**Step 3: Test It!**
1. Open http://localhost:3000
2. Click the ✨ sparkle icon in the navbar
3. Try: "blue cotton saree for women"

## 📁 New Files Added

```
✅ components/SemanticSearch.js          - AI search modal
✅ pages/api/search/semantic.js          - Search API endpoint
✅ start-with-ai.bat                     - Quick start script
✅ SEMANTIC_SEARCH_INTEGRATION.md        - Full documentation
✅ QUICK_START_AI_SEARCH.md             - This file
```

## 🔧 Modified Files

```
✏️ components/Navbar.js                  - Added AI search button
✏️ .env.local.example                    - Added PYTHON_API_URL
```

## ❌ Removed Files

```
🗑️ website.html                          - Standalone test page (no longer needed)
```

## 🎯 How It Works

1. User clicks AI search button (✨ icon)
2. Modal opens with search input
3. User types natural language query
4. Next.js API calls Python FastAPI
5. Python uses FAISS + ML to find similar products
6. Results displayed in beautiful grid

## 🔍 Example Searches

Try these in the AI search:
- "blue cotton saree for women"
- "black formal trouser men"
- "sports bra women"
- "red silk saree wedding"
- "casual shirt men"
- "comfortable running shoes"

## 🛠️ Requirements

Make sure you have:
- ✅ Python 3.8+
- ✅ Node.js 14+
- ✅ All Python packages: `pip install -r Data/requirements.txt`
- ✅ FAISS index generated: `python Data/generate_embeddings.py`

## 🎨 UI Features

- **Sparkle Icon**: AI search button in navbar
- **Modal Design**: Clean, modern search interface
- **Example Queries**: Quick-click suggestions
- **Real-time Results**: Instant product grid
- **Responsive**: Works on all screen sizes
- **Fallback**: Uses regular search if AI unavailable

## 📊 API Endpoints

### Semantic Search
```
POST /api/search/semantic
Body: { "query": "blue saree", "top_k": 10 }
```

### Python Backend
```
POST http://localhost:8000/search
Body: { "query": "blue saree", "top_k": 10 }
```

## 🐛 Troubleshooting

### Python API won't start?
```bash
cd Data
pip install -r requirements.txt
python api_fastapi.py
```

### No FAISS index?
```bash
cd Data
python generate_embeddings.py
```

### Connection error?
Check if Python API is running: http://localhost:8000

### No results?
Try broader search terms or regenerate embeddings

## 📚 Full Documentation

See `SEMANTIC_SEARCH_INTEGRATION.md` for:
- Detailed architecture
- Production deployment
- Performance optimization
- Advanced features
- Troubleshooting guide

## 🎉 Success!

If you see the sparkle icon (✨) in your navbar and can search for products using natural language, you're all set!

## 💡 Next Steps

1. **Test with your products**: Make sure your MongoDB has products
2. **Customize styling**: Edit `components/SemanticSearch.js`
3. **Add analytics**: Track popular searches
4. **Deploy**: See deployment guide in main documentation

## 🆘 Need Help?

1. Check Python API logs in terminal
2. Check browser console (F12)
3. Verify both servers are running
4. Read full documentation

---

**Enjoy your new AI-powered search! 🚀✨**
