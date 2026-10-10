import { Link } from 'react-router-dom';
import MetaData from '../Layouts/MetaData';
import storeInformation from '../../utils/storeInformation';

const ReturnPolicy = () => (
    <>
        <MetaData title="Flipkart: Return & Refund Policy" />
        <main className="w-full mt-20 px-4 sm:px-8 mb-12">
            <article className="max-w-4xl mx-auto bg-white p-5 sm:p-8 shadow-sm">
                <h1 className="text-2xl sm:text-3xl font-medium text-gray-800">Return &amp; Refund Policy</h1>
                <p className="mt-3 text-sm sm:text-base text-gray-600">
                    This policy describes how to request help with an order. Replace the bracketed settings with the store&apos;s approved rules before publishing.
                </p>

                <div className="mt-6 space-y-6 text-sm sm:text-base text-gray-700">
                    <section>
                        <h2 className="text-lg font-medium text-gray-800">Eligibility and return window</h2>
                        <p className="mt-2">{storeInformation.returnEligibility}</p>
                        <p className="mt-2">Contact support within: <strong>{storeInformation.returnWindow}</strong>.</p>
                        <p className="mt-2">Items must be in the condition required for their category, with applicable tags, accessories, packaging, and proof of purchase. Category-specific requirements should be confirmed when the request is reviewed.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-medium text-gray-800">Damaged, defective, or incorrect items</h2>
                        <p className="mt-2">If an item arrives damaged, defective, or different from what was ordered, contact support as soon as possible. Include the order number, a description of the issue, and clear photographs where relevant. Support will review the request and explain the available next steps.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-medium text-gray-800">Replacement and refunds</h2>
                        <p className="mt-2">A replacement may be offered when the item and stock are eligible and a replacement is available. Otherwise, the support team will explain the applicable resolution.</p>
                        <p className="mt-2">Approved refunds are processed using the method and process confirmed by support. Expected processing time: <strong>{storeInformation.refundProcessing}</strong>. The time for funds to appear may depend on the payment service or financial institution.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-medium text-gray-800">Non-returnable products</h2>
                        <p className="mt-2">{storeInformation.nonReturnableProducts}</p>
                        <p className="mt-2">Any exclusions must be disclosed for the relevant product category and remain subject to applicable consumer laws.</p>
                    </section>

                    <section>
                        <h2 className="text-lg font-medium text-gray-800">How to request a return</h2>
                        <p className="mt-2">Contact support with your order number, the item you are requesting help with, and the reason for the request. Keep the item and its packaging until support provides instructions.</p>
                        <p className="mt-2">
                            Use the details on our <Link className="text-primary-blue hover:underline" to="/contact">Contact Us</Link> page. Do not ship an item back until return instructions have been provided.
                        </p>
                    </section>
                </div>
            </article>
        </main>
    </>
);

export default ReturnPolicy;
