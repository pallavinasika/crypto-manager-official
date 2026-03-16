"""
Sentiment Analyzer Module - Analyzes market sentiment from news and social media.
Uses VADER and TextBlob for combined sentiment scoring.
"""

import re
import nltk
from typing import List, Dict, Optional
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from textblob import TextBlob
from utils.helpers import logger

# Ensure NLTK data is available
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt', quiet=True)

try:
    nltk.data.find('taggers/averaged_perceptron_tagger')
except LookupError:
    nltk.download('averaged_perceptron_tagger', quiet=True)

class SentimentAnalyzer:
    """
    Analyzes text sentiment specifically for cryptocurrency markets.
    """
    def __init__(self):
        self.vader = SentimentIntensityAnalyzer()
        
    def clean_text(self, text: str) -> str:
        """Standardize text for analysis."""
        # Remove URLs, mentions, and special characters but keep symbols like $BTC
        text = re.sub(r'http\S+', '', text)
        text = re.sub(r'@\S+', '', text)
        text = re.sub(r'[^a-zA-Z0-9\s\$]', '', text)
        return text.strip().lower()

    def analyze_text(self, text: str) -> Dict:
        """
        Analyze a single piece of text and return combined scores.
        """
        cleaned = self.clean_text(text)
        
        # VADER Score (Better for social media/short text)
        vader_scores = self.vader.polarity_scores(cleaned)
        
        # TextBlob Score (Better for formal news/longer text)
        blob = TextBlob(cleaned)
        
        # Combine scores (weighted)
        # Vader compound is -1 to 1. Blob polarity is -1 to 1.
        combined_score = (vader_scores['compound'] * 0.7) + (blob.sentiment.polarity * 0.3)
        
        return {
            "score": round(combined_score, 4),
            "label": "Bullish" if combined_score > 0.05 else "Bearish" if combined_score < -0.05 else "Neutral",
            "vader": vader_scores,
            "subjectivity": round(blob.sentiment.subjectivity, 4)
        }

    def aggregate_sentiment(self, texts: List[str]) -> Dict:
        """
        Analyze a list of texts and return the average sentiment.
        """
        if not texts:
            return {"score": 0.0, "label": "Neutral", "count": 0}
            
        scores = []
        for text in texts:
            scores.append(self.analyze_text(text)["score"])
            
        avg_score = sum(scores) / len(scores)
        
        return {
            "score": round(avg_score, 4),
            "label": "Bullish" if avg_score > 0.05 else "Bearish" if avg_score < -0.05 else "Neutral",
            "count": len(texts),
            "bullish_percentage": len([s for s in scores if s > 0.05]) / len(scores) * 100
        }

if __name__ == "__main__":
    analyzer = SentimentAnalyzer()
    test_texts = [
        "Bitcoin is crashing! Everything is going to zero.",
        "Ethereum ETF approval is imminent, price will moon.",
        "Market is trading sideways today with low volume."
    ]
    print(analyzer.aggregate_sentiment(test_texts))
