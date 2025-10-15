// Organization Schema
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  "name": "Lifetrek Medical",
  "description": "Precision medical device manufacturing with Swiss CNC technology, ISO 13485 certified, specialized in orthopedic, dental, and surgical instruments",
  "url": "https://lifetrek-global-site.lovable.app",
  "logo": "https://lifetrek-global-site.lovable.app/logo.png",
  "image": "https://lifetrek-global-site.lovable.app/og-image.jpg",
  "telephone": "+55-19-3936-7193",
  "email": "contact@lifetrek-medical.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Av. Francisco de Paula Leite, 2155 - Jd. Sta. Genebra",
    "addressLocality": "Campinas",
    "addressRegion": "SP",
    "postalCode": "13080-655",
    "addressCountry": "BR"
  },
  "sameAs": [
    "https://www.linkedin.com/company/lifetrek-medical"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+55-19-3936-7193",
    "contactType": "Sales",
    "email": "contact@lifetrek-medical.com",
    "availableLanguage": ["English", "Portuguese"]
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "30"
  }
};

// Product Schema for Medical Implants
export const medicalImplantsSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Medical Orthopedic Implants",
  "description": "Precision-manufactured medical implants including trauma fixation plates, spinal fusion systems, and orthopedic screws",
  "brand": {
    "@type": "Brand",
    "name": "Lifetrek Medical"
  },
  "category": "Medical Devices",
  "offers": {
    "@type": "Offer",
    "availability": "https://schema.org/InStock",
    "priceCurrency": "USD"
  }
};

// Product Schema for Dental Implants
export const dentalImplantsSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Dental Implants and Components",
  "description": "Titanium dental implants, angled abutments, and precision surgical instruments for dental applications",
  "brand": {
    "@type": "Brand",
    "name": "Lifetrek Medical"
  },
  "category": "Dental Devices",
  "offers": {
    "@type": "Offer",
    "availability": "https://schema.org/InStock",
    "priceCurrency": "USD"
  }
};

// Product Schema for Surgical Instruments
export const surgicalInstrumentsSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Surgical Instruments",
  "description": "Custom surgical instruments including powered drills, precision reamers, and surgical guide systems",
  "brand": {
    "@type": "Brand",
    "name": "Lifetrek Medical"
  },
  "category": "Surgical Equipment",
  "offers": {
    "@type": "Offer",
    "availability": "https://schema.org/InStock",
    "priceCurrency": "USD"
  }
};

// FAQ Schema
export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What certifications does Lifetrek Medical have?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Lifetrek Medical is ISO 13485:2016 certified and ANVISA registered, ensuring compliance with international medical device manufacturing standards."
      }
    },
    {
      "@type": "Question",
      "name": "What types of medical devices does Lifetrek manufacture?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We manufacture orthopedic implants, dental implants, surgical instruments, and veterinary medical devices using Swiss CNC technology."
      }
    },
    {
      "@type": "Question",
      "name": "What is the lead time for custom medical device manufacturing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Lead times vary based on project complexity. Contact us for a detailed quote and timeline for your specific requirements."
      }
    }
  ]
};

// Breadcrumb Schema Generator
export const generateBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});
