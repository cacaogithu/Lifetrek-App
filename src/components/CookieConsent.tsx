import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const COOKIE_CONSENT_KEY = "steck_cookie_consent";

export const CookieConsent = () => {
  const { t } = useLanguage();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-in slide-in-from-bottom duration-300">
      <Card className="max-w-4xl mx-auto bg-card border-border shadow-lg">
        <div className="p-4 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2 text-foreground">Cookie Notice</h3>
              <p className="text-sm text-muted-foreground mb-4">
                We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
                By clicking "Accept", you consent to our use of cookies. For more information, please read our{" "}
                <a href="/privacy-policy" className="text-primary hover:underline font-medium">
                  Privacy Policy
                </a>
                .
              </p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleAccept} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Accept All Cookies
                </Button>
                <Button onClick={handleDecline} variant="outline" size="sm">
                  Decline Non-Essential
                </Button>
                <a href="/privacy-policy" className="inline-flex items-center">
                  <Button variant="ghost" size="sm">
                    Learn More
                  </Button>
                </a>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0 h-8 w-8"
              onClick={handleDecline}
              aria-label="Close cookie notice"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
