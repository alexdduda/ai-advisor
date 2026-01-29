# backend/update_course_names.py
import pandas as pd
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

# Your Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Load enriched CSV
df = pd.read_csv('ClassAverageCrowdSourcing.csv')

print(f"Loaded {len(df)} rows from CSV")
print(f"Columns: {df.columns.tolist()}\n")

# Process each unique course
updated = 0
failed = 0

for _, row in df.iterrows():
    # Skip if no course_name
    if pd.isna(row['course_name']):
        continue
    
    subject = row['Course'][:4]  # First 4 chars = subject (ACCT, COMP, etc.)
    catalog = row['Course'][4:]   # Rest = catalog number (351, 202, etc.)
    course_name = row['course_name']
    
    try:
        # Update all rows with this subject + catalog combination
        result = supabase.table('courses').update({
            'course_name': course_name
        }).eq('subject', subject).eq('catalog', catalog).execute()
        
        if result.data:
            updated += len(result.data)
            print(f"✓ Updated {subject} {catalog}: {course_name}")
        
    except Exception as e:
        failed += 1
        print(f"✗ Error updating {subject} {catalog}: {e}")

print(f"\n{'='*60}")
print(f"SUMMARY")
print(f"{'='*60}")
print(f"Total rows updated: {updated}")
print(f"Failed updates: {failed}")