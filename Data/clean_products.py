"""
Product Data Cleaning Script
Cleans and preprocesses product CSV for recommendation system
"""

import pandas as pd
import os

def clean_price_column(price_value):
    """
    Clean price column by removing ₹ symbol and commas, then convert to float
    Args:
        price_value: Raw price value from CSV
    Returns:
        float: Cleaned price value or 0.0 if invalid
    """
    try:
        if pd.isna(price_value):
            return 0.0
        # Convert to string and remove ₹ and commas
        cleaned = str(price_value).replace('₹', '').replace(',', '').strip()
        return float(cleaned) if cleaned else 0.0
    except (ValueError, AttributeError):
        return 0.0

def categorize_product(title):
    """
    Categorize product based on title keywords
    Args:
        title: Product title string
    Returns:
        str: Category name
    """
    if pd.isna(title):
        return "fashion"
    
    title_lower = str(title).lower()
    
    if "saree" in title_lower:
        return "saree"
    elif "bra" in title_lower:
        return "bra"
    elif "trouser" in title_lower:
        return "trouser"
    else:
        return "fashion"

def create_combined_text(row):
    """
    Combine brand, title, and category into single text field
    Args:
        row: DataFrame row
    Returns:
        str: Combined lowercase text
    """
    brand = "" if pd.isna(row.get('brand')) else str(row['brand'])
    title = "" if pd.isna(row.get('title')) else str(row['title'])
    category = "" if pd.isna(row.get('category')) else str(row['category'])
    
    combined = f"{brand} {title} {category}".strip()
    return combined.lower()

def main():
    """Main function to clean and preprocess product data"""
    
    # File paths
    input_file = r"C:\Users\rachi\VSTRA\Data\Data - Copy.csv"
    output_file = r"C:\Users\rachi\VSTRA\Data\cleaned_products.csv"
    
    print("Starting product data cleaning...")
    print(f"Input file: {input_file}")
    
    # Step 1: Check if input file exists
    if not os.path.exists(input_file):
        print(f"ERROR: Input file not found at {input_file}")
        return
    
    try:
        # Step 2: Load CSV file
        print("\n[1/5] Loading CSV file...")
        df = pd.read_csv(input_file)
        print(f"✓ Loaded {len(df)} rows")
        
        # Step 3: Clean price columns
        print("\n[2/5] Cleaning price columns...")
        if 'sold_price' in df.columns:
            df['sold_price'] = df['sold_price'].apply(clean_price_column)
            print("✓ Cleaned 'sold_price' column")
        
        if 'actual_price' in df.columns:
            df['actual_price'] = df['actual_price'].apply(clean_price_column)
            print("✓ Cleaned 'actual_price' column")
        
        # Step 4: Create category column
        print("\n[3/5] Creating category column...")
        if 'title' in df.columns:
            df['category'] = df['title'].apply(categorize_product)
            print("✓ Created 'category' column")
            
            # Show category distribution
            category_counts = df['category'].value_counts()
            print("\nCategory distribution:")
            for cat, count in category_counts.items():
                print(f"  - {cat}: {count}")
        else:
            print("WARNING: 'title' column not found, skipping category creation")
        
        # Step 5: Create combined column
        print("\n[4/5] Creating combined text column...")
        df['combined'] = df.apply(create_combined_text, axis=1)
        print("✓ Created 'combined' column")
        
        # Step 6: Save cleaned data
        print("\n[5/5] Saving cleaned data...")
        # Create output directory if it doesn't exist
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        df.to_csv(output_file, index=False)
        print(f"✓ Saved to: {output_file}")
        
        # Summary
        print("\n" + "="*50)
        print("SUCCESS! Data cleaning completed")
        print("="*50)
        print(f"Total rows processed: {len(df)}")
        print(f"Total columns: {len(df.columns)}")
        print(f"\nOutput file: {output_file}")
        
    except pd.errors.EmptyDataError:
        print("ERROR: The CSV file is empty")
    except pd.errors.ParserError:
        print("ERROR: Unable to parse CSV file. Check file format")
    except Exception as e:
        print(f"ERROR: An unexpected error occurred: {str(e)}")

if __name__ == "__main__":
    main()
