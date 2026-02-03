"""
Complete CSV Enrichment Pipeline - UPDATED WITH WORKING RMP SCRAPING
1. Loads your CSV
2. Scrapes instructor FULL NAMES from McGill course catalog
3. Fetches RateMyProfessor ratings via direct web scraping
4. Saves enriched CSV
5. Uploads to Supabase

Run: python complete_enrichment_final.py
"""
import pandas as pd
import requests
from bs4 import BeautifulSoup
import time
import logging
import os
from dotenv import load_dotenv
from supabase import create_client
import re
import json
from urllib.parse import quote

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# RateMyProfessor Config
MCGILL_SCHOOL_ID = 1439


def extract_course_code(course_str):
    """Extract subject and catalog from 'COMP202' -> ('COMP', '202')"""
    match = re.match(r'([A-Z]+)(\d+)', course_str)
    if match:
        return match.group(1), match.group(2)
    return None, None


def scrape_course_instructor_full_name(subject, catalog):
    """
    Scrape FULL instructor name from McGill's course catalog
    Returns: full instructor name (First Last) or None
    """
    years = ['2024-2025', '2023-2024', '2022-2023', '2021-2022']
    
    for year in years:
        url = f"https://www.mcgill.ca/study/{year}/courses/{subject.lower()}-{catalog}"
        
        try:
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                text = soup.get_text()
                
                # Pattern 1: "Instructor(s): FirstName LastName"
                full_name_match = re.search(r'Instructors?:\s*([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?[A-Z][a-z]+)', text)
                if full_name_match:
                    instructor = full_name_match.group(1).strip()
                    instructor = ' '.join(instructor.split())
                    if ' ' in instructor and len(instructor) < 50:
                        return instructor
                
                # Pattern 2: "LastName, FirstName" - convert to "FirstName LastName"
                comma_name_match = re.search(r'Instructors?:\s*([A-Z][a-z]+),\s*([A-Z][a-z]+)', text)
                if comma_name_match:
                    last = comma_name_match.group(1).strip()
                    first = comma_name_match.group(2).strip()
                    instructor = f"{first} {last}"
                    return instructor
                
                # Pattern 3: Look in specific HTML elements
                prof_div = soup.find('div', class_='views-field-field-prof')
                if prof_div:
                    text_content = prof_div.get_text(strip=True)
                    name_match = re.search(r'([A-Z][a-z]+\s+[A-Z][a-z]+)', text_content)
                    if name_match:
                        instructor = name_match.group(1).strip()
                        return instructor
        
        except Exception as e:
            logger.debug(f"Error scraping {subject} {catalog} for year {year}: {e}")
            continue
    
    return None


def search_professor_on_rmp(professor_name, school_id=MCGILL_SCHOOL_ID):
    """
    Search for a professor on RMP via direct web scraping
    Returns: dict with rating info or None
    """
    if not professor_name or professor_name.lower() in ['tba', 'staff', 'unknown', '']:
        return None
    
    try:
        search_query = quote(professor_name)
        search_url = f"https://www.ratemyprofessors.com/search/professors/{school_id}?q={search_query}"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        }
        
        response = requests.get(search_url, headers=headers, timeout=15)
        
        if response.status_code != 200:
            return None
        
        soup = BeautifulSoup(response.content, 'html.parser')
        scripts = soup.find_all('script')
        
        for script in scripts:
            if script.string and 'window.__RELAY_STORE__' in script.string:
                json_match = re.search(r'window\.__RELAY_STORE__\s*=\s*({.+?});', script.string, re.DOTALL)
                if json_match:
                    try:
                        data = json.loads(json_match.group(1))
                        
                        for key, value in data.items():
                            if isinstance(value, dict) and value.get('__typename') == 'Teacher':
                                first_name = value.get('firstName', '')
                                last_name = value.get('lastName', '')
                                full_name = f"{first_name} {last_name}".strip()
                                
                                if professor_name.lower() in full_name.lower() or full_name.lower() in professor_name.lower():
                                    rating = value.get('avgRating')
                                    difficulty = value.get('avgDifficulty')
                                    num_ratings = value.get('numRatings', 0)
                                    would_take_again = value.get('wouldTakeAgainPercent')
                                    
                                    return {
                                        'rmp_id': value.get('legacyId'),
                                        'rmp_first_name': first_name,
                                        'rmp_last_name': last_name,
                                        'rmp_rating': round(float(rating), 2) if rating else None,
                                        'rmp_difficulty': round(float(difficulty), 2) if difficulty else None,
                                        'rmp_num_ratings': int(num_ratings) if num_ratings else 0,
                                        'rmp_would_take_again': round(float(would_take_again)) if would_take_again else None,
                                    }
                    except (json.JSONDecodeError, ValueError) as e:
                        continue
        
        return None
        
    except Exception as e:
        logger.debug(f"Error fetching rating for {professor_name}: {e}")
        return None


def main():
    print("\n" + "="*60)
    print("MCGILL COURSE DATA ENRICHMENT PIPELINE")
    print("="*60 + "\n")
    
    # Step 1: Load CSV
    print("📂 Step 1: Loading CSV...")
    df = pd.read_csv('ClassAverageCrowdSourcing.csv')
    print(f"✓ Loaded {len(df)} rows")
    print(f"✓ Columns: {df.columns.tolist()}")
    
    # Step 2: Extract unique courses
    print("\n📊 Step 2: Extracting unique courses...")
    df['subject'] = df['Course'].apply(lambda x: extract_course_code(x)[0])
    df['catalog'] = df['Course'].apply(lambda x: extract_course_code(x)[1])
    
    unique_courses = df[['Course', 'subject', 'catalog']].drop_duplicates()
    print(f"✓ Found {len(unique_courses)} unique courses")
    
    # Step 3: Scrape FULL NAMES from McGill
    print("\n🌐 Step 3: Scraping FULL instructor names from McGill...")
    print("⏱️  This will take a while (rate limiting to be respectful)...")
    print("💡 Tip: Grab a coffee! ☕")
    
    course_instructors = {}
    successful_scrapes = 0
    
    for idx, row in unique_courses.iterrows():
        course = row['Course']
        subject = row['subject']
        catalog = row['catalog']
        
        if not subject or not catalog:
            continue
        
        print(f"[{successful_scrapes + 1}/{len(unique_courses)}] {course}...", end=" ")
        
        instructor = scrape_course_instructor_full_name(subject, catalog)
        
        if instructor:
            course_instructors[course] = instructor
            successful_scrapes += 1
            print(f"✓ {instructor}")
        else:
            print("✗ Not found")
    
    print(f"\n📈 Scraping results: {successful_scrapes}/{len(unique_courses)} courses with full names")
    
    # Step 4: Get RateMyProfessor ratings via web scraping
    print("\n⭐ Step 4: Fetching RateMyProfessor ratings...")
    
    unique_instructors = set(course_instructors.values())
    print(f"✓ Found {len(unique_instructors)} unique instructors")
    
    instructor_ratings = {}
    ratings_found = 0
    
    for i, instructor in enumerate(unique_instructors, 1):
        print(f"[{i}/{len(unique_instructors)}] {instructor}...", end=" ")
        
        rating = search_professor_on_rmp(instructor)
        
        if rating:
            instructor_ratings[instructor] = rating
            ratings_found += 1
            print(f"✓ {rating['rmp_rating']}/5.0 ({rating['rmp_num_ratings']} ratings)")
        else:
            print("✗ Not found on RMP")
        
        time.sleep(2)  # Rate limit
    
    print(f"\n📊 Rating results: {ratings_found}/{len(unique_instructors)} found on RateMyProfessor")
    
    # Step 5: Enrich dataframe
    print("\n📝 Step 5: Enriching dataframe...")
    
    df['instructor'] = df['Course'].map(course_instructors)
    df['rmp_rating'] = df['instructor'].map(lambda x: instructor_ratings.get(x, {}).get('rmp_rating') if x else None)
    df['rmp_difficulty'] = df['instructor'].map(lambda x: instructor_ratings.get(x, {}).get('rmp_difficulty') if x else None)
    df['rmp_num_ratings'] = df['instructor'].map(lambda x: instructor_ratings.get(x, {}).get('rmp_num_ratings') if x else None)
    df['rmp_would_take_again'] = df['instructor'].map(lambda x: instructor_ratings.get(x, {}).get('rmp_would_take_again') if x else None)
    
    print("✓ Added columns: instructor, rmp_rating, rmp_difficulty, rmp_num_ratings, rmp_would_take_again")
    
    # Step 6: Save enriched CSV
    output_file = 'ClassAverageCrowdSourcing_Enriched.csv'
    df.to_csv(output_file, index=False)
    print(f"\n💾 Step 6: Saved to {output_file}")
    
    # Step 7: Show statistics
    print("\n" + "="*60)
    print("ENRICHMENT STATISTICS")
    print("="*60)
    print(f"Total rows: {len(df)}")
    print(f"Rows with instructor: {df['instructor'].notna().sum()} ({df['instructor'].notna().sum() / len(df) * 100:.1f}%)")
    print(f"Rows with RMP rating: {df['rmp_rating'].notna().sum()} ({df['rmp_rating'].notna().sum() / len(df) * 100:.1f}%)")
    
    # Show sample
    print("\n📋 Sample of enriched data:")
    sample = df[df['rmp_rating'].notna()].head(5)
    if len(sample) > 0:
        for _, row in sample.iterrows():
            print(f"  {row['Course']}: {row['instructor']} - {row['rmp_rating']}/5.0")
    else:
        print("  (No courses with ratings found)")
    
    # Step 8: Ask about uploading to Supabase
    print("\n" + "="*60)
    print("NEXT STEP: Upload to Supabase")
    print("="*60)
    print("\nDo you want to upload this enriched data to Supabase now?")
    print("This will REPLACE your current courses table.")
    
    response = input("\nType 'yes' to proceed: ").strip().lower()
    
    if response == 'yes':
        upload_to_supabase(df)
    else:
        print("\n✓ Skipped Supabase upload")
        print(f"✓ You can upload manually later using: {output_file}")


def upload_to_supabase(df):
    """Upload enriched data to Supabase"""
    print("\n🚀 Uploading to Supabase...")
    
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
    
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("❌ Error: SUPABASE_URL or SUPABASE_SERVICE_KEY not found in .env")
        return
    
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Delete existing data
    print("🗑️  Deleting existing courses...")
    supabase.table('courses').delete().neq('id', 0).execute()
    
    # Prepare data for upload
    print("📦 Preparing data...")
    records = []
    
    for _, row in df.iterrows():
        record = {
            'subject': row['subject'],
            'catalog': row['catalog'],
            'course_name': row.get('course_name'),
            'title': row.get('course_name'),
            'term': row.get('Term Name'),
            'average': float(row['Class Ave']) if pd.notna(row['Class Ave']) else None,
            'instructor': row.get('instructor'),
            'credits': float(row['Credits']) if pd.notna(row.get('Credits')) else None,
            'rmp_rating': float(row['rmp_rating']) if pd.notna(row.get('rmp_rating')) else None,
            'rmp_difficulty': float(row['rmp_difficulty']) if pd.notna(row.get('rmp_difficulty')) else None,
            'rmp_num_ratings': int(row['rmp_num_ratings']) if pd.notna(row.get('rmp_num_ratings')) else None,
            'rmp_would_take_again': float(row['rmp_would_take_again']) if pd.notna(row.get('rmp_would_take_again')) else None,
        }
        records.append(record)
    
    # Upload in batches
    print(f"⬆️  Uploading {len(records)} records...")
    batch_size = 100
    
    for i in range(0, len(records), batch_size):
        batch = records[i:i + batch_size]
        supabase.table('courses').insert(batch).execute()
        print(f"  ✓ Uploaded {min(i + batch_size, len(records))}/{len(records)}")
    
    print("\n✅ Upload complete!")
    print("✓ Your courses table now has instructor and rating data")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
        print("✓ Progress has been saved to CSV files")
    except Exception as e:
        logger.exception("Error in enrichment pipeline")
        print(f"\n❌ Error: {e}")