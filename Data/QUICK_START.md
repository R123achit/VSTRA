# 🚀 Quick Start Guide - 2 Minutes to Running API

## Step 1: Start the API Server (30 seconds)

Open terminal in the `data` folder and run:

```bash
python start_api.py
```

Choose option 1 (FastAPI) or 2 (Flask).

**That's it!** The server is now running.

## Step 2: Test It (30 seconds)

### Option A: Browser Test (Easiest)

Open in your browser:
- **FastAPI:** http://localhost:8000/docs
- **Flask:** http://localhost:5000/api/health

### Option B: HTML Demo

Open `demo.html` in your browser and try searching!

### Option C: cURL Test

```bash
curl -X POST http://localhost:8000/search \
  -H "Content-Type: application/json" \
  -d '{"query": "blue cotton saree", "top_k": 5}'
```

## Step 3: Connect Your Frontend (1 minute)

### React/JavaScript

```javascript
const response = await fetch('http://localhost:8000/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'blue saree',
    top_k: 10
  })
});

const data = await response.json();
console.log(data.products);
```

## 🎉 Done!

Your semantic search API is now running and ready to use!

## 📚 Need More Info?

- **Full Guide:** See `README_API.md`
- **Integration Examples:** See `API_INTEGRATION_GUIDE.md`
- **Test Script:** Run `python test_api.py`

## 🆘 Troubleshooting

**Server won't start?**
- Check if port 8000/5000 is already in use
- Make sure all dependencies are installed: `pip install -r requirements.txt`

**CORS error in browser?**
- Already configured! Should work out of the box.

**Can't find files?**
- Make sure you're in the `data` folder
- Check that `product_index.faiss` and `cleaned_products.csv` exist

## 💡 Pro Tips

1. Use FastAPI for better performance
2. Visit `/docs` for interactive API testing (FastAPI only)
3. Open `demo.html` for a visual demo
4. Check logs if something goes wrong

---

**You're all set! Happy coding! 🎊**
