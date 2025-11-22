import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <section className="glass rounded-2xl p-6 md:p-10">
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-6 text-green-900">
        Terms and Conditions
      </h1>
      
      <div className="space-y-6 text-green-900">
        <div>
          <h2 className="text-xl font-semibold mb-3 text-green-900">1. Acceptance of Terms</h2>
          <p>
            By accessing and using 3Layered's services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our services.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-green-900">2. Service Description</h2>
          <p>
            3Layered provides 3D printing services including custom prints, functional products, artistic pieces, and prototypes. We use PLA+, Premium PET-G, and Durable ABS materials.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-green-900">3. Custom Orders</h2>
          <p>
            Custom print orders are subject to feasibility assessment. We reserve the right to decline orders that are technically unfeasible or violate intellectual property rights. Once production begins, custom orders cannot be cancelled.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-green-900">4. Pricing and Payment</h2>
          <p>
            All prices are listed in Indian Rupees (INR) and are subject to change without notice. Payment is required before production begins. We accept various payment methods as displayed at checkout.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-green-900">5. Shipping and Delivery</h2>
          <p>
            Delivery times are estimates and may vary depending on order complexity and shipping location. 3Layered is not responsible for delays caused by shipping carriers or customs.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-green-900">6. Return and Refund Policy</h2>
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-emerald-700 mb-2">6.1 Uncustomized Products</h3>
              <p className="mb-2">
                Standard, uncustomized products are eligible for return within <strong>3 days of ordering</strong> under the following conditions:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Product must be unused and in original condition</li>
                <li>Original packaging must be intact</li>
                <li>All accessories and documentation must be included</li>
                <li>Return request must be initiated within 3 days of order placement</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-emerald-700 mb-2">6.2 Customized Products</h3>
              <p>
                <strong>All customized orders are non-returnable and non-refundable.</strong> This includes any product that has been personalized, custom-designed, or specially manufactured according to customer specifications. By placing a customized order, you acknowledge and accept that it cannot be returned or refunded except in cases of manufacturing defects or errors on our part.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-emerald-700 mb-2">6.3 Manufacturing Defects</h3>
              <p>
                If you receive a product with a genuine manufacturing defect, please contact us within 3 days of delivery with photographic evidence. We will assess the issue and provide a replacement or refund at our discretion.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-emerald-700 mb-2">6.4 Refund Processing</h3>
              <p>
                Approved refunds will be processed within 7-14 business days and will be credited to the original payment method. Shipping charges are non-refundable unless the return is due to our error.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-green-900">7. Intellectual Property</h2>
          <p>
            Customers must own or have permission to use any designs submitted for printing. 3Layered will not print items that infringe on copyrights, trademarks, or patents. We reserve the right to refuse any order that may violate intellectual property rights.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-green-900">8. Quality and Limitations</h2>
          <p>
            While we strive for the highest quality, 3D printed items may have minor imperfections such as layer lines or slight color variations. These are inherent to the 3D printing process and are not considered defects.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-green-900">9. Liability</h2>
          <p>
            3Layered's liability is limited to the purchase price of the product. We are not liable for any indirect, incidental, or consequential damages arising from the use of our products or services.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-green-900">10. Privacy Policy</h2>
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-emerald-700 mb-2">10.1 Information Collection</h3>
              <p>
                We collect personal information necessary to process your orders, including your name, email address, phone number, shipping address, and payment information. We also collect information about your browsing behavior and preferences to improve our services.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-emerald-700 mb-2">10.2 Use of Information</h3>
              <p className="mb-2">
                Your personal information is used for the following purposes:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Processing and fulfilling your orders</li>
                <li>Communicating with you about orders, products, and services</li>
                <li>Providing customer support</li>
                <li>Sending promotional materials (only with your consent)</li>
                <li>Improving our website and services</li>
                <li>Preventing fraud and ensuring security</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-emerald-700 mb-2">10.3 Information Sharing</h3>
              <p>
                We do not sell, trade, or rent your personal information to third parties. Your information may be shared only with trusted service providers who assist us in operating our website, processing payments, or delivering products, and who agree to keep this information confidential.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-emerald-700 mb-2">10.4 Data Security</h3>
              <p>
                We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-emerald-700 mb-2">10.5 Cookies</h3>
              <p>
                Our website uses cookies to enhance user experience, analyze site traffic, and personalize content. You can choose to disable cookies in your browser settings, though this may affect website functionality.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-emerald-700 mb-2">10.6 Your Rights</h3>
              <p>
                You have the right to access, update, or delete your personal information at any time. You may also opt-out of receiving promotional communications from us. To exercise these rights, please contact us at 3Layered.in@gmail.com.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-green-900">11. Disclaimers</h2>
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-emerald-700 mb-2">11.1 Product Accuracy</h3>
              <p>
                We strive to display product images and descriptions as accurately as possible. However, actual colors, dimensions, and finishes may vary slightly from what appears on your screen due to differences in monitor settings and the nature of 3D printing technology.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-emerald-700 mb-2">11.2 3D Printing Characteristics</h3>
              <p>
                3D printed products may exhibit characteristics inherent to the additive manufacturing process, including but not limited to visible layer lines, minor surface imperfections, slight warping, or color variations. These characteristics are normal and do not constitute defects unless they significantly impair the intended function or appearance of the product.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-emerald-700 mb-2">11.3 Fitness for Purpose</h3>
              <p>
                Our products are sold "as is" without warranty of any kind. While we ensure quality in our manufacturing process, we do not guarantee that products will meet your specific requirements or be suitable for any particular purpose unless explicitly stated in the product description.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-emerald-700 mb-2">11.4 Third-Party Designs</h3>
              <p>
                When printing customer-provided or third-party designs, 3Layered is not responsible for design flaws, structural weaknesses, or functionality issues inherent in the design itself. We will print according to the specifications provided but cannot guarantee the performance of designs we did not create.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-emerald-700 mb-2">11.5 Use of Products</h3>
              <p>
                Customers are responsible for ensuring that products are used safely and appropriately. 3Layered is not liable for injuries, damages, or losses resulting from misuse, improper handling, or use of products beyond their intended purpose. Some materials may not be suitable for food contact, outdoor use, or high-temperature applications unless specifically noted.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-emerald-700 mb-2">11.6 Website Availability</h3>
              <p>
                We do not guarantee that our website will be available at all times or that it will be free from errors, viruses, or other harmful components. We reserve the right to suspend or discontinue any aspect of our website or services without notice.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-emerald-700 mb-2">11.7 External Links</h3>
              <p>
                Our website may contain links to external websites. 3Layered is not responsible for the content, privacy policies, or practices of these external sites. Accessing external links is at your own risk.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-green-900">12. Changes to Terms</h2>
          <p>
            3Layered reserves the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the modified terms. We will notify customers of significant changes via email or through a prominent notice on our website.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3 text-green-900">13. Contact Information</h2>
          <div className="space-y-2">
            <p>
              For questions about these terms, return policies, privacy concerns, or any other inquiries, please contact us:
            </p>
            <ul className="list-none space-y-1 ml-4">
              <li><strong>Email (Founder):</strong> 3Layered.in@gmail.com</li>
              <li><strong>Email (Co-Founder):</strong> namansinghtomar.business@gmail.com</li>
              <li><strong>Phone (Founder):</strong> +91 9982781000</li>
              <li><strong>Phone (Co-Founder):</strong> +91 9243592559</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-emerald-200/50">
          <div className="bg-emerald-50/50 rounded-lg p-4">
            <p className="text-sm text-gray-800 font-semibold mb-2">
              Important Notice:
            </p>
            <p className="text-sm text-gray-700">
              By using 3Layered's services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions, including our Return Policy, Privacy Policy, and Disclaimers. If you do not agree with any part of these terms, please do not use our services.
            </p>
          </div>
          <p className="text-sm text-gray-700 mt-4 text-center">
            Last updated: November 21, 2025
          </p>
        </div>
      </div>
      <Footer />
    </section>
  );
}

