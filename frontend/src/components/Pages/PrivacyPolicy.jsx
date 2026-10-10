import MetaData from '../Layouts/MetaData';
import storeInformation from '../../utils/storeInformation';

const PrivacyPolicy = () => (
    <>
        <MetaData title="Flipkart: Privacy Policy" />
        <main className="w-full mt-20 px-4 sm:px-8 mb-12">
            <article className="max-w-4xl mx-auto bg-white p-5 sm:p-8 shadow-sm">
                <h1 className="text-2xl sm:text-3xl font-medium text-gray-800">Privacy Policy</h1>
                <p className="mt-3 text-sm sm:text-base text-gray-600">
                    This page explains how {storeInformation.name} handles information when you use this website. Review it against the store&apos;s actual operating and legal requirements before publication.
                </p>

                <div className="mt-6 space-y-6 text-sm sm:text-base text-gray-700">
                    <section>
                        <h2 className="text-lg font-medium text-gray-800">Information collected</h2>
                        <p className="mt-2">When you place an order, the site processes the name, email (if provided), phone number, delivery address, order items, quantities, and order total that you submit. Registered accounts also contain account and authentication data. The application stores password hashes rather than readable passwords.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-medium text-gray-800">Payments</h2>
                        <p className="mt-2">Checkout creates a standard UPI payment intent for the selected PhonePe or Google Pay option and records the order with a pending-payment status. The site does not provide an integrated payment gateway or automatically verify UPI transfers. The UPI app opened by your device receives the merchant address, order reference, amount, and payment note. The site does not request or store card numbers, UPI PINs, or banking passwords.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-medium text-gray-800">How information is used and stored</h2>
                        <p className="mt-2">Order and delivery details are used to create and administer orders. Account details support account and administrative functions. The backend uses MongoDB to store application records. Product and profile images uploaded by administrators or users are handled by Cloudinary.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-medium text-gray-800">Cookies and local storage</h2>
                        <p className="mt-2">The site uses browser local storage for shopping-cart, saved-item, wishlist, and shipping-information state. The backend uses an authentication token cookie for signed-in account and administrative sessions. Google Fonts is requested by the site to load its typography.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-medium text-gray-800">Sharing, security, and retention</h2>
                        <p className="mt-2">Information is handled by the services described above as needed to operate the application. The site does not include an analytics integration in the inspected source. No online service can guarantee absolute security; access to stored information should be restricted to authorized operators.</p>
                        <p className="mt-2">Order and account records are retained while needed to operate the service and meet applicable obligations. The application does not define a specific retention period; the store should set and document one and securely remove records when they are no longer needed.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-medium text-gray-800">Your choices and contact</h2>
                        <p className="mt-2">You may contact the store to ask about, correct, or request deletion of personal information, subject to applicable legal and operational requirements. Contact details are available on the Contact Us page. Clearing local storage may remove locally saved cart and shipping details.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-medium text-gray-800">Policy updates</h2>
                        <p className="mt-2">This policy may be updated when the site&apos;s practices or services change. The store should publish the effective date and notify customers where required.</p>
                    </section>
                </div>
            </article>
        </main>
    </>
);

export default PrivacyPolicy;
