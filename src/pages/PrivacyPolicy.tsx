import { useEffect } from "react";

const PrivacyPolicy = () => {
  useEffect(() => {
    document.title = "Privacy Policy | Steck Precision Manufacturing";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Privacy Policy and data protection information for Steck - LGPD and GDPR compliant');
    }
  }, []);

  return (
    <div className="min-h-screen bg-background py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8 text-foreground">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-8 text-foreground">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Steck Indústria e Comércio Ltda. ("we", "our", or "us") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you 
                visit our website and use our services, in compliance with the Brazilian General Data Protection Law 
                (LGPD - Lei Geral de Proteção de Dados) and the European General Data Protection Regulation (GDPR).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-medium mb-3">2.1 Personal Information</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We may collect the following personal information:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Name and company name</li>
                <li>Email address and phone number</li>
                <li>Business address and contact information</li>
                <li>Technical specifications and project requirements</li>
                <li>Communication preferences</li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-6">2.2 Automatically Collected Information</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>IP address and browser type</li>
                <li>Device information and operating system</li>
                <li>Pages visited and time spent on site</li>
                <li>Referral source and clickstream data</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We use your information for the following purposes:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>To respond to your inquiries and provide customer support</li>
                <li>To process quotes and manufacturing requests</li>
                <li>To send technical documentation and product information</li>
                <li>To improve our website and services</li>
                <li>To comply with legal obligations and industry regulations</li>
                <li>To send marketing communications (with your consent)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Legal Basis for Processing (LGPD/GDPR)</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We process your personal data based on:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong>Consent:</strong> When you provide explicit consent for specific purposes</li>
                <li><strong>Contractual necessity:</strong> To fulfill our obligations in providing services</li>
                <li><strong>Legitimate interests:</strong> For business operations and improvements</li>
                <li><strong>Legal compliance:</strong> To comply with Brazilian and international regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Data Sharing and Disclosure</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We may share your information with:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Service providers who assist in our operations (email services, analytics)</li>
                <li>Manufacturing partners when necessary for project fulfillment</li>
                <li>Legal authorities when required by law</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                We do not sell your personal information to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Your Rights (LGPD/GDPR)</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong>Access:</strong> Request confirmation and access to your personal data</li>
                <li><strong>Correction:</strong> Request correction of incomplete or inaccurate data</li>
                <li><strong>Deletion:</strong> Request deletion of your data (right to be forgotten)</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service provider</li>
                <li><strong>Objection:</strong> Object to processing of your data</li>
                <li><strong>Restriction:</strong> Request restriction of processing</li>
                <li><strong>Withdraw consent:</strong> Withdraw consent at any time</li>
                <li><strong>Lodge a complaint:</strong> File a complaint with ANPD (Brazil) or relevant authority</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                To exercise these rights, contact us at: <a href="mailto:contato@steck.ind.br" className="text-primary hover:underline">contato@steck.ind.br</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Cookies and Tracking Technologies</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, 
                and understand user preferences. You can control cookie settings through our cookie consent banner 
                and your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement industry-standard security measures including encryption, access controls, and regular 
                security audits to protect your personal information. However, no method of transmission over the 
                internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your personal information only as long as necessary to fulfill the purposes outlined in 
                this policy, comply with legal obligations, resolve disputes, and enforce our agreements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. International Data Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your data may be processed in Brazil and other countries. We ensure appropriate safeguards are in 
                place for international transfers in compliance with LGPD and GDPR requirements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our services are not directed to individuals under 18 years of age. We do not knowingly collect 
                personal information from children.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy periodically. We will notify you of any material changes by posting 
                the new policy on this page with an updated "Last Updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
              <div className="text-muted-foreground leading-relaxed space-y-2">
                <p><strong>Data Controller:</strong> Steck Indústria e Comércio Ltda.</p>
                <p><strong>Address:</strong> Rua Independencia, 1750 - Bela Vista, Gaspar - SC, 89110-000, Brazil</p>
                <p><strong>Email:</strong> <a href="mailto:contato@steck.ind.br" className="text-primary hover:underline">contato@steck.ind.br</a></p>
                <p><strong>Phone:</strong> +55 (47) 3332-2686</p>
                <p><strong>DPO Contact:</strong> <a href="mailto:dpo@steck.ind.br" className="text-primary hover:underline">dpo@steck.ind.br</a></p>
              </div>
            </section>
          </div>
        </div>
      </div>
  );
};

export default PrivacyPolicy;
