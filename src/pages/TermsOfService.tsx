import { useEffect } from "react";

const TermsOfService = () => {
  useEffect(() => {
    document.title = "Terms of Service | Steck Precision Manufacturing";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Terms of Service for Steck precision manufacturing services');
    }
  }, []);

  return (
    <div className="min-h-screen bg-background py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8 text-foreground">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-8 text-foreground">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using the Steck website and services, you accept and agree to be bound by these 
                Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Description of Services</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Steck Indústria e Comércio Ltda. provides precision manufacturing services including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>CNC machining and Swiss-type turning</li>
                <li>Medical and dental implant manufacturing</li>
                <li>Orthopedic component production</li>
                <li>Custom precision parts manufacturing</li>
                <li>Quality control and metrology services</li>
                <li>Technical consultation and project development</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                When using our services, you agree to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Provide accurate and complete information</li>
                <li>Maintain the confidentiality of any account credentials</li>
                <li>Use the website and services only for lawful purposes</li>
                <li>Not interfere with or disrupt the website or services</li>
                <li>Not attempt to gain unauthorized access to our systems</li>
                <li>Respect all applicable intellectual property rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Quotes and Orders</h2>
              <h3 className="text-xl font-medium mb-3">4.1 Quote Requests</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Quote requests submitted through our website are non-binding. All quotes are subject to review and 
                confirmation by our technical team.
              </p>

              <h3 className="text-xl font-medium mb-3">4.2 Order Acceptance</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Orders are subject to acceptance by Steck. We reserve the right to refuse any order for any reason, 
                including but not limited to technical feasibility, capacity constraints, or compliance requirements.
              </p>

              <h3 className="text-xl font-medium mb-3">4.3 Specifications</h3>
              <p className="text-muted-foreground leading-relaxed">
                You are responsible for providing accurate technical specifications. Any errors in provided 
                specifications may result in additional costs or delays.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Pricing and Payment</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>All prices are quoted in Brazilian Reais (BRL) unless otherwise specified</li>
                <li>Prices are subject to change without notice until order confirmation</li>
                <li>Payment terms will be specified in individual order agreements</li>
                <li>Late payments may incur interest charges as permitted by law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Quality and Compliance</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Steck maintains certifications including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>ISO 13485:2016 for medical device manufacturing</li>
                <li>ANVISA compliance for Brazilian medical device regulations</li>
                <li>Cleanroom facilities meeting ISO 7 standards</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                All products are manufactured to meet applicable quality standards and regulatory requirements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
              <h3 className="text-xl font-medium mb-3">7.1 Our Content</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                All content on this website, including text, graphics, logos, images, and software, is the property 
                of Steck or its licensors and is protected by copyright and other intellectual property laws.
              </p>

              <h3 className="text-xl font-medium mb-3">7.2 Your Designs</h3>
              <p className="text-muted-foreground leading-relaxed">
                You retain all intellectual property rights to designs and specifications you provide. We will not 
                use your proprietary information for any purpose other than fulfilling your orders without your 
                explicit consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Confidentiality</h2>
              <p className="text-muted-foreground leading-relaxed">
                We treat all customer information, technical specifications, and project details as confidential. 
                We will not disclose such information to third parties except as necessary to fulfill orders or 
                as required by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Warranties and Disclaimers</h2>
              <h3 className="text-xl font-medium mb-3">9.1 Product Warranty</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                We warrant that products will conform to agreed specifications. Specific warranty terms will be 
                provided in individual order agreements.
              </p>

              <h3 className="text-xl font-medium mb-3">9.2 Website Disclaimer</h3>
              <p className="text-muted-foreground leading-relaxed">
                This website is provided "as is" without warranties of any kind. We do not guarantee that the 
                website will be error-free or uninterrupted.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                To the maximum extent permitted by law, Steck shall not be liable for any indirect, incidental, 
                special, or consequential damages arising from the use of our website or services. Our total 
                liability shall not exceed the amount paid for the specific product or service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Force Majeure</h2>
              <p className="text-muted-foreground leading-relaxed">
                We shall not be liable for any failure or delay in performance due to circumstances beyond our 
                reasonable control, including but not limited to natural disasters, government actions, labor 
                disputes, or material shortages.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to terminate or suspend access to our services immediately, without prior 
                notice, for any breach of these Terms of Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">13. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms of Service shall be governed by and construed in accordance with the laws of Brazil. 
                Any disputes shall be subject to the exclusive jurisdiction of the courts of Gaspar, Santa Catarina, 
                Brazil.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">14. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms of Service at any time. Changes will be effective 
                immediately upon posting to this page. Your continued use of our services constitutes acceptance 
                of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">15. Contact Information</h2>
              <div className="text-muted-foreground leading-relaxed space-y-2">
                <p><strong>Company:</strong> Steck Indústria e Comércio Ltda.</p>
                <p><strong>Address:</strong> Rua Independencia, 1750 - Bela Vista, Gaspar - SC, 89110-000, Brazil</p>
                <p><strong>Email:</strong> <a href="mailto:contato@steck.ind.br" className="text-primary hover:underline">contato@steck.ind.br</a></p>
                <p><strong>Phone:</strong> +55 (47) 3332-2686</p>
              </div>
            </section>

            <section className="mt-12 pt-8 border-t border-border">
              <p className="text-muted-foreground text-sm">
                By using our website and services, you acknowledge that you have read, understood, and agree to be 
                bound by these Terms of Service and our Privacy Policy.
              </p>
            </section>
          </div>
        </div>
      </div>
  );
};

export default TermsOfService;
