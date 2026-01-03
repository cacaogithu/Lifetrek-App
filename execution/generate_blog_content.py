#!/usr/bin/env python3
"""
Blog Content Generation Script
Orchestrates AI-powered blog post generation for Lifetrek Medical

Usage:
    python execution/generate_blog_content.py --topics config/blog_topics.csv --count 4
    python execution/generate_blog_content.py --topic "ISO 13485 explicado" --keywords "iso 13485,certificação"
"""

import os
import sys
import csv
import json
import argparse
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
SUPABASE_ANON_KEY = os.getenv('VITE_SUPABASE_ANON_KEY') or os.getenv('VITE_SUPABASE_PUBLISHABLE_KEY')
PERPLEXITY_API_KEY = os.getenv('PERPLEXITY_API_KEY')


class BlogGenerator:
    """Generates SEO-optimized blog posts using AI and Supabase"""
    
    def __init__(self):
        # Environment variables
        self.supabase_url = os.getenv('VITE_SUPABASE_URL')
        # Prefer Service Role Key for backend scripts to bypass RLS
        self.supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('VITE_SUPABASE_ANON_KEY') or os.getenv('VITE_SUPABASE_PUBLISHABLE_KEY')
        self.perplexity_key = os.getenv('PERPLEXITY_API_KEY')
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("Missing Supabase credentials in .env")
    
    def load_topics_from_csv(self, csv_path: str, count: int = 4) -> List[Dict]:
        """Load blog topics from CSV file"""
        topics = []
        
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for i, row in enumerate(reader):
                if i >= count:
                    break
                topics.append({
                    'topic': row['topic'],
                    'keywords': row['keywords'].split(',') if row.get('keywords') else [],
                    'category': row.get('category', 'educational'),
                    'priority': row.get('priority', 'medium')
                })
        
        return topics
    
    def research_topic_with_perplexity(self, topic: str) -> Optional[str]:
        """Use Perplexity API for market research"""
        if not self.perplexity_key:
            print("⚠️  Perplexity API key not found, skipping research phase")
            return None
        
        print(f"  🔍 Researching topic with Perplexity AI...")
        
        try:
            response = requests.post(
                'https://api.perplexity.ai/chat/completions',
                headers={
                    'Authorization': f'Bearer {self.perplexity_key}',
                    'Content-Type': 'application/json'
                },
                json={
                    'model': 'sonar',
                    'messages': [{
                        'role': 'user',
                        'content': f'''Pesquise informações recentes sobre: {topic}
                        
Foque em:
- Mercado brasileiro de dispositivos médicos
- Regulamentações ANVISA atualizadas
- Tendências da indústria em 2025
- Dados técnicos e especificações relevantes
- Benchmarks e melhores práticas

Forneça fontes confiáveis e informações atualizadas.'''
                    }]
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                research_context = result['choices'][0]['message']['content']
                print(f"  ✅ Research completed ({len(research_context)} chars)")
                return research_context
            else:
                print(f"  ⚠️  Perplexity API error: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"  ⚠️  Perplexity research failed: {str(e)}")
            return None
    
    def generate_post_via_edge_function(self, topic: str, keywords: List[str], 
                                       category: str, research_context: Optional[str] = None) -> Dict:
        """Call Supabase Edge Function to generate blog post"""
        print(f"  🤖 Generating content with AI...")
        
        try:
            response = requests.post(
                f'{self.supabase_url}/functions/v1/generate-blog-post',
                headers={
                    'Authorization': f'Bearer {self.supabase_key}',
                    'Content-Type': 'application/json'
                },
                json={
                    'topic': topic,
                    'keywords': keywords,
                    'category': category,
                    'research_context': research_context
                },
                timeout=60
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"  ✅ Content generated: '{data.get('title', 'Unknown')}' ({len(data.get('content', ''))} chars)")
                return data
            else:
                print(f"  ❌ Edge Function error: {response.status_code} - {response.text}")
                raise Exception(f"Edge Function failed: {response.status_code}")
                
        except Exception as e:
            print(f"  ❌ Generation failed: {str(e)}")
            raise
    
    def slugify(self, text: str) -> str:
        """Generate URL-friendly slug from title"""
        import unicodedata
        import re
        
        # Normalize to NFKD form and filter non-ASCII characters
        text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('ascii')
        
        # Convert to lowercase
        text = text.lower()
        
        # Replace non-alphanumeric characters with hyphens
        text = re.sub(r'[^a-z0-9\s-]', '', text)
        
        # Replace whitespace and hyphens with a single hyphen
        text = re.sub(r'[-\s]+', '-', text).strip('-')
        
        return text

    def get_category_id(self, category_slug: str) -> Optional[str]:
        """Get category UUID from slug"""
        try:
            # Try fetching all categories if specific one fails
            response = requests.get(
                f'{self.supabase_url}/rest/v1/blog_categories',
                headers={
                    'apikey': self.supabase_key,
                    'Authorization': f'Bearer {self.supabase_key}'
                },
                params={'select': 'id,slug'}
            )
            
            if response.status_code == 200:
                categories = response.json()
                # Try exact match
                for cat in categories:
                    if cat['slug'] == category_slug:
                        return cat['id']
                # Try case-insensitive match
                for cat in categories:
                    if cat['slug'].lower() == category_slug.lower():
                        return cat['id']
            
            print(f"  ⚠️  Category '{category_slug}' not found, using NULL")
            return None
            
        except Exception as e:
            print(f"  ⚠️  Error fetching category: {str(e)}")
            return None
    
    def save_to_database(self, post_data: Dict, category_slug: str) -> bool:
        """Save generated post to Supabase"""
        print(f"  💾 Saving to database...")
        
        # Get category ID
        category_id = self.get_category_id(category_slug)
        
        if 'slug' not in post_data or not post_data['slug']:
            post_data['slug'] = self.slugify(post_data['title'])
            
        # Prepare post data
        db_post = {
            'title': post_data['title'],
            'slug': post_data['slug'],
            'content': post_data['content'],
            'excerpt': post_data.get('excerpt'),
            'category_id': category_id,
            'seo_title': post_data.get('seo_title'),
            'seo_description': post_data.get('seo_description'),
            'keywords': post_data.get('keywords', []),
            'tags': post_data.get('tags', []),
            'status': 'pending_review',  # Require human approval
            'ai_generated': True,
            'news_sources': post_data.get('sources', [])
        }
        
        try:
            response = requests.post(
                f'{self.supabase_url}/rest/v1/blog_posts',
                headers={
                    'apikey': self.supabase_key,
                    'Authorization': f'Bearer {self.supabase_key}',
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                json=db_post
            )
            
            if response.status_code == 201:
                saved_post = response.json()[0]
                print(f"  ✅ Saved to database (ID: {saved_post['id']}, slug: {saved_post['slug']})")
                return True
            else:
                print(f"  ❌ Database save failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"  ❌ Database error: {str(e)}")
            return False
    
    def save_to_markdown(self, post_data: Dict, output_dir: str = '.tmp/blog-drafts'):
        """Save generated post as Markdown file (backup)"""
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        
        filename = f"{output_dir}/{post_data['slug']}.md"
        
        markdown_content = f"""---
title: {post_data['title']}
slug: {post_data['slug']}
seo_title: {post_data.get('seo_title', '')}
seo_description: {post_data.get('seo_description', '')}
keywords: {', '.join(post_data.get('keywords', []))}
tags: {', '.join(post_data.get('tags', []))}
category: {post_data.get('category', '')}
status: pending_review
ai_generated: true
generated_at: {datetime.now().isoformat()}
---

<!-- 
STRATEGY BRIEF:
{json.dumps(post_data.get('strategy_brief', {}), indent=2, ensure_ascii=False)} 
-->

![Header Image]({post_data.get('image_url', '')} "Header Image")

{post_data['content']}
"""
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
        
        print(f"  📄 Saved markdown: {filename}")
    
    def generate_single_post(self, topic: str, keywords: List[str], category: str = 'educacional') -> bool:
        """Generate a single blog post"""
        print(f"\n{'='*60}")
        print(f"📝 Generating: {topic}")
        print(f"{'='*60}")
        
        try:
            # Step 1: Research (optional)
            research_context = self.research_topic_with_perplexity(topic)
            
            # Step 2: Generate content
            post_data = self.generate_post_via_edge_function(
                topic=topic,
                keywords=keywords,
                category=category,
                research_context=research_context
            )
            
            # Step 3: Save to database
            db_success = self.save_to_database(post_data, category)
            
            # Step 4: Save markdown backup
            self.save_to_markdown(post_data)
            
            if db_success:
                print(f"✅ SUCCESS: Post '{post_data['title']}' created!\n")
                return True
            else:
                print(f"⚠️  WARNING: Post generated but database save failed\n")
                return False
                
        except Exception as e:
            print(f"❌ FAILED: {str(e)}\n")
            return False
    
    def generate_batch(self, topics: List[Dict]) -> Dict:
        """Generate multiple blog posts"""
        print(f"\n🚀 Starting batch generation: {len(topics)} posts")
        print(f"{'='*60}\n")
        
        results = {
            'total': len(topics),
            'success': 0,
            'failed': 0,
            'posts': []
        }
        
        for i, topic_data in enumerate(topics, 1):
            print(f"[{i}/{len(topics)}] ", end='')
            
            success = self.generate_single_post(
                topic=topic_data['topic'],
                keywords=topic_data['keywords'],
                category=topic_data['category']
            )
            
            if success:
                results['success'] += 1
            else:
                results['failed'] += 1
            
            results['posts'].append({
                'topic': topic_data['topic'],
                'success': success
            })
        
        # Print summary
        print(f"\n{'='*60}")
        print(f"📊 BATCH COMPLETE")
        print(f"{'='*60}")
        print(f"Total:   {results['total']}")
        print(f"✅ Success: {results['success']}")
        print(f"❌ Failed:  {results['failed']}")
        print(f"\n💡 Next step: Review posts in /admin/blog and publish approved ones\n")
        
        return results


def main():
    parser = argparse.ArgumentParser(description='Generate blog content for Lifetrek Medical')
    parser.add_argument('--topics', help='Path to CSV file with topics')
    parser.add_argument('--count', type=int, default=4, help='Number of posts to generate from CSV')
    parser.add_argument('--topic', help='Single topic to generate')
    parser.add_argument('--keywords', help='Comma-separated keywords for single topic')
    parser.add_argument('--category', default='educacional', help='Category for single topic')
    parser.add_argument('--news', action='store_true', help='Generate a weekly news update based on recent events')
    
    args = parser.parse_args()
    
    generator = BlogGenerator()
    
    if args.news:
        generator.execute_news_generation()
        
    elif args.topic:
        keywords = [k.strip() for k in args.keywords.split(',')] if args.keywords else []
        generator.generate_single_post(args.topic, keywords, args.category)
        
    elif args.topics:
        topics = generator.load_topics_from_csv(args.topics, args.count)
        
        print(f"🚀 Starting batch generation: {len(topics)} posts")
        
        success_count = 0
        fail_count = 0
        
        for t in topics:
            if generator.generate_single_post(t['topic'], t['keywords'], t['category']):
                success_count += 1
            else:
                fail_count += 1
        
        print(f"\n{'='*60}")
        print(f"📊 BATCH COMPLETE")
        print(f"{'='*60}")
        print(f"Total:   {len(topics)}")
        print(f"✅ Success: {success_count}")
        print(f"❌ Failed:  {fail_count}")
        
        if fail_count > 0:
            sys.exit(1)
            
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == '__main__':
    main()
