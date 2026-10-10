import MetaData from '../Layouts/MetaData';
import storeInformation from '../../utils/storeInformation';

const Contact = () => (
    <>
        <MetaData title="Flipkart: Contact Us" />
        <main className="w-full mt-20 px-4 sm:px-8 mb-12">
            <div className="max-w-4xl mx-auto bg-white p-5 sm:p-8 shadow-sm">
                <h1 className="text-2xl sm:text-3xl font-medium text-gray-800">Contact Us</h1>
                <p className="mt-3 text-sm sm:text-base text-gray-600">
                    Contact {storeInformation.name} customer support about an order, delivery, return, or product question.
                </p>

                <section className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="border border-gray-200 p-4">
                        <h2 className="text-lg font-medium text-gray-800">Customer support</h2>
                        <p className="mt-2 text-sm text-gray-600">Phone</p>
                        <a className="text-primary-blue hover:underline" href={`tel:${storeInformation.phone.replace(/\s/g, '')}`}>
                            {storeInformation.phone}
                        </a>
                        <p className="mt-3 text-sm text-gray-600">Email</p>
                        <p className="text-primary-blue">{storeInformation.email}</p>
                        <p className="mt-3 text-sm text-gray-600">Availability</p>
                        <p className="text-sm text-gray-800">{storeInformation.supportHours}</p>
                    </div>

                    <div className="border border-gray-200 p-4">
                        <h2 className="text-lg font-medium text-gray-800">Business address</h2>
                        <p className="mt-2 text-sm text-gray-800">{storeInformation.legalName}</p>
                        <address className="mt-1 text-sm text-gray-600 not-italic">
                            {storeInformation.address.map((line) => (
                                <span className="block" key={line}>{line}</span>
                            ))}
                        </address>
                    </div>
                </section>

                <p className="mt-6 text-sm text-gray-600">
                    When contacting support about an order, include your order number and the email or phone number used at checkout. Do not send passwords or payment credentials.
                </p>
            </div>
        </main>
    </>
);

export default Contact;
