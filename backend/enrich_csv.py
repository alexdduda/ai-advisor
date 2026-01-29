#!/usr/bin/env python3
"""
Simple script to add course names to your CSV
No descriptions or professors - just the course titles
"""

import pandas as pd
import requests
from bs4 import BeautifulSoup
import time
import re

def fetch_course_name(course_code):
    """
    Fetch course name from McGill's course catalog
    Returns: course_name (string or None)
    """
    dept = re.match(r'([A-Z]+)', course_code).group(1)
    number = re.match(r'[A-Z]+(\d+)', course_code).group(1)
    
    # Try different academic years
    years = ['2024-2025', '2023-2024', '2022-2023', '2021-2022']
    
    for year in years:
        url = f"https://www.mcgill.ca/study/{year}/courses/{dept.lower()}-{number}"
        
        try:
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Get title
                title_elem = soup.find('h1', class_='page-title')
                if not title_elem:
                    title_elem = soup.find('h1')
                
                if title_elem:
                    title_text = title_elem.get_text(strip=True)
                    # Extract course name from format: "COMP 251 Algorithms and Data Structures (3 credits)"
                    match = re.search(rf'{dept}\s*{number}\s+(.+?)\s*\(', title_text)
                    if match:
                        return match.group(1).strip()
                    
        except:
            continue
    
    return None


def enrich_csv(input_file, output_file):
    """
    Add course_name column to the CSV
    """
    print("Loading CSV...")
    df = pd.read_csv(input_file)
    
    # Add course_name column if it doesn't exist
    if 'course_name' not in df.columns:
        df['course_name'] = None
    
    unique_courses = df['Course'].unique()
    
    print(f"\nProcessing {len(unique_courses)} unique courses")
    print(f"Estimated time: {len(unique_courses) * 2 / 60:.0f} minutes")
    print("Progress will be saved every 100 courses\n")
    
    course_names = {}
    successful = 0
    
    for i, course_code in enumerate(unique_courses, 1):
        print(f"[{i}/{len(unique_courses)}] {course_code}...", end=' ')
        
        # Fetch course name
        name = fetch_course_name(course_code)
        
        if name:
            print(f"✓ {name}")
            successful += 1
        else:
            print("✗ Not found")
        
        course_names[course_code] = name
        
        # Be nice to McGill's servers
        time.sleep(0.1)
        
        # Save progress every 100 courses
        if i % 100 == 0:
            print(f"\n[CHECKPOINT {i}/{len(unique_courses)}]")
            print(f"Success rate: {(successful/i)*100:.1f}%")
            print("Saving progress...\n")
            
            # Map course names to all rows
            for course, name in course_names.items():
                mask = df['Course'] == course
                df.loc[mask, 'course_name'] = name
            
            df.to_csv(f'progress_{i}.csv', index=False)
    
    # Final mapping
    print("\nMapping course names to all rows...")
    for course, name in course_names.items():
        mask = df['Course'] == course
        df.loc[mask, 'course_name'] = name
    
    # Save final file
    df.to_csv(output_file, index=False)
    
    # Print statistics
    print("\n" + "="*70)
    print("COMPLETE!")
    print("="*70)
    print(f"Total rows in CSV: {len(df):,}")
    print(f"Unique courses: {len(unique_courses):,}")
    print(f"Course names found: {successful:,}")
    print(f"Success rate: {(successful/len(unique_courses))*100:.1f}%")
    print(f"\nRows with course names: {df['course_name'].notna().sum():,}")
    print(f"\nSaved to: {output_file}")
    
    # Show sample
    print("\nSample of enriched data:")
    sample = df[df['course_name'].notna()].head(10)
    print(sample[['Course', 'course_name', 'Term Name', 'Class Ave']])


if __name__ == "__main__":
    import sys
    import os
    
    if not os.path.exists('ClassAverageCrowdSourcing.csv'):
        print("ERROR: ClassAverageCrowdSourcing.csv not found!")
        sys.exit(1)
    
    print("="*70)
    print("McGill Course Name Enrichment")
    print("="*70)
    print("\nThis will add course names to all 2,170 courses")
    print("Estimated time: ~72 minutes")
    print("Progress will be saved every 100 courses")
    
    proceed = input("\nProceed? (y/n): ").strip().lower()
    
    if proceed == 'y':
        enrich_csv('ClassAverageCrowdSourcing.csv', 'courses_enriched.csv')
        
        print("\n" + "="*70)
        print("ALL DONE!")
        print("="*70)
        print("\nYour enriched CSV is ready: courses_enriched.csv")
        print("The 'course_name' column has been added to your data.")
    else:
        print("Cancelled.")