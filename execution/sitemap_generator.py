#!/usr/bin/env python3
"""
XML Sitemap Generator
Generates sitemap.xml for all published blog posts + static pages

Usage:
    python execution/sitemap_generator.py --output public/sitemap.xml
"""

import os
import sys
import argparse
from datetime import datetime
from typing import List, Dict
import requests
from dotenv import load_dotenv
import xml.etree.ElementTree as ET
from xml.dom import minidom

load_dotenv()

SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
SUPABASE_ANON_KEY = os.getenv('VITE_SUPABASE_ANON_KEY')
SITE_URL = 'https://lifetrekmedical.com.br'


class SitemapGenerator:
    """Generates XML sitemap for SEO"""
    
    def __init__(self, site_url: str = SITE_URL):
        self.site_url = site_url.rstrip('/')
        self.static_pages = [
            {'loc': '/', 'priority': '1.0', 'changefreq': 'weekly'},
            {'loc': '/about', 'priority': '0.8', 'changefreq': 'monthly'},
            {'loc': '/what-we-do', 'priority': '0.8', 'changefreq': 'monthly'},
            {'loc': '/products', 'priority': '0.9', 'changefreq': 'monthly'},
            {'loc': '/capabilities', 'priority': '0.9', 'changefreq': 'monthly'},
            {'loc': '/clients', 'priority': '0.7', 'changefreq': 'monthly'},
            {'loc': '/contact', 'priority': '0.9', 'changefreq': 'monthly'},
            {'loc': '/blog', 'priority': '0.9', 'changefreq': 'weekly'},
        ]
    
    def fetch_published_posts(self) -> List[Dict]:
        """Fetch all published blog posts from Supabase"""
        try:
            response = requests.get(
                f'{SUPABASE_URL}/rest/v1/blog_posts',
                headers={
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': f'Bearer {SUPABASE_ANON_KEY}'
                },
                params={
                    'status': 'eq.published',
                    'select': 'slug,published_at,updated_at'
                }
            )
            
            if response.status_code == 200:
                posts = response.json()
                print(f"✅ Fetched {len(posts)} published posts")
                return posts
            else:
                print(f"❌ Error fetching posts: {response.status_code}")
                return []
                
        except Exception as e:
            print(f"❌ Database error: {str(e)}")
            return []
    
    def generate_sitemap_xml(self, blog_posts: List[Dict]) -> str:
        """Generate XML sitemap content"""
        # Create root element
        urlset = ET.Element('urlset')
        urlset.set('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
        
        # Add static pages
        for page in self.static_pages:
            url = ET.SubElement(urlset, 'url')
            
            loc = ET.SubElement(url, 'loc')
            loc.text = f"{self.site_url}{page['loc']}"
            
            lastmod = ET.SubElement(url, 'lastmod')
            lastmod.text = datetime.now().strftime('%Y-%m-%d')
            
            changefreq = ET.SubElement(url, 'changefreq')
            changefreq.text = page['changefreq']
            
            priority = ET.SubElement(url, 'priority')
            priority.text = page['priority']
        
        # Add blog posts
        for post in blog_posts:
            url = ET.SubElement(urlset, 'url')
            
            loc = ET.SubElement(url, 'loc')
            loc.text = f"{self.site_url}/blog/{post['slug']}"
            
            lastmod = ET.SubElement(url, 'lastmod')
            # Use updated_at if available, else published_at
            last_modified = post.get('updated_at') or post.get('published_at') or datetime.now().isoformat()
            lastmod.text = datetime.fromisoformat(last_modified.replace('Z', '+00:00')).strftime('%Y-%m-%d')
            
            changefreq = ET.SubElement(url, 'changefreq')
            changefreq.text = 'monthly'
            
            priority = ET.SubElement(url, 'priority')
            priority.text = '0.8'
        
        # Pretty print XML
        rough_string = ET.tostring(urlset, encoding='utf-8')
        reparsed = minidom.parseString(rough_string)
        pretty_xml = reparsed.toprettyxml(indent='  ', encoding='UTF-8')
        
        # Remove extra blank lines
        lines = [line for line in pretty_xml.decode('utf-8').split('\n') if line.strip()]
        return '\n'.join(lines)
    
    def save_sitemap(self, xml_content: str, output_path: str):
        """Save sitemap to file"""
        # Ensure directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(xml_content)
        
        print(f"✅ Sitemap saved to: {output_path}")
    
    def generate_and_save(self, output_path: str):
        """Main workflow: fetch posts, generate XML, save file"""
        print("\n🗺️  Generating XML Sitemap")
        print("="*60)
        
        # Fetch posts
        blog_posts = self.fetch_published_posts()
        
        # Generate XML
        print(f"📝 Generating sitemap with {len(self.static_pages)} static pages + {len(blog_posts)} blog posts")
        xml_content = self.generate_sitemap_xml(blog_posts)
        
        # Save file
        self.save_sitemap(xml_content, output_path)
        
        # Print file info
        file_size = os.path.getsize(output_path)
        print(f"📦 File size: {file_size:,} bytes")
        
        # Print summary
        total_urls = len(self.static_pages) + len(blog_posts)
        print(f"\n✅ Sitemap complete: {total_urls} URLs")
        print(f"   Static pages: {len(self.static_pages)}")
        print(f"   Blog posts:   {len(blog_posts)}")
        print(f"\n💡 Next steps:")
        print(f"   1. Submit to Google Search Console: {self.site_url}/sitemap.xml")
        print(f"   2. Update robots.txt: Sitemap: {self.site_url}/sitemap.xml")
        print()


def main():
    parser = argparse.ArgumentParser(description='Generate XML sitemap for Lifetrek Medical website')
    parser.add_argument('--output', type=str, default='public/sitemap.xml', help='Output file path')
    parser.add_argument('--url', type=str, default=SITE_URL, help='Base site URL')
    
    args = parser.parse_args()
    
    generator = SitemapGenerator(site_url=args.url)
    generator.generate_and_save(args.output)


if __name__ == '__main__':
    main()
