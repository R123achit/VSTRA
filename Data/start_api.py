"""
Simple API Launcher
Choose which API server to start
"""

import sys
import os


def print_banner():
    print("\n" + "="*60)
    print("🚀 Product Search API Launcher")
    print("="*60)


def start_fastapi():
    """Start FastAPI server"""
    print("\n✨ Starting FastAPI server...")
    print("📍 Server: http://localhost:8000")
    print("📚 API Docs: http://localhost:8000/docs")
    print("💡 Press CTRL+C to stop\n")
    
    os.system("python api_fastapi.py")


def start_flask():
    """Start Flask server"""
    print("\n✨ Starting Flask server...")
    print("📍 Server: http://localhost:5000")
    print("💡 Press CTRL+C to stop\n")
    
    os.system("python api_flask.py")


def main():
    print_banner()
    
    print("\nChoose API server:")
    print("1. FastAPI (Recommended) - Port 8000")
    print("   ✓ Faster performance")
    print("   ✓ Automatic API documentation")
    print("   ✓ Type validation")
    print()
    print("2. Flask - Port 5000")
    print("   ✓ Simpler")
    print("   ✓ More mature ecosystem")
    print()
    
    choice = input("Enter choice (1 or 2): ").strip()
    
    if choice == "1":
        start_fastapi()
    elif choice == "2":
        start_flask()
    else:
        print("❌ Invalid choice. Please enter 1 or 2.")
        sys.exit(1)


if __name__ == "__main__":
    main()
